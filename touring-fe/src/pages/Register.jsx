// Register.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  MapPin,
  Plane,
  Mountain,
  Briefcase,
} from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

axios.defaults.withCredentials = true;

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
      .get(`/api/vn/provinces`)
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
      .get(`/api/vn/wards`, {
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
      errs.username = "Username 3–20 ký tự; chỉ a–z, 0–9, dấu gạch dưới (_)";
    }
    if (form.phone && !VN_PHONE.test(form.phone)) {
      errs.phone = "Số điện thoại VN không hợp lệ (vd: 09xxxxxxxx, 03xxxxxxxx)";
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

    // 1. Đăng ký user
    await axios.post(`/api/auth/register`, payload, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // 2. Gọi notify để gửi email chào mừng
    try {
      await axios.post(`/api/notify/register`, {
        email: payload.email,
        fullName: payload.name,
      });
    } catch (notifyErr) {
      console.error("Không gửi được email chào mừng:", notifyErr);
    }

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
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image - same vibe as Login */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://res.cloudinary.com/dmiio79ah/image/upload/v1759241294/e2462154-a761-4c8c-9364-1de7d82542c3.png)",
        }}
      />

      {/* Animated gradient orbs (same as Login) */}
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

      {/* Main glassmorphic container (same structure as Login) */}
      <div className="relative w-full max-w-4xl z-10">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="">
            <div className="p-6 lg:p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-white mb-1">
                  Create Account
                </h1>
                <p className="text-white/70 text-sm">
                  Fill your details to get started
                </p>
              </div>

              {/* Google OAuth */}
              <div className="mb-6">
                <a
                  href={`/api/auth/google`}
                  className="flex items-center justify-center w-full px-4 py-3.5 rounded-2xl
                 backdrop-blur-md bg-white/10 border border-white/20
                 hover:bg-white/20 text-white transition-all"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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
                  Đăng ký bằng Google
                </a>
              </div>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-white/70">
                    hoặc
                  </span>
                </div>
              </div>

              {/* FORM — 2 columns on lg+ */}
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* COL 1 */}
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <div className="relative">
                        <User
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                          size={20}
                        />
                        <input
                          name="name"
                          type="text"
                          value={form.name}
                          onChange={onChange}
                          placeholder="Tên *"
                          className={`w-full pl-12 pr-4 py-3.5 rounded-2xl backdrop-blur-md bg-white/10 border
                          ${
                            errors.name
                              ? "border-red-400/70"
                              : "border-white/20"
                          }
                          text-white placeholder:text-white/60
                          focus:outline-none focus:ring-2
                          ${
                            errors.name
                              ? "focus:ring-red-400/50"
                              : "focus:ring-white/40"
                          }
                          transition-all`}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-300 text-sm mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Username */}
                    <div>
                      <div className="relative">
                        <User
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                          size={20}
                        />
                        <input
                          name="username"
                          type="text"
                          value={form.username}
                          onChange={onChange}
                          placeholder="Username (tuỳ chọn)"
                          className={`w-full pl-12 pr-4 py-3.5 rounded-2xl backdrop-blur-md bg-white/10 border
                          ${
                            errors.username
                              ? "border-red-400/70"
                              : "border-white/20"
                          }
                          text-white placeholder:text-white/60
                          focus:outline-none focus:ring-2
                          ${
                            errors.username
                              ? "focus:ring-red-400/50"
                              : "focus:ring-white/40"
                          }
                          transition-all`}
                        />
                      </div>
                      {errors.username && (
                        <p className="text-red-300 text-sm mt-1">
                          {errors.username}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <div className="relative">
                        <Mail
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                          size={20}
                        />
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={onChange}
                          placeholder="Email *"
                          className={`w-full pl-12 pr-4 py-3.5 rounded-2xl backdrop-blur-md bg-white/10 border
                          ${
                            errors.email
                              ? "border-red-400/70"
                              : "border-white/20"
                          }
                          text-white placeholder:text-white/60
                          focus:outline-none focus:ring-2
                          ${
                            errors.email
                              ? "focus:ring-red-400/50"
                              : "focus:ring-white/40"
                          }
                          transition-all`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-300 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <div className="relative">
                        <Phone
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                          size={20}
                        />
                        <input
                          name="phone"
                          type="text"
                          value={form.phone}
                          onChange={onChange}
                          placeholder="Số điện thoại (tuỳ chọn)"
                          className={`w-full pl-12 pr-4 py-3.5 rounded-2xl backdrop-blur-md bg-white/10 border
                          ${
                            errors.phone
                              ? "border-red-400/70"
                              : "border-white/20"
                          }
                          text-white placeholder:text-white/60
                          focus:outline-none focus:ring-2
                          ${
                            errors.phone
                              ? "focus:ring-red-400/50"
                              : "focus:ring-white/40"
                          }
                          transition-all`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-300 text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* COL 2 */}
                  <div className="space-y-4">
                    {/* Password */}
                    <div>
                      <div className="relative">
                        <Lock
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                          size={20}
                        />
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={onChange}
                          placeholder="Mật khẩu * (≥ 8 ký tự)"
                          className={`w-full pl-12 pr-12 py-3.5 rounded-2xl backdrop-blur-md bg-white/10 border
                          ${
                            errors.password
                              ? "border-red-400/70"
                              : "border-white/20"
                          }
                          text-white placeholder:text-white/60
                          focus:outline-none focus:ring-2
                          ${
                            errors.password
                              ? "focus:ring-red-400/50"
                              : "focus:ring-white/40"
                          }
                          transition-all`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-300 text-sm mt-1">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <div className="relative">
                        <Lock
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                          size={20}
                        />
                        <input
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={form.confirmPassword}
                          onChange={onChange}
                          placeholder="Nhập lại mật khẩu *"
                          className={`w-full pl-12 pr-12 py-3.5 rounded-2xl backdrop-blur-md bg-white/10 border
                          ${
                            errors.confirmPassword
                              ? "border-red-400/70"
                              : "border-white/20"
                          }
                          text-white placeholder:text-white/60
                          focus:outline-none focus:ring-2
                          ${
                            errors.confirmPassword
                              ? "focus:ring-red-400/50"
                              : "focus:ring-white/40"
                          }
                          transition-all`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-300 text-sm mt-1">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {/* Role */}
                    <div>
                      <div className="relative">
                        <Briefcase
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
                          size={20}
                        />

                        <select
                          name="role"
                          value={form.role}
                          onChange={onChange}
                          className={`w-full pl-12 pr-4 py-3.5 rounded-2xl 
                  backdrop-blur-md bg-white/10
                  border ${
                    errors.role ? "border-red-400/70" : "border-white/20"
                  }
                  text-white placeholder:text-white/60
                  focus:outline-none focus:ring-2
                  ${
                    errors.role
                      ? "focus:ring-red-400/50"
                      : "focus:ring-white/40"
                  }
                  transition-all appearance-none`}
                        >
                          <option
                            value=""
                            className="bg-slate-800/70 text-white backdrop-blur-md"
                          >
                            Chọn vai trò
                          </option>
                          {ROLES.map((r) => (
                            <option
                              key={r.value}
                              value={r.value}
                              className="bg-slate-800/70 text-white backdrop-blur-md hover:bg-slate-700/70"
                            >
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {errors.role && (
                        <p className="text-red-300 text-sm mt-1">
                          {errors.role}
                        </p>
                      )}
                    </div>

                    {/* Location: Province / Ward */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Province */}
                      {/* Province */}
                      <div>
                        <div className="relative">
                          <MapPin
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
                            size={20}
                          />

                          <div className="relative">
                            <MapPin
                              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                              size={20}
                            />

                            <Select
                              value={form.provinceId}
                              onValueChange={(v) =>
                                onChange({
                                  target: { name: "provinceId", value: v },
                                })
                              }
                              disabled={provinces.length === 0}
                            >
                              <SelectTrigger
                                className={[
                                  // kích thước & padding giống input
                                  "w-full !h-auto !py-3.5 !pl-12 !pr-10",
                                  // bo góc + glass + border
                                  "!rounded-2xl !bg-white/10 !backdrop-blur-md border !border-white/20",
                                  // màu chữ & placeholder
                                  "text-white data-[placeholder]:text-white/60",
                                  // focus ring
                                  "focus:outline-none focus:ring-2 focus:ring-white/40",
                                  // mượt mà
                                  "transition-all",
                                  // chỉnh màu/đặt vị trí chevron mặc định của shadcn
                                  "[&_[data-slot=select-icon]]:text-white/70 [&_[data-slot=select-icon]]:mr-2",
                                ].join(" ")}
                              >
                                <SelectValue placeholder="Tỉnh/Thành *" />
                              </SelectTrigger>

                              <SelectContent
                                className="min-w-[var(--radix-select-trigger-width)] w-[var(--radix-select-trigger-width)]
                 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl text-white shadow-lg"
                              >
                                {provinces.map((p) => (
                                  <SelectItem
                                    key={p.id}
                                    value={String(p.id)}
                                    className="hover:bg-white/20 cursor-pointer transition-colors"
                                  >
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {errors.provinceId && (
                          <p className="text-red-300 text-sm mt-1">
                            {errors.provinceId}
                          </p>
                        )}
                      </div>

                      {/* Ward */}
                      <div>
                        <div className="relative">
                          <MapPin
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                            size={20}
                          />

                          <Select
                            value={form.wardId}
                            onValueChange={(v) =>
                              onChange({ target: { name: "wardId", value: v } })
                            }
                            disabled={!form.provinceId || wards.length === 0}
                          >
                            <SelectTrigger
                              className="w-full !h-auto !py-3.5 !pl-12 !pr-10
                 !rounded-2xl !bg-white/10 !backdrop-blur-md border !border-white/20
                 text-white data-[placeholder]:text-white/60
                 focus:outline-none focus:ring-2 focus:ring-white/40
                 transition-all disabled:opacity-60 disabled:cursor-not-allowed
                 [&_[data-slot=select-icon]]:text-white/70 [&_[data-slot=select-icon]]:mr-2"
                            >
                              <SelectValue placeholder="Phường/Xã *" />
                            </SelectTrigger>

                            <SelectContent
                              className="min-w-[var(--radix-select-trigger-width)] w-[var(--radix-select-trigger-width)]
                 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl text-white shadow-lg"
                            >
                              {wards.map((w) => (
                                <SelectItem
                                  key={w.id}
                                  value={String(w.id)}
                                  className="hover:bg-white/20 transition-colors"
                                >
                                  {w.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {errors.wardId && (
                          <p className="text-red-300 text-sm mt-1">
                            {errors.wardId}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Address Line */}
                    <div>
                      <input
                        name="addressLine"
                        type="text"
                        value={form.addressLine}
                        onChange={onChange}
                        placeholder="Địa chỉ (tuỳ chọn)"
                        className="w-full px-4 py-3.5 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20
                       text-white placeholder:text-white/60
                       focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit spans both columns */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 backdrop-blur-md bg-blue-600/80 hover:bg-blue-700/80
                 text-white font-semibold rounded-2xl border border-white/30 shadow-lg hover:shadow-xl
                 focus:outline-none focus:ring-2 focus:ring-white/50 transform hover:scale-[1.02] active:scale-[0.98]
                 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    "Đăng ký"
                  )}
                </button>
              </form>

              {/* Footer Link */}
              <div className="mt-6 text-center text-sm">
                <p className="text-white/80">
                  Đã có tài khoản?{" "}
                  <a
                    href="/login"
                    className="text-white font-semibold underline decoration-white/40 hover:decoration-white"
                  >
                    Đăng nhập
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster richColors closeButton />
    </div>
  );
}
