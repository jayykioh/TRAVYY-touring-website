import React, { useState, useEffect } from "react";
import {
  Shield,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
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

  // Email verification states
  const [emailVerificationEnabled, setEmailVerificationEnabled] =
    useState(false);

  // ✅ Fetch security settings (có thể gọi lại)
  const fetchSecuritySettings = async () => {
    try {
      const data = await userSecurityService.getSecuritySettings(withAuth);
      setTwoFAEnabled(data.twoFactorEnabled || false);
      setEmailVerificationEnabled(data.emailVerificationEnabled || false);
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

      await userSecurityService.disable2FA(withAuth, disable2FAPassword);

      setTwoFAEnabled(false);
      setShow2FADisable(false);
      setDisable2FAPassword("");

      handleSave("🔓 Xác thực hai yếu tố đã được tắt");
      fetchSecuritySettings();
    } catch (error) {
      setErrors({
        general:
          error.message || "Không thể tắt 2FA. Vui lòng kiểm tra mật khẩu.",
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
                  disabled={!disable2FAPassword || saving}
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
      </div>
    </div>
  );
}
