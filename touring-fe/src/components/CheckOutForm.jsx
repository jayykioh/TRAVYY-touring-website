import React, { useEffect, useRef, useState } from "react";
import { Lock, CreditCard, Wallet, MapPin, User, Phone, Mail } from "lucide-react";
import momoLogo from "@/assets/momo.svg";
import { useAuth } from "@/auth/context"; // đổi đường dẫn nếu bạn không dùng alias @
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import   useLocationOptions  from "../hooks/useLocation";

export default function CheckoutForm({ totalAmount = 0, paymentItems = [] }) {
  const { user } = useAuth() || {};
  const accessToken = user?.token; // hoặc user?.accessToken

  const [selectedPayment, setSelectedPayment] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const didPrefetchRef = useRef(false);

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
        let data = null;
        const r = await fetch("/api/profile", {
          headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        });
        if (r.ok) data = await r.json();
        else {
          const r2 = await fetch("/api/auth/me", {
            headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
            credentials: "include",
          });
          if (r2.ok) data = await r2.json();
        }
        if (data) {
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
        }
      } catch (e) {
        console.error("Prefill profile failed:", e);
      } finally { setIsLoadingProfile(false); }
    })();
  }, [isDialogOpen, accessToken]);

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
      const r = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        console.warn("Update failed:", err);
      } else {
        const updated = await r.json();
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
      }
      setIsDialogOpen(false);
    } catch (e) {
      console.error("Update profile error:", e);
    } finally { setIsLoadingProfile(false); }
  };

  const isFormValid =
    userInfo.name && userInfo.email && userInfo.phone &&
    userInfo.provinceId && userInfo.wardId && userInfo.addressLine;

  const [paying, setPaying] = useState(false);

  const handlePayment = async () => {
    if (!selectedPayment) return;
    if (!isFormValid) return;
    if (selectedPayment === "paypal") {
      window.open("https://www.paypal.com/checkoutnow", "_blank");
      return;
    }
    if (selectedPayment === "momo") {
      try {
        if (totalAmount <= 0) {
          alert("Số tiền không hợp lệ hoặc chưa tính được.");
          return;
        }
        setPaying(true);
        const res = await fetch("/api/payments/momo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
            credentials: "include",
          body: JSON.stringify({
            amount: totalAmount,
            orderInfo: "Thanh toán đơn tour Travyy",
            redirectUrl: `${window.location.origin}/momo-sandbox`,
            items: paymentItems.map(it => ({
              name: it.name,
              price: it.price,
              originalPrice: it.originalPrice,
              tourId: it.tourId,
            }))
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.payUrl) {
          console.warn("MoMo create failed", data);
          alert("Không tạo được phiên thanh toán MoMo");
          return;
        }
        window.location.href = data.payUrl; // redirect to MoMo sandbox
      } catch (e) {
        console.error("MoMo payment error", e);
        alert("Lỗi khi tạo thanh toán MoMo");
      } finally {
        setPaying(false);
      }
    }
  };

  return (
    <div className="w-full lg:w-3/5 bg-white p-6 lg:p-8">
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
                  <Phone className="w-4 h-4 inline mr-1" />Số điện thoại *
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành phố *</label>
                  <select
                    value={userInfo.provinceId} onChange={handleProvinceChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="">{loadingProvince ? "Đang tải..." : "Chọn tỉnh/thành"}</option>
                    {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện *</label>
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
                  <MapPin className="w-4 h-4 inline mr-1" />Địa chỉ cụ thể *
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
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='24' viewBox='0 0 80 24'%3E%3Ctext x='0' y='18' font-family='Arial' font-size='18' font-weight='bold' fill='%23003087'%3EPayPal%3C/text%3E%3C/svg%3E"
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
                <img src={momoLogo} alt="MoMo" className="w-8 h-8 rounded-md shadow-sm" />
                <span className="font-medium text-gray-900">Ví MoMo</span>
              </div>
              <div className="text-pink-600 text-xs font-semibold uppercase tracking-wide">QR</div>
            </div>
          </div>
        </div>
      </div>

      {/* pay button */}
      <button
        onClick={handlePayment}
        disabled={!selectedPayment || !isFormValid || paying}
        className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
          selectedPayment && isFormValid && !paying
            ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        {!isFormValid
          ? "Vui lòng nhập thông tin"
          : !selectedPayment
          ? "Vui lòng chọn phương thức thanh toán"
          : paying
          ? "Đang chuyển đến MoMo..."
          : "Tiếp tục thanh toán"}
      </button>
      {selectedPayment === "momo" && totalAmount > 0 && (
        <p className="text-xs text-center text-gray-500 mt-3">
         
        </p>
      )}
    </div>
  );
}