// components/TourManagement.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Download } from "lucide-react";
import { Users, DollarSign, Calendar, MapPin } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useNotifications } from "../context/NotificationContext";
import Modal from "../components/Common/Modal";

// Components
import StatCard from "../components/Dashboard/StatsCard";
import TourFilters from "../components/Tours/TourFilters";
import TourTableRow from "../components/Tours/TourTableRow";
import TourForm from "../components/Tours/TourForm";
import Pagination from "../components/Common/Pagination";

// Data & Utils
import { MOCK_CHART_DATA } from "../data/mockData";
import {
  searchTours,
  filterByStatus,
  sortTours,
  calculateTotalRevenue,
  calculateTotalBookings,
  getToursByStatus,
  exportToursToCSV,
  downloadCSV,
} from "../utils/tourHelpers";

// Items Per Page Selector
const ItemsPerPageSelector = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-700">Hiển thị:</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
      <span className="text-sm text-gray-700">tours/trang</span>
    </div>
  );
};

const TourManagement = () => {
  const { notify } = useNotifications();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    field: "title",
    order: "asc",
  });
  const [showForm, setShowForm] = useState(false);
  const [editingTour, setEditingTour] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, tour: null });

  // Fetch tours data from API
  const fetchTours = async () => {
    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const response = await fetch(`${API_URL}/api/tours`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched tours:", data);
      setTours(data);
    } catch (err) {
      console.error("Failed to fetch tours:", err);
      setError("Không thể tải dữ liệu tour. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Load tours data on component mount
  useEffect(() => {
    fetchTours();
  }, []);

  // Reload tours
  const handleRefresh = () => {
    fetchTours();
  };

  // Apply filters and search
  const filteredTours = useMemo(() => {
    let result = tours;
    result = searchTours(result, searchTerm);
    result = filterByStatus(result, statusFilter);
    result = sortTours(result, sortConfig.field, sortConfig.order);
    return result;
  }, [tours, searchTerm, statusFilter, sortConfig]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTours = filteredTours.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortConfig, itemsPerPage]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Calculate statistics
  const totalRevenue = calculateTotalRevenue(filteredTours);
  const totalBookings = calculateTotalBookings(filteredTours);
  const activeTours = getToursByStatus(tours, "active").length;
  const pendingTours = getToursByStatus(tours, "pending").length;

  // Stats configuration
  const stats = [
    {
      id: "revenue",
      label: "Tổng doanh thu",
      value: `${new Intl.NumberFormat("vi-VN").format(totalRevenue)} VNĐ`,
      subtitle: "Từ các tour đã đặt",
      trend: "up",
      change: "+12.5%",
      icon: DollarSign,
      iconColor: "text-green-600",
      variant: "mint",
      chartData: MOCK_CHART_DATA.revenue,
    },
    {
      id: "bookings",
      label: "Tổng đặt chỗ",
      value: totalBookings,
      subtitle: "Khách hàng đã đặt",
      trend: "up",
      change: "+8.3%",
      icon: Users,
      iconColor: "text-blue-600",
      variant: "aqua",
      chartData: MOCK_CHART_DATA.bookings,
    },
    {
      id: "active",
      label: "Tours đang hoạt động",
      value: activeTours,
      subtitle: "Đang mở đặt chỗ",
      trend: "up",
      change: "+2",
      icon: MapPin,
      iconColor: "text-purple-600",
      variant: "mint",
      chartData: [],
    },
    {
      id: "pending",
      label: "Tours chờ xác nhận",
      value: pendingTours,
      subtitle: "Cần xử lý",
      trend: "down",
      change: "-1",
      icon: Calendar,
      iconColor: "text-orange-600",
      variant: "yellow",
      chartData: [],
    },
  ];

  // Handle Export CSV
  const handleExport = () => {
    if (filteredTours.length === 0) {
      toast.error("Không có dữ liệu để export");
      return;
    }

    const csvContent = exportToursToCSV(filteredTours);
    downloadCSV(
      csvContent,
      `tours_${new Date().toISOString().split("T")[0]}.csv`
    );
    toast.success("Export thành công!");
  };

  // Handle View Detail Tour
  const navigate = useNavigate();

  const handleViewDetail = (tour) => {
    navigate(`/admin/tours/${tour._id}`);
  };

  // Handle Toggle Visibility
  const handleToggleVisibility = async (tour) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const response = await fetch(`${API_URL}/api/tours/${tour._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isHidden: !tour.isHidden,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const updatedTour = await response.json();

      // Update the tour in state
      setTours(tours.map((t) => (t._id === tour._id ? updatedTour : t)));
      const statusMessage = tour.isHidden ? "Đã hiện tour!" : "Đã ẩn tour!";
      toast.success(statusMessage);
      notify.tour("Cập nhật Tour", `${tour.title} - ${statusMessage}`);
    } catch (err) {
      console.error("Failed to toggle visibility:", err);
      toast.error("Lỗi khi thay đổi trạng thái tour. Vui lòng thử lại.");
      notify.error("Lỗi Cập nhật Tour", "Không thể thay đổi trạng thái tour");
    }
  };

  // Handle Delete Tour
  const handleDeleteTour = async (tour) => {
    setDeleteModal({ isOpen: true, tour });
  };

  const confirmDeleteTour = async () => {
    const tour = deleteModal.tour;
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const response = await fetch(`${API_URL}/api/tours/${tour._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Remove tour from state after successful API call
      setTours(tours.filter((t) => t._id !== tour._id));
      setDeleteModal({ isOpen: false, tour: null });
      toast.success("Đã xóa tour thành công!");
      notify.tour("Xóa Tour", `Đã xóa tour "${tour.title}"`);
    } catch (err) {
      console.error("Failed to delete tour:", err);
      setDeleteModal({ isOpen: false, tour: null });
      toast.error("Lỗi khi xóa tour. Vui lòng thử lại.");
      notify.error("Lỗi Xóa Tour", "Không thể xóa tour");
    }
  };

  // Handle Form Submit
  const handleFormSubmit = async (formData) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

      if (editingTour) {
        // Update existing tour
        const response = await fetch(
          `${API_URL}/api/tours/${editingTour._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const updatedTour = await response.json();

        // Update the tour in state
        setTours(
          tours.map((t) => (t._id === editingTour._id ? updatedTour : t))
        );
        toast.success("Cập nhật tour thành công!");
        notify.tour(
          "Cập nhật Tour",
          `Đã cập nhật tour "${formData.title || editingTour.title}"`
        );
      } else {
        // Add new tour
        const response = await fetch(`${API_URL}/api/tours`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const newTour = await response.json();
        setTours([...tours, newTour]);
        toast.success("Thêm tour mới thành công!");
        notify.tour("Tour Mới", `Đã thêm tour "${formData.title}"`);
      }

      setShowForm(false);
      setEditingTour(null);
    } catch (err) {
      console.error("Failed to save tour:", err);
      toast.error("Lỗi khi lưu tour. Vui lòng thử lại.");
      notify.error("Lỗi Lưu Tour", "Không thể lưu tour");
    }
  };

  // Handle Form Cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTour(null);
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Đã xảy ra lỗi
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Loading state
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý Tour
          </h1>
          <p className="text-gray-600">Tổng quan và quản lý các tour du lịch</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Hiển thị {filteredTours.length} / {tours.length} tours
              </div>
              <ItemsPerPageSelector
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Làm mới
              </button>
              <button
                onClick={handleExport}
                disabled={filteredTours.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTour ? "Chỉnh sửa Tour" : "Thêm Tour Mới"}
                </h2>
              </div>
              <TourForm
                tour={editingTour}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        )}

        {/* Filters */}
        <TourFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Tour List */}
        <div className="mt-6">
          {filteredTours.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🏖️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không tìm thấy tour
              </h3>
              <p className="text-gray-600 mb-4">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tour
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentTours.map((tour) => (
                      <TourTableRow
                        key={tour._id}
                        tour={tour}
                        onViewDetail={handleViewDetail}
                        onToggleVisibility={handleToggleVisibility}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={filteredTours.length}
                  itemsPerPage={itemsPerPage}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, tour: null })}
        onConfirm={confirmDeleteTour}
        title="Xác nhận xóa tour"
        type="warning"
        confirmText="Xóa"
        cancelText="Hủy"
      >
        <p className="text-gray-600">
          Bạn có chắc chắn muốn xóa tour{" "}
          <span className="font-semibold text-gray-900">
            "{deleteModal.tour?.title}"
          </span>
          ?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </div>
  );
};

export default TourManagement;
