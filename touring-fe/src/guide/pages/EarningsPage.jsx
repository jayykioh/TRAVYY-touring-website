import React, { useState, useMemo, useEffect } from "react";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import { getGuideEarnings } from "../data/guideAPI";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const EarningsPage = () => {
  const [earningsData, setEarningsData] = useState(null);
  const [range, setRange] = useState("week");

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const data = await getGuideEarnings();
        setEarningsData(data);
      } catch (error) {
        console.error("Failed to fetch earnings:", error);
        // Fallback data
        setEarningsData({
          summary: { thisWeek: 0, thisMonth: 0, lastMonth: 0, totalEarnings: 0, pendingPayment: 0 },
          weeklyData: [],
          recentPayments: [],
          monthlyStats: [],
          yearlyStats: []
        });
      } finally {
        // finished fetching — loading state removed because it was unused
      }
    };

    fetchEarnings();
  }, []);

  const summary = earningsData?.summary || { thisWeek: 0, thisMonth: 0, lastMonth: 0, totalEarnings: 0, pendingPayment: 0 };
  const recentPayments = earningsData?.recentPayments || [];

  const chartData = useMemo(() => {
    const weekly = earningsData?.weeklyData || [];
    const monthly = earningsData?.monthlyStats || [];
    const yearly = earningsData?.yearlyStats || [];

    if (range === "week") {
      return {
        title: "Tuần này",
        data: weekly.map((d) => ({
          name: d.day,
          value: d.amount || 0,
        })),
      };
    }
    if (range === "month") {
      return {
        title: "Tháng này",
        data: monthly.map((d) => ({
          name: d.month,
          value: d.earnings || 0,
        })),
      };
    }
    return {
      title: "Năm nay",
      data: yearly.map((d) => ({
        name: d.month,
        value: d.earnings || 0,
      })),
    };
  }, [range, earningsData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg">
          <p className="font-semibold">
            {(payload[0].value / 1000000).toFixed(1)}M VND
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thu nhập</h1>
        <p className="text-gray-500">
          Theo dõi thu nhập và các khoản thanh toán
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Tuần này</p>
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-[#02A0AA] mb-1">
            {summary.thisWeek.toLocaleString("vi-VN")}
          </p>
          <p className="text-xs text-gray-400">VND</p>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Tháng này</p>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            {summary.thisMonth.toLocaleString("vi-VN")}
          </p>
          <p className="text-xs text-gray-400">VND</p>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Tổng thu nhập</p>
            <span className="text-2xl">💎</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            {summary.totalEarnings.toLocaleString("vi-VN")}
          </p>
          <p className="text-xs text-gray-400">VND</p>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-orange-700">
              Chờ thanh toán
            </p>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-orange-600 mb-1">
            {summary.pendingPayment.toLocaleString("vi-VN")}
          </p>
          <p className="text-xs text-orange-400">VND</p>
        </Card>
      </div>

      {/* Chart with Recharts */}
      <Card className="mb-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900">{chartData.title}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setRange("week")}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                range === "week"
                  ? "bg-[#02A0AA] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setRange("month")}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                range === "month"
                  ? "bg-[#02A0AA] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tháng
            </button>
            <button
              onClick={() => setRange("year")}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                range === "year"
                  ? "bg-[#02A0AA] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Năm
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={chartData.data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#02A0AA" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#02A0AA" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#02A0AA"
              strokeWidth={3}
              fill="url(#colorValue)"
              animationDuration={1200}
              animationEasing="ease-out"
              dot={{
                fill: "#fff",
                stroke: "#02A0AA",
                strokeWidth: 3,
                r: 5,
              }}
              activeDot={{
                r: 7,
                fill: "#02A0AA",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Payments */}
      <Card>
        <h3 className="font-bold text-gray-900 mb-4 text-lg">
          Các khoản thanh toán gần đây
        </h3>
        <div className="space-y-3">
          {recentPayments.map((payment, idx) => (
            <div
              key={payment.id || payment._id || `${payment.tourName}-${payment.date}-${idx}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all hover:shadow-md gap-3"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">
                  {payment.tourName}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(payment.date).toLocaleDateString("vi-VN")}
                  {payment.status === "pending" && payment.expectedPayout && (
                    <span className="ml-2 text-orange-600">
                      • Dự kiến:{" "}
                      {new Date(payment.expectedPayout).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3 sm:text-right">
                <p className="font-bold text-gray-900 mb-1 text-lg">
                  {payment.netAmount.toLocaleString("vi-VN")} VND
                </p>
                <Badge
                  variant={payment.status === "paid" ? "success" : "warning"}
                  size="sm"
                >
                  {payment.status === "paid" ? "Đã thanh toán" : "Đang chờ"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default EarningsPage;
