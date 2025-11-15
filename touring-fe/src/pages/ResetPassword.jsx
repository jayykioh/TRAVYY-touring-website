import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, KeyRound, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { toast, Toaster } from "sonner";
import logger from "../utils/logger";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    // Lấy token từ URL
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      toast.error("Link không hợp lệ");
      setTokenValid(false);
    } else {
      setToken(tokenFromUrl);
      setTokenValid(true);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Calculate password strength for new password
    if (name === "newPassword") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 2) return "bg-orange-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Yếu";
    if (passwordStrength <= 2) return "Trung bình";
    if (passwordStrength <= 3) return "Khá";
    if (passwordStrength <= 4) return "Mạnh";
    return "Rất mạnh";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!token) {
      toast.error("Token không hợp lệ");
      return;
    }

    if (form.newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API}/api/auth/reset-password`,
        {
          token: token,
          newPassword: form.newPassword,
        }
      );

      if (response.data.success) {
        toast.success("Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...");
        
        // Clear form
        setForm({
          newPassword: "",
          confirmPassword: "",
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      logger.error("Reset password error:", error);
      const message = error.response?.data?.message || "Đặt lại mật khẩu thất bại. Link có thể đã hết hạn.";
      toast.error(message);
      
      // Nếu token hết hạn, redirect về forgot password
      if (error.response?.status === 400) {
        setTimeout(() => {
          navigate("/forgot-password");
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Nếu không có token, hiển thị error page
  if (tokenValid === false) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(https://res.cloudinary.com/dmiio79ah/image/upload/v1759241294/e2462154-a761-4c8c-9364-1de7d82542c3.png)" }} />
        <div className="relative z-10 backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 max-w-md text-center">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-white mb-4">Link Không Hợp Lệ</h1>
          <p className="text-white/80 mb-6">Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.</p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full py-3 px-4 backdrop-blur-md bg-blue-600/80 hover:bg-blue-700/80 text-white font-semibold rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all"
          >
            Yêu Cầu Link Mới
          </button>
        </div>
        <Toaster richColors closeButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://res.cloudinary.com/dmiio79ah/image/upload/v1759241294/e2462154-a761-4c8c-9364-1de7d82542c3.png)",
        }}
      />

      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      {/* Main Container */}
      <div className="relative w-full max-w-md z-10">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
              <KeyRound className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Đặt Lại Mật Khẩu</h1>
            <p className="text-white/80 text-sm">
              Tạo mật khẩu mới để bảo vệ tài khoản của bạn
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                  size={20}
                />
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                  placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {form.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-xs">Độ mạnh mật khẩu:</span>
                    <span className="text-white text-xs font-medium">
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                  size={20}
                />
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Match Indicator */}
              {form.confirmPassword && (
                <div className="mt-2 flex items-center gap-2">
                  {form.newPassword === form.confirmPassword ? (
                    <>
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-green-400 text-xs">Mật khẩu khớp</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="text-red-400" />
                      <span className="text-red-400 text-xs">Mật khẩu không khớp</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Security Tips */}
            <div className="backdrop-blur-md bg-blue-500/10 border border-blue-400/20 rounded-2xl p-4">
              <p className="text-white/90 text-xs font-medium mb-2">💡 Mẹo bảo mật:</p>
              <ul className="text-white/70 text-xs space-y-1 list-disc list-inside">
                <li>Sử dụng ít nhất 8 ký tự</li>
                <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                <li>Không sử dụng mật khẩu đã dùng ở nơi khác</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full py-3.5 px-4 backdrop-blur-md bg-blue-600/80 hover:bg-blue-700/80 text-white font-semibold rounded-2xl border border-white/30 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </div>
              ) : (
                "Đặt Lại Mật Khẩu"
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-white/90 hover:text-white text-sm font-medium underline decoration-white/40 hover:decoration-white transition-colors"
              >
                ← Quay lại đăng nhập
              </button>
            </div>
          </form>
        </div>
      </div>

      <Toaster richColors closeButton />
    </div>
  );
}
