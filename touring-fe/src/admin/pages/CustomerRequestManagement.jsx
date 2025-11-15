import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Download,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import logger from "../../utils/logger";

// Components
import StatCard from "../components/Dashboard/StatsCard";
import RequestFilters from "../components/CustomerRequest/RequestFilters";
import RequestTableRow from "../components/CustomerRequest/RequestTableRow";
import Pagination from "../components/Common/Pagination";

// Services
import * as customerRequestService from "../services/customerRequestService";

// Data (fallback)
import {
  CUSTOMER_REQUEST_STATUS,
  REQUEST_PRIORITY,
  REQUEST_CHART_DATA,
} from "../data/customerRequestData";

const CustomerRequestManagement = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch data on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const result = await customerRequestService.getCustomerRequests();

      if (result.success) {
        // Transform backend feedback to frontend request format
        const transformedRequests = result.data.map(
          customerRequestService.transformFeedbackToRequest
        );
        setRequests(transformedRequests);
      } else {
        toast.error(result.error || "Không thể tải dữ liệu");
        setRequests([]);
      }
    } catch (error) {
      logger.error("❌ Fetch requests error:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = useMemo(
    () => customerRequestService.getRequestStats(requests),
    [requests]
  );

  // Stats cards configuration
  const statsCards = [
    {
      id: "pending",
      label: "Chờ xử lý",
      value: stats.pending,
      subtitle: "Yêu cầu mới",
      trend: "up",
      change: "+5",
      icon: AlertCircle,
      iconColor: "text-yellow-600",
      variant: "yellow",
      chartData: REQUEST_CHART_DATA.requests,
    },
    {
      id: "inProgress",
      label: "Đang xử lý",
      value: stats.inProgress,
      subtitle: "Đang được giải quyết",
      trend: "up",
      change: "+3",
      icon: Clock,
      iconColor: "text-blue-600",
      variant: "aqua",
      chartData: REQUEST_CHART_DATA.requests,
    },
    {
      id: "completed",
      label: "Hoàn thành",
      value: stats.completed,
      subtitle: "Đã giải quyết",
      trend: "up",
      change: "+12",
      icon: CheckCircle,
      iconColor: "text-green-600",
      variant: "mint",
      chartData: REQUEST_CHART_DATA.requests,
    },
    {
      id: "urgent",
      label: "Khẩn cấp",
      value: stats.urgent,
      subtitle: "Cần xử lý ngay",
      trend: "down",
      change: "-2",
      icon: XCircle,
      iconColor: "text-red-600",
      variant: "yellow",
      chartData: [],
    },
  ];

  // Filter requests
  const filteredRequests = useMemo(() => {
    let result = [...requests];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (req) =>
          req.requestId.toLowerCase().includes(searchLower) ||
          req.customerName.toLowerCase().includes(searchLower) ||
          req.email.toLowerCase().includes(searchLower) ||
          req.subject.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((req) => req.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      result = result.filter((req) => req.priority === priorityFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((req) => req.type === typeFilter);
    }

    // Sort by created date (newest first)
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }, [requests, searchTerm, statusFilter, priorityFilter, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter, typeFilter]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle refresh
  const handleRefresh = async () => {
    await fetchRequests();
    toast.success("Đã làm mới dữ liệu");
  };

  // Handle export CSV
  const handleExport = () => {
    if (filteredRequests.length === 0) {
      toast.warning("Không có dữ liệu để export");
      return;
    }

    const csvHeaders = [
      "Mã yêu cầu",
      "Khách hàng",
      "Email",
      "Điện thoại",
      "Loại",
      "Mức độ",
      "Trạng thái",
      "Tiêu đề",
      "Điểm đến",
      "Số người",
      "Ngày tạo",
    ];

    const csvRows = filteredRequests.map((req) => [
      req.requestId,
      req.customerName,
      req.email,
      req.phone,
      req.type,
      req.priority,
      req.status,
      `"${req.subject}"`,
      req.destination || "",
      req.numberOfPeople || "",
      new Date(req.createdAt).toLocaleDateString("vi-VN"),
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `customer-requests_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  // Handle view request - Điều hướng đến trang chi tiết
  const handleViewRequest = (request) => {
    navigate(`/admin/customer-requests/${request.requestId}`);
  };

  // Handle update status - Điều hướng đến trang cập nhật
  const handleUpdateStatus = (request) => {
    navigate(`/admin/customer-requests/${request.requestId}/update`);
  };

  // Main list view
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý Yêu cầu Khách hàng
          </h1>
          <p className="text-gray-600">
            Theo dõi và xử lý các yêu cầu từ khách hàng
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statsCards.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Hiển thị {filteredRequests.length} / {requests.length} yêu cầu
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
                disabled={filteredRequests.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <RequestFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
        />

        {/* Request List */}
        <div className="mt-6">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không tìm thấy yêu cầu
              </h3>
              <p className="text-gray-600 mb-4">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thông tin yêu cầu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Chi tiết
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thời gian
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentRequests.map((request) => (
                        <RequestTableRow
                          key={request._id}
                          request={request}
                          onView={handleViewRequest}
                          onUpdateStatus={handleUpdateStatus}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={filteredRequests.length}
                  itemsPerPage={itemsPerPage}
                />
              )}

              <div className="text-center text-sm text-gray-500 mt-2 mb-4">
                Hiển thị {startIndex + 1}-
                {Math.min(endIndex, filteredRequests.length)} trong tổng số{" "}
                {filteredRequests.length} yêu cầu
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerRequestManagement;
