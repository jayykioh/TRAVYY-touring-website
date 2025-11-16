import { useEffect, useState } from "react";
import { useAuth } from "../auth/context";
import {
  Calendar,
  Users,
  User,
  Ticket,
  CreditCard,
  Loader2,
  Receipt, MapPin, MessageSquare,
  RefreshCw,
} from "lucide-react";
import { formatVND, formatCurrency } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function BookingHistory() {
  const { user, withAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'requests'
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refundStatuses, setRefundStatuses] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
        setLoading(true);
        
        // Fetch regular bookings
      setLoading(true);
      const bookingsResponse = await fetch(`/api/bookings/my`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setBookings(bookingsData.bookings || bookingsData.data || []);
        }

        // Fetch custom tour requests
        if (withAuth) {
          try {
            const requestsData = await withAuth('/api/tour-requests');
            setRequests(requestsData.requests || []);
          } catch (err) {
            console.error('Error fetching tour requests:', err);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (user?.token) fetchData();
  }, [user, withAuth]);

  // Refetch when page becomes visible again (user returns from another tab/page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.token) {
        fetchRefundStatuses(bookings);
      }
    };

    // Listen for refund updates from other components
    const handleRefundUpdate = (event) => {
      console.log("Refund updated event received:", event.detail);
      if (user?.token && bookings.length > 0) {
        fetchRefundStatuses(bookings);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("refundUpdated", handleRefundUpdate);

    // Only listen for visibility and refund updates here.
    // Payment updates are handled on the guide side only to avoid
    // triggering automatic refreshes in the traveller booking history.
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("refundUpdated", handleRefundUpdate);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("refundUpdated", handleRefundUpdate);
    };
  }, [user, bookings]);

  const fetchRefundStatuses = async (bookings) => {
    try {
      const statuses = {};

      // Fetch refund requests for this user
      const response = await fetch(`/api/refunds/my-refunds`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const refunds = data.data || [];

        // Map refunds to bookings
        refunds.forEach((refund) => {
          // Skip only cancelled refunds (user cancelled themselves)
          // Keep rejected (can request again) and completed (show success status)
          if (refund.status === "cancelled") {
            return;
          }

          const bookingId = refund.bookingId?._id || refund.bookingId;
          if (bookingId) {
            statuses[bookingId] = {
              status: refund.status,
              refundReference: refund.refundReference,
              finalRefundAmount: refund.finalRefundAmount,
            };
          }
        });
      }

      setRefundStatuses(statuses);
    } catch (err) {
      console.error("Error fetching refund statuses:", err);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchBookings();
    } finally {
      setRefreshing(false);
    }
  };

  const formatDateVN = (d) =>
    new Date(d).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleRetryPayment = async (booking) => {
    try {
      // Recreate cart items from failed booking
      const cartItems =
        booking.items?.map((item) => ({
          tourId: item.tourId,
          name: item.name,
          image: item.image,
          date: item.date,
          adults: item.adults || 0,
          children: item.children || 0,
          unitPriceAdult: item.unitPriceAdult || 0,
          unitPriceChild: item.unitPriceChild || 0,
          selected: true,
        })) || [];

      // Navigate to checkout with the cart items
      // Store cart items in sessionStorage for checkout page
      sessionStorage.setItem("retryPaymentCart", JSON.stringify(cartItems));
      sessionStorage.setItem("retryBookingId", booking._id);

      // Navigate to checkout
      window.location.href = "/booking";
    } catch (error) {
      console.error("Error retrying payment:", error);
      alert("Có lỗi xảy ra khi thử thanh toán lại. Vui lòng thử lại sau.");
    }
  };

  const statusUI = (status) => {
    switch (status) {
      case "paid":
        return {
          text: "Đã thanh toán",
          className:
            "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
        };
      case "pending":
        return {
          text: "Chờ thanh toán",
          className:
            "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
        };
      case "pending_refund":
        return {
          text: "Chờ xử lý hoàn tiền",
          className:
            "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
        };
      case "cancelled":
        return {
          text: "Thanh toán thất bại",
          className: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
        };
      case "completed":
        return {
          text: "Đã hoàn thành",
          className: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
        };
      case "refunded":
        return {
          text: "Đã hoàn tiền - Tour đã hủy",
          className: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
        };
      default:
        return {
          text: "Đã hủy",
          className: "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200",
        };
    }
  };

  const getRefundStatusUI = (status) => {
    switch (status) {
      case "pending":
        return {
          text: "Refund đang chờ",
          className:
            "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200",
          icon: "⏳",
          tourStatus: "pending", // Tour tạm ngưng chờ xử lý
        };
      case "under_review":
        return {
          text: "Đang xem xét",
          className: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
          icon: "🔍",
          tourStatus: "pending", // Tour tạm ngưng
        };
      case "approved":
        return {
          text: "Đã duyệt - Tour bị hủy",
          className:
            "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
          icon: "✅",
          tourStatus: "cancelled", // Tour đã bị hủy
        };
      case "processing":
        return {
          text: "Đang xử lý - Tour bị hủy",
          className:
            "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
          icon: "⚙️",
          tourStatus: "cancelled", // Tour đã bị hủy
        };
      case "completed":
        return {
          text: "Đã hoàn tiền - Tour đã hủy",
          className: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200",
          icon: "💰",
          tourStatus: "cancelled", // Tour đã bị hủy
        };
      case "rejected":
        return {
          text: "Request bị từ chối - Tour vẫn diễn ra",
          className: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
          icon: "❌",
          tourStatus: "active", // Tour vẫn hoạt động bình thường
        };
      default:
        return {
          text: "Đang xử lý",
          className: "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200",
          icon: "📋",
          tourStatus: "pending",
        };
    }
  };

  const requestStatusUI = (status) => {
    switch (status) {
      case "pending":
        return { text: "Chờ xác nhận", className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200", icon: "⏳" };
      case "negotiating":
        return { text: "Đang thương lượng", className: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200", icon: "💬" };
      case "accepted":
        return { text: "Đã chấp nhận", className: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200", icon: "✅" };
      case "rejected":
        return { text: "Đã từ chối", className: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200", icon: "❌" };
      case "cancelled":
        return { text: "Đã hủy", className: "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200", icon: "🚫" };
      case "expired":
        return { text: "Đã hết hạn", className: "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200", icon: "⏰" };
      default:
        return { text: status, className: "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200", icon: "❓" };
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "#02A0AA" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-rose-600 mb-3 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-2 rounded-md text-white text-sm"
            style={{ backgroundColor: "#02A0AA" }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="h-screen bg-neutral-50 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col px-3 md:px-4 py-4 md:py-6">
        {/* Header */}
        <h1
          className="relative mb-4 md:mb-5 text-xl md:text-2xl font-semibold tracking-tight 
                   text-neutral-800 backdrop-blur-md bg-white/40 border border-white/60 
                   shadow-sm rounded-xl px-4 py-3 flex items-center justify-between gap-2 shrink-0"
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-1.5 h-7 rounded-full"
              style={{ backgroundColor: "#02A0AA" }}
            />
            <span className="font-medium text-neutral-900">
              Lịch sử đặt tour
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-white/60 transition-colors disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              style={{ color: "#02A0AA" }}
            />
          </button>
        </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 shrink-0">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'bookings'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
          }`}
        >
          <Ticket className="inline w-4 h-4 mr-2" />
          Tour có sẵn ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'requests'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
          }`}
        >
          <MapPin className="inline w-4 h-4 mr-2" />
          Custom Tour ({requests.length})
        </button>
      </div>

      {/* Content */}
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto pr-1">
          {activeTab === 'bookings' ? (
            // Regular Bookings
            bookings.length === 0 ? (
            <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
              <Ticket className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-700">Bạn chưa có booking nào</p>
              <button
                onClick={() => (window.location.href = "/")}
                className="mt-3 px-4 py-2 rounded-md text-white text-sm"
                style={{ backgroundColor: "#02A0AA" }}
              >
                Khám phá tour ngay
              </button>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {bookings.map((booking) => {
                const ui = statusUI(booking.status);
                return (
                  <div key={booking._id} className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                    {/* Header card */}
                    <div className="px-4 py-3 border-b border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 items-center">
                      <div className="flex items-center gap-2 text-neutral-900">
                        <Receipt className="w-4 h-4" style={{ color: "#02A0AA" }} />
                        <div className="leading-tight">
                          <p className="text-[11px] text-neutral-500">Mã đặt chỗ</p>
                          <p className="text-sm font-medium">
                            {booking.orderRef || booking._id.substring(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>

                        <div className="sm:justify-center">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset"
                            style={{
                              color: "#03656B",
                              backgroundColor: "#E6F7F8",
                              borderColor: "#C7EFF2",
                            }}
                            title="Ngày tạo booking"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDateVN(booking.createdAt)}
                          </span>
                        </div>

                        <div className="sm:justify-self-end flex flex-col gap-1.5">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${ui.className}`}
                          >
                            {ui.text}
                          </span>

                          {/* Tour Status - Only show when important */}
                          {/* Show "Tour KHÔNG khởi hành" when refund approved/completed OR booking refunded */}
                          {(refundUI && refundUI.tourStatus === "cancelled") ||
                          booking.status === "refunded" ? (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">
                              <span>🚫</span>
                              <span>Tour KHÔNG khởi hành</span>
                            </div>
                          ) : null}

                          {/* Show "Tour vẫn khởi hành" only when refund rejected */}
                          {refundUI && refundUI.tourStatus === "active" && (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 ring-1 ring-inset ring-green-200">
                              <span>✈️</span>
                              <span>Tour vẫn khởi hành</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="space-y-3 mb-4">
                          {booking.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex gap-3 pb-3 border-b border-neutral-200 last:border-b-0"
                            >
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-14 h-14 object-cover rounded-md border border-neutral-200"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-neutral-900 mb-1 line-clamp-1">
                                  {item.name || "Tour"}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                                  <div className="flex items-center gap-1.5 text-neutral-600">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="truncate">
                                      {item.date}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-neutral-600">
                                    <Users className="w-3.5 h-3.5" />
                                    <span className="truncate">
                                      {item.adults > 0 &&
                                        `${item.adults} người lớn`}
                                      {item.adults > 0 &&
                                        item.children > 0 &&
                                        ", "}
                                      {item.children > 0 &&
                                        `${item.children} trẻ em`}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-1 text-[12px] text-neutral-500">
                                  Giá {formatVND(item.unitPriceAdult || 0)}
                                  /người lớn
                                  {item.children > 0 &&
                                    ` · ${formatVND(
                                      item.unitPriceChild || 0
                                    )}/trẻ em`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2 text-neutral-700">
                            <CreditCard className="w-4 h-4" />
                            <div className="text-sm">
                              <span className="text-neutral-500">
                                Thanh toán:&nbsp;
                              </span>
                              <span className="font-semibold text-neutral-900">
                                {booking.payment?.provider || "N/A"}
                              </span>
                              {booking.payment?.orderId && (
                                <span className="ml-2 text-[12px] text-neutral-500">
                                  (ID: {booking.payment.orderId})
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Retry Payment Button for Failed Bookings */}
                            {booking.status === "cancelled" &&
                              !refundStatus && (
                                <button
                                  onClick={() => handleRetryPayment(booking)}
                                  className="px-3 py-1.5 rounded-md text-white text-xs font-medium transition-colors hover:opacity-90"
                                  style={{ backgroundColor: "#02A0AA" }}
                                  title="Thanh toán lại"
                                >
                                  Thanh toán lại
                                </button>
                              )}

                            {/* Request Refund Button for Paid Bookings */}
                            {/* Show if: no refund OR refund was rejected (can request again) */}
                            {booking.status === "paid" &&
                              (!refundStatus ||
                                refundStatus.status === "rejected") && (
                                <Link
                                  to={`/refund-request/${booking._id}`}
                                  className="px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                                  title="Yêu cầu hoàn tiền"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  {refundStatus?.status === "rejected"
                                    ? "Tạo Request Mới"
                                    : "Yêu Cầu Hoàn Tiền"}
                                </Link>
                              )}

                            {/* Show Refund in Progress for active refunds */}
                            {refundStatus &&
                              refundStatus.status !== "completed" &&
                              refundStatus.status !== "rejected" && (
                                <Link
                                  to="/profile/refunds"
                                  className="px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                                  title="Xem chi tiết refund"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  Refund đang xử lý
                                </Link>
                              )}

                            {/* Show View Refund for completed refunds (no new request allowed) */}
                            {/* Also show for bookings with status "refunded" */}
                            {(refundStatus &&
                              refundStatus.status === "completed") ||
                            booking.status === "refunded" ? (
                              <Link
                                to="/profile/refunds"
                                className="px-3 py-1.5 rounded-md bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                                title="Xem chi tiết refund đã hoàn tất"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                Xem Chi Tiết
                              </Link>
                            ) : null}

                            {/* Show View Refund for rejected (with new request option shown above) */}
                            {refundStatus &&
                              refundStatus.status === "rejected" && (
                                <Link
                                  to="/profile/refunds"
                                  className="px-3 py-1.5 rounded-md bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                                  title="Xem lý do từ chối"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                  Xem Lý Do
                                </Link>
                              )}

                            {/* Write Review Button for Completed Tours */}
                            {booking.status === "completed" && (
                              <Link
                                to="/profile/reviews"
                                className="px-3 py-1.5 rounded-md bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                                title="Viết đánh giá cho tour"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Viết đánh giá
                              </Link>
                            )}

                            <div className="text-right">
                              {/* Hiển thị giá gốc và discount nếu có */}
                              {booking.discountAmount > 0 && (
                                <div className="mb-1 space-y-0.5">
                                  <div className="flex items-center justify-end gap-2 text-xs text-neutral-500">
                                    <span>Tổng tiền:</span>
                                    <span className="line-through">
                                      {formatCurrency(
                                        booking.originalAmount || 0,
                                        booking.currency || "VND"
                                      )}
                                    </span>
                                  </div>
                                  <div
                                    className="flex items-center justify-end gap-2 text-xs font-medium"
                                    style={{ color: "#02A0AA" }}
                                  >
                                    <span className="bg-teal-50 px-2 py-0.5 rounded text-[11px] uppercase font-semibold">
                                      {booking.voucherCode || "VOUCHER"}
                                    </span>
                                    <span>
                                      -
                                      {formatCurrency(
                                        booking.discountAmount || 0,
                                        booking.currency || "VND"
                                      )}
                                    </span>
                                  </div>
                                </div>
                              )}
                              <p
                                className="text-base font-semibold tracking-tight"
                                style={{ color: "#02A0AA" }}
                              >
                                {formatCurrency(
                                  booking.totalVND || booking.totalUSD || 0,
                                  booking.currency || "VND"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {booking.qrCode && (
                          <div className="mt-4 text-center">
                            <img
                              src={booking.qrCode}
                              alt="QR Code"
                              className="w-24 h-24 mx-auto rounded border border-neutral-200"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
          )
          ) : (
            // Custom Tour Requests
            requests.length === 0 ? (
              <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
                <MapPin className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-700">Bạn chưa có yêu cầu custom tour nào</p>
                <button
                  onClick={() => (window.location.href = "/discover")}
                  className="mt-3 px-4 py-2 rounded-md text-white text-sm"
                  style={{ backgroundColor: "#02A0AA" }}
                >
                  Tạo hành trình mới
                </button>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {requests.map((request) => {
                  const statusInfo = requestStatusUI(request.status);
                  return (
                    <div key={request._id} className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 items-center">
                        <div className="flex items-center gap-2 text-neutral-900">
                          <Receipt className="w-4 h-4" style={{ color: "#02A0AA" }} />
                          <div className="leading-tight">
                            <p className="text-[11px] text-neutral-500">Mã yêu cầu</p>
                            <p className="text-sm font-medium">
                              {request.requestNumber || request._id.substring(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>

                        <div className="sm:justify-center">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset"
                            style={{ color: "#03656B", backgroundColor: "#E6F7F8", borderColor: "#C7EFF2" }}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDateVN(request.createdAt)}
                          </span>
                        </div>

                        <div className="sm:justify-self-end">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
                            <span>{statusInfo.icon}</span>
                            <span>{statusInfo.text}</span>
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="mb-4">
                          <h3 className="text-base font-semibold text-neutral-900 mb-2">
                            {request.tourDetails?.zoneName || 'Custom Tour'}
                          </h3>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {/* Guide Info */}
                            {request.guideId && (
                              <div className="flex items-center gap-2 text-neutral-700">
                                <User className="w-4 h-4" />
                                <div>
                                  <span className="text-neutral-500">Hướng dẫn viên: </span>
                                  <span className="font-medium">{request.guideId.name || 'N/A'}</span>
                                </div>
                              </div>
                            )}

                            {/* Number of Guests */}
                            <div className="flex items-center gap-2 text-neutral-700">
                              <Users className="w-4 h-4" />
                              <div>
                                <span className="text-neutral-500">Số khách: </span>
                                <span className="font-medium">{request.tourDetails?.numberOfGuests || 1} người</span>
                              </div>
                            </div>

                            {/* Preferred Date */}
                            {request.preferredDates?.[0] && (
                              <div className="flex items-center gap-2 text-neutral-700">
                                <Calendar className="w-4 h-4" />
                                <div>
                                  <span className="text-neutral-500">Ngày mong muốn: </span>
                                  <span className="font-medium">
                                    {new Date(request.preferredDates[0].startDate).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Messages Count */}
                            {request.messages?.length > 0 && (
                              <div className="flex items-center gap-2 text-neutral-700">
                                <MessageSquare className="w-4 h-4" />
                                <div>
                                  <span className="text-neutral-500">Tin nhắn: </span>
                                  <span className="font-medium">{request.messages.length} tin</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Budget & Actions */}
                        <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex flex-col gap-1">
                            <div className="text-xs text-neutral-500">Ngân sách ban đầu:</div>
                            <div className="text-lg font-semibold" style={{ color: "#02A0AA" }}>
                              {formatCurrency(request.initialBudget?.amount || 0, request.initialBudget?.currency || 'VND')}
                            </div>
                            
                            {/* Show latest offer if available */}
                            {request.priceOffers?.length > 0 && (
                              <div className="text-xs text-neutral-600">
                                Đề xuất mới nhất: {formatCurrency(
                                  request.priceOffers[request.priceOffers.length - 1].amount,
                                  request.priceOffers[request.priceOffers.length - 1].currency || 'VND'
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => window.location.href = `/my-tour-requests`}
                            className="px-4 py-2 rounded-md text-white text-sm font-medium transition-colors hover:opacity-90"
                            style={{ backgroundColor: "#02A0AA" }}
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
