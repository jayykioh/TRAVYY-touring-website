import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/auth/context";
import { useEffect, useMemo, useState } from "react";
import CheckoutForm from "../components/CheckOutForm";
import PaymentSummary from "../components/PaymentSummary";
import { useCart } from "@/hooks/useCart";

export default function BookingPage() {
  const location = useLocation();
  const buyNowItem = location.state?.mode === "buy-now" ? location.state?.item : null;
  const { withAuth } = useAuth();
  const { items, loading } = useCart();

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
        if (!cancelled) setQuoteErr(e,"Không thể tạo báo giá cho Đặt ngay.");
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [buyNowItem, withAuth]);

  // Dữ liệu hiển thị tóm tắt
  const summaryItems = useMemo(() => {
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
}, [buyNowItem, quote, items]);

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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Travyy</h1>
          <Link to="/cart" className="text-purple-600 font-semibold hover:text-purple-700">Quay lại giỏ</Link>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          <CheckoutForm
            mode={buyNowItem ? "buy-now" : "cart"}
            buyNowItem={buyNowItem}
            quote={quote}
            totalAmount={summaryItems.reduce((s,i)=>s+(i.price||0),0)}
            paymentItems={summaryItems}
          />
          {summaryItems.length > 0 ? (
            <PaymentSummary items={summaryItems} />
          ) : (
            <div className="w-full lg:w-2/5 p-6 lg:p-8">
              <div className="bg-white rounded-xl p-6 border text-gray-700">
                {buyNowItem ? (quoteErr || "Không có dữ liệu báo giá.") : "Chưa có tour nào được chọn để thanh toán."}
                {!buyNowItem && (
                  <div className="mt-4">
                    <Link to="/cart" className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold">
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
