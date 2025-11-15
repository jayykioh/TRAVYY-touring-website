import React from "react";
import { Tag, MapPin, Calendar, Users, Map, Clock } from "lucide-react";

export default function OrderSummary({ items = [], voucherDiscount = 0, voucherCode = null }) {
  const originalTotal = items.reduce((s, t) => s + (t.originalPrice || t.price || 0), 0);
  const total = items.reduce((s, t) => s + (t.price || 0), 0);
  const discountTotal = Math.max(0, originalTotal - total);
  const discountPercent = originalTotal ? Math.round((discountTotal / originalTotal) * 100) : 0;
  
  // Final total after voucher
  const finalTotal = Math.max(0, total - voucherDiscount);

  // Check if this is a tour-request (has itinerary)
  const isTourRequest = items.length > 0 && items[0]?.itinerary && items[0].itinerary.length > 0;

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

      {/* <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
        <p className="text-sm text-gray-700">
          Bằng việc hoàn tất thanh toán, bạn đồng ý với{" "}
          <a href="#" className="text-blue-600 hover:underline font-medium">Điều khoản sử dụng</a>
        </p>
      </div> */}

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 mb-3">Chi tiết tours ({items.length} tours)</h3>
        
        {/* Tour-Request with Itinerary */}
        {isTourRequest ? (
          items.map((tour) => (
            <div key={tour.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              {/* Tour Header */}
              <div className="flex gap-4 mb-4">
                {tour.image && (
                  <img src={tour.image} alt={tour.name} className="w-24 h-24 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2 text-base">{tour.name}</h4>
                  {tour.zoneName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      {tour.zoneName}
                    </div>
                  )}
                  {tour.numberOfDays && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-green-500" />
                      {tour.numberOfDays} ngày
                    </div>
                  )}
                </div>
              </div>
              
              {/* Price Section */}
              <div className="border-t border-gray-200 pt-3 mb-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Giá tour:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {(tour.price || 0).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              {/* Itinerary Section */}
              {tour.itinerary && tour.itinerary.length > 0 && (
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Map className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-gray-900">Hành trình ({tour.itinerary.length} điểm)</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {tour.itinerary.map((item, idx) => (
                      <div key={idx} className="flex gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">{item.name || item.activity}</div>
                          {item.address && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {item.address}
                            </div>
                          )}
                          {(item.startTime || item.duration) && (
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                              {item.startTime && (
                                <span className="flex items-center gap-1">
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
              )}
            </div>
          ))
        ) : (
          /* Regular Tours Display */
          items.map((tour) => (
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
          ))
        )}
      </div>
    </div>
  );
}
