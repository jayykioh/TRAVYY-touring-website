// 📁 src/pages/GuideManagement.jsx
// ============================================

import React, { useState, useMemo, useEffect } from "react";
import {
  RefreshCw,
  Download,
  Users,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

// Components
import StatCard from "../components/Dashboard/StatsCard";
import GuideFilters from "../components/Guides/GuideFilters";
import GuideCard from "../components/Guides/GuideCard";
import Pagination from "../components/Common/Pagination";

// Services
import * as guideService from "../services/guideService";

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
  const itemsPerPage = 10;

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
      } else {
        toast.error(result.error || "Không thể tải dữ liệu hướng dẫn viên");
        setGuides([]);
      }
    } catch (error) {
      console.error("❌ Load guides error:", error);
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
      subtitle: "Hướng dẫn viên",
      icon: Users,
      color: "blue",
    },
    {
      id: "verified",
      label: "Đã xác minh",
      value: guideStats.verified,
      subtitle: "HDV đã xác minh",
      icon: CheckCircle,
      color: "green",
    },
    {
      id: "pending",
      label: "Chờ xác minh",
      value: guideStats.pending,
      subtitle: "Cần xử lý",
      icon: Clock,
      color: "yellow",
    },
    {
      id: "rating",
      label: "Đánh giá TB",
      value: `${guideStats.averageRating}⭐`,
      subtitle: "Trung bình",
      icon: Star,
      color: "purple",
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
    toast.info(`Xem chi tiết: ${guide.name}\nĐây là chức năng demo`);
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
      console.error("❌ Update guide status error:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý Hướng dẫn viên
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý và theo dõi hướng dẫn viên trong hệ thống
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {filteredGuides.length} / {guides.length} hướng dẫn viên
            </div>
            <div className="flex gap-3">
              <div className="text-sm text-gray-600">
                Tổng doanh thu:{" "}
                <span className="font-bold text-green-600">
                  ₫{formatPrice(guideStats.totalRevenue)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Tổng tours:{" "}
                <span className="font-bold text-blue-600">
                  {guideStats.totalTours}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <GuideFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Guides Grid */}
        {filteredGuides.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy hướng dẫn viên
            </h3>
            <p className="text-gray-600">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                onView={handleViewGuide}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
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
    </div>
  );
};

export default GuideManagement;
