import React, { useState, useEffect } from "react";
import {
  Shield,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  Smartphone,
  Trash2,
  Clock,
} from "lucide-react";
import { useAuth } from "../auth/context";
import * as userSecurityService from "../services/userSecurityService";

export default function ProfileSecurity() {
  const { withAuth } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // 2FA states
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [twoFAToken, setTwoFAToken] = useState("");
  const [show2FADisable, setShow2FADisable] = useState(false);
  const [disable2FAPassword, setDisable2FAPassword] = useState("");
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  // Email verification states
  const [emailVerificationEnabled, setEmailVerificationEnabled] =
    useState(false);

  // Trusted devices states
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [deletingDeviceId, setDeletingDeviceId] = useState(null);

  // ✅ Fetch security settings (có thể gọi lại)
  const fetchSecuritySettings = async () => {
    try {
      const data = await userSecurityService.getSecuritySettings(withAuth);
      setTwoFAEnabled(data.twoFactorEnabled || false);
      setEmailVerificationEnabled(data.emailVerificationEnabled || false);
      setIsOAuthUser(data.isOAuthUser || false);
      setTrustedDevices(data.trustedDevices || []); // ✅ Set trusted devices
    } catch (error) {
      console.error("Failed to fetch security settings:", error);
    }
  };

  // ✅ Load settings on mount
  useEffect(() => {
    fetchSecuritySettings();
  }, []);

  // ✅ Auto reload security settings khi focus vào page
  useEffect(() => {
    const handleFocus = () => {
      fetchSecuritySettings();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleSave = (message = "Cập nhật thành công!") => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    if (message) {
      setErrors({ success: message });
      setTimeout(() => setErrors({}), 3000);
    }
  };

  // =================== 2FA HANDLERS ===================

  const handleEnable2FA = async () => {
    try {
      setSaving(true);
      setErrors({});

      // Step 1: Request email confirmation
      await userSecurityService.request2FAEnable(withAuth);

      setErrors({
        success:
          "📧 Email xác nhận đã được gửi! Vui lòng kiểm tra hộp thư của bạn.",
      });

      setTimeout(() => {
        setErrors({});
      }, 5000);
    } catch (error) {
      setErrors({
        general:
          error.message || "Không thể gửi email xác nhận. Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleVerify2FA = async () => {
    try {
      setSaving(true);
      setErrors({});

      await userSecurityService.verify2FA(withAuth, twoFAToken);

      setShow2FASetup(false);
      setQrCode("");
      setTwoFAToken("");

      // Reload để cập nhật trạng thái
      window.location.href = "/profile/security";
    } catch (error) {
      setErrors({
        general: error.message || "Mã xác thực không đúng. Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setSaving(true);
      setErrors({});

      console.log(
        "🔓 Disabling 2FA with password length:",
        disable2FAPassword.length
      );

      await userSecurityService.disable2FA(withAuth, disable2FAPassword);

      setTwoFAEnabled(false);
      setShow2FADisable(false);
      setDisable2FAPassword("");

      handleSave("🔓 Xác thực hai yếu tố đã được tắt");
      fetchSecuritySettings();
    } catch (error) {
      console.error("❌ Disable 2FA error:", error);

      // Extract error message from response
      let errorMessage = "Không thể tắt 2FA. Vui lòng kiểm tra mật khẩu.";

      if (error?.error === "INVALID_PASSWORD") {
        errorMessage = "❌ Mật khẩu không đúng. Vui lòng thử lại.";
      } else if (error?.error === "OAUTH_USER") {
        errorMessage = "❌ Tài khoản OAuth không thể tắt 2FA bằng mật khẩu.";
      } else if (error?.error === "2FA_NOT_ENABLED") {
        errorMessage = "❌ 2FA chưa được bật.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setErrors({
        general: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  // =================== EMAIL VERIFICATION HANDLER ===================

  const handleToggleEmailVerification = async (newState) => {
    try {
      setSaving(true);
      setErrors({});

      await userSecurityService.requestEmailVerificationToggle(
        withAuth,
        newState
      );

      setErrors({
        success:
          "📧 Email xác nhận đã được gửi! Vui lòng kiểm tra hộp thư của bạn.",
      });

      setTimeout(() => {
        setErrors({});
      }, 5000);
    } catch (error) {
      setErrors({
        general:
          error.message || "Không thể gửi email xác nhận. Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =================== TRUSTED DEVICES HANDLERS ===================

  const handleRemoveDevice = async (deviceId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) return;

    try {
      setDeletingDeviceId(deviceId);

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/security/trusted-devices/${deviceId}`,
        {
          method: "DELETE",
          headers: await withAuth(),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xóa thiết bị");
      }

      handleSave("✅ Đã xóa thiết bị thành công");
      await fetchSecuritySettings(); // Refresh list
    } catch (error) {
      setErrors({
        general: error.message || "Không thể xóa thiết bị",
      });
    } finally {
      setDeletingDeviceId(null);
    }
  };

  const handleRemoveAllDevices = async () => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa TẤT CẢ thiết bị đã tin cậy? Bạn sẽ phải verify 2FA lại lần đăng nhập sau."
      )
    )
      return;

    try {
      setSaving(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/security/trusted-devices`,
        {
          method: "DELETE",
          headers: await withAuth(),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xóa thiết bị");
      }

      handleSave("✅ Đã xóa tất cả thiết bị thành công");
      await fetchSecuritySettings(); // Refresh list
    } catch (error) {
      setErrors({
        general: error.message || "Không thể xóa thiết bị",
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Render special view for OAuth users
  if (isOAuthUser) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Bảo mật</h2>
          <p className="text-sm text-gray-500 mt-1">
            Tài khoản của bạn được bảo vệ bởi Google/Facebook
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-start">
          <Shield className="w-8 h-8 text-blue-600 mr-4 flex-shrink-0 mt-1" />
          <div>
            <p className="text-base font-semibold text-blue-900 mb-2">
              Bạn đang đăng nhập bằng Google/Facebook
            </p>
            <p className="text-sm text-blue-700 mb-4">
              Bảo mật tài khoản của bạn được quản lý trực tiếp bởi
              Google/Facebook. Các tính năng như Xác thực hai yếu tố (2FA) và
              Xác minh Email không áp dụng cho tài khoản OAuth.
            </p>
            <div className="bg-white/50 rounded-lg p-4 border border-blue-300">
              <p className="text-sm font-medium text-blue-900 mb-2">
                💡 Để tăng cường bảo mật tài khoản:
              </p>
              <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                <li>
                  Bật xác thực hai yếu tố (2FA) trong cài đặt Google/Facebook
                </li>
                <li>Sử dụng mật khẩu mạnh cho tài khoản Google/Facebook</li>
                <li>Kiểm tra hoạt động đăng nhập thường xuyên</li>
                <li>Cập nhật thông tin khôi phục tài khoản</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Bảo mật</h2>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý các tùy chọn bảo mật tài khoản của bạn
        </p>
      </div>

      {/* Success/Error Messages */}
      {errors.success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{errors.success}</p>
        </div>
      )}

      {errors.general && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{errors.general}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* 2FA Section */}
        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Xác thực hai yếu tố (2FA)
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Thêm lớp bảo mật cho tài khoản với Google Authenticator
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                twoFAEnabled ? setShow2FADisable(true) : handleEnable2FA()
              }
              disabled={saving}
              className={`px-5 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
                twoFAEnabled
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : twoFAEnabled ? (
                "Tắt"
              ) : (
                "Bật"
              )}
            </button>
          </div>

          {/* 2FA Setup Modal */}
          {show2FASetup && (
            <div className="mt-4 p-5 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Quét mã QR</h4>
              <div className="flex flex-col items-center">
                {qrCode && (
                  <img
                    src={qrCode}
                    alt="QR Code"
                    className="w-52 h-52 mb-4 rounded-lg border border-blue-300"
                  />
                )}
                <p className="text-sm text-gray-600 mb-4 text-center max-w-md">
                  Quét mã QR bằng ứng dụng Google Authenticator, Authy hoặc ứng
                  dụng TOTP khác
                </p>
                <div className="w-full max-w-sm">
                  <input
                    type="text"
                    value={twoFAToken}
                    onChange={(e) => setTwoFAToken(e.target.value)}
                    placeholder="Nhập mã 6 số từ ứng dụng"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={6}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShow2FASetup(false);
                        setQrCode("");
                        setTwoFAToken("");
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleVerify2FA}
                      disabled={twoFAToken.length !== 6 || saving}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? "Đang xác thực..." : "Xác nhận"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2FA Disable Modal */}
          {show2FADisable && (
            <div className="mt-4 p-5 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                Xác nhận tắt 2FA
              </h4>

              {!isOAuthUser ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Nhập mật khẩu của bạn để xác nhận tắt xác thực hai yếu tố:
                  </p>
                  <input
                    type="password"
                    value={disable2FAPassword}
                    onChange={(e) => setDisable2FAPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </>
              ) : (
                <p className="text-sm text-gray-600 mb-4">
                  Bạn đang sử dụng tài khoản OAuth (Google/Facebook). Bạn có
                  chắc chắn muốn tắt 2FA không?
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShow2FADisable(false);
                    setDisable2FAPassword("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDisable2FA}
                  disabled={(!isOAuthUser && !disable2FAPassword) || saving}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Đang tắt..." : "Tắt 2FA"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Email Verification Section */}
        <div className="flex items-center justify-between p-5 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Email xác thực
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Gửi mã xác thực qua email khi đăng nhập
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={emailVerificationEnabled}
              onChange={(e) => handleToggleEmailVerification(e.target.checked)}
              disabled={saving}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
          </label>
        </div>

        {/* Trusted Devices Section */}
        {twoFAEnabled && trustedDevices.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Smartphone className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Thiết bị đã tin cậy
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Quản lý các thiết bị đã lưu để bỏ qua 2FA
                  </p>
                </div>
              </div>
              {trustedDevices.length > 0 && (
                <button
                  onClick={handleRemoveAllDevices}
                  disabled={saving}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            <div className="space-y-3">
              {trustedDevices.map((device) => {
                const createdDate = new Date(device.createdAt);
                const expiresDate = new Date(device.expiresAt);
                const lastUsedDate = device.lastUsed
                  ? new Date(device.lastUsed)
                  : null;
                const now = new Date();
                const timeLeft = expiresDate - now;
                const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hoursLeft = Math.floor(
                  (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                const minutesLeft = Math.floor(
                  (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
                );

                return (
                  <div
                    key={device.id}
                    className={`p-4 rounded-lg border ${
                      device.isExpired
                        ? "bg-red-50 border-red-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="w-4 h-4 text-gray-600" />
                          <p className="text-sm font-medium text-gray-900">
                            {device.deviceName || "Unknown Device"}
                          </p>
                          {device.isExpired && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                              Đã hết hạn
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              Tạo: {createdDate.toLocaleString("vi-VN")}
                            </span>
                          </div>
                          {lastUsedDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                Dùng lần cuối:{" "}
                                {lastUsedDate.toLocaleString("vi-VN")}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {device.isExpired
                                ? `Đã hết hạn: ${expiresDate.toLocaleString(
                                    "vi-VN"
                                  )}`
                                : daysLeft > 0
                                ? `Còn ${daysLeft} ngày ${hoursLeft} giờ`
                                : hoursLeft > 0
                                ? `Còn ${hoursLeft} giờ ${minutesLeft} phút`
                                : `Còn ${minutesLeft} phút`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveDevice(device.id)}
                        disabled={deletingDeviceId === device.id}
                        className="ml-4 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Xóa thiết bị"
                      >
                        {deletingDeviceId === device.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
