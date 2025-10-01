import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function OrderSummary({ subtotal, total, cartItems }) {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  const applyPromo = () => {
    if (promoCode.toUpperCase() === "WELCOME10") {
      setAppliedPromo({ code: "WELCOME10", discount: 0.1, type: "percentage" });
    } else if (promoCode.toUpperCase() === "SAVE50K") {
      setAppliedPromo({ code: "SAVE50K", discount: 50000, type: "fixed" });
    } else {
      setAppliedPromo(null);
    }
  };

  // Áp dụng giảm giá trên total (chỉ item được chọn)
  let discount = 0;
  if (appliedPromo) {
    discount =
      appliedPromo.type === "percentage"
        ? total * appliedPromo.discount
        : appliedPromo.discount;
  }

  const finalTotal = total - discount;

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
            className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={applyPromo}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
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
          <span>₫{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tạm tính (đã chọn):</span>
          <span>₫{total.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Giảm giá:</span>
            <span>-₫{discount.toLocaleString()}</span>
          </div>
        )}
        <div className="border-t pt-2 flex justify-between items-center">
          <span className="font-semibold text-gray-800">Tổng thanh toán:</span>
          <span className="text-2xl font-bold text-orange-600">
            ₫{finalTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Nút thanh toán */}
      <button
        disabled={
          cartItems.filter(
            (i) => i.available && i.selected && (i.adults > 0 || i.children > 0)
          ).length === 0
        }
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:shadow-xl disabled:opacity-50"
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
