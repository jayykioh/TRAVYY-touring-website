import React, { useState } from 'react';
import {
  User,
  Lock,
  Bell,
  Globe,
  Shield,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
  LogOut,
  Calendar,
  MapPin,
  Chrome,
  Smartphone as Phone,
  Trash2,
  Download
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasProfileChanges, setHasProfileChanges] = useState(false);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: 'Melissa Peters',
    email: 'admin@travyy.com',
    phone: '+84 123 456 789',
    role: 'Super Admin',
    avatar: 'https://ui-avatars.com/api/?name=Melissa+Peters&background=3B82F6&color=fff'
  });

  const [initialProfileData] = useState({
    fullName: 'Melissa Peters',
    email: 'admin@travyy.com',
    phone: '+84 123 456 789',
    role: 'Super Admin',
    avatar: 'https://ui-avatars.com/api/?name=Melissa+Peters&background=3B82F6&color=fff'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newBooking: true,
    newGuide: true,
    newReview: false,
    systemUpdates: true
  });

  const [activeSessions, setActiveSessions] = useState([
    {
      id: 1,
      device: 'Chrome on macOS',
      location: 'Hà Nội, Việt Nam',
      ipAddress: '192.168.1.1',
      lastActive: '2025-10-26T14:30:00',
      isCurrent: true
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'Sài Gòn, Việt Nam',
      ipAddress: '203.162.5.120',
      lastActive: '2025-10-25T09:15:00',
      isCurrent: false
    },
    {
      id: 3,
      device: 'Chrome on Windows',
      location: 'Đà Nẵng, Việt Nam',
      ipAddress: '203.162.10.45',
      lastActive: '2025-10-24T16:20:00',
      isCurrent: false
    }
  ]);

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'security', label: 'Bảo mật', icon: Lock },
    { id: 'sessions', label: 'Phiên hoạt động', icon: Chrome },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'preferences', label: 'Tùy chỉnh', icon: Globe }
  ];

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const isLongEnough = password.length >= 8;
    return hasUpperCase && hasLowerCase && hasNumbers && isLongEnough;
  };

  const handlePasswordChange = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (!validatePassword(passwordData.newPassword)) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự, chữ hoa, chữ thường và số';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      handleSave();
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const handleLogoutSession = (sessionId) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    handleSave();
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const validateProfileData = () => {
    const newErrors = {};
    
    if (!profileData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    } else if (profileData.fullName.trim().length < 3) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 3 ký tự';
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!profileData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9+\-\s()]+$/.test(profileData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    return newErrors;
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({...prev, [field]: value}));
    const hasChanges = 
      profileData.fullName !== initialProfileData.fullName ||
      profileData.email !== initialProfileData.email ||
      profileData.phone !== initialProfileData.phone ||
      profileData.avatar !== initialProfileData.avatar;
    setHasProfileChanges(hasChanges);
  };

  const handleSaveProfile = () => {
    const newErrors = validateProfileData();
    
    if (Object.keys(newErrors).length === 0) {
      handleSave();
      setHasProfileChanges(false);
    } else {
      setErrors(newErrors);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result;
        if (typeof imageUrl === 'string') {
          handleProfileChange('avatar', imageUrl);
          setShowAvatarOptions(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    handleProfileChange('avatar', `https://ui-avatars.com/api/?name=${profileData.fullName}&background=3B82F6&color=fff`);
    setShowAvatarOptions(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản và cài đặt hệ thống</p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          <p className="text-sm text-green-800 font-medium">Đã lưu thay đổi thành công!</p>
        </div>
      )}

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
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
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
            {activeTab === 'profile' && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h2>
                  
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
                          onClick={() => setShowAvatarOptions(!showAvatarOptions)}
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
                        Họ và tên <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => handleProfileChange('fullName', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                          errors.fullName 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="Nhập họ và tên"
                      />
                      {errors.fullName && (
                        <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vai trò
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={profileData.role}
                          disabled
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Không thể thay đổi vai trò</p>
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
                          onChange={(e) => handleProfileChange('email', e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                            errors.email 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                          placeholder="admin@travyy.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => handleProfileChange('phone', e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                            errors.phone 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                          placeholder="+84 123 456 789"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
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
                      disabled={!hasProfileChanges}
                      className={`px-6 py-2 rounded-lg flex items-center text-sm font-medium transition ${
                        hasProfileChanges
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Đổi mật khẩu</h2>
                  
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu hiện tại
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.currentPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                          }`}
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-xs text-red-600 mt-1">{errors.currentPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.newPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                          }`}
                          placeholder="Nhập mật khẩu mới"
                        />
                      </div>
                      {errors.newPassword ? (
                        <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xác nhận mật khẩu mới
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                          }`}
                          placeholder="Nhập lại mật khẩu mới"
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Bảo mật nâng cao</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Xác thực hai yếu tố (2FA)</p>
                          <p className="text-xs text-gray-500">Thêm lớp bảo mật cho tài khoản</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                        className={`px-4 py-2 text-white rounded-lg text-sm font-medium ${
                          twoFAEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {twoFAEnabled ? 'Tắt' : 'Bật'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email xác thực</p>
                          <p className="text-xs text-gray-500">Gửi mã xác thực qua email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={handlePasswordChange}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Cập nhật mật khẩu
                  </button>
                </div>
              </div>
            )}

            {/* Active Sessions Tab */}
            {activeTab === 'sessions' && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Phiên hoạt động</h2>
                  <p className="text-sm text-gray-600 mb-4">Quản lý tất cả các thiết bị đã đăng nhập vào tài khoản của bạn</p>
                  
                  <div className="space-y-3">
                    {activeSessions.map((session) => (
                      <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              {session.device.includes('Chrome') || session.device.includes('Safari') ? (
                                <Chrome className="w-5 h-5 text-blue-500 mr-2" />
                              ) : (
                                <Phone className="w-5 h-5 text-green-500 mr-2" />
                              )}
                              <p className="font-medium text-gray-900">{session.device}</p>
                              {session.isCurrent && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                  Thiết bị hiện tại
                                </span>
                              )}
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                {session.location}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                Lần cuối: {formatDateTime(session.lastActive)}
                              </div>
                              <div className="text-xs text-gray-500">
                                IP: {session.ipAddress}
                              </div>
                            </div>
                          </div>
                          {!session.isCurrent && (
                            <button
                              onClick={() => handleLogoutSession(session.id)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                            >
                              <LogOut className="w-4 h-4 inline mr-1" />
                              Đăng xuất
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Bảo mật phiên</h3>
                  <button className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 font-medium">
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Đăng xuất khỏi tất cả phiên khác
                  </button>
                  <p className="text-xs text-gray-500 mt-2">Điều này sẽ đặt lại mối quan hệ tin cậy trên tất cả các thiết bị khác</p>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt thông báo</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Thông báo qua Email</p>
                        <p className="text-xs text-gray-500 mt-1">Nhận thông báo qua email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Thông báo đẩy</p>
                        <p className="text-xs text-gray-500 mt-1">Nhận thông báo trên trình duyệt</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.pushNotifications}
                          onChange={(e) => setNotificationSettings({...notificationSettings, pushNotifications: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Loại thông báo</h3>
                  
                  <div className="space-y-3">
                    {[
                      { key: 'newBooking', label: 'Đặt tour mới', desc: 'Khi có booking mới' },
                      { key: 'newGuide', label: 'Hướng dẫn viên mới', desc: 'Khi có HDV đăng ký mới' },
                      { key: 'newReview', label: 'Đánh giá mới', desc: 'Khi có đánh giá từ khách hàng' },
                      { key: 'systemUpdates', label: 'Cập nhật hệ thống', desc: 'Thông báo về bảo trì và cập nhật' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings[item.key]}
                          onChange={(e) => setNotificationSettings({...notificationSettings, [item.key]: e.target.checked})}
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
            {activeTab === 'preferences' && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Tùy chỉnh giao diện</h2>
                  
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
                        <option value="asia/ho_chi_minh">(GMT+7) Hồ Chí Minh</option>
                        <option value="asia/tokyo">(GMT+9) Tokyo</option>
                        <option value="america/new_york">(GMT-5) New York</option>
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
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Giao diện</h3>
                  
                  <div className="grid grid-cols-3 gap-4 max-w-2xl">
                    <div className="border-2 border-blue-600 rounded-lg p-4 cursor-pointer">
                      <div className="bg-white h-20 rounded mb-2"></div>
                      <p className="text-sm font-medium text-center">Sáng</p>
                    </div>
                    <div className="border-2 border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-600">
                      <div className="bg-gray-800 h-20 rounded mb-2"></div>
                      <p className="text-sm font-medium text-center">Tối</p>
                    </div>
                    <div className="border-2 border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-600">
                      <div className="bg-gradient-to-br from-white to-gray-800 h-20 rounded mb-2"></div>
                      <p className="text-sm font-medium text-center">Tự động</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-md font-semibold text-gray-900 mb-4 text-red-600">Vùng nguy hiểm</h3>
                  
                  <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-red-900 mb-1">Xóa tài khoản</h4>
                        <p className="text-xs text-red-700">Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị xóa vĩnh viễn.</p>
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
                      <h4 className="font-semibold text-gray-900 mb-3">Xác nhận xóa tài khoản</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Vui lòng xác nhận bằng cách nhập địa chỉ email của bạn:
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
    </div>
  );
}