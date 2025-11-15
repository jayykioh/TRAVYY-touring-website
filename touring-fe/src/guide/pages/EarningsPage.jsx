import React, { useState, useMemo, useEffect } from "react";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import { getGuideEarnings } from "../data/guideAPI";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, BarChart2, Star, Clock } from "lucide-react";
import logger from '@/utils/logger';

const PRIMARY = "#02A0AA";

const EarningsPage = () => {
  const [earningsData, setEarningsData] = useState(null);
  const [range, setRange] = useState("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const data = await getGuideEarnings();
        setEarningsData(data);
      } catch (error) {
        logger.error("Failed to fetch earnings:", error);
        setEarningsData({
          summary: {
            thisWeek: 0,
            thisMonth: 0,
            lastMonth: 0,
            totalEarnings: 0,
            pendingPayment: 0,
          },
          weeklyData: [],
          recentPayments: [],
          monthlyStats: [],
          yearlyStats: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const summary = earningsData?.summary || {};
  const recentPayments = earningsData?.recentPayments || [];

  const chartData = useMemo(() => {
    if (!earningsData) return { title: "", data: [] };

    if (range === "week")
      return {
        title: "Tuần này",
        data: earningsData.weeklyData.map((d) => ({
          name: d.day,
          value: d.amount || 0,
        })),
      };

    if (range === "month")
      return {
        title: "Tháng này",
        data: earningsData.monthlyStats.map((d) => ({
          name: d.month,
          value: d.earnings || 0,
        })),
      };

    return {
      title: "Năm nay",
      data: earningsData.yearlyStats.map((d) => ({
        name: d.month,
        value: d.earnings || 0,
      })),
    };
  }, [range, earningsData]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-white border border-gray-200 px-3 py-2 rounded shadow text-sm">
        {(payload[0].value / 1_000_000).toFixed(1)}M VND
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex justify-center items-center min-h-[50vh]">
        <div
          className="animate-spin rounded-full h-12 w-12 border-2 border-b-transparent"
          style={{ borderColor: PRIMARY }}
        />
      </div>
    );
  }

  return (
    <div className="px-6 py-4 min-h-screen">
      <div className="mb-6 ml-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
          Thu nhập
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Theo dõi thu nhập và các khoản thanh toán
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Tuần này */}
        <Card className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">Tuần này</p>
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#E6F7F8", color: PRIMARY }}
            >
              <Calendar className="w-5 h-5" />
            </span>
          </div>
          <p
            className="text-3xl font-extrabold mb-1"
            style={{ color: "black" }}
          >
            {summary.thisWeek?.toLocaleString("vi-VN")}
          </p>
          <p className="text-xs text-gray-400">VND</p>
        </Card>

        {/* Tháng này */}
        <Card className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">Tháng này</p>
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#E6F7F8", color: PRIMARY }}
            >
              <BarChart2 className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-black mb-1">
            {summary.thisMonth?.toLocaleString("vi-VN")}
          </p>
          <p className="text-xs text-gray-400">VND</p>
        </Card>

        {/* Tổng thu nhập */}
        <Card className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">Tổng thu nhập</p>
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#E6F7F8", color: PRIMARY }}
            >
              <Star className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-black mb-1">
            {summary.totalEarnings?.toLocaleString("vi-VN")}
          </p>
          <p className="text-xs text-gray-400">VND</p>
        </Card>

        {/* Chờ thanh toán (giữ màu cam đặc thù) */}
        <Card className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-orange-700">
              Chờ thanh toán
            </p>
            <span className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-orange-600 mb-1">
            {summary.pendingPayment?.toLocaleString("vi-VN")}
          </p>
          <p className="text-xs text-orange-400">VND</p>
        </Card>
      </div>

      {/* CHART */}
      <Card className="mb-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900">{chartData.title}</h3>

          {/* Range filter (primary) */}
          <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full p-1">
            {["week", "month", "year"].map((key) => (
              <button
                key={key}
                onClick={() => setRange(key)}
                className={`h-9 px-4 rounded-full text-sm font-semibold transition-colors ${
                  range === key
                    ? "text-white shadow"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                style={range === key ? { backgroundColor: PRIMARY } : undefined}
              >
                {key === "week" ? "Tuần" : key === "month" ? "Tháng" : "Năm"}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData.data}>
            <defs>
              <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.25} />
                <stop offset="95%" stopColor={PRIMARY} stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="value"
              stroke={PRIMARY}
              strokeWidth={2}
              fill="url(#primaryGradient)"
              dot={{ r: 4, fill: "#fff", stroke: PRIMARY, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: PRIMARY }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* RECENT PAYMENTS */}
      <Card>
        <h3 className="font-bold text-gray-900 mb-4 text-lg">
          Các khoản thanh toán gần đây
        </h3>

        <div className="space-y-3">
          {recentPayments.map((p, idx) => (
            <div
              key={p.id || p._id || idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{p.tourName}</p>
                <p className="text-xs text-gray-500">
                  {new Date(p.date).toLocaleDateString("vi-VN")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <p className="font-bold text-gray-900 text-lg">
                  {p.netAmount.toLocaleString("vi-VN")} VND
                </p>

                <Badge
                  size="sm"
                  variant={p.status === "paid" ? "success" : "warning"}
                >
                  {p.status === "paid" ? "Đã thanh toán" : "Đang chờ"}
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
