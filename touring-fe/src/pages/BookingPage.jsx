import { useLocation, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/auth/context";
import { useEffect, useMemo, useState } from "react";
import CheckoutForm from "../components/CheckOutForm";
import PaymentSummary from "../components/PaymentSummary";
import { useCart } from "@/hooks/useCart";
import logger from '@/utils/logger';

export default function BookingPage() {
  const location = useLocation();
  const buyNowItem = location.state?.mode === "buy-now" ? location.state?.item : null;
  const isTourRequest = location.state?.mode === "tour-request";
  const requestId = location.state?.requestId;
  const itinerary = location.state?.itinerary || [];
  const zoneName = location.state?.zoneName || '';
  const numberOfDays = location.state?.numberOfDays || 1;
  const numberOfGuests = location.state?.numberOfGuests || 1;
  
  const { withAuth } = useAuth();
  const { items, loading } = useCart();

  // Check for retry payment data
  const [retryPaymentItems, setRetryPaymentItems] = useState(null);
  const [retryBookingId, setRetryBookingId] = useState(null);

  useEffect(() => {
    const retryCart = sessionStorage.getItem('retryPaymentCart');
    const retryBooking = sessionStorage.getItem('retryBookingId');
    
    if (retryCart) {
      try {
        const parsedItems = JSON.parse(retryCart);
        setRetryPaymentItems(parsedItems);
        setRetryBookingId(retryBooking);
        
        // Clear sessionStorage after loading
        sessionStorage.removeItem('retryPaymentCart');
        sessionStorage.removeItem('retryBookingId');
      } catch (error) {
        logger.error('Error parsing retry payment data:', error);
      }
    }
  }, []);

  // Voucher state - lifted to BookingPage to share between CheckoutForm and PaymentSummary
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherCode, setVoucherCode] = useState(null);

  const handleVoucherChange = (voucher, discount) => {
    if (voucher) {
      setVoucherCode(voucher.code);
      setVoucherDiscount(discount);
    } else {
      setVoucherCode(null);
      setVoucherDiscount(0);
    }
  };

  // Nếu buy-now: lấy quote từ BE (không đụng cart)
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteErr, setQuoteErr] = useState("");
      window.scrollTo({ top: 0, behavior: "smooth" });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!buyNowItem) return;
      try {
        setQuoteLoading(true);
        setQuoteErr("");
        const res = await withAuth("/api/bookings/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: [buyNowItem] }),
        });
        if (!cancelled) setQuote(res?.items?.[0] || null);
      } catch (e) {
        logger.error("Quote error:", e);
        if (!cancelled) {
          const errorMsg = e.response?.data?.error === "EXCEEDS_DEPARTURE_CAPACITY" 
            ? `Không đủ chỗ trống. Chỉ còn ${e.response?.data?.limit || 0} chỗ.`
            : "Không thể tạo báo giá cho Đặt ngay.";
          setQuoteErr(errorMsg);
        }
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [buyNowItem, withAuth]);

  // Dữ liệu hiển thị tóm tắt
  const summaryItems = useMemo(() => {
    // ✅ Luồng RETRY PAYMENT từ booking history
    if (retryPaymentItems) {
      return retryPaymentItems.map((it) => {
        const a = safeNum(it.adults);
        const c = safeNum(it.children);
        
        const unitA = safeNum(it.unitPriceAdult);
        const unitC = safeNum(it.unitPriceChild);
        
        const price = unitA * a + unitC * c;
        
        return {
          id: `${it.tourId}-${it.date}`,
          name: `${it.name} • ${formatDateVN(it.date)} • NL ${a}${c ? `, TE ${c}` : ""}`,
          image: it.image,
          price,
          originalPrice: price, // No discount for retry
        };
      });
    }

    // ✅ Luồng TOUR-REQUEST (custom tour with guide negotiation)
    if (isTourRequest && location.state?.summaryItems) {
      return location.state.summaryItems.map((it) => ({
        id: requestId || 'tour-request',
        name: it.name || `Tour tùy chỉnh - ${zoneName}`,
        image: it.image || (itinerary[0]?.image) || '',
        price: it.price || 0,
        originalPrice: it.price || 0, // No discount for tour requests
        numberOfDays: it.numberOfDays || numberOfDays,
        numberOfGuests: numberOfGuests,
        description: it.description || '',
        itinerary: it.itinerary || itinerary, // Include itinerary for display
        zoneName: it.zoneName || zoneName,
      }));
    }

    // ✅ Luồng BUY-NOW
    if (buyNowItem) {
      if (!quote) return []; // đợi quote xong
  const a = safeNum(quote.adults);
    const c = safeNum(quote.children);
      
    const unitA = safeNum(quote.unitPriceAdult);
    const unitC = safeNum(quote.unitPriceChild);
    const unitAO = safeNum(quote.unitOriginalAdult ?? quote.unitPriceAdult);
    const unitCO = safeNum(quote.unitOriginalChild ?? quote.unitPriceChild);


      const price = unitA * a + unitC * c;
     const originalPrice = unitAO * a + unitCO * c;

   return [{
      id: `${quote.tourId}-${quote.date}`,
      name: `${quote.name} • ${formatDateVN(quote.date)} • NL ${a}${c ? `, TE ${c}` : ""}`,
      image: quote.image,
      price,
      originalPrice,
    }];
    }

    // ✅ Luồng CHECKOUT từ giỏ
    const selected = items.filter(
      it => it.selected && it.available !== false && ((it.adults||0)+(it.children||0)) > 0
    );
  return selected.map((it) => {
    const a = safeNum(it.adults);
    const c = safeNum(it.children);

    const unitA = safeNum(it.adultPrice);
    const unitC = safeNum(it.childPrice);
    const unitAO = safeNum(it.adultOriginalPrice ?? it.adultPrice);
    const unitCO = safeNum(it.childOriginalPrice ?? it.childPrice);

    const price = unitA * a + unitC * c;
    const originalPrice = unitAO * a + unitCO * c;

    return {
      id: it.itemId,
      name: `${it.name} • ${formatDateVN(it.date)} • NL ${a}${c ? `, TE ${c}` : ""}`,
      image: it.image,
      price,
      originalPrice,
    };
  });
}, [buyNowItem, quote, items, retryPaymentItems, isTourRequest, requestId, itinerary, zoneName, location.state?.summaryItems]);

  // Loading
  if (buyNowItem && quoteLoading) {
    return <div className="min-h-screen bg-gray-100"><div className="max-w-7xl mx-auto p-6">Đang tạo báo giá…</div></div>;
  }
  if (!buyNowItem && loading) {
    return <div className="min-h-screen bg-gray-100"><div className="max-w-7xl mx-auto p-6">Đang tải giỏ hàng…</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-2  border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center  justify-between">
          <Link
            to="/shoppingcarts"
            className="inline-flex items-center gap-2 hover:scale-105 transition-all duration-200  px-3 py-2 rounded-lg text-white  bg-[#02A0AA] border border-gray-200 text-sm font-medium text-whiteshadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span>Quay lại giỏ</span>
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto ">
        <div className="flex flex-col lg:flex-row">
          {/**
           * Pass summaryItems + computed totalAmount down so CheckoutForm (MoMo / PayPal) can use the REAL figure.
           * This fixes previous mismatch where MoMo used a hardcoded fallback 100000 VND.
           */}
          <CheckoutForm
            mode={retryPaymentItems ? "retry-payment" : (isTourRequest ? "tour-request" : (buyNowItem ? "buy-now" : "cart"))}
            buyNowItem={buyNowItem}
            retryPaymentItems={retryPaymentItems}
            retryBookingId={retryBookingId}
            quote={quote}
            summaryItems={summaryItems}
            totalAmount={summaryItems.reduce((s,it)=> s + (it.price||0), 0)}
            onVoucherChange={handleVoucherChange}
            requestId={requestId}
            itinerary={itinerary}
            zoneName={zoneName}
          />
          {summaryItems.length > 0 ? (
            <PaymentSummary 
              items={summaryItems} 
              voucherDiscount={voucherDiscount}
              voucherCode={voucherCode}
            />
          ) : (
            <div className="w-full lg:w-2/5 p-6 lg:p-8">
              <div className="bg-white rounded-xl p-6 border text-gray-700">
                {buyNowItem ? (
                  <div>
                    <p className="text-red-600 font-medium">{quoteErr || "Không có dữ liệu báo giá."}</p>
                    {quoteLoading && <p className="mt-2 text-gray-500">Đang tải...</p>}
                  </div>
                ) : "Chưa có tour nào được chọn để thanh toán."}
                {!buyNowItem && (
                  <div className="mt-4">
                    <Link to="/shoppingcarts" className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold">
                      Về giỏ hàng
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helpers
function safeNum(n){ const x=Number(n); return Number.isFinite(x)?x:0; }
function formatDateVN(dateStr){
  const s = String(dateStr||"").slice(0,10);
  const [y,m,d] = s.split("-");
  return (y&&m&&d) ? `${d}/${m}/${y}` : s;
}