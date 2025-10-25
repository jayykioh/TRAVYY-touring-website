import React from "react";
import { Tag } from "lucide-react";

export default function OrderSummary({ items = [], voucherDiscount = 0, voucherCode = null }) {
  const originalTotal = items.reduce((s, t) => s + (t.originalPrice || t.price || 0), 0);
  const total = items.reduce((s, t) => s + (t.price || 0), 0);
  const discountTotal = Math.max(0, originalTotal - total);
  const discountPercent = originalTotal ? Math.round((discountTotal / originalTotal) * 100) : 0;
  
  // Final total after voucher
  const finalTotal = Math.max(0, total - voucherDiscount);

  return (
    <div className="w-full lg:w-2/5 bg-gray-50 p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tổng quan đơn hàng</h2>

      <div className="bg-white rounded-xl p-5 mb-6 shadow-sm">
        <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Giá gốc:</span>
            <span className="text-gray-900 font-medium">{originalTotal.toLocaleString("vi-VN")}đ</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Giảm giá ({discountPercent}%):</span>
            <span className="text-green-600 font-medium">-{discountTotal.toLocaleString("vi-VN")}đ</span>
          </div>
          
          {/* Voucher discount */}
          {voucherDiscount > 0 && (
            <div className="flex justify-between text-sm bg-gradient-to-r from-orange-50 to-red-50 -mx-3 px-3 py-2 rounded-lg">
              <span className="text-orange-700 font-medium flex items-center gap-1">
                <Tag className="w-4 h-4" />
                Voucher {voucherCode && `(${voucherCode})`}:
              </span>
              <span className="text-orange-600 font-bold">-{voucherDiscount.toLocaleString("vi-VN")}đ</span>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Tổng cộng ({items.length} tours):</span>
          <span className="text-2xl font-bold text-blue-600">{finalTotal.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
        <p className="text-sm text-gray-700">
          Bằng việc hoàn tất thanh toán, bạn đồng ý với{" "}
          <a href="#" className="text-blue-600 hover:underline font-medium">Điều khoản sử dụng</a>
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 mb-3">Chi tiết tours ({items.length} tours)</h3>
        {items.map((tour) => (
          <div key={tour.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex gap-4">
              <img src={tour.image} alt={tour.name} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2 text-sm leading-tight">{tour.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-600">
                    {(tour.price || 0).toLocaleString("vi-VN")}đ
                  </span>
                  {tour.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {tour.originalPrice.toLocaleString("vi-VN")}đ
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
