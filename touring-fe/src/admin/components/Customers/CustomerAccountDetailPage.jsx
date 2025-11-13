import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Lock,
  Unlock,
  Trash2,
  Download,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Star,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Modal from "../Common/Modal";

// Services
import * as customerService from "../../services/customerService";

// Utils & Data
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  CUSTOMER_STATUS,
  STATUS_LABELS,
  STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  GENDER_LABELS,
  ACTIVITY_LABELS,
  ACTIVITY_ICONS,
} from "../../data/customerAccountData";

export default function CustomerAccountDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null,
    customer: null,
  });

  // Fetch customer data
  useEffect(() => {
    loadCustomerData();
  }, [id]);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const result = await customerService.getCustomerById(id);

      if (result.success) {
        setCustomer(result.data);

        // Fetch bookings if tab is bookings
        if (activeTab === "bookings") {
          await loadBookings();
        }
      } else {
        toast.error(result.error || "Không thể tải dữ liệu khách hàng");
      }
    } catch (error) {
      console.error("❌ Load customer error:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const result = await customerService.getCustomerBookings(id);
      if (result.success) {
        setBookings(result.data);
      }
    } catch (error) {
      console.error("❌ Load bookings error:", error);
    }
  };

  // Load bookings when tab changes
  useEffect(() => {
    if (activeTab === "bookings" && customer && bookings.length === 0) {
      loadBookings();
    }
  }, [activeTab]);

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

  if (!customer) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Không tìm thấy khách hàng
          </h2>
          <p className="text-gray-500 mb-4">ID: {id}</p>
          <button
            onClick={() => navigate("/admin/customers/accounts")}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const handleAction = async (action) => {
    setActionModal({ isOpen: true, type: action, customer });
  };

  const confirmAction = async () => {
    const { type, customer } = actionModal;

    switch (type) {
      case "lock":
        try {
          const result = await customerService.updateCustomerStatus(
            customer._id,
            "banned",
            "Khóa từ trang chi tiết khách hàng"
          );
          if (result.success) {
            toast.success("Đã khóa tài khoản");
            await loadCustomerData();
          } else {
            toast.error(result.error || "Khóa tài khoản thất bại");
          }
        } catch (error) {
          toast.error("Có lỗi xảy ra");
        }
        break;
      case "unlock":
        try {
          const result = await customerService.updateCustomerStatus(
            customer._id,
            "active",
            ""
          );
          if (result.success) {
            toast.success("Đã mở khóa tài khoản");
            await loadCustomerData();
          } else {
            toast.error(result.error || "Mở khóa thất bại");
          }
        } catch (error) {
          toast.error("Có lỗi xảy ra");
        }
        break;
      case "delete":
        try {
          const result = await customerService.deleteCustomer(customer._id);
          if (result.success) {
            toast.success("Đã xóa tài khoản");
            navigate("/admin/customers/accounts");
          } else {
            toast.error(result.error || "Xóa tài khoản thất bại");
          }
        } catch (error) {
          toast.error("Có lỗi xảy ra");
        }
        break;
      case "export":
        toast.info("Chức năng xuất báo cáo đang phát triển");
        break;
      default:
        break;
    }
    setActionModal({ isOpen: false, type: null, customer: null });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/customers/accounts")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết Khách hàng
            </h1>
            <p className="text-sm text-gray-500 mt-1">ID: {customer._id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleAction("export")}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* 1️⃣ Overview Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={customer.avatar}
              alt={customer.fullName}
              className="w-32 h-32 rounded-full border-4 border-gray-100"
            />
          </div>

          {/* Basic Info */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">
                Họ tên
              </label>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {customer.fullName || customer.name}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">
                Email
              </label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-900">{customer.email}</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">
                Số điện thoại
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-900">
                  {customer.phone || "N/A"}
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">
                Địa chỉ
              </label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-900">
                  {customer.location?.addressLine ||
                    customer.location?.provinceName ||
                    "N/A"}
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">
                Ngày tạo tài khoản
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {formatDate(customer.createdAt)}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">
                Trạng thái
              </label>
              <div className="mt-1">
                <span
                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    STATUS_COLORS[customer.status]
                  }`}
                >
                  {customer.status === CUSTOMER_STATUS.ACTIVE
                    ? "🟢"
                    : customer.status === CUSTOMER_STATUS.BANNED
                    ? "🔴"
                    : "⚫"}{" "}
                  {STATUS_LABELS[customer.status]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center p-4 bg-teal-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-5 h-5 text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-teal-600">
              {formatCurrency(customer.totalSpent || 0)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Tổng chi tiêu</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {customer.totalBookings || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Tổng tour đã đặt</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              ⭐ {customer.averageRating || "N/A"}
            </p>
            <p className="text-sm text-gray-600 mt-1">Đánh giá trung bình</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {customer.paidBookings || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Tour đã thanh toán</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "bookings"
                  ? "border-b-2 border-teal-600 text-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📅 Lịch sử đặt tour
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "requests"
                  ? "border-b-2 border-teal-600 text-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              💬 Yêu cầu & Phản hồi
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "activity"
                  ? "border-b-2 border-teal-600 text-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📊 Hoạt động gần đây
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* 2️⃣ Booking History Tab */}
          {activeTab === "bookings" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lịch sử đặt tour ({bookings.length})
                </h3>
              </div>
              {bookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Mã booking
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tour
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Ngày đặt
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tổng tiền
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Trạng thái
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {booking.bookingCode || booking._id.slice(-8)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {booking.items && booking.items.length > 0 ? (
                              <div>
                                {booking.items.map((item, idx) => (
                                  <div key={idx}>
                                    {item.tourId?.title || item.name || "Tour"}
                                    {booking.items.length > 1 &&
                                      ` (+${
                                        booking.items.length - 1
                                      } tour khác)`}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDate(booking.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-teal-600">
                            {formatCurrency(booking.totalVND)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                booking.status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {booking.status === "paid"
                                ? "✅ Đã thanh toán"
                                : booking.status === "pending"
                                ? "⏳ Chờ thanh toán"
                                : "❌ Đã hủy"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() =>
                                navigate(`/admin/bookings/${booking._id}`)
                              }
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              [Chi tiết]
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Chưa có booking nào</p>
                </div>
              )}
            </div>
          )}

          {/* 3️⃣ Requests & Feedback Tab */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Yêu cầu & Phản hồi
                </h3>
              </div>
              <div className="text-center py-8 text-gray-500">
                <p>Chức năng đang phát triển</p>
                <p className="text-sm mt-2">
                  Sẽ hiển thị các yêu cầu và phản hồi của khách hàng
                </p>
              </div>
            </div>
          )}

          {/* 4️⃣ Activity Log Tab */}
          {activeTab === "activity" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Hoạt động gần đây
                </h3>
              </div>
              <div className="text-center py-8 text-gray-500">
                <p>Chức năng đang phát triển</p>
                <p className="text-sm mt-2">
                  Sẽ hiển thị lịch sử hoạt động của khách hàng
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5️⃣ Admin Actions Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ⚙️ Quản trị / Hành động
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {customer.status === CUSTOMER_STATUS.ACTIVE ? (
            <button
              onClick={() => handleAction("lock")}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
            >
              <Lock className="w-5 h-5" />
              Khóa tài khoản
            </button>
          ) : customer.status === CUSTOMER_STATUS.BANNED ? (
            <button
              onClick={() => handleAction("unlock")}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
            >
              <Unlock className="w-5 h-5" />
              Mở khóa tài khoản
            </button>
          ) : null}

          <button
            onClick={() => handleAction("delete")}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            <Trash2 className="w-5 h-5" />
            Xóa tài khoản
          </button>

          {/* Email/send action removed */}

          <button
            onClick={() => handleAction("export")}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() =>
          setActionModal({ isOpen: false, type: null, customer: null })
        }
        onConfirm={confirmAction}
        title={
          actionModal.type === "lock"
            ? "Xác nhận khóa tài khoản"
            : actionModal.type === "unlock"
            ? "Xác nhận mở khóa tài khoản"
            : "Xác nhận xóa tài khoản"
        }
        type={actionModal.type === "delete" ? "error" : "warning"}
        confirmText={
          actionModal.type === "lock"
            ? "Khóa"
            : actionModal.type === "unlock"
            ? "Mở khóa"
            : "Xóa"
        }
        cancelText="Hủy"
      >
        <p className="text-gray-600">
          {actionModal.type === "lock" && (
            <>
              Bạn có chắc muốn khóa tài khoản{" "}
              <span className="font-semibold text-gray-900">
                {actionModal.customer?.fullName}
              </span>
              ?
            </>
          )}
          {actionModal.type === "unlock" && (
            <>
              Bạn có chắc muốn mở khóa tài khoản{" "}
              <span className="font-semibold text-gray-900">
                {actionModal.customer?.fullName}
              </span>
              ?
            </>
          )}
          {actionModal.type === "delete" && (
            <>
              Bạn có chắc muốn xóa tài khoản{" "}
              <span className="font-semibold text-gray-900">
                {actionModal.customer?.fullName}
              </span>
              ?
              <p className="text-sm text-red-600 mt-2 font-medium">
                ⚠️ Hành động này không thể hoàn tác!
              </p>
            </>
          )}
        </p>
      </Modal>
    </div>
  );
}
