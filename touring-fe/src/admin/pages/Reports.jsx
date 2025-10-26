// src/admin/pages/Reports.jsx

import React, { useState } from "react";
import { BarChart3, TrendingUp, Users, MapPin, Calendar, Download, Filter, RefreshCw, Eye, FileText } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import StatCard from "../components/Dashboard/StatsCard";
import RevenueChart from "../components/Dashboard/RevenueChart";
import CategoryPieChart from "../components/Dashboard/CategoryPieChart";
import BookingTrendsChart from "../components/Dashboard/BookingTrendsChart";
import ToursByRegionChart from "../components/Dashboard/ToursByRegionChart";
import AgeDistributionChart from "../components/Dashboard/AgeDistributionChart";
import { summaryStats, detailedMetrics } from "../data/mockData";

const Reports = () => {
  const [reportType, setReportType] = useState("overview");
  const [dateRange, setDateRange] = useState("month");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [dashboardStats] = useState(summaryStats);
  const [userMetrics] = useState(detailedMetrics);

  const regions = [
    "all",
    "Đà Nẵng",
    "Hà Nội",
    "Hồ Chí Minh",
    "Hội An",
    "Nha Trang",
    "Phú Quốc",
    "Sapa"
  ];

  const categories = [
    "all",
    "Phiêu lưu",
    "Văn hóa",
    "Biển",
    "Núi",
    "Gia đình",
    "Cuối tuần"
  ];

  const handleRefresh = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setLoading(false);
        toast.success("Dữ liệu báo cáo đã cập nhật!");
      }, 1500);
    } catch {
      setLoading(false);
      toast.error("Lỗi khi cập nhật dữ liệu!");
    }
  };

  const handleExportPDF = () => {
    try {
      toast.success("Đang tạo file PDF...");
      setTimeout(() => {
        toast.success("Tải xuống file PDF thành công!");
      }, 2000);
    } catch {
      toast.error("Lỗi khi xuất PDF!");
    }
  };

  const handleExportExcel = () => {
    try {
      toast.success("Đang tạo file Excel...");
      setTimeout(() => {
        toast.success("Tải xuống file Excel thành công!");
      }, 2000);
    } catch {
      toast.error("Lỗi khi xuất Excel!");
    }
  };

  const handleSendEmail = () => {
    try {
      toast.success("Đang gửi báo cáo qua email...");
      setTimeout(() => {
        toast.success("Báo cáo đã được gửi thành công!");
      }, 2000);
    } catch {
      toast.error("Lỗi khi gửi email!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 10px 25px rgba(0, 121, 128, 0.15)",
          },
          success: {
            iconTheme: {
              primary: "#007980",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#007980] to-[#005f65] bg-clip-text text-transparent">
              Báo Cáo & Thống Kê
            </h1>
            <p className="text-gray-600 mt-1">Xem chi tiết doanh thu, tours, khách hàng và hiệu suất kinh doanh</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "overview", label: "Tổng Quan", icon: BarChart3 },
              { id: "revenue", label: "Doanh Thu", icon: TrendingUp },
              { id: "tours", label: "Tours", icon: MapPin },
              { id: "customers", label: "Khách Hàng", icon: Users },
              { id: "booking", label: "Đặt Tour", icon: Calendar },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setReportType(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    reportType === tab.id
                      ? "bg-gradient-to-r from-[#007980] to-[#005f65] text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng Thời Gian</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007980]"
              >
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="quarter">Quý này</option>
                <option value="year">Năm này</option>
                <option value="custom">Tùy chỉnh</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Khu Vực</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007980]"
              >
                {regions.map(region => (
                  <option key={region} value={region}>
                    {region === "all" ? "Tất cả khu vực" : region}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh Mục Tour</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007980]"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "Tất cả danh mục" : category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2">
                <Filter className="w-4 h-4" />
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Xuất Báo Cáo</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={handleExportPDF}
              className="px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <FileText className="w-4 h-4" />
              Xuất PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-3 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Xuất Excel
            </button>
            <button
              onClick={handleSendEmail}
              className="px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <FileText className="w-4 h-4" />
              Gửi Email
            </button>
            <button className="px-4 py-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 flex items-center justify-center gap-2 font-medium transition-colors">
              <Eye className="w-4 h-4" />
              Xem Trước
            </button>
          </div>
        </div>

        {/* Content based on report type */}
        {reportType === "overview" && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tổng Quan Kinh Doanh</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardStats.map((stat) => (
                  <StatCard key={stat.id} stat={stat} />
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Chỉ Số Chính</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {userMetrics.map((metric) => (
                  <StatCard key={metric.id} stat={metric} />
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart />
              <CategoryPieChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BookingTrendsChart />
              <ToursByRegionChart />
            </div>
          </div>
        )}

        {reportType === "revenue" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Báo Cáo Doanh Thu</h2>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <RevenueChart />
              </div>
            </div>

            {/* Revenue Summary Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Chi Tiết Doanh Thu Theo Tháng</h3>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tháng</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Doanh Thu</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Số Tour</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Khách Hàng</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Thay Đổi</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { month: "Tháng 1", revenue: "2.5 tỷ", tours: 245, customers: 1850, change: "+12%" },
                    { month: "Tháng 2", revenue: "2.8 tỷ", tours: 267, customers: 2010, change: "+8%" },
                    { month: "Tháng 3", revenue: "3.1 tỷ", tours: 289, customers: 2150, change: "+11%" },
                    { month: "Tháng 4", revenue: "3.4 tỷ", tours: 312, customers: 2340, change: "+9%" },
                    { month: "Tháng 5", revenue: "3.8 tỷ", tours: 334, customers: 2520, change: "+13%" },
                    { month: "Tháng 6", revenue: "4.2 tỷ", tours: 356, customers: 2680, change: "+11%" },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{row.month}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">{row.revenue}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">{row.tours}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">{row.customers}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          {row.change}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === "tours" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Báo Cáo Tours</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <CategoryPieChart />
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <ToursByRegionChart />
                </div>
              </div>
            </div>

            {/* Tours Summary Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Tours Phổ Biến Nhất</h3>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên Tour</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Khu Vực</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Đặt/Tháng</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Doanh Thu</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Bà Nà Hills - Cầu Vàng", region: "Đà Nẵng", bookings: 287, revenue: "862M", rating: 4.8 },
                    { name: "Hội An - Phố Cổ", region: "Hội An", bookings: 256, revenue: "768M", rating: 4.7 },
                    { name: "Hạ Long Bay", region: "Hạ Long", bookings: 234, revenue: "945M", rating: 4.9 },
                    { name: "Sa Pa - Trekking", region: "Sapa", bookings: 198, revenue: "645M", rating: 4.6 },
                    { name: "Nha Trang - Biển", region: "Nha Trang", bookings: 187, revenue: "521M", rating: 4.5 },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{row.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.region}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">{row.bookings}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">{row.revenue}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1 font-semibold text-gray-900">{row.rating}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === "customers" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Báo Cáo Khách Hàng</h2>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <AgeDistributionChart />
              </div>
            </div>

            {/* Customers Summary Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Khách Hàng Hàng Đầu</h3>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên Khách</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Tours Đặt</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Chi Tiêu</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Nguyễn Văn A", email: "vana@email.com", tours: 12, spent: "45.2M", status: "VIP" },
                    { name: "Trần Thị B", email: "thib@email.com", tours: 8, spent: "32.5M", status: "Thường xuyên" },
                    { name: "Phạm Văn C", email: "vanc@email.com", tours: 6, spent: "28.3M", status: "Thường xuyên" },
                    { name: "Hoàng Thị D", email: "thid@email.com", tours: 5, spent: "22.1M", status: "Tiềm năng" },
                    { name: "Lý Văn E", email: "vane@email.com", tours: 4, spent: "18.5M", status: "Mới" },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{row.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.email}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900">{row.tours}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">{row.spent}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          row.status === "VIP" ? "bg-purple-100 text-purple-700" :
                          row.status === "Thường xuyên" ? "bg-blue-100 text-blue-700" :
                          row.status === "Tiềm năng" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === "booking" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Báo Cáo Đặt Tour</h2>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <BookingTrendsChart />
              </div>
            </div>

            {/* Booking Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-2">Tổng Đặt Hôm Nay</p>
                <p className="text-3xl font-bold text-gray-900">24</p>
                <p className="text-sm text-green-600 mt-2">+12% so với hôm qua</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-2">Chưa Xác Nhận</p>
                <p className="text-3xl font-bold text-yellow-600">8</p>
                <p className="text-sm text-yellow-600 mt-2">Cần xử lý</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-2">Hủy Đơn</p>
                <p className="text-3xl font-bold text-red-600">2</p>
                <p className="text-sm text-red-600 mt-2">Tuần này</p>
              </div>
            </div>

            {/* Booking Details Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Đơn Đặt Gần Đây</h3>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mã Đơn</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Khách Hàng</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tour</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Giá</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: "#ORD001", customer: "Nguyễn Văn A", tour: "Bà Nà Hills", price: "2.4M", status: "Xác nhận" },
                    { id: "#ORD002", customer: "Trần Thị B", tour: "Hội An", price: "1.8M", status: "Chờ thanh toán" },
                    { id: "#ORD003", customer: "Phạm Văn C", tour: "Hạ Long", price: "3.2M", status: "Xác nhận" },
                    { id: "#ORD004", customer: "Hoàng Thị D", tour: "Sapa", price: "1.9M", status: "Hủy" },
                    { id: "#ORD005", customer: "Lý Văn E", tour: "Nha Trang", price: "2.1M", status: "Xác nhận" },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">{row.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{row.customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.tour}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">{row.price}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          row.status === "Xác nhận" ? "bg-green-100 text-green-700" :
                          row.status === "Chờ thanh toán" ? "bg-yellow-100 text-yellow-700" :
                          row.status === "Hủy" ? "bg-red-100 text-red-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
