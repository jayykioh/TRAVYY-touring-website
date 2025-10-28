import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../auth/context";

const Confirm2FA = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuth } = useAuth();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [userId, setUserId] = useState(""); // Lưu userId từ enable API

  useEffect(() => {
    const confirmToken = searchParams.get("token");
    if (!confirmToken) {
      setStatus("error");
      setMessage("Thiếu token xác nhận");
      return;
    }

    // Check if user is logged in
    if (!isAuth) {
      // Save current URL to redirect back after login
      const currentUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem("redirect_after_login", currentUrl);

      setStatus("error");
      setMessage("Bạn cần đăng nhập để tiếp tục kích hoạt 2FA");
      return;
    }

    // Call API to enable 2FA
    const confirm2FA = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/security/2fa/enable",
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
          setQrCode(data.qrCode);
          setSecret(data.secret);
          setUserId(data.userId); // Lưu userId
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message || "Có lỗi xảy ra");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Không thể kết nối đến server");
      }
    };

    confirm2FA();
  }, [searchParams, navigate, isAuth]);

  const handleVerify2FA = async () => {
    if (!token || token.length !== 6) {
      alert("Vui lòng nhập mã 6 chữ số");
      return;
    }

    if (!userId) {
      alert("Lỗi: Thiếu thông tin userId. Vui lòng thử lại.");
      return;
    }

    setVerifying(true);
    try {
      // Không cần token, dùng userId
      const response = await fetch(
        "http://localhost:4000/api/security/2fa/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            token: token, // ✅ Sửa "code" thành "token" để match với backend
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert("✅ 2FA đã được bật thành công!");
        // Reload trang Security để cập nhật trạng thái
        setTimeout(() => {
          window.location.href = "/profile/security";
        }, 1500);
      } else {
        alert(data.message || "Mã xác thực không đúng");
      }
    } catch (error) {
      alert("Có lỗi xảy ra: " + error.message);
    } finally {
      setVerifying(false);
    }
  };

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
          <div>
            <div className="text-center mb-6">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
              <h2 className="text-xl font-semibold text-gray-800 mt-4">
                Quét mã QR
              </h2>
              <p className="text-gray-600 mt-2 text-sm">{message}</p>
            </div>

            {qrCode && (
              <div className="mb-6">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                  <img
                    src={qrCode}
                    alt="QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">
                    Secret Key (nếu không quét được QR):
                  </p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all">
                    {secret}
                  </code>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập mã xác thực 6 chữ số
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                />
              </div>

              <button
                onClick={handleVerify2FA}
                disabled={verifying || token.length !== 6}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  "Xác nhận & Kích hoạt 2FA"
                )}
              </button>

              <button
                onClick={() => navigate("/profile/security")}
                className="w-full py-2 text-gray-600 hover:text-gray-800"
              >
                Quay lại sau
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Hướng dẫn:</strong>
              </p>
              <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                <li>Mở app Google Authenticator hoặc Authy trên điện thoại</li>
                <li>Quét mã QR phía trên</li>
                <li>Nhập mã 6 chữ số từ app</li>
                <li>Click "Xác nhận & Kích hoạt 2FA"</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Confirm2FA;
