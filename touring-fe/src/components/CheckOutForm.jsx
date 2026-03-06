import React, { useEffect, useRef, useState } from "react";
import { Lock, CreditCard, Wallet, MapPin, User, Phone, Mail, Tag, Map, Calendar, Users, Clock } from "lucide-react";
import { useAuth } from "@/auth/context";
import { API_URL } from '@/config/api';
import { IS_PROD } from "@/config/clientEnv";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import useLocationOptions from "../hooks/useLocation";
import { useLocation } from "react-router-dom";
import VoucherSelector from "./VoucherSelector";

const API_BASE = API_URL;

export default function CheckoutForm({ 
  mode: modeProp, 
  buyNowItem: buyNowItemProp, 
  retryPaymentItems: retryPaymentItemsProp,
  retryBookingId: retryBookingIdProp,
  summaryItems = [], 
  totalAmount,
  onVoucherChange,
  requestId: requestIdProp,
  itinerary: itineraryProp,
  zoneName: zoneNameProp,
}) {
  const { user, withAuth } = useAuth() || {};
  const accessToken = user?.token; // hoặc user?.accessToken

  const [selectedPayment, setSelectedPayment] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [agreedPolicy, setAgreedPolicy] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);
  const [termsScrolled, setTermsScrolled] = useState(false);
  const termsContentRef = useRef(null);
  const didPrefetchRef = useRef(false);
  const location = useLocation();

  // ⬇️ FIX: Default "cart" nếu không có state
  // Prefer props (BookingPage passes them); fall back to location.state for backward compatibility.
  const mode = modeProp || location.state?.mode || "cart";
  const buyNowItem = mode === "buy-now" ? (buyNowItemProp || location.state?.item) : null;
  const retryPaymentItems = mode === "retry-payment" ? retryPaymentItemsProp : null;
  const retryBookingId = mode === "retry-payment" ? retryBookingIdProp : null;
  
  // ⬇️ NEW: Support for tour-request mode
  // Prefer props from parent, fallback to location.state
  // Prefer prop, then location.state, then URL query param (helps if navigation omitted state)
  const urlParams = new URLSearchParams(location.search);
  const requestId = requestIdProp || location.state?.requestId || urlParams.get('requestId');
  const itinerary = itineraryProp || location.state?.itinerary || [];
  const zoneName = zoneNameProp || location.state?.zoneName || '';
  const tourInfo = location.state?.tourInfo || {};
  const isTourRequest = mode === 'tour-request';
  
  console.log("🔍 CheckoutForm loaded:");
  console.log("   location.state:", location.state);
  console.log("   mode:", mode);
  console.log("   buyNowItem:", buyNowItem);
  console.log("   requestId:", requestId);
  console.log("   itinerary items:", itinerary.length);
  console.log("   zone:", zoneName, "tourInfo:", tourInfo);
  console.log("   isTourRequest:", isTourRequest);


  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    provinceId: "",
    provinceName: "",
    wardId: "",
    wardName: "",
    addressLine: "",
  });

  // Voucher state
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(totalAmount);

  const { provinces, wards, loadingProvince, loadingWard } = useLocationOptions(userInfo.provinceId);

  // map tên khi options sẵn sàng
  useEffect(() => {
    if (userInfo.provinceId && provinces.length) {
      const p = provinces.find((x) => x.id === userInfo.provinceId);
      if (p && p.name !== userInfo.provinceName) setUserInfo((s) => ({ ...s, provinceName: p.name }));
    }
  }, [provinces, userInfo.provinceId]); // eslint-disable-line

  useEffect(() => {
    if (userInfo.wardId && wards.length) {
      const w = wards.find((x) => x.id === userInfo.wardId);
      if (w && w.name !== userInfo.wardName) setUserInfo((s) => ({ ...s, wardName: w.name }));
    }
  }, [wards, userInfo.wardId]); // eslint-disable-line

  // prefill profile lần đầu mở dialog
  useEffect(() => {
    if (!isDialogOpen || didPrefetchRef.current || !accessToken) return;
    (async () => {
      try {
        setIsLoadingProfile(true);
        
        // Gọi endpoint /api/profile để lấy thông tin user
        const data = await withAuth("/api/profile");
        setUserInfo((prev) => ({
          ...prev,
          name: data?.name || "",
          email: data?.email || "",
          phone: data?.phone || "",
          provinceId: data?.location?.provinceId || "",
          wardId: data?.location?.wardId || "",
          addressLine: data?.location?.addressLine || "",
        }));
        didPrefetchRef.current = true;
      } catch (e) {
        console.error("Prefill profile failed:", e);
      } finally { 
        setIsLoadingProfile(false); 
      }
    })();
  }, [isDialogOpen, accessToken, withAuth]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (e) => {
    const selectedId = e.target.value;
    const selectedProvince = provinces.find((p) => p.id === selectedId);
    setUserInfo((prev) => ({
      ...prev,
      provinceId: selectedId,
      provinceName: selectedProvince?.name || "",
      wardId: "",
      wardName: "",
    }));
  };

  const handleWardChange = (e) => {
    const selectedId = e.target.value;
    const selectedWard = wards.find((w) => w.id === selectedId);
    setUserInfo((prev) => ({ ...prev, wardId: selectedId, wardName: selectedWard?.name || "" }));
  };
  // (Removed stray 'mode,' token that caused syntax error)

  const handleSaveInfo = async () => {
    if (!accessToken) { setIsDialogOpen(false); return; }
    try {
      setIsLoadingProfile(true);
      const payload = {
        name: userInfo.name,
        phone: userInfo.phone || "",
        location: {
          provinceId: userInfo.provinceId,
          wardId: userInfo.wardId,
          addressLine: userInfo.addressLine || "",
        },
      };
      const updated = await withAuth('/api/profile/info', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const provinceId = updated?.location?.provinceId || userInfo.provinceId;
      const wardId = updated?.location?.wardId || userInfo.wardId;
      setUserInfo((prev) => ({
        ...prev,
        name: updated?.name ?? prev.name,
        phone: updated?.phone ?? prev.phone,
        provinceId,
        provinceName: provinces.find((p) => p.id === provinceId)?.name || prev.provinceName,
        wardId,
        wardName: wards.find((w) => w.id === wardId)?.name || prev.wardName,
        addressLine: updated?.location?.addressLine ?? prev.addressLine,
      }));
      setIsDialogOpen(false);
    } catch (e) {
      console.error("Update profile error:", e);
    } finally { setIsLoadingProfile(false); }
  };

  const isFormValid =
    userInfo.name && userInfo.email && userInfo.phone &&
    userInfo.provinceId && userInfo.wardId && userInfo.addressLine;

  // Update finalTotal when voucher or totalAmount changes
  useEffect(() => {
    setFinalTotal(totalAmount - discountAmount);
  }, [totalAmount, discountAmount]);

  // Handle voucher apply
  const handleVoucherApply = (voucher, discount) => {
    setAppliedVoucher(voucher);
    setDiscountAmount(discount);
    // Notify parent component if callback provided
    if (onVoucherChange) {
      onVoucherChange(voucher, discount);
    }
  };

  const handlePayment = async () => {
    // ⬇️ NGĂN CHẶN MULTIPLE CLICKS
    if (isProcessingPayment) {
      console.log("⚠️ Payment already in progress, ignoring click");
      return;
    }

    if (!accessToken) {
      alert("Vui lòng đăng nhập để tiếp tục");
      return;
    }

    if (!isFormValid) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!selectedPayment) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (selectedPayment === "paypal") {
      try {
        setIsProcessingPayment(true);

        // Guard: tour-request must include requestId
        if (mode === 'tour-request' && !requestId) {
          console.error('[CheckoutForm] Missing requestId for tour-request payment');
          alert('Không thể tiếp tục: thiếu requestId cho yêu cầu tour. Vui lòng quay lại và thử lại.');
          setIsProcessingPayment(false);
          return;
        }

        const payload = {
          mode,
          ...(mode === "buy-now" && { item: buyNowItem }),
          ...(mode === "retry-payment" && { 
            retryItems: retryPaymentItems,
            retryBookingId: retryBookingId 
          }),
          ...(mode === "tour-request" && { 
            requestId: requestId
          }),
          // Include voucher information
          ...(appliedVoucher && {
            promotionCode: appliedVoucher.code,
            discountAmount: discountAmount,
            finalAmount: finalTotal,
          }),
        };

        console.log("📦 Sending payment request:", JSON.stringify(payload, null, 2));
        
        const respJson = await withAuth('/api/paypal/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const { orderID } = respJson || {};

        if (!orderID) {
          throw new Error("Không nhận được orderID từ server");
        }

        console.log("✅ Order created, redirecting to PayPal:", orderID, respJson);

        // Redirect đến PayPal (không reset isProcessingPayment vì sẽ redirect)
        const paypalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderID}`;
        window.location.href = paypalUrl;

      } catch (error) {
        console.error("❌ PayPal payment error:", error, error?.body || error?.stack || null);
        // Prefer server-provided error message/body when available
        const serverBody = error?.body || (error && error.detail) || null;
        const userMsg = serverBody?.error || serverBody?.message || error.message || 'Lỗi khi tạo đơn PayPal';
        
        if (serverBody && !IS_PROD) {
          alert(`Lỗi thanh toán: ${userMsg}\n\nChi tiết (dev): ${JSON.stringify(serverBody)}`);
        } else {
          alert(`Lỗi thanh toán: ${userMsg}`);
        }
        setIsProcessingPayment(false); // ⬅️ CHỈ RESET KHI CÓ LỖI
      }
      // ⬅️ KHÔNG CÓ finally ở đây vì sẽ redirect
    } else if (selectedPayment === "momo") {
      try {
        setIsProcessingPayment(true);
        // Use finalTotal (after voucher discount) instead of totalAmount
        let amount = Number(finalTotal);
        if (!Number.isFinite(amount) || amount <= 0) {
          amount = summaryItems.reduce((s,it)=> s + (Number(it.price)||0), 0) - discountAmount;
        }
        if (!Number.isFinite(amount) || amount <= 0) {
          amount = Number(location.state?.totalAmount) - discountAmount;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
          alert("Không có số tiền hợp lệ để thanh toán MoMo");
          setIsProcessingPayment(false);
          return;
        }

        // Prepare item snapshot (trim to essentials for backend persistence / audit)
        const itemsSnapshot = summaryItems.map(it => ({
          name: it.name,
            price: Number(it.price)||0,
            originalPrice: Number(it.originalPrice)||undefined,
        }));

        console.log("🚀 Creating MoMo payment", { 
          amount, 
          itemsSnapshot, 
          voucherCode: appliedVoucher?.code,
          discountAmount 
        });
        // Guard: tour-request must include requestId
        if (mode === 'tour-request' && !requestId) {
          console.error('[CheckoutForm] Missing requestId for tour-request payment (MoMo)');
          alert('Không thể tiếp tục: thiếu requestId cho yêu cầu tour. Vui lòng quay lại và thử lại.');
          setIsProcessingPayment(false);
          return;
        }

        const data = await withAuth('/api/payments/momo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            orderInfo: 'Thanh toán đơn tour Travyy',
            // Unified callback page for both PayPal & MoMo
            redirectUrl: `${window.location.origin}/payment/callback`,
            // Persist mode so backend knows whether to clear selected cart items
            mode,
            // For buy-now, also send the single item detail (backend can choose to persist)
            ...(mode === 'buy-now' && buyNowItem ? { item: buyNowItem } : {}),
            // For retry-payment, send retry items and booking ID
            ...(mode === 'retry-payment' && retryPaymentItems ? { 
              retryItems: retryPaymentItems,
              retryBookingId: retryBookingId 
            } : {}),
            // For tour-request, send request ID
            ...(mode === 'tour-request' && requestId ? {
              requestId: requestId
            } : {}),
            items: itemsSnapshot,
            // Include voucher information
            ...(appliedVoucher && {
              promotionCode: appliedVoucher.code,
              discountAmount: discountAmount,
            }),
          }),
        });

        console.log('MoMo response:', data);
        if (!data?.payUrl) {
          const serverMsg = data?.error || data?.message || 'Tạo phiên thanh toán MoMo thất bại';
          if (!IS_PROD) {
            alert(`${serverMsg}\n\nChi tiết (dev): ${JSON.stringify(data)}`);
          } else {
            alert(serverMsg);
          }
          setIsProcessingPayment(false);
          return;
        }
        // Redirect sang MoMo
        window.location.href = data.payUrl;
      } catch (err) {
        console.error("MoMo error", err, err?.body || err?.stack || null);
        const serverBody = err?.body || (err && err.detail) || null;
        const userMsg = serverBody?.error || serverBody?.message || err.message || 'Lỗi khi tạo MoMo payment';
        if (serverBody && !IS_PROD) {
          alert(`Lỗi MoMo: ${userMsg}\n\nChi tiết (dev): ${JSON.stringify(serverBody)}`);
        } else {
          alert(`Lỗi MoMo: ${userMsg}`);
        }
        setIsProcessingPayment(false);
      }
    }
  };

  const canPay = selectedPayment && isFormValid && agreedPolicy && !isProcessingPayment;

  return (
    <div className="w-full lg:w-3/5 bg-white p-6 lg:p-8 rounded-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

      {/* thông tin người đặt */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin người đặt</h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-blue-500 transition-colors bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="text-gray-900 font-medium">
                  {isFormValid ? userInfo.name : "Nhập thông tin của bạn"}
                </span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Thông tin người đặt tour</DialogTitle>
              <DialogDescription>Vui lòng điền đầy đủ thông tin để hoàn tất đặt tour</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />Họ và tên *
                </label>
                <input
                  type="text" name="name" value={userInfo.name} onChange={handleInputChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />Email *
                </label>
                <input
                  type="email" name="email" value={userInfo.email} onChange={handleInputChange}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />Số điện thoại
                </label>
                <input
                  type="tel" name="phone" value={userInfo.phone} onChange={handleInputChange}
                  placeholder="0912345678"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* province + ward */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành phố</label>
                  <select
                    value={userInfo.provinceId} onChange={handleProvinceChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="">{loadingProvince ? "Đang tải..." : "Chọn tỉnh/thành"}</option>
                    {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
                  <select
                    value={userInfo.wardId} onChange={handleWardChange}
                    disabled={!userInfo.provinceId || loadingWard}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">{loadingWard ? "Đang tải..." : "Chọn quận/huyện"}</option>
                    {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              {/* address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />Địa chỉ cụ thể
                </label>
                <textarea
                  name="addressLine" value={userInfo.addressLine} onChange={handleInputChange}
                  placeholder="Số nhà, tên đường..." rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                onClick={handleSaveInfo}
                disabled={!isFormValid || isLoadingProfile}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  isFormValid && !isLoadingProfile ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isLoadingProfile ? "Đang lưu..." : "Lưu thông tin"}
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* info summary */}
        {isFormValid && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>{userInfo.name}</strong> • {userInfo.phone}<br />
              {userInfo.addressLine}, {userInfo.wardName}, {userInfo.provinceName}
            </p>
          </div>
        )}
      </div>

      {/* Tour Request Details Display */}
      {isTourRequest && itinerary && itinerary.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Map className="w-5 h-5 text-blue-600" />
            Thông tin tour tùy chỉnh
          </h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200">
            {/* Zone Info */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-lg">{zoneName || 'Tour tùy chỉnh'}</h3>
              </div>
              {tourInfo?.numberOfDays && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{tourInfo.numberOfDays} ngày</span>
                  {tourInfo?.numberOfGuests && (
                    <>
                      <span className="text-gray-400">•</span>
                      <Users className="w-4 h-4" />
                      <span>{tourInfo.numberOfGuests} khách</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Itinerary List */}
            <div className="bg-white rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Map className="w-4 h-4 text-orange-500" />
                Hành trình chi tiết ({itinerary.length} điểm)
              </h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {itinerary.map((item, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.name || item.activity}</div>
                      {item.address && (
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {item.address}
                        </div>
                      )}
                      {(item.startTime || item.duration) && (
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-600">
                          {item.startTime && (
                            <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              <Clock className="w-3 h-3" />
                              {item.startTime}
                            </span>
                          )}
                          {item.duration && (
                            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                              {item.duration} phút
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Section - Shopee Style */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-orange-500" />
            Ưu đãi của bạn
          </h2>
        </div>

        <VoucherSelector
          totalAmount={totalAmount}
          tourId={buyNowItem?.tourId || summaryItems[0]?.tourId}
          onVoucherApply={handleVoucherApply}
        />

        {/* Applied voucher display */}
        {appliedVoucher && (
          <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-800">
                  Mã: {appliedVoucher.code}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Giảm {appliedVoucher.type === 'percentage' 
                    ? `${appliedVoucher.value}%` 
                    : `${discountAmount.toLocaleString('vi-VN')}₫`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Tiết kiệm</p>
                <p className="text-lg font-bold text-green-600">
                  -{discountAmount.toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* payment methods */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Phương thức thanh toán</h2>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Lock className="w-4 h-4" /><span>Bảo mật</span>
          </div>
        </div>

        <div className="space-y-3">
          {/* PayPal */}
          <div
            onClick={() => setSelectedPayment("paypal")}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedPayment === "paypal" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === "paypal" ? "border-blue-500" : "border-gray-300"}`}>
                  {selectedPayment === "paypal" && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                </div>
                <CreditCard className="w-6 h-6 text-gray-700" />
                <span className="font-medium text-gray-900">PayPal</span>
              </div>
              <img
                src="https://res.cloudinary.com/dzjm0cviz/image/upload/v1759928562/PayPal.svg_mdi5au.png"
                alt="PayPal" className="h-6"
              />
            </div>
          </div>

          {/* MoMo */}
          <div
            onClick={() => setSelectedPayment("momo")}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedPayment === "momo" ? "border-pink-500 bg-pink-50" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === "momo" ? "border-pink-500" : "border-gray-300"}`}>
                  {selectedPayment === "momo" && <div className="w-3 h-3 rounded-full bg-pink-500" />}
                </div>
                <Wallet className="w-6 h-6 text-gray-700" />
                <span className="font-medium text-gray-900">Ví MoMo</span>
              </div>
              <div className="w-6 h-6">
                <img src="https://res.cloudinary.com/dzjm0cviz/image/upload/v1759928578/Logo-MoMo-Square_mti9wm.webp"/>
              </div>
            </div>
            
            {/* ⚠️ Test Environment Warning */}
            {selectedPayment === "momo" && IS_PROD === false && totalAmount > 10000000 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex gap-2 text-sm text-yellow-800">
                  <span>⚠️</span>
                  <div>
                    <strong>Lưu ý môi trường test:</strong>
                    <p className="mt-1">
                      MoMo test chỉ hỗ trợ tối đa <strong>10,000,000 VNĐ</strong>/giao dịch.
                      Đơn hàng của bạn ({(totalAmount).toLocaleString('vi-VN')} VNĐ) sẽ được tự động điều chỉnh về 10 triệu để test.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Policy Agreement Checkbox */}
      <div className="mb-6 flex items-start gap-2">
        <input
          id="agree-policy"
          type="checkbox"
          checked={agreedPolicy}
          disabled={!termsScrolled}
          onChange={e => setAgreedPolicy(e.target.checked)}
          className={`mt-1 accent-blue-600 w-5 h-5 ${!termsScrolled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
        <label htmlFor="agree-policy" className="text-sm text-gray-700 select-none">
          Tôi đã đọc, hiểu và đồng ý với
          <button type="button" className="text-blue-700 underline font-semibold px-1" onClick={() => setOpenTerms(true)}>
            Điều khoản Sử dụng
          </button>.
          {!termsScrolled && (
            <span className="ml-2 text-xs text-red-500">(Vui lòng đọc và kéo hết nội dung để xác nhận)</span>
          )}
        </label>
      </div>
      {/* Popup for Điều khoản Sử dụng */}
      <Dialog open={openTerms} onOpenChange={(open) => {
        setOpenTerms(open);
        // Khi mở lại dialog, nếu chưa đồng ý thì reset để bắt buộc kéo lại
        if (open && !agreedPolicy) setTermsScrolled(false);
        // Khi đóng dialog, KHÔNG reset để giữ trạng thái đã kéo
      }}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Điều khoản Sử dụng</DialogTitle>
          </DialogHeader>
          <div
            ref={termsContentRef}
            className="prose max-w-none text-gray-700 max-h-[60vh] overflow-y-auto pr-2 border border-blue-100 rounded"
            onScroll={e => {
              const el = e.target;
              if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
                setTermsScrolled(true);
              }
            }}
          >
            <h3 className="font-bold">A. Vai trò &amp; Trách nhiệm</h3>
            <ul className="list-disc ml-6">
              <li><b>Travyy</b> là nền tảng công nghệ kết nối Khách hàng với các Nhà cung cấp dịch vụ du lịch độc lập.</li>
              <li>Travyy <b>không</b> trực tiếp tổ chức, điều hành hay sở hữu các tour, phương tiện vận chuyển hoặc hướng dẫn viên.</li>
              <li>Travyy <b>không chịu trách nhiệm pháp lý</b> đối với:
                <ul className="list-disc ml-6">
                  <li>Bất kỳ tai nạn, thương tích, tử vong, mất mát hay thiệt hại tài sản cá nhân nào xảy ra trong quá trình tham gia tour.</li>
                  <li>Chất lượng dịch vụ tour không đúng mô tả của Nhà cung cấp.</li>
                  <li>Việc Nhà cung cấp hủy tour, thay đổi lịch trình, hoặc không cung cấp dịch vụ (Travyy sẽ hoàn tiền theo chính sách hủy tour mục B).</li>
                </ul>
              </li>
            </ul>
            <h3 className="font-bold mt-4">B. Chính sách Hủy tour &amp; Hoàn tiền</h3>
            <ul className="list-disc ml-6">
              <li>Hủy <b>trước 14 ngày</b> so với ngày khởi hành: <b>Hoàn 100%</b></li>
              <li>Hủy <b>từ 7 ngày đến dưới 14 ngày</b> so với ngày khởi hành: <b>Hoàn 50%</b></li>
              <li>Hủy <b>trong vòng 7 ngày</b> so với ngày khởi hành: <b>Không hoàn tiền</b></li>
              <li><b>Không có mặt (No-show):</b> Không hoàn tiền</li>
              <li><b>Nếu Khách hàng hủy:</b> Áp dụng theo các mốc trên.</li>
              <li><b>Nếu lỗi do Nhà cung cấp hủy:</b> Khách hàng sẽ được hoàn tiền 100%. Nền tảng có thể tặng thêm voucher/giảm giá cho lần đặt sau.</li>
              <li><b>Trường hợp Bất khả kháng:</b> (Thiên tai, dịch bệnh, chiến tranh...) Khách hàng được đổi ngày miễn phí hoặc hoàn 100% giá trị tour (nếu tour chưa diễn ra) dưới dạng voucher.</li>
              <li>Khách hàng phải thao tác hủy trên nền tảng Travyy để được xử lý và theo dõi.</li>
              <li><b>Hoàn về Ví điện tử (MoMo, ZaloPay...):</b> 1-3 ngày làm việc.</li>
              <li><b>Hoàn về Thẻ ATM nội địa/Chuyển khoản:</b> 3-7 ngày làm việc.</li>
              <li><b>Hoàn về Thẻ tín dụng/Ghi nợ quốc tế (Visa, Mastercard):</b> 7-15 ngày làm việc (tùy ngân hàng và chu kỳ sao kê).</li>
              <li><b>Lưu ý:</b> Ngày làm việc không bao gồm Thứ 7, Chủ Nhật và các ngày Lễ, Tết.</li>
            </ul>
            <h3 className="font-bold mt-4">C. Trách nhiệm của Khách hàng</h3>
            <ul className="list-disc ml-6">
              <li>Cung cấp thông tin cá nhân chính xác khi đặt tour.</li>
              <li>Tự chịu trách nhiệm về giấy tờ tùy thân hợp lệ cho chuyến đi.</li>
              <li>Có mặt đúng giờ tại điểm tập kết. Mọi sự chậm trễ (No-show) sẽ không được hoàn tiền (xem mục B).</li>
              <li>Tuân thủ quy tắc an toàn và hướng dẫn của Nhà cung cấp tại điểm đến.</li>
            </ul>
            <h3 className="font-bold mt-4">D. Quy trình Đặt tour &amp; Xác nhận</h3>
            <ul className="list-disc ml-6">
              <li>Giá tour hiển thị đã bao gồm/chưa bao gồm các dịch vụ như mô tả trong phần chi tiết tour.</li>
              <li>Đơn đặt tour chỉ được xem là "Thành công" sau khi thanh toán và nhận được Email xác nhận hoặc Voucher điện tử từ Travyy.</li>
            </ul>
            <h3 className="font-bold mt-4">E. Đánh giá của Khách hàng</h3>
            <ul className="list-disc ml-6">
              <li>Khách hàng cấp phép cho Travyy sử dụng, hiển thị, chỉnh sửa (ẩn/xóa review vi phạm) các nội dung đánh giá trên nền tảng.</li>
            </ul>
            <h3 className="font-bold mt-4">F. Giải quyết Tranh chấp</h3>
            <ul className="list-disc ml-6">
              <li>Khiếu nại: Khách hàng liên hệ CSKH Travyy khi có vấn đề về chất lượng tour.</li>
              <li>Travyy đóng vai trò trung gian hòa giải, tiếp nhận khiếu nại và làm việc với Nhà cung cấp để đưa ra giải pháp hợp lý.</li>
              <li>Mọi tranh chấp không thể hòa giải sẽ được giải quyết theo luật pháp Việt Nam.</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
      {/* pay button */}
      <button
        onClick={handlePayment}
        disabled={!canPay}
        className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
          canPay
            ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        {isProcessingPayment ? "Đang xử lý..."
          : !isFormValid ? "Vui lòng nhập thông tin"
          : !selectedPayment ? "Vui lòng chọn phương thức thanh toán"
          : !agreedPolicy ? "Vui lòng xác nhận chính sách"
          : finalTotal > 0 ? `Thanh toán ${finalTotal.toLocaleString('vi-VN')}₫` : "Xác nhận đặt tour"}
      </button>
    </div>
  );
}