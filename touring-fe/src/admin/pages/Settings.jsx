import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  Bell,
  Globe,
  Mail,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
  Trash2,
  Phone,
  Download,
  Loader2,
} from "lucide-react";
import * as settingsService from "../services/settingsService";
import logger from "../../utils/logger";
import { toast } from "sonner";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasProfileChanges, setHasProfileChanges] = useState(false);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Admin",
    avatar: "",
  });

  const [initialProfileData, setInitialProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Admin",
    avatar: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newBooking: true,
    newGuide: true,
    newReview: false,
    systemUpdates: true,
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Globe },
  ];

  // ✅ Fetch admin profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getAdminProfile();

        const userData = {
          fullName: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || "Admin",
          avatar: data._id ? settingsService.getAvatarUrl(data._id) : "",
        };

        setProfileData(userData);
        setInitialProfileData(userData);
        setErrors({});
      } catch (error) {
        logger.error("Failed to fetch profile:", error);
        setErrors({ general: "Cannot load account information" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = (message = "Changes saved successfully!") => {
    setSaveSuccess(message);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const isLongEnough = password.length >= 8;
    return hasUpperCase && hasLowerCase && hasNumbers && isLongEnough;
  };

  const handlePasswordChange = async () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (!validatePassword(passwordData.newPassword)) {
      newErrors.newPassword =
        "Mật khẩu phải có ít nhất 8 ký tự, chữ hoa, chữ thường và số";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setSaving(true);
        await settingsService.changePassword(
          passwordData.currentPassword,
          passwordData.newPassword
        );

        handleSave(
          "Mật khẩu đã được thay đổi thành công! Email xác nhận đã được gửi."
        );
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (error) {
        setErrors({
          general: error.message || "Đổi mật khẩu thất bại",
        });
      } finally {
        setSaving(false);
      }
    }
  };

  const validateProfileData = () => {
    const newErrors = {};

    if (!profileData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    } else if (profileData.fullName.trim().length < 3) {
      newErrors.fullName = "Họ và tên phải có ít nhất 3 ký tự";
    }

    if (!profileData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!profileData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9+\-\s()]+$/.test(profileData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    return newErrors;
  };

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    const hasChanges =
      profileData.fullName !== initialProfileData.fullName ||
      profileData.email !== initialProfileData.email ||
      profileData.phone !== initialProfileData.phone ||
      profileData.avatar !== initialProfileData.avatar;
    setHasProfileChanges(hasChanges);
  };

  const handleSaveProfile = async () => {
    const newErrors = validateProfileData();

    if (Object.keys(newErrors).length === 0) {
      try {
        setSaving(true);

        // Backend expects specific format
        const updateData = {
          name: profileData.fullName,
          phone: profileData.phone,
          // Admin không cần location, dùng default
          location: {
            provinceId: "01", // Hà Nội default
            wardId: "001",
            addressLine: "",
          },
        };

        await settingsService.updateAdminProfile(updateData);

        // Update initial data để track changes
        setInitialProfileData({ ...profileData });
        setHasProfileChanges(false);
        handleSave("Cập nhật thông tin thành công!");
      } catch (error) {
        setErrors({
          general: error.message || "Cập nhật thất bại",
        });
      } finally {
        setSaving(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setSaving(true);
        await settingsService.uploadAvatar(file);

        // Reload avatar URL
        const data = await settingsService.getAdminProfile();
        const newAvatarUrl =
          settingsService.getAvatarUrl(data._id) + `?t=${Date.now()}`;

        handleProfileChange("avatar", newAvatarUrl);
        setShowAvatarOptions(false);
        handleSave("Tải ảnh đại diện thành công!");
      } catch (error) {
        setErrors({
          general: error.message || "Tải ảnh thất bại",
        });
      } finally {
        setSaving(false);
      }
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setSaving(true);
      await settingsService.deleteAvatar();

      // Reset to default avatar
      const data = await settingsService.getAdminProfile();
      const defaultAvatar =
        settingsService.getAvatarUrl(data._id) + `?t=${Date.now()}`;

      handleProfileChange("avatar", defaultAvatar);
      setShowAvatarOptions(false);
      handleSave("Đã xóa ảnh đại diện!");
    } catch (error) {
      setErrors({
        general: error.message || "Xóa ảnh thất bại",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Quản lý thông tin tài khoản và cài đặt hệ thống
        </p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          <p className="text-sm text-green-800 font-medium">{saveSuccess}</p>
        </div>
      )}

      {/* Error Message */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          <p className="text-sm text-red-800 font-medium">{errors.general}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-600">Loading information...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg border border-gray-200 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Thông tin cá nhân
                    </h2>

                    {/* Avatar Section */}
                    <div className="flex items-center space-x-6 mb-6">
                      <img
                        src={profileData.avatar}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                      />
                      <div>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowAvatarOptions(!showAvatarOptions)
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                          >
                            Thay đổi ảnh
                          </button>
                          {showAvatarOptions && (
                            <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10">
                              <label className="block px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm rounded">
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/gif,image/webp"
                                  onChange={handleAvatarChange}
                                  className="hidden"
                                />
                                📤 Tải lên từ máy
                              </label>
                              <button
                                onClick={handleRemoveAvatar}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm rounded text-red-600"
                              >
                                🗑️ Xóa ảnh
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          JPG, PNG, GIF, WebP. Tối đa 5MB.
                        </p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) =>
                            handleProfileChange("fullName", e.target.value)
                          }
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                            errors.fullName
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-blue-500"
                          }`}
                          placeholder="Enter full name"
                        />
                        {errors.fullName && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={profileData.role}
                            disabled
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Cannot change role
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) =>
                              handleProfileChange("email", e.target.value)
                            }
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                              errors.email
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                            placeholder="admin@travyy.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) =>
                              handleProfileChange("phone", e.target.value)
                            }
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                              errors.phone
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                            placeholder="+84 123 456 789"
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    {hasProfileChanges && (
                      <p className="text-sm text-orange-600 font-medium">
                        ⚠️ Bạn có những thay đổi chưa lưu
                      </p>
                    )}
                    <div className="ml-auto flex gap-3">
                      {hasProfileChanges && (
                        <button
                          onClick={() => {
                            setProfileData(initialProfileData);
                            setHasProfileChanges(false);
                            setErrors({});
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                          Hủy
                        </button>
                      )}
                      <button
                        onClick={handleSaveProfile}
                        disabled={!hasProfileChanges || saving}
                        className={`px-6 py-2 rounded-lg flex items-center text-sm font-medium transition ${
                          hasProfileChanges && !saving
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Lưu thay đổi
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Đổi mật khẩu
                    </h2>

                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                currentPassword: e.target.value,
                              })
                            }
                            className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                              errors.currentPassword
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {errors.currentPassword && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.currentPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                              })
                            }
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                              errors.newPassword
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                            placeholder="Enter new password"
                          />
                        </div>
                        {errors.newPassword ? (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.newPassword}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">
                            Min 8 characters, include uppercase, lowercase and
                            number
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                              })
                            }
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                              errors.confirmPassword
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                            placeholder="Re-enter new password"
                          />
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={handlePasswordChange}
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Cập nhật mật khẩu
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Cài đặt thông báo
                    </h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Thông báo qua Email
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Nhận thông báo qua email
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailNotifications}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                emailNotifications: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Thông báo đẩy
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Nhận thông báo trên trình duyệt
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.pushNotifications}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                pushNotifications: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-md font-semibold text-gray-900 mb-4">
                      Loại thông báo
                    </h3>

                    <div className="space-y-3">
                      {[
                        {
                          key: "newBooking",
                          label: "New Tour Bookings",
                          desc: "When there is a new booking",
                        },
                        {
                          key: "newGuide",
                          label: "New Tour Guides",
                          desc: "When a new guide registers",
                        },
                        {
                          key: "newReview",
                          label: "New Reviews",
                          desc: "When customers leave reviews",
                        },
                        {
                          key: "systemUpdates",
                          label: "System Updates",
                          desc: "Notifications about maintenance and updates",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.label}
                            </p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings[item.key]}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                [item.key]: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Lưu cài đặt
                    </button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Tùy chỉnh giao diện
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngôn ngữ
                        </label>
                        <select className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="vi">Tiếng Việt</option>
                          <option value="en">English</option>
                          <option value="ja">日本語</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Múi giờ
                        </label>
                        <select className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="asia/ho_chi_minh">
                            (GMT+7) Hồ Chí Minh
                          </option>
                          <option value="asia/tokyo">(GMT+9) Tokyo</option>
                          <option value="america/new_york">
                            (GMT-5) New York
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Định dạng ngày
                        </label>
                        <select className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                          <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                          <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Đơn vị tiền tệ
                        </label>
                        <select className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="vnd">VNĐ (₫)</option>
                          <option value="usd">USD ($)</option>
                          <option value="eur">EUR (€)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-md font-semibold text-gray-900 mb-4">
                      Theme
                    </h3>

                    <div className="grid grid-cols-3 gap-4 max-w-2xl">
                      <div className="border-2 border-blue-600 rounded-lg p-4 cursor-pointer">
                        <div className="bg-white h-20 rounded mb-2"></div>
                        <p className="text-sm font-medium text-center">Light</p>
                      </div>
                      <div className="border-2 border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-600">
                        <div className="bg-gray-800 h-20 rounded mb-2"></div>
                        <p className="text-sm font-medium text-center">Dark</p>
                      </div>
                      <div className="border-2 border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-600">
                        <div className="bg-gradient-to-br from-white to-gray-800 h-20 rounded mb-2"></div>
                        <p className="text-sm font-medium text-center">Auto</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-md font-semibold text-gray-900 mb-4 text-red-600">
                      Vùng nguy hiểm
                    </h3>

                    <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-red-900 mb-1">
                            Xóa tài khoản
                          </h4>
                          <p className="text-xs text-red-700">
                            Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ
                            bị xóa vĩnh viễn.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium whitespace-nowrap ml-4"
                        >
                          <Trash2 className="w-4 h-4 inline mr-1" />
                          Xóa tài khoản
                        </button>
                      </div>
                    </div>

                    {showDeleteConfirm && (
                      <div className="mt-4 bg-white border-2 border-red-300 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Xác nhận xóa tài khoản
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Vui lòng xác nhận bằng cách nhập địa chỉ email của
                          bạn:
                        </p>
                        <input
                          type="email"
                          placeholder="admin@travyy.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                        />
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              handleSave();
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            Xóa tài khoản
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Lưu tùy chỉnh
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
