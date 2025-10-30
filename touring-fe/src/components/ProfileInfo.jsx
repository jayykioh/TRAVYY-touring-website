import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useAuth } from "../auth/context";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

/* ========== Utilities ========== */
async function apiFetch(path, opts = {}) {
  const r = await fetch(path, {
    credentials: "include",
    headers: { Accept: "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  const ct = r.headers.get("content-type") || "";
  const body = ct.includes("application/json") ? await r.json().catch(() => null) : null;
  if (!r.ok) {
    const err = new Error(`HTTP ${r.status}`);
    err.status = r.status;
    err.body = body;
    throw err;
  }
  return body;
}
const apiGet = (path, opts) => apiFetch(path, { method: "GET", ...opts });

const validatePhoneNumber = (phone) => {
  if (!phone) return ""; 
  const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
  return phoneRegex.test(phone)
    ? ""
    : "Số điện thoại không hợp lệ (ví dụ: 09xxxxxxxx, 03xxxxxxxx...)";
};
const validateUsername = (u) => {
  if (!u) return ""; 
  const usernameRegex = /^[\p{L}\p{N}_]{3,20}$/u;
  return usernameRegex.test(u)
    ? ""
    : "Tên đăng nhập phải dài 3–20 ký tự; chỉ chứa chữ, số hoặc dấu gạch dưới (_).";
};

function usePrevious(value) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

/* ========== Component ========== */
export default function ProfileInfo() {
  const { user, setUser, withAuth, accessToken } = useAuth();

  const phoneInputRef = useRef(null);
  const usernameInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone: "",
    provinceId: "",
    wardId: "",
    addressLine: "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarVersion, setAvatarVersion] = useState(Date.now()); // ✅ Track avatar changes

  // Baseline from user (for dirty check)
  const baseline = useMemo(
    () => ({
      name: user?.name ?? "",
      username: user?.username ?? "",
      phone: user?.phone ?? "",
      provinceId: String(user?.location?.provinceId ?? ""),
      wardId: String(user?.location?.wardId ?? ""),
      addressLine: user?.location?.addressLine ?? "",
    }),
    [user]
  );

  // Dirty check
  const formDirty = useMemo(
    () => Object.keys(baseline).some((k) => (formData[k] ?? "") !== baseline[k]),
    [formData, baseline]
  );

  // Hydrate form when user changes
  useEffect(() => {
    if (!user) return;
    setFormData(baseline);
  }, [baseline, user]);

  // Load provinces 1 time
  useEffect(() => {
    const ac = new AbortController();
    apiGet("/api/vn/provinces", { signal: ac.signal })
      .then(setProvinces)
      .catch((e) => {
        if (e.name !== "AbortError") {
          console.error("Failed to load provinces:", e);
          toast.error("Failed to load provinces");
        }
      });
    return () => ac.abort();
  }, []);

  // Load wards when province changes; reset wardId only if user actually changed province
  const prevProvinceId = usePrevious(formData.provinceId);
  useEffect(() => {
    const prov = formData.provinceId;
    if (!prov) {
      setWards([]);
      return;
    }
    const ac = new AbortController();

    if (prevProvinceId && prevProvinceId !== prov) {
      setFormData((fd) => ({ ...fd, wardId: "" }));
    }

    apiGet(`/api/vn/wards?province_id=${prov}`, { signal: ac.signal })
      .then((data) => setWards(Array.isArray(data) ? data : []))
      .catch((e) => {
        if (e.name !== "AbortError") {
          console.error("Failed to load wards:", e);
          toast.error("Failed to load wards");
        }
      });

    return () => ac.abort();
  }, [formData.provinceId, prevProvinceId]);

  // Update form helper
  const updateFormData = useCallback((updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Handle input changes
  const handleInputChange = useCallback(
    (field, value) => {
      if (field === "phone") setPhoneError(validatePhoneNumber(value));
      if (field === "username") setUsernameError(validateUsername(value));
      updateFormData({ [field]: value });
    },
    [updateFormData]
  );

  // Save
  const saveProfile = useCallback(
    async (e) => {
      e?.preventDefault();

      const { name, username, phone, provinceId, wardId, addressLine } = formData;
      if (!name.trim()) return toast.error("Name is required");
      if (!provinceId || !wardId) return toast.error("Please select Province and Ward");
      if (phone && phoneError) return toast.error("Please fix phone number format");
      if (username && usernameError) return toast.error("Please fix username");

      setSaving(true);
      try {
        await withAuth("/api/profile/info", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            username: (username || "").trim().toLowerCase(),
            phone: phone.trim(),
            location: { provinceId, wardId, addressLine: addressLine.trim() },
          }),
        });

        const freshUser = await withAuth("/api/profile/info");
        // ✅ Giữ lại token khi cập nhật user (lấy từ accessToken hoặc user.token)
        const token = accessToken || user?.token;
        setUser({ ...freshUser, token });
        setPhoneError("");
        setUsernameError("");
        toast.success("Profile saved successfully!");
      } catch (err) {
        if (err?.status === 409 && err?.body?.error === "PHONE_TAKEN") {
          setPhoneError(err.body.message || "Phone number already in use.");
          phoneInputRef.current?.focus();
          return;
        }
        if (err?.status === 409 && err?.body?.error === "USERNAME_TAKEN") {
          setUsernameError(err.body.message || "Username already in use.");
          usernameInputRef.current?.focus();
          return;
        }
        if (err?.status === 400 && err?.body?.error === "VALIDATION_ERROR") {
          toast.error(err.body.message || "Validation failed");
          return;
        }
        console.error("Save error:", err);
        toast.error(err?.body?.message || `Save failed (${err?.status || "ERR"})`);
      } finally {
        setSaving(false);
      }
    },
    [formData, phoneError, usernameError, withAuth, setUser, accessToken, user?.token]
  );

  // Handle avatar file selection
  const handleAvatarChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Kiểm tra kích thước file (5MB)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE) {
        toast.error("Ảnh phải nhỏ hơn 5MB");
        e.target.value = ""; // Reset input
        return;
      }

      // Kiểm tra định dạng file
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)");
        e.target.value = "";
        return;
      }

      // Preview ảnh
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload lên server
      setUploadingAvatar(true);
      try {
        const formData = new FormData();
        formData.append("avatar", file);

        // ✅ Use withAuth to include Bearer token
        await withAuth("/api/profile/upload-avatar", {
          method: "POST",
          body: formData,
          // Don't set Content-Type - browser will set it with boundary for FormData
        });
        
        // ✅ Update avatar version TRƯỚC để force reload ngay
        setAvatarVersion(Date.now());
        
        // ✅ Clear preview trước khi fetch user mới
        setAvatarPreview(null);
        
        // ✅ Cập nhật user với avatar mới ngay lập tức
        const freshUser = await withAuth("/api/profile/info");
        // ✅ Giữ lại token khi cập nhật user (lấy từ accessToken hoặc user.token)
        const token = accessToken || user?.token;
        // ✅ Force updatedAt để các component khác reload avatar
        setUser({ ...freshUser, token, updatedAt: new Date().toISOString() });
        
        toast.success("Avatar đã được cập nhật!");
      } catch (err) {
        console.error("Upload avatar error:", err);
        toast.error(err.message || "Không thể upload avatar");
        setAvatarPreview(null);
      } finally {
        setUploadingAvatar(false);
        e.target.value = ""; // Reset input
      }
    },
    [withAuth, setUser, accessToken, user?.token]
  );

  // Handle remove avatar
  const handleRemoveAvatar = useCallback(async () => {
    if (!user?.avatar) return;

    setUploadingAvatar(true);
    try {
      // ✅ Use withAuth to include Bearer token
      await withAuth("/api/profile/avatar", {
        method: "DELETE",
      });

      // ✅ Update avatar version TRƯỚC để force reload
      setAvatarVersion(Date.now());
      
      // ✅ Clear preview
      setAvatarPreview(null);
      
      // ✅ Cập nhật user ngay lập tức
      const freshUser = await withAuth("/api/profile/info");
      // ✅ Giữ lại token khi cập nhật user (lấy từ accessToken hoặc user.token)
      const token = accessToken || user?.token;
      // ✅ Force updatedAt để các component khác reload avatar
      setUser({ ...freshUser, token, updatedAt: new Date().toISOString() });
      
      toast.success("Avatar đã được xóa");
    } catch (err) {
      console.error("Remove avatar error:", err);
      toast.error(err.message || "Không thể xóa avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }, [user?.avatar, withAuth, setUser, accessToken, user?.token]);

  // 🔥 Tính avatar URL - phải đặt trước early return
  const avatarUrl = useMemo(() => {
    if (!user) return "https://i.pravatar.cc/150";
    if (user.avatar) {
      // ✅ Dùng avatarVersion để force reload khi avatar thay đổi
      return `/api/profile/avatar/${user._id}?v=${avatarVersion}`;
    }
    
    // Avatar Discord-style: chữ cái đầu + màu ngẫu nhiên
    const initial = (user.name || user.email || "?").charAt(0).toUpperCase();
    const colors = ["5865F2", "43B581", "FAA61A", "F04747", "7289DA"];
    const color = colors[initial.charCodeAt(0) % colors.length];
    return `https://ui-avatars.com/api/?name=${initial}&background=${color}&color=fff&bold=true`;
  }, [user, avatarVersion]);

  // ✅ Ưu tiên: preview (khi đang chọn ảnh) → avatar từ DB → avatar mặc định
  const currentAvatar = avatarPreview || avatarUrl;

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-5 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Your Profile</h2>
          <p className="text-sm text-gray-500 mt-1">
            Edit your information. Use the Save button at the end.
          </p>
        </div>

        <form onSubmit={saveProfile} className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 p-5 border rounded-xl bg-gray-50">
            <div className="relative">
              <img
                key={avatarVersion} 
                src={currentAvatar}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium transition-colors"
              >
                {uploadingAvatar ? "Đang tải..." : "Đổi avatar"}
              </button>
              {user?.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white text-sm font-medium transition-colors"
                >
                  Xóa avatar
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500 text-center">
              Chấp nhận file ảnh (JPEG, PNG, GIF, WEBP). Tối đa 5MB.
            </p>
          </div>

          {/* Name */}
          <FormSection title="Name">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </FormSection>

          {/* Username */}
          <FormSection title="Username">
            <input
              type="text"
              ref={usernameInputRef}
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value.toLowerCase())}
              placeholder="username (a-z, 0-9, _)"
              className={`mt-1 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none ${
                usernameError ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />
            {usernameError && <p className="mt-1 text-sm text-red-600">{usernameError}</p>}
          </FormSection>

          {/* Phone */}
          <FormSection title="Phone">
            <input
              type="text"
              ref={phoneInputRef}
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter phone number"
              className={`mt-1 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none ${
                phoneError ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />
            {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
          </FormSection>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Province *</label>
              <select
                value={formData.provinceId}
                onChange={(e) => handleInputChange("provinceId", e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="">-- Select Province --</option>
                {provinces.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Ward *</label>
              <select
                value={formData.wardId}
                onChange={(e) => handleInputChange("wardId", e.target.value)}
                disabled={!formData.provinceId || wards.length === 0}
                className="mt-1 w-full px-4 py-2 rounded-lg border disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="">-- Select Ward --</option>
                {wards.map((w) => (
                  <option key={w.id} value={String(w.id)}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address line */}
          <FormSection title="Address line (optional)">
            <input
              type="text"
              value={formData.addressLine}
              onChange={(e) => handleInputChange("addressLine", e.target.value)}
              placeholder="House number, street..."
              className="mt-1 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </FormSection>

          {/* Read-only fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <ReadOnlyField label="Email" value={user.email || ""} />
            <ReadOnlyField label="Role" value={user.role || ""} />
          </div>

          {/* Save button */}
          {formDirty && (
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving || !!phoneError || !!usernameError}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium transition-colors"
              >
                {saving ? "Saving..." : "Save profile"}
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
}

/* ========== Small components ========== */
function FormSection({ title, children }) {
  return (
    <div className="p-5 border rounded-xl">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600">{label}</label>
      <input
        type="text"
        value={value}
        disabled
        className="mt-1 w-full px-4 py-2 rounded-lg border bg-gray-100 text-gray-600"
      />
    </div>
  );
}
