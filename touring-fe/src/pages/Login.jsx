import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Plane,
  Mountain,
  Compass,
  Shield,
  User,
  Star,
  Sparkles,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAuth } from "../auth/context";
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, adminLogin } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (form.username.includes('@') && form.username.includes('travyy.com')) {
        // Admin login
        await adminLogin(form.username, form.password);
        toast.success("Đăng nhập admin thành công");
        navigate("/admin/dashboard", { replace: true });
      } else {
      await login(form.username, form.password);
      toast.success("Đăng nhập thành công");
      navigate("/home", { replace: true });
      }
    } catch (err) {
      toast.error(err?.body?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = () => {
    window.location.href = `${API}/api/auth/google`;
  };

  const facebookLogin = () => {
  window.location.href = `${API}/api/auth/facebook`;
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image - Travel themed */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://res.cloudinary.com/dmiio79ah/image/upload/v1759241294/e2462154-a761-4c8c-9364-1de7d82542c3.png)",
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0" />

      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      {/* Decorative travel elements */}
      <div className="absolute top-10 left-10 text-white/20 hidden lg:block">
        <Mountain size={60} />
      </div>
      <div
        className="absolute top-20 right-20 text-white/20 hidden lg:block animate-bounce"
        style={{ animationDuration: "3s" }}
      >
        <Plane size={50} />
      </div>
      <div className="absolute bottom-20 left-20 text-white/20 hidden lg:block">
        <MapPin size={60} />
      </div>

      {/* Main Single Glassmorphic Container */}
      <div className="relative w-full max-w-5xl z-10">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Left Side - Travvy Info */}
            <div className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-white/10">
              {/* Header */}
              <div className="text-center space-y-3 mb-8">
                <div className="flex items-center justify-center"></div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white">
                  Welcome to Travvy
                </h2>
                <p className="text-white/80 text-sm">
                  Your Journey Starts Here
                </p>
              </div>

              {/* Illustration Area */}
              <div className="flex items-center justify-center my-8 py-6">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 text-yellow-300/60">
                    <Sparkles size={24} />
                  </div>
                  <div className="absolute -top-2 -right-6 text-purple-300/60">
                    <Star size={20} />
                  </div>
                  <div className="absolute -bottom-3 -left-6 text-blue-300/60">
                    <Compass size={20} />
                  </div>
                  <div className="bg-white/5 backdrop-blur-md rounded-full p-12 border border-white/20">
                    <Plane className="text-white" size={64} />
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <div className="text-center">
                <p className="text-white/90 text-base font-medium">
                  You Are Few Minutes Away To Travel Around The World With
                  Travyy !
                </p>
              </div>
            </div>

              {/* Right Side - Login Form */}
            <div className="p-8 lg:p-10">
             
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                      size={20}
                    />
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={form.username}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/30 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                      size={20}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-12 py-3.5 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password and Register Link*/}
                <div className="flex flex-row justify-between items-center">
                  <a
                    href="#"
                    className="text-sm text-white/90 hover:text-white transition-colors font-medium"
                  >
                    Forgot Password?
                  </a>
                   <a
                    href="register"
                    className="text-sm text-white/90 hover:text-white transition-colors font-medium"
                  >
                    Register 
                  </a>
                </div>

            

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 backdrop-blur-md bg-blue-600/80 hover:bg-blue-700/80 text-white font-semibold rounded-2xl border border-white/30 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Sign In
                      <span>→</span>
                    </div>
                  )}
                </button>

                {/* Social Login Icons */}
                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={googleLogin}
                    className="w-12 h-12 flex items-center justify-center backdrop-blur-md bg-white/10 border border-white/20 rounded-full hover:bg-white/20 focus:outline-none transition-all"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285f4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34a853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#fbbc05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#ea4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={facebookLogin}
                    className="w-12 h-12 flex items-center justify-center backdrop-blur-md bg-white/10 border border-white/20 rounded-full hover:bg-white/20 focus:outline-none transition-all"
                  >
                    <svg className="w-5 h-5" fill="#1877f2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="w-12 h-12 flex items-center justify-center backdrop-blur-md bg-white/10 border border-white/20 rounded-full hover:bg-white/20 focus:outline-none transition-all"
                  >
                    <svg className="w-5 h-5" fill="#1DA1F2" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="w-12 h-12 flex items-center justify-center backdrop-blur-md bg-white/10 border border-white/20 rounded-full hover:bg-white/20 focus:outline-none transition-all"
                  >
                    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Toaster richColors closeButton />
    </div>
  );
}

export default Login;
