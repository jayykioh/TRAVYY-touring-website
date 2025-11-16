import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/auth/context";
import { ArrowLeft, Lock, CreditCard, Wallet, Calendar, Users, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function CustomTourPaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { withAuth } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const response = await withAuth(`/api/bookings/${bookingId}`);
      setBooking(response.booking);
    } catch (error) {
      console.error("Error loading booking:", error);
      toast.error("Không thể tải thông tin booking");
      navigate("/my-tour-requests");
    } finally {
      setLoading(false);
    }
  };

  // Load booking details
  useEffect(() => {
    loadBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const handlePayment = async () => {
    if (!selectedPayment) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (isProcessing) return;

    try {
      setIsProcessing(true);

      if (selectedPayment === "paypal") {
        // PayPal flow
        const response = await withAuth("/api/paypal/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "custom-tour",
            bookingId: booking._id,
            amount: booking.payment.totalVND
          })
        });

        if (response.approvalUrl) {
          window.location.href = response.approvalUrl;
        } else {
          throw new Error("Không nhận được URL thanh toán từ PayPal");
        }

      } else if (selectedPayment === "momo") {
        // MoMo flow
        const response = await withAuth("/api/payment/momo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "custom-tour",
            bookingId: booking._id,
            amount: booking.payment.totalVND
          })
        });

        if (response.payUrl) {
          window.location.href = response.payUrl;
        } else {
          throw new Error("Không nhận được URL thanh toán từ MoMo");
        }
      }

    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.message || "Lỗi khi khởi tạo thanh toán");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy thông tin booking</p>
          <Link to="/my-tour-requests" className="mt-4 text-teal-600 hover:underline">
            Quay lại danh sách yêu cầu
          </Link>
        </div>
      </div>
    );
  }

  // Calculate expiry time
  const expiresAt = new Date(booking.payment.expiresAt);
  const now = new Date();
  const timeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000 / 60)); // minutes

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            to="/my-tour-requests"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại yêu cầu tour</span>
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán Custom Tour</h1>
        <p className="text-gray-600 mb-8">
          Hoàn tất thanh toán để xác nhận tour của bạn với hướng dẫn viên
        </p>

        {/* Expiry Warning */}
        {timeLeft > 0 && timeLeft <= 60 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 font-medium">
              ⏰ Vui lòng thanh toán trong {timeLeft} phút để giữ booking
            </p>
          </div>
        )}

        {timeLeft === 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">
              ❌ Booking đã hết hạn. Vui lòng tạo yêu cầu mới.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Payment Method */}
          <div className="md:col-span-2 space-y-6">
            {/* Booking Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Chi tiết tour</h2>
              
              <div className="space-y-4">
                {/* Itinerary Name */}
                {booking.customTourRequest?.itineraryId && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Hành trình</p>
                      <p className="font-medium text-gray-900">
                        {booking.items?.[0]?.name || "Custom Tour"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Guide Info */}
                {booking.customTourRequest?.guideId && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Hướng dẫn viên</p>
                      <p className="font-medium text-gray-900">
                        {booking.customTourRequest.guideId.name || "Guide"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Date */}
                {booking.items?.[0]?.date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Ngày khởi hành</p>
                      <p className="font-medium text-gray-900">
                        {new Date(booking.items[0].date).toLocaleDateString("vi-VN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Participants */}
                {booking.items?.[0] && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Số người</p>
                      <p className="font-medium text-gray-900">
                        {booking.items[0].adults || 0} người lớn
                        {booking.items[0].children > 0 && `, ${booking.items[0].children} trẻ em`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Phương thức thanh toán</h2>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Lock className="w-4 h-4" />
                  <span>Bảo mật</span>
                </div>
              </div>

              <div className="space-y-3">
                {/* PayPal */}
                <div
                  onClick={() => !isProcessing && setSelectedPayment("paypal")}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPayment === "paypal"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPayment === "paypal" ? "border-blue-500" : "border-gray-300"
                        }`}
                      >
                        {selectedPayment === "paypal" && (
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <CreditCard className="w-6 h-6 text-gray-700" />
                      <span className="font-medium text-gray-900">PayPal</span>
                    </div>
                    <img
                      src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
                      alt="PayPal"
                      className="h-6"
                    />
                  </div>
                </div>

                {/* MoMo */}
                <div
                  onClick={() => !isProcessing && setSelectedPayment("momo")}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPayment === "momo"
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPayment === "momo" ? "border-pink-500" : "border-gray-300"
                        }`}
                      >
                        {selectedPayment === "momo" && (
                          <div className="w-3 h-3 rounded-full bg-pink-500" />
                        )}
                      </div>
                      <Wallet className="w-6 h-6 text-gray-700" />
                      <span className="font-medium text-gray-900">MoMo</span>
                    </div>
                    <img
                      src="https://res.cloudinary.com/dzjm0cviz/image/upload/v1759928578/Logo-MoMo-Square_mti9wm.webp"
                      alt="MoMo"
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan thanh toán</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mã booking</span>
                  <span className="font-medium text-gray-900">
                    {booking.orderRef || booking._id.substring(0, 8).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giá tour</span>
                  <span className="font-medium text-gray-900">
                    {booking.payment.totalVND.toLocaleString("vi-VN")} ₫
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trạng thái</span>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700">
                    {booking.payment.status === "pending" ? "Chờ thanh toán" : booking.payment.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                  <span className="text-2xl font-bold text-teal-600">
                    {booking.payment.totalVND.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={!selectedPayment || isProcessing || timeLeft === 0}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  !selectedPayment || isProcessing || timeLeft === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-teal-600 text-white hover:bg-teal-700"
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang xử lý...
                  </span>
                ) : (
                  `Thanh toán ${booking.payment.totalVND.toLocaleString("vi-VN")} ₫`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                <Lock className="w-3 h-3 inline mr-1" />
                Thanh toán được mã hóa và bảo mật
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
