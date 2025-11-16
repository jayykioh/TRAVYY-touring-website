// src/pages/guide/GuideProfilePage.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "../../auth/context";
import { toast } from "sonner";
import {
  Upload,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  MapPin,
  Award,
  Clock,
  Languages,
  Briefcase,
  Shield,
  Camera,
  Edit3,
  Save,
} from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";

const GuideProfilePage = () => {
  const { withAuth } = useAuth();

  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Avatar states (from cuocthi)
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());

  // Certificate upload
  const [uploadingCert, setUploadingCert] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [certForm, setCertForm] = useState({
    name: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    file: null,
  });

  // Profile form
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bio: "",
    experience: "",
    languages: [],
    specialties: [],
    location: "",
    coverageAreas: [],
    licenseNumber: "",
    availability: "Available",
  });

  // Load profile
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await withAuth("/api/guide/profile");

      if (data && data.success !== false) {
        setGuide(data);
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          bio: data.bio || "",
          experience: data.experience || "",
          languages: data.languages || [],
          specialties: data.specialties || [],
          location: data.location || "",
          coverageAreas: data.coverageAreas || [],
          licenseNumber: data.licenseNumber || "",
          availability: data.availability || "Available",
        });
      }
    } catch (err) {
      console.error("Load profile error:", err);
      toast.error("Không thể tải hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [withAuth]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ---------------------------
  // SAVE PROFILE
  // ---------------------------
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await withAuth("/api/guide/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.success) {
        toast.success("Cập nhật hồ sơ thành công!");
        setIsEditing(false);
        loadProfile();
      } else {
        toast.error("Không thể cập nhật hồ sơ");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      toast.error("Có lỗi xảy ra khi lưu hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------
  // AVATAR CHANGE (cuocthi version)
  // ---------------------------
  const handleAvatarChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh phải nhỏ hơn 5MB");
        e.target.value = "";
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Chỉ chấp nhận JPEG, PNG, GIF, WEBP");
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);

      setUploadingAvatar(true);
      try {
        const fd = new FormData();
        fd.append("avatar", file);

        await withAuth("/api/profile/upload-avatar", {
          method: "POST",
          body: fd,
        });

        setAvatarVersion(Date.now());
        setAvatarPreview(null);

        await loadProfile();
        toast.success("Avatar đã được cập nhật!");
      } catch (err) {
        console.error("Upload avatar error:", err);
        toast.error("Không thể upload avatar");
        setAvatarPreview(null);
      } finally {
        setUploadingAvatar(false);
        e.target.value = "";
      }
    },
    [withAuth, loadProfile]
  );

  const handleRemoveAvatar = useCallback(async () => {
    if (!guide?.avatar) return;
    if (!window.confirm("Bạn có chắc muốn xóa avatar?")) return;

    setUploadingAvatar(true);
    try {
      await withAuth("/api/profile/avatar", { method: "DELETE" });

      setAvatarVersion(Date.now());
      setAvatarPreview(null);

      await loadProfile();
      toast.success("Avatar đã được xóa");
    } catch (err) {
      console.error("Remove avatar error:", err);
      toast.error("Không thể xóa avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }, [guide, withAuth, loadProfile]);

  // Avatar source logic
  const avatarSrc = useMemo(() => {
    if (avatarPreview) return avatarPreview;
    if (guide?.avatar)
      return `/api/profile/avatar/${guide._id}?v=${avatarVersion}`;

    return "https://i.pravatar.cc/150";
  }, [guide, avatarPreview, avatarVersion]);

  // ---------------------------
  // ARRAY HELPERS
  // ---------------------------
  const addToArray = (field, value) => {
    if (value && !formData[field].includes(value)) {
      setFormData({
        ...formData,
        [field]: [...formData[field], value],
      });
    }
  };

  const removeFromArray = (field, value) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((it) => it !== value),
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#02A0AA] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Không có dữ liệu hồ sơ.</p>
      </div>
    );
  }

  // ---------------------------
  // PROFILE COMPLETION
  // ---------------------------
  const profileCompletionPercentage = guide.profileComplete
    ? 100
    : Math.round(
        ([
          guide.name,
          guide.phone,
          guide.bio,
          guide.location,
          guide.licenseNumber,
          guide.languages?.length > 0,
          guide.specialties?.length > 0,
          guide.coverageAreas?.length > 0,
          guide.certifications?.length > 0,
        ].filter(Boolean).length /
          9) *
          100
      );

  // ---------------------------
  // RENDER UI (from guide_moi)
  // ---------------------------
  return (
    <div className="px-6 py-4 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Hồ sơ Hướng dẫn viên
        </h1>
        <p className="text-gray-500">Quản lý thông tin và chứng chỉ của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="md:col-span-1 md:sticky top-30 self-start">
          {!guide.profileComplete && (
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-2">
                    Hoàn thiện hồ sơ để nhận yêu cầu tour
                  </h3>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-orange-700">
                        Tiến độ hoàn thiện
                      </span>
                      <span className="font-semibold text-orange-900">
                        {profileCompletionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-2.5">
                      <div
                        className="bg-orange-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${profileCompletionPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Missing fields */}
                  <ul className="text-sm text-orange-800 space-y-1">
                    {!guide.bio && <li>• Thêm giới thiệu bản thân</li>}
                    {!guide.licenseNumber && (
                      <li>• Nhập số giấy phép hướng dẫn</li>
                    )}
                    {!guide.languages?.length && <li>• Thêm ngôn ngữ</li>}
                    {!guide.specialties?.length && <li>• Thêm chuyên môn</li>}
                    {!guide.coverageAreas?.length && (
                      <li>• Thêm khu vực hoạt động</li>
                    )}
                    {!guide.certifications?.length && (
                      <li>• Upload ít nhất 1 chứng chỉ</li>
                    )}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Verification block */}
          <Card className="mt-6">
            {guide.verificationStatus && (
              <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-[#02A0AA]" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Trạng thái xác thực
                      </h3>
                      <p className="text-sm text-gray-500">
                        {guide.verificationStatus === "approved" &&
                          "Hồ sơ đã được duyệt."}
                        {guide.verificationStatus === "pending" &&
                          "Hồ sơ đang chờ duyệt."}
                        {guide.verificationStatus === "rejected" &&
                          "Hồ sơ chưa được chấp nhận."}
                        {guide.verificationStatus === "incomplete" &&
                          "Hồ sơ chưa hoàn thiện."}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      guide.verificationStatus === "approved"
                        ? "success"
                        : guide.verificationStatus === "pending"
                        ? "warning"
                        : guide.verificationStatus === "rejected"
                        ? "danger"
                        : "default"
                    }
                    size="lg"
                    className="rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5"
                  >
                    {guide.verificationStatus === "approved" && (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Đã xác thực</span>
                      </>
                    )}
                    {guide.verificationStatus === "pending" && (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Đang chờ</span>
                      </>
                    )}
                    {guide.verificationStatus === "rejected" && (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Bị từ chối</span>
                      </>
                    )}
                    {guide.verificationStatus === "incomplete" && (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Chưa hoàn thiện</span>
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* MAIN RIGHT COLUMN */}
        <div className="md:col-span-2">
          <Card className="bg-white p-10">
            {/* BASIC INFO */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                <h2 className="text-3xl font-bold text-gray-900">
                  Thông tin cơ bản
                </h2>

                <div className="flex items-center gap-2">
                  {isEditing && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        loadProfile();
                      }}
                      disabled={saving}
                      className="h-8 px-3 text-xs rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      Hủy
                    </Button>
                  )}

                  <Button
                    variant="primary"
                    onClick={() => {
                      if (isEditing) handleSave();
                      else setIsEditing(true);
                    }}
                    disabled={saving}
                    className="h-8 px-3 text-xs rounded-full flex items-center"
                  >
                    {saving ? (
                      <>
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        Đang lưu...
                      </>
                    ) : isEditing ? (
                      <>
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        Lưu hồ sơ
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                        Chỉnh sửa hồ sơ
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Avatar + basic form */}
              <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-6 items-start ml-10">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={avatarSrc}
                      alt={guide.name || "Avatar"}
                      className="w-full h-full object-cover"
                    />

                    {/* Change avatar */}
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-1 right-1 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white shadow cursor-pointer hover:bg-gray-50"
                    >
                      <Camera className="w-4 h-4 text-gray-700" />
                    </label>

                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                    />
                  </div>

                  <div className="text-xl text-gray-700">
                    <p className="font-semibold text-gray-900">
                      {guide.name || "Hướng dẫn viên"}
                    </p>
                    <p className="flex items-center gap-1 text-gray-500 mt-1">
                      <MapPin className="w-4 h-4" />
                      {guide.location || "Chưa cập nhật địa điểm"}
                    </p>
                    {uploadingAvatar && (
                      <p className="text-xs text-gray-400 mt-1">
                        Đang cập nhật ảnh...
                      </p>
                    )}
                  </div>
                </div>

                {/* FORM */}
                <div className="md:col-span-1 mr-3">
                  {isEditing ? (
                    <>
                      {/* Edit Mode */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ và tên *
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại *
                          </label>
                          <input
                            type="tel"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Địa điểm chính *
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                location: e.target.value,
                              })
                            }
                            placeholder="Ví dụ: Đà Lạt, Lâm Đồng"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số giấy phép HDV *
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            value={formData.licenseNumber}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                licenseNumber: e.target.value,
                              })
                            }
                            placeholder="Ví dụ: HDV-123456"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kinh nghiệm
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            value={formData.experience}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                experience: e.target.value,
                              })
                            }
                            placeholder="Ví dụ: 5 năm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái hoạt động
                          </label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            value={formData.availability}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                availability: e.target.value,
                              })
                            }
                          >
                            <option value="Available">Sẵn sàng</option>
                            <option value="Busy">Bận</option>
                            <option value="Offline">Offline</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giới thiệu *
                          </label>
                          <textarea
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            rows={4}
                            value={formData.bio}
                            onChange={(e) =>
                              setFormData({ ...formData, bio: e.target.value })
                            }
                            placeholder="Giới thiệu về bản thân..."
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* VIEW MODE */}
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm text-gray-700">
                              Số điện thoại
                            </p>
                            <p className="text-gray-900 flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-gray-500"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M3.654 1.328a.75.75 0 011.046-.07l2.29 2.29c.33.33.447.81.298 1.244l-.806 2.414a.75.75 0 00.174.75l2.457 2.457a.75.75 0 00.75.174l2.414-.806c.434-.149.914-.032 1.244.298l2.29 2.29a.75.75 0 01-.07 1.046l-1.272.954c-.75.564-1.75.689-2.617.331-3.2-1.316-5.842-3.958-7.158-7.158-.358-.867-.233-1.867.331-2.617l.954-1.272z" />
                              </svg>
                              {guide.phone || "Chưa cập nhật"}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-700">
                              Số giấy phép HDV
                            </p>
                            <p className="text-gray-900 flex items-center gap-2">
                              <Award className="w-4 h-4 text-gray-500" />
                              {guide.licenseNumber || "Chưa cập nhật"}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-700">Kinh nghiệm</p>
                            <p className="text-gray-900 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              {guide.experience || "Chưa cập nhật"}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-700">
                              Trạng thái hoạt động
                            </p>
                            <Badge
                              variant={
                                guide.availability === "Available"
                                  ? "success"
                                  : "default"
                              }
                            >
                              {guide.availability === "Available"
                                ? "Sẵn sàng"
                                : guide.availability || "Chưa cập nhật"}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-700">Giới thiệu</p>
                          <p className="text-gray-700 leading-relaxed">
                            {guide.bio || "Chưa có giới thiệu"}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <hr className="mx-30 my-10 border-t border-gray-800" />

            {/* LANGUAGES - SPECIALTIES - COVERAGE */}
            <div className="mb-6 ml-10">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* LANGUAGES */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Languages className="w-5 h-5" />
                    Ngôn ngữ *
                  </h3>

                  {isEditing && (
                    <div className="mb-4">
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        placeholder="Nhập ngôn ngữ và nhấn Enter"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.target.value.trim()) {
                            addToArray("languages", e.target.value.trim());
                            e.target.value = "";
                          }
                        }}
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {(isEditing
                      ? formData.languages
                      : guide.languages || []
                    ).map((lang, idx) => (
                      <Badge key={idx} variant="info" size="md">
                        {lang}
                        {isEditing && (
                          <button
                            onClick={() => removeFromArray("languages", lang)}
                            className="ml-2"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {(!guide.languages || guide.languages.length === 0) &&
                      !isEditing && (
                        <p className="text-gray-500 text-sm">
                          Chưa thêm ngôn ngữ
                        </p>
                      )}
                  </div>
                </div>

                {/* SPECIALTIES */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Chuyên môn *
                  </h3>

                  {isEditing && (
                    <div className="mb-4">
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        placeholder="Nhập chuyên môn và nhấn Enter"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.target.value.trim()) {
                            addToArray("specialties", e.target.value.trim());
                            e.target.value = "";
                          }
                        }}
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {(isEditing
                      ? formData.specialties
                      : guide.specialties || []
                    ).map((spec, idx) => (
                      <Badge key={idx} variant="primary" size="md">
                        {spec}
                        {isEditing && (
                          <button
                            onClick={() => removeFromArray("specialties", spec)}
                            className="ml-2"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {(!guide.specialties || guide.specialties.length === 0) &&
                      !isEditing && (
                        <p className="text-gray-500 text-sm">
                          Chưa thêm chuyên môn
                        </p>
                      )}
                  </div>
                </div>
              </div>

              {/* COVERAGE AREAS */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Khu vực hoạt động *
              </h3>

              {isEditing && (
                <div className="mb-4">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="Nhập tỉnh/thành phố và nhấn Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        addToArray("coverageAreas", e.target.value.trim());
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {(isEditing
                  ? formData.coverageAreas
                  : guide.coverageAreas || []
                ).map((area, idx) => (
                  <Badge key={idx} variant="success" size="md">
                    {area}
                    {isEditing && (
                      <button
                        onClick={() => removeFromArray("coverageAreas", area)}
                        className="ml-2"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}

                {(!guide.coverageAreas || guide.coverageAreas.length === 0) &&
                  !isEditing && (
                    <p className="text-gray-500 text-sm">
                      Chưa thêm khu vực hoạt động
                    </p>
                  )}
              </div>
            </div>

            <hr className="mx-30 my-10 border-t border-gray-800" />

            {/* CERTIFICATIONS */}
            <div className="ml-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Chứng chỉ *
                </h2>

                <Button
                  variant="primary"
                  onClick={() => setShowCertForm(!showCertForm)}
                  className="h-8 px-3 text-xs rounded-full flex items-center"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Thêm chứng chỉ
                </Button>
              </div>

              {/* CERT FORM */}
              {showCertForm && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();

                    if (!certForm.file) {
                      toast.error("Vui lòng chọn file chứng chỉ");
                      return;
                    }

                    try {
                      setUploadingCert(true);

                      const fd = new FormData();
                      fd.append("certificate", certForm.file);
                      fd.append("name", certForm.name);
                      fd.append("issuer", certForm.issuer);
                      if (certForm.issueDate)
                        fd.append("issueDate", certForm.issueDate);
                      if (certForm.expiryDate)
                        fd.append("expiryDate", certForm.expiryDate);

                      const res = await withAuth("/api/guide/certificate", {
                        method: "POST",
                        body: fd,
                      });

                      if (res.success) {
                        toast.success("Tải lên chứng chỉ thành công!");
                        await loadProfile();

                        setCertForm({
                          name: "",
                          issuer: "",
                          issueDate: "",
                          expiryDate: "",
                          file: null,
                        });
                        setShowCertForm(false);
                      } else {
                        toast.error(
                          res.message || "Không thể tải lên chứng chỉ"
                        );
                      }
                    } catch (err) {
                      console.error("Upload cert error:", err);
                      toast.error("Có lỗi xảy ra khi tải lên");
                    } finally {
                      setUploadingCert(false);
                    }
                  }}
                  className="mb-6 bg-gray-50 p-4 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên chứng chỉ *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        value={certForm.name}
                        onChange={(e) =>
                          setCertForm({ ...certForm, name: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cơ quan cấp *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        value={certForm.issuer}
                        onChange={(e) =>
                          setCertForm({ ...certForm, issuer: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày cấp
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        value={certForm.issueDate}
                        onChange={(e) =>
                          setCertForm({
                            ...certForm,
                            issueDate: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày hết hạn
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        value={certForm.expiryDate}
                        onChange={(e) =>
                          setCertForm({
                            ...certForm,
                            expiryDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File chứng chỉ * (PDF, JPG, PNG - Max 10MB)
                    </label>
                    <input
                      type="file"
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      onChange={(e) =>
                        setCertForm({
                          ...certForm,
                          file: e.target.files[0],
                        })
                      }
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={uploadingCert}
                      className="rounded-full px-4 py-2 text-sm flex items-center"
                    >
                      {uploadingCert ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Đang tải lên...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Tải lên
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCertForm(false);
                        setCertForm({
                          name: "",
                          issuer: "",
                          issueDate: "",
                          expiryDate: "",
                          file: null,
                        });
                      }}
                      className="rounded-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200"
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              )}

              {/* CERT LIST */}
              <div className="space-y-4">
                {guide.certifications?.length ? (
                  guide.certifications.map((cert) => (
                    <div
                      key={cert._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {cert.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              Cơ quan cấp: {cert.issuer}
                            </p>

                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                              {cert.issueDate && (
                                <span>
                                  Cấp:{" "}
                                  {new Date(cert.issueDate).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </span>
                              )}
                              {cert.expiryDate && (
                                <span>
                                  Hết hạn:{" "}
                                  {new Date(cert.expiryDate).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </span>
                              )}
                            </div>

                            {cert.verified ? (
                              <Badge
                                variant="success"
                                size="sm"
                                className="mt-2"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Đã xác thực
                              </Badge>
                            ) : (
                              <Badge
                                variant="warning"
                                size="sm"
                                className="mt-2"
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                Chờ xác thực
                              </Badge>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={async () => {
                            if (!window.confirm("Xóa chứng chỉ?")) return;

                            try {
                              const res = await withAuth(
                                `/api/guide/certificate/${cert._id}`,
                                { method: "DELETE" }
                              );

                              if (res.success) {
                                toast.success("Đã xóa chứng chỉ");
                                loadProfile();
                              } else {
                                toast.error("Không thể xóa chứng chỉ");
                              }
                            } catch (err) {
                              toast.error("Lỗi khi xóa chứng chỉ");
                            }
                          }}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>Chưa có chứng chỉ nào</p>
                    <p className="text-sm mt-1">
                      Thêm chứng chỉ để hoàn thiện hồ sơ
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GuideProfilePage;
