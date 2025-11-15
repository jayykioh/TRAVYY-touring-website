import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/auth/context";
import logger from "../utils/logger";
import { ArrowLeft, Lock, CreditCard, Wallet, Calendar, Users, MapPin } from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function TourRequestPayment() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { withAuth } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const response = await withAuth(`/api/tour-requests/${requestId}`);
      setRequest(response.tourRequest || response.request || response);
    } catch (error) {
      logger.error("Error loading tour request:", error);
      toast.error("Không thể tải thông tin yêu cầu");
      navigate("/my-tour-requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const handlePayment = async () => {
    if (!selectedPayment) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (isProcessing) return;

    try {
      setIsProcessing(true);

      if (selectedPayment === "paypal") {
        const response = await withAuth("/api/paypal/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "tour-request",
            requestId: request._id
          })
        });

        if (response.orderID) {
          // Redirect to PayPal approval URL
          window.location.href = `${API_BASE}/api/paypal/approval?orderID=${response.orderID}`;
        } else {
          throw new Error("Không nhận được Order ID từ PayPal");
        }

      } else if (selectedPayment === "momo") {
        const response = await withAuth("/api/payment/momo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "tour-request",
            requestId: request._id
          })
        });

        if (response.payUrl) {
          window.location.href = response.payUrl;
        } else {
          throw new Error("Không nhận được URL thanh toán từ MoMo");
        }
      }

    } catch (error) {
      logger.error("Payment error:", error);
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

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy thông tin yêu cầu</p>
          <Link to="/my-tour-requests" className="mt-4 text-teal-600 hover:underline">
            Quay lại danh sách yêu cầu
          </Link>
        </div>
      </div>
    );
  }

  const price = request?.payment?.totalVND || request?.finalPrice || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/my-tour-requests" className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại yêu cầu tour</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán yêu cầu tour</h1>
        <p className="text-gray-600 mb-8">Hoàn tất thanh toán để xác nhận yêu cầu tour.</p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Chi tiết yêu cầu</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Yêu cầu</p>
                    <p className="font-medium text-gray-900">{request.title || request.requestNumber || 'Tour Request'}</p>
                  </div>
                </div>

                {request.guideId && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Hướng dẫn viên</p>
                      <p className="font-medium text-gray-900">{request.guideId.name || 'Guide'}</p>
                    </div>
                  </div>
                )}

                {request.startDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Ngày dự kiến</p>
                      <p className="font-medium text-gray-900">{new Date(request.startDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Phương thức thanh toán</h2>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Lock className="w-4 h-4" />
                  <span>Bảo mật</span>
                </div>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => !isProcessing && setSelectedPayment('paypal')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPayment === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'paypal' ? 'border-blue-500' : 'border-gray-300'}`}>
                        {selectedPayment === 'paypal' && (<div className="w-3 h-3 rounded-full bg-blue-500" />)}
                      </div>
                      <CreditCard className="w-6 h-6 text-gray-700" />
                      <span className="font-medium text-gray-900">PayPal</span>
                    </div>
                    <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-6" />
                  </div>
                </div>

                <div
                  onClick={() => !isProcessing && setSelectedPayment('momo')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPayment === 'momo' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'momo' ? 'border-pink-500' : 'border-gray-300'}`}>
                        {selectedPayment === 'momo' && (<div className="w-3 h-3 rounded-full bg-pink-500" />)}
                      </div>
                      <Wallet className="w-6 h-6 text-gray-700" />
                      <span className="font-medium text-gray-900">MoMo</span>
                    </div>
                    <img src="https://res.cloudinary.com/dzjm0cviz/image/upload/v1759928578/Logo-MoMo-Square_mti9wm.webp" alt="MoMo" className="h-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan thanh toán</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mã yêu cầu</span>
                  <span className="font-medium text-gray-900">{request.requestNumber || request._id?.substring(0,8).toUpperCase()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giá</span>
                  <span className="font-medium text-gray-900">{price.toLocaleString('vi-VN')} ₫</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trạng thái</span>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700">{request.status || 'pending'}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                  <span className="text-2xl font-bold text-teal-600">{price.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={!selectedPayment || isProcessing}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  !selectedPayment || isProcessing ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang xử lý...
                  </span>
                ) : (
                  `Thanh toán ${price.toLocaleString('vi-VN')} ₫`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4"><Lock className="w-3 h-3 inline mr-1" />Thanh toán được mã hóa và bảo mật</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
