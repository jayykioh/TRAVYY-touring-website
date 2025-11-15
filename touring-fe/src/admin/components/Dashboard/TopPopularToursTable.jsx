import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const TopPopularToursTable = ({ data = [] }) => {
  const getRankBadge = (rank) => {
    const badges = {
      1: "🥇",
      2: "🥈",
      3: "🥉",
    };
    return badges[rank] || rank;
  };

  const getTrendIcon = (trend) => {
    if (trend === "up")
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === "down")
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 5 Tour phổ biến nhất
        </h3>
        <div className="text-center py-8 text-gray-500">Chưa có dữ liệu</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Top 5 Tour phổ biến nhất
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#007980] text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                TÊN TOUR
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold">
                BOOKINGS
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold">
                DOANH THU
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold">
                XU HƯỚNG
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((tour) => (
              <tr
                key={tour.tourId}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Rank */}
                <td className="px-4 py-4">
                  <span className="text-2xl">{getRankBadge(tour.rank)}</span>
                </td>

                {/* Tour Info */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={tour.thumbnail || "/placeholder-tour.jpg"}
                      alt={tour.title}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder-tour.jpg";
                      }}
                    />
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {tour.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        ⭐ {tour.rating} ({tour.reviewCount} reviews)
                      </p>
                    </div>
                  </div>
                </td>

                {/* Bookings */}
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                    {tour.bookings}
                  </span>
                </td>

                {/* Revenue */}
                <td className="px-4 py-4 text-right">
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(tour.revenue)}
                  </span>
                </td>

                {/* Trend */}
                <td className="px-4 py-4 text-center">
                  {getTrendIcon(tour.trend)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopPopularToursTable;
