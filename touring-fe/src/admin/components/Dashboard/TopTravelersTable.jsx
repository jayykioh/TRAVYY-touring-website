import React from "react";
import { TrendingUp, User } from "lucide-react";

export default function TopTravelersTable({ data = [] }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Hiển thị loading state nếu chưa có data
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Top Travelers
              </h3>
              <p className="text-sm text-gray-500">
                Khách đặt tour nhiều nhất tháng này
              </p>
            </div>
          </div>
        </div>
        <div className="text-center py-12 text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Top Travelers
            </h3>
            <p className="text-sm text-gray-500">
              Khách đặt tour nhiều nhất tháng này
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((traveler, index) => (
          <div
            key={traveler.id || traveler._id || `traveler-${index}`}
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-100 hover:border-emerald-300 transition-all cursor-pointer"
          >
            {/* Rank Badge */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">
                  {index + 1}
                </span>
              </div>
            </div>

            {/* Avatar */}
            <div className="flex-shrink-0">
              {traveler.avatar ? (
                <img
                  src={traveler.avatar}
                  alt={traveler.name}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center"
                style={{ display: traveler.avatar ? "none" : "flex" }}
              >
                <User className="w-5 h-5 text-emerald-700" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {traveler.name}
              </h4>
              <p className="text-xs text-gray-600 truncate">{traveler.email}</p>
            </div>

            {/* Stats */}
            <div className="text-right">
              <div className="text-sm font-bold text-emerald-600">
                {traveler.bookings || 0} tour
              </div>
              <div className="text-xs text-gray-500">
                {formatCurrency(traveler.totalSpent || 0)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
