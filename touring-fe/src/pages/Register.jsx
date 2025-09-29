// Register.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, Eye, EyeOff, MapPin, Plane, Mountain, Briefcase } from "lucide-react";

axios.defaults.withCredentials = true;
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const VN_PHONE = /^(03|05|07|08|09)\d{8}$/;
const USERNAME = /^[a-z0-9_]{3,20}$/i;
const ROLES = [
  { value: "Traveler", label: "Traveler (Khách du lịch)" },
  { value: "TourGuide", label: "Tour Guide (Hướng dẫn viên)" },
  { value: "TravelAgency", label: "Travel Agency (Công ty lữ hành)" },
];

const isEmail = (e) => /\S+@\S+\.\S+/.test(e);
const normalizeUsername = (u = "") => u.trim().toLowerCase();

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "",
    provinceId: "",
    wardId: "",
    addressLine: "",
  });

  const [errors, setErrors] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load provinces
  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_BASE}/api/vn/provinces`)
      .then(({ data }) => {
        if (!cancelled) setProvinces(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!cancelled) {
          console.error("load provinces failed:", e);
          toast.error("Tải danh sách tỉnh/thành thất bại");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load wards when province changes
  useEffect(() => {
    if (!form.provinceId) {
      setWards([]);
      if (form.wardId) setForm((f) => ({ ...f, wardId: "" }));
      return;
    }
    let cancelled = false;
    axios
      .get(`${API_BASE}/api/vn/wards`, {
        params: { province_id: form.provinceId },
      })
      .then(({ data }) => {
        if (!cancelled) setWards(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!cancelled) {
          console.error("load wards failed:", e);
          toast.error("Tải danh sách phường/xã thất bại");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [form.provinceId, form.wardId]);

  // Client validate
  const validate = useMemo(() => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Tên không được để trống";
    if (!form.email.trim() || !isEmail(form.email.trim()))
      errs.email = "Email không hợp lệ";
    if (!form.password || form.password.length < 8)
      errs.password = "Mật khẩu tối thiểu 8 ký tự";
    if (!form.confirmPassword)
      errs.confirmPassword = "Vui lòng nhập lại mật khẩu";
    if (
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    ) {
      errs.confirmPassword = "Mật khẩu nhập lại không khớp";
    }
    if (form.username && !USERNAME.test(form.username)) {
      errs.username =
        "Username 3–20 ký tự; chỉ a–z, 0–9, dấu gạch dưới (_)";
    }
    if (form.phone && !VN_PHONE.test(form.phone)) {
      errs.phone =
        "Số điện thoại VN không hợp lệ (vd: 09xxxxxxxx, 03xxxxxxxx)";
    }
    if (!form.role) errs.role = "Vui lòng chọn vai trò";
    if (!form.provinceId) errs.provinceId = "Chọn Tỉnh/Thành";
    if (!form.wardId) errs.wardId = "Chọn Phường/Xã";
    return errs;
  }, [form]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "username" ? normalizeUsername(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const errs = validate;
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Vui lòng sửa các lỗi trước khi đăng ký");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        role: form.role,
        provinceId: form.provinceId,
        wardId: form.wardId,
        addressLine: form.addressLine.trim(),
      };

      await axios.post(`${API_BASE}/api/auth/register`, payload, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      toast.success("Đăng ký thành công!");
      navigate("/login", { replace: true });
    } catch (error) {
      const data = error.response?.data;
      if (data?.error === "EMAIL_TAKEN") {
        setErrors((e) => ({ ...e, email: "Email đã được sử dụng" }));
        toast.error("Email đã được sử dụng");
      } else if (data?.error === "PHONE_TAKEN") {
        setErrors((e) => ({ ...e, phone: "Số điện thoại đã được sử dụng" }));
        toast.error("Số điện thoại đã được sử dụng");
      } else if (data?.error === "USERNAME_TAKEN") {
        setErrors((e) => ({ ...e, username: "Username đã được sử dụng" }));
        toast.error("Username đã được sử dụng");
      } else if (data?.error === "VALIDATION_ERROR") {
        toast.error(data.message || "Dữ liệu không hợp lệ");
      } else {
        toast.error(data?.message || "Đăng ký thất bại");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-gray-50">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600)',
          opacity: 0.12
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-blue-300 opacity-30 hidden md:block">
        <Mountain size={60} />
      </div>
      <div className="absolute top-20 right-20 text-purple-300 opacity-30 hidden md:block">
        <Plane size={50} />
      </div>
      <div className="absolute bottom-20 left-20 text-indigo-300 opacity-30 hidden md:block">
        <MapPin size={60} />
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-2xl my-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                <Plane className="text-white" size={28} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
            <p className="text-blue-100 text-sm">Join us and start your journey</p>
          </div>

          {/* Form Container */}
          <div className="p-8">
            {/* Google OAuth */}
            <div className="mb-6">
              <a
                href={`${API_BASE}/api/auth/google`}
                className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Đăng ký bằng Google
              </a>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">hoặc</span>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Nhập tên của bạn"
                    className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                      errors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2 transition-all`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={onChange}
                    placeholder="a-z, 0-9, _ (tuỳ chọn)"
                    className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                      errors.username ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2 transition-all`}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="you@example.com"
                    className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2 transition-all`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password & Confirm Password - Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={onChange}
                      placeholder="Tối thiểu 8 ký tự"
                      className={`w-full pl-11 pr-12 py-3 rounded-lg border ${
                        errors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
                      } focus:outline-none focus:ring-2 transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhập lại mật khẩu *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={onChange}
                      placeholder="Nhập lại mật khẩu"
                      className={`w-full pl-11 pr-12 py-3 rounded-lg border ${
                        errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
                      } focus:outline-none focus:ring-2 transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    name="phone"
                    type="text"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="VD: 09xxxxxxxx"
                    className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                      errors.phone ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2 transition-all`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò *
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    name="role"
                    value={form.role}
                    onChange={onChange}
                    className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                      errors.role ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2 transition-all appearance-none bg-white`}
                  >
                    <option value="">-- Chọn vai trò --</option>
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                )}
              </div>

              {/* Location - Province & Ward */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Province */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tỉnh/Thành *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      name="provinceId"
                      value={form.provinceId}
                      onChange={onChange}
                      className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                        errors.provinceId ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
                      } focus:outline-none focus:ring-2 transition-all appearance-none bg-white`}
                    >
                      <option value="">-- Chọn Tỉnh/Thành --</option>
                      {provinces.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.provinceId && (
                    <p className="text-red-500 text-sm mt-1">{errors.provinceId}</p>
                  )}
                </div>

                {/* Ward */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phường/Xã *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      name="wardId"
                      value={form.wardId}
                      onChange={onChange}
                      disabled={!form.provinceId || wards.length === 0}
                      className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                        errors.wardId ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
                      } focus:outline-none focus:ring-2 transition-all appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    >
                      <option value="">-- Chọn Phường/Xã --</option>
                      {wards.map((w) => (
                        <option key={w.id} value={String(w.id)}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.wardId && (
                    <p className="text-red-500 text-sm mt-1">{errors.wardId}</p>
                  )}
                </div>
              </div>

              {/* Address Line */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ (tuỳ chọn)
                </label>
                <input
                  name="addressLine"
                  type="text"
                  value={form.addressLine}
                  onChange={onChange}
                  placeholder="Số nhà, đường..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  'Đăng ký'
                )}
              </button>
            </form>

            {/* Footer Link */}
            <div className="mt-8 text-center text-sm">
              <p className="text-gray-600">
                Đã có tài khoản?{' '}
                <a
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors relative group inline-block"
                >
                  Đăng nhập
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Toaster richColors closeButton />
    </div>
  );
}