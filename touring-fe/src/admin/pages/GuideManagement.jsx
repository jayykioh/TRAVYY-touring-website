// 📁 src/pages/GuideManagement.jsx
// ============================================
// All Guides Management - Consolidated Page
// ============================================

import React, { useState, useMemo, useEffect } from "react";
import {
  RefreshCw,
  Download,
  Users,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

// Components
import GuideFilters from "../components/Guides/GuideFilters";
import GuideCard from "../components/Guides/GuideCard";
import GuideDetailModal from "../components/Guides/GuideDetailModal";
import Pagination from "../components/Common/Pagination";

// Services
import * as guideService from "../services/guideService";
import logger from "../../utils/logger";

// Utils
import {
  searchGuides,
  filterByStatus,
  exportGuidesToCSV,
  downloadCSV,
  formatPrice,
} from "../utils/guideHelpers";

const GuideManagement = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGuideId, setSelectedGuideId] = useState(null);
  const itemsPerPage = 12; // Increased for better grid display

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    setLoading(true);
    try {
      const result = await guideService.getTourGuides({
        search: searchTerm,
        status: statusFilter,
      });

      if (result.success) {
        const transformedGuides = result.data.map(
          guideService.transformUserToGuide
        );
        setGuides(transformedGuides);
        // ✅ Chỉ log ra logger (debug), không hiện toast mỗi lần load
        logger.debug(`✅ Loaded ${transformedGuides.length} guides`);
      } else {
        toast.error(result.error || "Không thể tải dữ liệu hướng dẫn viên");
        setGuides([]);
      }
    } catch (error) {
      logger.error("❌ Load guides error:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadGuides();
    toast.success("Đã làm mới dữ liệu");
  };

  const filteredGuides = useMemo(() => {
    let result = guides;
    result = searchGuides(result, searchTerm);
    result = filterByStatus(result, statusFilter);
    return result;
  }, [guides, searchTerm, statusFilter]);

  // Calculate stats from transformed guides
  const guideStats = useMemo(
    () => guideService.calculateGuideStats(guides),
    [guides]
  );

  const stats = [
    {
      id: "total",
      label: "Tổng HDV",
      value: guideStats.total,
      subtitle: `${guideStats.active} đang hoạt động`,
      icon: Users,
      color: "blue",
      trend: "+12%",
    },
    {
      id: "verified",
      label: "Đã xác minh",
      value: guideStats.verified,
      subtitle: `${Math.round(
        (guideStats.verified / (guideStats.total || 1)) * 100
      )}% tổng số`,
      icon: CheckCircle,
      color: "green",
      trend: "+5%",
    },
    {
      id: "pending",
      label: "Chờ xử lý",
      value: guideStats.pending,
      subtitle: "Cần xem xét",
      icon: Clock,
      color: "yellow",
      trend: "-3%",
    },
    {
      id: "revenue",
      label: "Doanh thu",
      value: `₫${formatPrice(guideStats.totalRevenue)}`,
      subtitle: `${guideStats.totalTours} tours`,
      icon: DollarSign,
      color: "purple",
      trend: "+18%",
    },
  ];

  const handleExport = () => {
    if (filteredGuides.length === 0) {
      toast.error("Không có dữ liệu để export");
      return;
    }
    const csvContent = exportGuidesToCSV(filteredGuides);
    downloadCSV(
      csvContent,
      `guides_${new Date().toISOString().split("T")[0]}.csv`
    );
    toast.success("Export thành công!");
  };

  const handleViewGuide = (guide) => {
    setSelectedGuideId(guide.id);
  };

  const handleCloseDetail = () => {
    setSelectedGuideId(null);
  };

  const handleStatusChange = async (guide, newStatus, reason) => {
    try {
      const result = await guideService.updateGuideStatus(
        guide.id,
        newStatus,
        reason
      );

      if (result.success) {
        // Update local state
        setGuides(
          guides.map((g) =>
            g.id === guide.id
              ? { ...g, verificationStatus: newStatus, statusReason: reason }
              : g
          )
        );
        toast.success(
          result.message || `Đã chuyển trạng thái ${guide.name} thành công!`
        );
      } else {
        toast.error(result.error || "Cập nhật thất bại");
      }
    } catch (error) {
      logger.error("❌ Update guide status error:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse mx-auto mb-4"></div>
            <RefreshCw
              className="w-10 h-10 text-blue-600 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{ marginTop: "-40px" }}
            />
          </div>
          <p className="text-gray-600 font-medium">
            Đang tải dữ liệu hướng dẫn viên...
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Vui lòng đợi trong giây lát
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
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
              primary: "#10b981",
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
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Users className="w-10 h-10" />
                Quản lý Hướng dẫn viên
              </h1>
              <p className="text-blue-100 text-lg flex items-center gap-2">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                {filteredGuides.length} hướng dẫn viên • {guideStats.active}{" "}
                đang hoạt động
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                className="px-5 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl flex items-center gap-2 transition-all duration-200 font-medium"
              >
                <Download className="w-5 h-5" />
                Export
              </button>
              <button
                onClick={handleRefresh}
                className="px-5 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl flex items-center gap-2 transition-all duration-200 font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards with better styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
              {stat.trend && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span
                    className={`text-sm font-medium ${
                      stat.trend.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.trend}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    vs tháng trước
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Filters with better design */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <GuideFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </div>

        {/* Guides Grid */}
        {filteredGuides.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-16 text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Không tìm thấy hướng dẫn viên
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                : "Chưa có hướng dẫn viên nào trong hệ thống"}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Result count */}
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-gray-600">
                Hiển thị{" "}
                <span className="font-semibold text-gray-900">
                  {filteredGuides.length}
                </span>{" "}
                kết quả
                {searchTerm && ` cho "${searchTerm}"`}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span>
                    Tổng doanh thu:{" "}
                    <span className="font-bold text-green-600">
                      ₫{formatPrice(guideStats.totalRevenue)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>
                    Đánh giá TB:{" "}
                    <span className="font-bold text-yellow-600">
                      {guideStats.averageRating}⭐
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((guide) => (
                  <GuideCard
                    key={guide.id}
                    guide={guide}
                    onView={handleViewGuide}
                    onStatusChange={handleStatusChange}
                  />
                ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {filteredGuides.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredGuides.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={filteredGuides.length}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>

      {/* Guide Detail Modal */}
      {selectedGuideId && (
        <GuideDetailModal
          guideId={selectedGuideId}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default GuideManagement;
