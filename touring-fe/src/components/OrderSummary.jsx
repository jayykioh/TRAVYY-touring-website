import { useState, useMemo } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function OrderSummary({ totals, cartItems, onCheckout }) {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === "WELCOME10") {
      setAppliedPromo({ code, discount: 0.1, type: "percentage" });
    } else if (code === "SAVE50K") {
      setAppliedPromo({ code, discount: 50000, type: "fixed" });
    } else {
      setAppliedPromo(null);
    }
  };

  const fmt = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }),
    []
  );

  const subtotalAll = totals?.all ?? 0;         // tổng tất cả dòng
  const selectedTotal = totals?.selected ?? 0;  // tạm tính các dòng đã chọn

  // Giảm giá áp trên selectedTotal
  const discount =
    appliedPromo?.type === "percentage"
      ? Math.floor(selectedTotal * (appliedPromo.discount || 0))
      : appliedPromo?.type === "fixed"
      ? Math.min(appliedPromo.discount || 0, selectedTotal)
      : 0;

  const finalTotal = Math.max(0, selectedTotal - discount);

  const canCheckout =
    (cartItems || []).some(
      (i) => i.available && i.selected && ((i.adults || 0) > 0 || (i.children || 0) > 0)
    ) && finalTotal > 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Tóm Tắt Đơn Hàng</h2>

      {/* Mã giảm giá */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Mã giảm giá
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Nhập mã"
            className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={applyPromo}
            className="px-6 py-2 bg-white text-gray-800 font-medium 
                       rounded-xl shadow-sm border border-gray-200
                       hover:bg-gray-50 hover:scale-105 
                       active:scale-95
                       transition-all duration-300 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Áp dụng
          </button>
        </div>
        {appliedPromo && (
          <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Mã {appliedPromo.code} đã được áp dụng!</span>
          </div>
        )}
      </div>

      {/* Tổng tiền */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Tổng tất cả:</span>
          <span>{fmt.format(subtotalAll)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tạm tính (đã chọn):</span>
          <span>{fmt.format(selectedTotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Giảm giá:</span>
            <span>-{fmt.format(discount)}</span>
          </div>
        )}
        <div className="border-t pt-2 flex justify-between items-center">
          <span className="font-semibold text-gray-800">Tổng thanh toán:</span>
          <span className="text-2xl font-bold text-blue-600">
            {fmt.format(finalTotal)}
          </span>
        </div>
      </div>

      {/* Nút thanh toán */}
      <button
        disabled={!canCheckout}
        className="w-full py-3 rounded-2xl font-semibold border border-black/10 bg-blue-600 text-white 
                   transform hover:scale-105 transition-transform duration-300 ease-in-out 
                   disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        onClick={onCheckout}           
      >
        Thanh Toán
      </button>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg flex gap-2">
        <AlertCircle className="w-5 h-5 text-blue-600" />
        <p className="text-sm text-blue-700">
          Hủy miễn phí trước 24 giờ khởi hành để được hoàn tiền 100%
        </p>
      </div>
    </div>
  );
}
