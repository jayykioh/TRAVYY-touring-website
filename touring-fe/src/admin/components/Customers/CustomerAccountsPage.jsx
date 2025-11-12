import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  Lock,
  Unlock,
  Download,
  UserCheck,
  UserX,
  Users,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Services
import * as customerService from "../../services/customerService";

// Utils & Data
import {
  formatCurrency,
  formatDate,
  CUSTOMER_STATUS,
  STATUS_LABELS,
  STATUS_COLORS,
} from "../../data/customerAccountData";
import Pagination from "../Common/Pagination";

export default function CustomerAccountsPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Lock/Unlock states
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [actionType, setActionType] = useState("");
  const [lockReason, setLockReason] = useState("");
  const [expandedLockItems, setExpandedLockItems] = useState({});

  // Fetch customers on mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const result = await customerService.getCustomers({
        search: searchTerm,
        status: statusFilter,
      });

      if (result.success) {
        const transformedCustomers = result.data.map(
          customerService.transformUserToCustomer
        );
        setCustomers(transformedCustomers);
      } else {
        toast.error(result.error || "Không thể tải dữ liệu khách hàng");
        setCustomers([]);
      }
    } catch (error) {
      console.error("❌ Load customers error:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = useMemo(
    () => customerService.calculateCustomerStats(customers),
    [customers]
  );

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || customer.accountStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetail = (customerId) => {
    navigate(`/admin/customers/${customerId}`);
  };

  const handleAction = (action, customer) => {
    setActionType(action);
    setSelectedAccount(customer);
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    // Validate lock reason if action is lock/ban
    if ((actionType === "lock" || actionType === "ban") && !lockReason.trim()) {
      toast.error("Vui lòng nhập lý do khóa/cấm tài khoản");
      return;
    }

    try {
      const newStatus =
        actionType === "lock" || actionType === "ban" ? "banned" : "active";
      const result = await customerService.updateCustomerStatus(
        selectedAccount.id,
        newStatus,
        lockReason.trim()
      );

      if (result.success) {
        // Reload customers
        await loadCustomers();
        toast.success(result.message || "Cập nhật thành công");
        setShowActionModal(false);
        setLockReason("");
      } else {
        toast.error(result.error || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("❌ Update customer status error:", error);
      toast.error("Có lỗi xảy ra khi cập nhật");
    }
  };

  const handleRefresh = () => {
    loadCustomers();
    toast.success("Đã làm mới dữ liệu");
  };

  const closeModal = () => {
    setShowActionModal(false);
    setSelectedAccount(null);
    setActionType("");
    setLockReason("");
    setExpandedLockItems({});
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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleLockItemExpand = (id) => {
    setExpandedLockItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getActionConfig = () => {
    const configs = {
      lock: {
        title: "Khóa tài khoản",
        icon: <Lock className="w-6 h-6 text-red-600" />,
        message: "Tài khoản sẽ không thể đăng nhập.",
        buttonText: "Khóa",
        buttonClass: "bg-red-600 hover:bg-red-700",
      },
      unlock: {
        title: "Mở khóa tài khoản",
        icon: <Unlock className="w-6 h-6 text-green-600" />,
        message: "Tài khoản sẽ có thể đăng nhập trở lại.",
        buttonText: "Mở khóa",
        buttonClass: "bg-green-600 hover:bg-green-700",
      },
    };
    return configs[actionType] || configs.lock;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Tài khoản Khách hàng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý thông tin và hoạt động của khách hàng
          </p>
        </div>
        <button
          onClick={() => toast.info("Chức năng xuất báo cáo đang phát triển")}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Xuất báo cáo
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng khách hàng</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.active}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-teal-600 mt-1">
                {formatCurrency(stats.totalRevenue).replace("₫", "")}đ
              </p>
            </div>
            <div className="p-3 bg-teal-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Chi tiêu TB</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {formatCurrency(stats.averageSpending).replace("₫", "")}đ
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value={CUSTOMER_STATUS.ACTIVE}>Hoạt động</option>
              <option value={CUSTOMER_STATUS.INACTIVE}>Không hoạt động</option>
              <option value={CUSTOMER_STATUS.BANNED}>Bị khóa</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng chi tiêu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCustomers.map((customer) => (
                <tr
                  key={customer._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={customer.avatar}
                        alt={customer.fullName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {customer._id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.email}
                    </div>
                    <div className="text-xs text-gray-500">
                      {customer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        STATUS_COLORS[customer.status]
                      }`}
                    >
                      {STATUS_LABELS[customer.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(customer.totalSpent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.totalBookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">
                        ⭐ {customer.averageRating}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewDetail(customer._id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {customer.status === CUSTOMER_STATUS.ACTIVE ? (
                        <button
                          onClick={() => handleAction("lock", customer)}
                          className="p-1 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                          title="Khóa tài khoản"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      ) : customer.status === CUSTOMER_STATUS.BANNED ? (
                        <button
                          onClick={() => handleAction("unlock", customer)}
                          className="p-1 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                          title="Mở khóa"
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredCustomers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredCustomers.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <UserX className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Không tìm thấy khách hàng nào</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedAccount && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl border border-gray-100 my-8">
            {/* Modal Header */}
            <div className="flex items-center mb-4">
              {getActionConfig().icon}
              <h3 className="text-lg font-semibold ml-2">
                {getActionConfig().title}
              </h3>
            </div>

            {/* Modal Content */}
            <p className="text-gray-600 mb-2">
              Bạn có chắc chắn muốn {getActionConfig().title.toLowerCase()} cho{" "}
              <strong>{selectedAccount.fullName}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {getActionConfig().message}
            </p>

            {/* Lock Reason Input */}
            {actionType === "lock" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do khóa tài khoản <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  placeholder="Nhập lý do khóa tài khoản (bắt buộc)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows="3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lý do này sẽ được gửi cho khách hàng
                </p>
              </div>
            )}

            {/* Lock History Display - Show when Unlocking */}
            {actionType === "unlock" &&
              selectedAccount.lockHistory &&
              selectedAccount.lockHistory.length > 0 && (
                <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start mb-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">
                        Lịch sử khóa tài khoản
                      </h4>
                      <p className="text-xs text-blue-700">
                        Dưới đây là tất cả các lần khóa tài khoản này:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedAccount.lockHistory.map((lockItem) => (
                      <div
                        key={lockItem.id}
                        className="bg-white rounded border border-gray-200"
                      >
                        <button
                          onClick={() => toggleLockItemExpand(lockItem.id)}
                          className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50"
                        >
                          <div className="flex items-center flex-1 text-left">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Lần khóa #{lockItem.id}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDateTime(lockItem.lockedAt)}
                                {lockItem.unlockedAt && (
                                  <>
                                    {" "}
                                    • Mở khóa:{" "}
                                    {formatDateTime(lockItem.unlockedAt)}
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                          {expandedLockItems[lockItem.id] ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </button>

                        {expandedLockItems[lockItem.id] && (
                          <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 text-xs space-y-1">
                            <p>
                              <span className="font-medium text-gray-700">
                                Lý do:
                              </span>{" "}
                              <span className="text-gray-600">
                                {lockItem.reason}
                              </span>
                            </p>
                            <p>
                              <span className="font-medium text-gray-700">
                                Khóa bởi:
                              </span>{" "}
                              <span className="text-gray-600">
                                {lockItem.lockedBy}
                              </span>
                            </p>
                            {lockItem.unlockedAt && (
                              <p>
                                <span className="font-medium text-gray-700">
                                  Mở khóa bởi:
                                </span>{" "}
                                <span className="text-gray-600">
                                  {lockItem.unlockedBy}
                                </span>
                              </p>
                            )}
                            {!lockItem.unlockedAt && (
                              <p className="text-red-600 font-medium">
                                • Hiện đang bị khóa
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Modal Footer */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 rounded-lg text-white transition-colors font-medium ${
                  getActionConfig().buttonClass
                }`}
              >
                {getActionConfig().buttonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
