import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "../../auth/context";
import { toast } from "sonner";
import {
  Upload, X, FileText, CheckCircle, AlertCircle, MapPin, Award, Clock, Languages, Briefcase, Shield
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

  // Avatar upload state (guide-specific UI)
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());

  // Certificate upload state
  const [uploadingCert, setUploadingCert] = useState(false);
  const [certForm, setCertForm] = useState({
    name: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    file: null,
  });
  const [showCertForm, setShowCertForm] = useState(false);

  // Profile form state
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

  // Load guide profile
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await withAuth("/api/guide/profile");

      if (data.success !== false) {
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
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Không thể tải hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [withAuth]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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
        setGuide(response.guide);
        setIsEditing(false);
        await loadProfile();
      } else {
        toast.error("Không thể cập nhật hồ sơ");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Có lỗi xảy ra khi lưu hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadCertificate = async (e) => {
    e.preventDefault();
    
    if (!certForm.file) {
      toast.error("Vui lòng chọn file chứng chỉ");
      return;
    }

    if (!certForm.name || !certForm.issuer) {
      toast.error("Vui lòng điền đầy đủ thông tin chứng chỉ");
      return;
    }

    try {
      setUploadingCert(true);
      const formDataToSend = new FormData();
      formDataToSend.append("certificate", certForm.file);
      formDataToSend.append("name", certForm.name);
      formDataToSend.append("issuer", certForm.issuer);
      if (certForm.issueDate) formDataToSend.append("issueDate", certForm.issueDate);
      if (certForm.expiryDate) formDataToSend.append("expiryDate", certForm.expiryDate);

      const response = await withAuth("/api/guide/certificate", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.success) {
        toast.success("Tải lên chứng chỉ thành công!");
        setCertForm({ name: "", issuer: "", issueDate: "", expiryDate: "", file: null });
        setShowCertForm(false);
        await loadProfile();
      } else {
        toast.error(response.message || "Không thể tải lên chứng chỉ");
      }
    } catch (error) {
      console.error("Error uploading certificate:", error);
      toast.error("Có lỗi xảy ra khi tải lên chứng chỉ");
    } finally {
      setUploadingCert(false);
    }
  };

  const handleDeleteCertificate = async (certId) => {
    if (!confirm("Bạn có chắc muốn xóa chứng chỉ này?")) return;

    try {
      const response = await withAuth(`/api/guide/certificate/${certId}`, {
        method: "DELETE",
      });

      if (response.success) {
        toast.success("Đã xóa chứng chỉ");
        await loadProfile();
      } else {
        toast.error("Không thể xóa chứng chỉ");
      }
    } catch (error) {
      console.error("Error deleting certificate:", error);
      toast.error("Có lỗi xảy ra khi xóa chứng chỉ");
    }
  };

  // Handle avatar change (reuse profile endpoints)
  const handleAvatarChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE) {
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
        toast.error("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)");
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

        // Force refresh and update
        setAvatarVersion(Date.now());
        setAvatarPreview(null);
        await loadProfile();
        toast.success("Avatar đã được cập nhật!");
      } catch (err) {
        console.error("Upload avatar error:", err);
        toast.error(err?.message || "Không thể upload avatar");
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
    if (!confirm("Bạn có chắc muốn xóa avatar?")) return;
    setUploadingAvatar(true);
    try {
      await withAuth("/api/profile/avatar", { method: "DELETE" });
      setAvatarVersion(Date.now());
      setAvatarPreview(null);
      await loadProfile();
      toast.success("Avatar đã được xóa");
    } catch (err) {
      console.error("Remove avatar error:", err);
      toast.error(err?.message || "Không thể xóa avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }, [withAuth, guide, loadProfile]);

  const addToArray = (field, value) => {
    if (value && !formData[field].includes(value)) {
      setFormData({ ...formData, [field]: [...formData[field], value] });
    }
  };

  const removeFromArray = (field, value) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((item) => item !== value),
    });
  };

  // Compute avatar source (preview -> uploaded avatar -> placeholder)
  const avatarSrc = useMemo(() => {
    if (avatarPreview) return avatarPreview;
    if (guide?.avatar) return `/api/profile/avatar/${guide._id}?v=${avatarVersion}`;
    return "https://i.pravatar.cc/150";
  }, [guide, avatarPreview, avatarVersion]);

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

  // Compute avatar source (preview -> uploaded avatar -> placeholder)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hồ sơ Hướng dẫn viên</h1>
        <p className="text-gray-500">Quản lý thông tin và chứng chỉ của bạn</p>
      </div>

      {/* Avatar Card */}
      <Card className="mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={avatarSrc}
              alt={guide.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{guide.name}</h3>
            <p className="text-sm text-gray-500">{guide.email}</p>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium transition-colors"
              >
                {uploadingAvatar ? "Đang tải..." : "Đổi avatar"}
              </button>

              {guide?.avatar && (
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
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </Card>

      {/* Profile Completion Status */}
      {!guide.profileComplete && profileCompletionPercentage < 100 && (
        <Card className="mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-orange-100 rounded-full flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2 text-lg">
                Hoàn thiện hồ sơ để nhận yêu cầu tour
              </h3>
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-orange-700 font-medium">Tiến độ hoàn thiện</span>
                  <span className="font-bold text-orange-900 text-lg">
                    {profileCompletionPercentage}%
                  </span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500 ease-out shadow-md"
                    style={{ width: `${profileCompletionPercentage}%` }}
                  ></div>
                </div>
              </div>
              <ul className="text-sm text-orange-800 space-y-2 bg-white bg-opacity-50 rounded-lg p-3">
                {!guide.bio && <li className="flex items-center gap-2"><span className="text-orange-600">•</span> Thêm giới thiệu bản thân</li>}
                {!guide.licenseNumber && <li className="flex items-center gap-2"><span className="text-orange-600">•</span> Nhập số giấy phép hướng dẫn</li>}
                {!guide.languages?.length && <li className="flex items-center gap-2"><span className="text-orange-600">•</span> Thêm ngôn ngữ</li>}
                {!guide.specialties?.length && <li className="flex items-center gap-2"><span className="text-orange-600">•</span> Thêm chuyên môn</li>}
                {!guide.coverageAreas?.length && <li className="flex items-center gap-2"><span className="text-orange-600">•</span> Thêm khu vực hoạt động</li>}
                {!guide.certifications?.length && <li className="flex items-center gap-2"><span className="text-orange-600">•</span> Upload ít nhất 1 chứng chỉ</li>}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Verification Status */}
      {guide.verificationStatus && (
        <Card className={`mb-6 border-l-4 ${
          guide.verificationStatus === "approved" 
            ? "bg-green-50 border-green-500" 
            : guide.verificationStatus === "pending"
            ? "bg-yellow-50 border-yellow-500"
            : guide.verificationStatus === "rejected"
            ? "bg-red-50 border-red-500"
            : "bg-gray-50 border-gray-500"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                guide.verificationStatus === "approved" 
                  ? "bg-green-100" 
                  : guide.verificationStatus === "pending"
                  ? "bg-yellow-100"
                  : guide.verificationStatus === "rejected"
                  ? "bg-red-100"
                  : "bg-gray-100"
              }`}>
                <Shield className={`w-6 h-6 ${
                  guide.verificationStatus === "approved" 
                    ? "text-green-600" 
                    : guide.verificationStatus === "pending"
                    ? "text-yellow-600"
                    : guide.verificationStatus === "rejected"
                    ? "text-red-600"
                    : "text-gray-600"
                }`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Trạng thái xác thực</h3>
                <p className="text-sm text-gray-600">
                  {guide.verificationStatus === "approved" && "Hồ sơ của bạn đã được xác thực bởi quản trị viên"}
                  {guide.verificationStatus === "pending" && "Hồ sơ đang chờ quản trị viên xem xét"}
                  {guide.verificationStatus === "rejected" && "Hồ sơ cần được cập nhật thêm thông tin"}
                  {guide.verificationStatus === "incomplete" && "Vui lòng hoàn thiện hồ sơ để được xét duyệt"}
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
              className="text-sm px-4 py-2 font-semibold"
            >
              {guide.verificationStatus === "approved" && "✓ Đã xác thực"}
              {guide.verificationStatus === "pending" && "⏳ Đang chờ duyệt"}
              {guide.verificationStatus === "rejected" && "✗ Bị từ chối"}
              {guide.verificationStatus === "incomplete" && "⚠ Chưa hoàn thiện"}
            </Badge>
          </div>
        </Card>
      )}

      {/* Basic Information */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Thông tin cơ bản</h2>
          <Button
            variant={isEditing ? "success" : "outline"}
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={saving}
          >
            {saving ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên *
            </label>
            {isEditing ? (
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            ) : (
              <p className="text-gray-900">{guide.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại *
            </label>
            {isEditing ? (
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            ) : (
              <p className="text-gray-900">{guide.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa điểm chính *
            </label>
            {isEditing ? (
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ví dụ: Đà Lạt, Lâm Đồng"
              />
            ) : (
              <p className="text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {guide.location || "Chưa cập nhật"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số giấy phép HDV *
            </label>
            {isEditing ? (
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={formData.licenseNumber}
                onChange={(e) =>
                  setFormData({ ...formData, licenseNumber: e.target.value })
                }
                placeholder="Ví dụ: HDV-123456"
              />
            ) : (
              <p className="text-gray-900 flex items-center gap-2">
                <Award className="w-4 h-4" />
                {guide.licenseNumber || "Chưa cập nhật"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kinh nghiệm
            </label>
            {isEditing ? (
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={formData.experience}
                onChange={(e) =>
                  setFormData({ ...formData, experience: e.target.value })
                }
                placeholder="Ví dụ: 5 năm"
              />
            ) : (
              <p className="text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {guide.experience || "Chưa cập nhật"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái hoạt động
            </label>
            {isEditing ? (
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={formData.availability}
                onChange={(e) =>
                  setFormData({ ...formData, availability: e.target.value })
                }
              >
                <option value="Available">Sẵn sàng</option>
                <option value="Busy">Bận</option>
                <option value="Offline">Offline</option>
              </select>
            ) : (
              <Badge
                variant={
                  guide.availability === "Available" ? "success" : "default"
                }
              >
                {guide.availability === "Available" ? "Sẵn sàng" : guide.availability}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giới thiệu *
          </label>
          {isEditing ? (
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Giới thiệu về bản thân và kinh nghiệm làm hướng dẫn viên..."
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {guide.bio || "Chưa có giới thiệu"}
            </p>
          )}
        </div>
      </Card>

      {/* Languages, Specialties, Coverage Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* Languages */}
        <Card>
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
            {(isEditing ? formData.languages : guide.languages || []).map((lang, idx) => (
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
            {(!guide.languages || guide.languages.length === 0) && !isEditing && (
              <p className="text-gray-500 text-sm">Chưa thêm ngôn ngữ</p>
            )}
          </div>
        </Card>

        {/* Specialties */}
        <Card>
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
            {(isEditing ? formData.specialties : guide.specialties || []).map(
              (spec, idx) => (
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
              )
            )}
            {(!guide.specialties || guide.specialties.length === 0) && !isEditing && (
              <p className="text-gray-500 text-sm">Chưa thêm chuyên môn</p>
            )}
          </div>
        </Card>

        {/* Coverage Areas */}
        <Card className="md:col-span-2">
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
            {(isEditing ? formData.coverageAreas : guide.coverageAreas || []).map(
              (area, idx) => (
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
              )
            )}
            {(!guide.coverageAreas || guide.coverageAreas.length === 0) && !isEditing && (
              <p className="text-gray-500 text-sm">Chưa thêm khu vực hoạt động</p>
            )}
          </div>
        </Card>
      </div>

      {/* Certifications */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Chứng chỉ *
          </h2>
          <Button
            variant="primary"
            onClick={() => setShowCertForm(!showCertForm)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Thêm chứng chỉ
          </Button>
        </div>

        {/* Certificate Upload Form */}
        {showCertForm && (
          <form onSubmit={handleUploadCertificate} className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên chứng chỉ *
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={certForm.name}
                  onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                  placeholder="Ví dụ: Giấy phép Hướng dẫn viên Du lịch"
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
                  placeholder="Ví dụ: Bộ Văn hóa, Thể thao và Du lịch"
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
                    setCertForm({ ...certForm, issueDate: e.target.value })
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
                    setCertForm({ ...certForm, expiryDate: e.target.value })
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
                  setCertForm({ ...certForm, file: e.target.files[0] })
                }
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" disabled={uploadingCert}>
                {uploadingCert ? "Đang tải lên..." : "Tải lên"}
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
              >
                Hủy
              </Button>
            </div>
          </form>
        )}

        {/* Certificate List */}
        <div className="space-y-4">
          {guide.certifications && guide.certifications.length > 0 ? (
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
                      <h4 className="font-semibold text-gray-900 mb-1">{cert.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Cơ quan cấp: {cert.issuer}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        {cert.issueDate && (
                          <span>Cấp: {new Date(cert.issueDate).toLocaleDateString("vi-VN")}</span>
                        )}
                        {cert.expiryDate && (
                          <span>Hết hạn: {new Date(cert.expiryDate).toLocaleDateString("vi-VN")}</span>
                        )}
                      </div>
                      {cert.verified ? (
                        <Badge variant="success" size="sm" className="mt-2">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Đã xác thực
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm" className="mt-2">
                          <Clock className="w-3 h-3 mr-1" />
                          Chờ xác thực
                        </Badge>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCertificate(cert._id)}
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
              <p className="text-sm mt-1">Thêm chứng chỉ để hoàn thiện hồ sơ</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default GuideProfilePage;
