import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Send, ArrowLeft, CheckCircle } from "lucide-react";
import { toast, Toaster } from "sonner";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email không hợp lệ");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/api/auth/forgot-password`, {
        email: email.toLowerCase().trim(),
      });

      if (response.data.success) {
        setEmailSent(true);
        toast.success("Link đặt lại mật khẩu đã được gửi đến email của bạn!");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      // Vẫn hiển thị success để không tiết lộ email có tồn tại hay không (security)
      setEmailSent(true);
      toast.success("Nếu email tồn tại, link đặt lại mật khẩu đã được gửi!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setEmailSent(false);
    setEmail("");
  };

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
          {!emailSent ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                  <Mail className="text-white" size={32} />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Quên Mật Khẩu?</h1>
                <p className="text-white/80 text-sm">
                  Đừng lo! Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                      size={20}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="your.email@example.com"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/30 transition-all"
                    />
                  </div>
                </div>

                {/* Info Box */}
                <div className="backdrop-blur-md bg-blue-500/10 border border-blue-400/20 rounded-2xl p-4">
                  <p className="text-white/90 text-xs">
                    📧 Chúng tôi sẽ gửi một email chứa link đặt lại mật khẩu. Link này có hiệu
                    lực trong <strong>15 phút</strong>.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 backdrop-blur-md bg-blue-600/80 hover:bg-blue-700/80 text-white font-semibold rounded-2xl border border-white/30 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang gửi...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Send size={20} />
                      Gửi Link Đặt Lại Mật Khẩu
                    </div>
                  )}
                </button>

                {/* Back to Login */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-white/90 hover:text-white text-sm font-medium inline-flex items-center gap-2 underline decoration-white/40 hover:decoration-white transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Quay lại đăng nhập
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6 animate-bounce">
                  <CheckCircle className="text-green-400" size={48} />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Email Đã Được Gửi!</h1>
                <p className="text-white/80 text-sm mb-8">
                  Chúng tôi đã gửi link đặt lại mật khẩu đến email:
                  <br />
                  <strong className="text-white">{email}</strong>
                </p>

                {/* Instructions */}
                <div className="backdrop-blur-md bg-white/5 rounded-2xl p-6 mb-6 text-left">
                  <p className="text-white/90 text-sm font-medium mb-3">📋 Các bước tiếp theo:</p>
                  <ol className="text-white/70 text-sm space-y-2 list-decimal list-inside">
                    <li>Kiểm tra hộp thư đến của bạn</li>
                    <li>Nhấp vào link trong email (hiệu lực 15 phút)</li>
                    <li>Đặt mật khẩu mới cho tài khoản</li>
                    <li>Đăng nhập với mật khẩu mới</li>
                  </ol>
                </div>

                {/* Tips */}
                <div className="backdrop-blur-md bg-yellow-500/10 border border-yellow-400/20 rounded-2xl p-4 mb-6">
                  <p className="text-white/90 text-xs">
                    💡 <strong>Không thấy email?</strong> Kiểm tra thư mục spam hoặc chờ vài phút
                    rồi thử lại.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleResend}
                    className="w-full py-3.5 px-4 backdrop-blur-md bg-blue-600/80 hover:bg-blue-700/80 text-white font-semibold rounded-2xl border border-white/30 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Gửi Lại Email
                  </button>

                  <button
                    onClick={() => navigate("/login")}
                    className="w-full py-3.5 px-4 backdrop-blur-md bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl border border-white/20 focus:outline-none transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Quay Lại Đăng Nhập
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Toaster richColors closeButton />
    </div>
  );
}
