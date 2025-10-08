import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/context";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("Đang xử lý thanh toán...");
  const [bookingId, setBookingId] = useState(null);
  const hasProcessed = useRef(false); // ⬅️ THÊM GUARD

  useEffect(() => {
    // ⬇️ CHỈ CHẠY 1 LẦN
    if (hasProcessed.current) {
      console.log("⚠️ Payment already processed, skipping");
      return;
    }
    hasProcessed.current = true;

    const processPayment = async () => {
      try {
        const token = searchParams.get("token"); // PayPal orderID

        if (!token) {
          throw new Error("Thiếu thông tin thanh toán");
        }

        console.log("📦 Capturing payment for orderID:", token);

        // Gọi API backend để capture payment
        const response = await fetch(`${API_BASE}/api/paypal/capture`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            orderID: token,
            // ⬅️ BỎ mode, backend lấy từ session metadata
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Thanh toán thất bại");
        }

        const data = await response.json();

        if (data.success && data.bookingId) {
          setStatus("success");
          setMessage("Thanh toán thành công!");
          setBookingId(data.bookingId);
        } else {
          throw new Error("Không thể hoàn tất thanh toán");
        }
      } catch (error) {
        console.error("Payment capture error:", error);
        setStatus("error");
        setMessage(error.message || "Đã xảy ra lỗi trong quá trình thanh toán");
      }
    };

    processPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ⬅️ EMPTY DEPS - chỉ chạy 1 lần khi mount

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          {status === "processing" && (
            <>
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              {bookingId && (
                <p className="text-sm text-gray-500 mb-6">Mã đặt chỗ: {bookingId}</p>
              )}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => navigate("/profile/booking-history")}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Xem vé của tôi
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Về trang chủ
                </button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thất bại</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => navigate("/shoppingcarts")}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Quay lại giỏ hàng
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
