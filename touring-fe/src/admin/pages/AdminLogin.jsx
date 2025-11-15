import React, { useState, useEffect } from "react";
import logger from "../../utils/logger";
import { Eye, EyeOff, Lock, Mail, Shield, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, admin } = useAdminAuth();

  const [formData, setFormData] = useState({
    email: localStorage.getItem("adminRememberEmail") || "",
    password: localStorage.getItem("adminRememberPassword") || "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem("adminRememberEmail") &&
      !!localStorage.getItem("adminRememberPassword")
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Auto redirect when authenticated as admin
  useEffect(() => {
    if (isAuthenticated && admin?.role === "Admin") {
      logger.info("[AdminLogin] Already authenticated as admin, redirecting...");
      const redirectUrl = sessionStorage.getItem("redirect_after_login");
      if (redirectUrl) {
        sessionStorage.removeItem("redirect_after_login");
        navigate(redirectUrl, { replace: true });
      } else {
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, admin, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email không hợp lệ");
      setLoading(false);
      return;
    }

    try {
      logger.info("Starting login...");
      const result = await login(formData.email, formData.password);
      logger.info("Login result:", result);

      if (result.success) {
        // ✅ Verify admin role before proceeding
        if (result.admin?.role !== "Admin") {
          setError("Tài khoản này không có quyền truy cập trang quản trị");
          setLoading(false);
          return;
        }

        if (rememberMe) {
          localStorage.setItem("adminRememberEmail", formData.email);
          localStorage.setItem("adminRememberPassword", formData.password);
          localStorage.setItem("adminRememberMe", "true");
        } else {
          localStorage.removeItem("adminRememberEmail");
          localStorage.removeItem("adminRememberPassword");
          localStorage.removeItem("adminRememberMe");
        }

        logger.info("Login successful! useEffect will handle navigation.");
        // Navigation will be handled by useEffect when state updates
      } else if (result.requires2FA || result.requiresEmailVerification) {
        // Redirect đến trang verify
        navigate("/admin/login/verify", {
          state: {
            requires2FA: result.requires2FA,
            requiresEmailVerification: result.requiresEmailVerification,
            userId: result.userId,
            message: result.message,
          },
          replace: true,
        });
      } else {
        setError(result.message || "Email hoặc mật khẩu không chính xác");
      }
    } catch (err) {
      logger.error("Login error:", err);
      setError("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Travyy Admin
            </h1>
            <p className="text-gray-600">Đăng nhập vào hệ thống quản trị</p>
          </div>

          {/* Demo Info Alert */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo:</strong> admin123@travyy.com / Admin@123
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="admin@travyy.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                disabled={loading}
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Đây là trang đăng nhập dành riêng cho Admin
            </p>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Bạn là khách hàng?{" "}
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Đăng nhập tại đây
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10 text-white max-w-lg">
          <h2 className="text-5xl font-bold mb-6">Quản lý toàn diện</h2>
          <p className="text-xl text-blue-100 mb-8">
            Hệ thống quản trị mạnh mẽ cho Travyy - Nền tảng kết nối du lịch hàng
            đầu Việt Nam
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              "Dashboard thống kê chi tiết",
              "Quản lý tour & hướng dẫn viên",
              "Xử lý yêu cầu khách hàng",
              "Báo cáo & phân tích hiệu suất",
            ].map((feature, index) => (
              <div key={index} className="flex items-center">
                <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                <span className="text-blue-100">{feature}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { value: "10K+", label: "Users" },
              { value: "5K+", label: "Tours" },
              { value: "99%", label: "Uptime" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
