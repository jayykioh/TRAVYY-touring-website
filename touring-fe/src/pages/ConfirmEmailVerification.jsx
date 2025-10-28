import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../auth/context";

const ConfirmEmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuth } = useAuth();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const confirmToken = searchParams.get("token");
    if (!confirmToken) {
      setStatus("error");
      setMessage("Thiếu token xác nhận");
      return;
    }

    // Check if user is logged in - if not, save redirect URL
    if (!isAuth) {
      const currentUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem("redirect_after_login", currentUrl);

      setStatus("error");
      setMessage("Bạn cần đăng nhập để tiếp tục");
      return;
    }

    // Call API to toggle email verification
    const confirmToggle = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/security/email-verification/toggle",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: confirmToken }),
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage(data.message);
          // Auto redirect after 2 seconds với reload
          setTimeout(() => {
            window.location.href = "/profile/security";
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.message || "Có lỗi xảy ra");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Không thể kết nối đến server");
      }
    };

    confirmToggle();
  }, [searchParams, navigate, isAuth]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {status === "loading" && (
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
            <p className="mt-4 text-gray-600">Đang xác nhận...</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <XCircle className="w-12 h-12 mx-auto text-red-500" />
            <h2 className="text-xl font-semibold text-gray-800 mt-4">
              Xác nhận thất bại
            </h2>
            <p className="text-gray-600 mt-2">{message}</p>

            {message.includes("đăng nhập") ? (
              <button
                onClick={() => navigate("/login")}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Đăng nhập ngay
              </button>
            ) : (
              <button
                onClick={() => navigate("/profile/security")}
                className="mt-6 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Quay lại Bảo mật
              </button>
            )}
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
            <h2 className="text-xl font-semibold text-gray-800 mt-4">
              Thành công!
            </h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <p className="text-sm text-gray-500 mt-4">
              Đang chuyển hướng về trang Bảo mật...
            </p>
            <button
              onClick={() => (window.location.href = "/profile/security")}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Quay lại ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmailVerification;
