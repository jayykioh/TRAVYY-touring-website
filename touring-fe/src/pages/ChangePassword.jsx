import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle, Info } from "lucide-react";
import { toast, Toaster } from "sonner";
import axios from "axios";
import { useAuth } from "../auth/context";
import { API_URL } from "@/config/api";

const API = API_URL;

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Kiểm tra xem user có đăng nhập bằng OAuth không
  const isOAuthUser = user?.googleId || user?.facebookId;
  
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

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

    if (form.newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (form.currentPassword === form.newPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      
      const response = await axios.post(
        `${API}/api/auth/change-password`,
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        
        setForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          localStorage.removeItem("accessToken");
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Change password error:", error);
      const message = error.response?.data?.message || "Đổi mật khẩu thất bại";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <Toaster richColors closeButton />
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Shield className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Đổi Mật Khẩu</h2>
            <p className="text-sm text-gray-500">Cập nhật mật khẩu để bảo vệ tài khoản</p>
          </div>
        </div>
      </div>

      {/* Thông báo cho OAuth users */}
      {isOAuthUser ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Info className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Đăng nhập bằng {user?.googleId ? 'Google' : 'Facebook'}
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                Bạn đang đăng nhập bằng tài khoản {user?.googleId ? 'Google' : 'Facebook'}, 
                do đó không cần mật khẩu riêng cho hệ thống này.
              </p>
              <p className="text-gray-600 text-sm mb-4">
                Để bảo mật tài khoản, vui lòng quản lý mật khẩu thông qua:
              </p>
              <ul className="text-gray-600 text-sm space-y-2 list-disc list-inside mb-4">
                {user?.googleId && (
                  <>
                    <li>
                      <a 
                        href="https://myaccount.google.com/security" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Google Account Security
                      </a>
                    </li>
                    <li>Bật xác thực 2 bước (2FA) cho tài khoản Google</li>
                  </>
                )}
                {user?.facebookId && (
                  <>
                    <li>
                      <a 
                        href="https://www.facebook.com/settings?tab=security" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Facebook Security Settings
                      </a>
                    </li>
                    <li>Bật xác thực 2 bước (2FA) cho tài khoản Facebook</li>
                  </>
                )}
              </ul>
              <button
                onClick={() => navigate('/profile/info')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Quay lại thông tin cá nhân
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Form đổi mật khẩu cho users có password */
        <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current Password */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Mật khẩu hiện tại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type={showPasswords.current ? "text" : "password"}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu hiện tại"
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("current")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Mật khẩu mới <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type={showPasswords.new ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("new")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {form.newPassword && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-600 text-xs">Độ mạnh mật khẩu:</span>
                <span className="text-gray-800 text-xs font-medium">
                  {getPasswordStrengthText()}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
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
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Xác nhận mật khẩu mới <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type={showPasswords.confirm ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Nhập lại mật khẩu mới"
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirm")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Password Match Indicator */}
          {form.confirmPassword && (
            <div className="mt-2 flex items-center gap-2">
              {form.newPassword === form.confirmPassword ? (
                <>
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-green-600 text-xs">Mật khẩu khớp</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="text-red-600 text-xs">Mật khẩu không khớp</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Security Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-gray-800 text-xs font-medium mb-2">💡 Mẹo bảo mật:</p>
          <ul className="text-gray-600 text-xs space-y-1 list-disc list-inside">
            <li>Sử dụng ít nhất 8 ký tự</li>
            <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
            <li>Không sử dụng mật khẩu đã dùng ở nơi khác</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </div>
            ) : (
              "Đổi Mật Khẩu"
            )}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
