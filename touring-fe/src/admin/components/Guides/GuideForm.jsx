// 📁 src/components/Guides/GuideForm.jsx
// ============================================

import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { validateGuideData } from '../../utils/guideHelpers';

const GuideForm = ({ guide, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: guide?.name || '',
    email: guide?.email || '',
    phone: guide?.phone || '',
    location: guide?.location || '',
    experience: guide?.experience || '',
    languages: guide?.languages?.join(', ') || '',
    specialties: guide?.specialties?.join(', ') || '',
    avatar: guide?.avatar || ''
  });
  
  const [avatarPreview, setAvatarPreview] = useState(guide?.avatar || '');
  const [errors, setErrors] = useState({});
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, avatar: 'Vui lòng chọn một tệp hình ảnh' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, avatar: 'Kích thước hình ảnh không được vượt quá 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData({ ...formData, avatar: reader.result });
        setErrors({ ...errors, avatar: '' });
        setImageLoadError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUrl = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, avatar: url });
    if (url) {
      setAvatarPreview(url);
      setImageLoadError(false);
    }
  };

  const handleImageError = () => {
    setImageLoadError(true);
  };

  const handleImageLoad = () => {
    setImageLoadError(false);
  };

  const removeAvatar = () => {
    setFormData({ ...formData, avatar: '' });
    setAvatarPreview('');
    setImageLoadError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateGuideData(formData);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    
    const submitData = {
      ...formData,
      languages: formData.languages.split(',').map(l => l.trim()).filter(l => l),
      specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s)
    };
    
    onSubmit(submitData);
  };

  return (
    <>
      {/* Overlay Background - Hiển thị nền phía sau như popup đồng bộ */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-y-auto max-h-screen">
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
              <div className="space-y-3">
                {/* Avatar Preview */}
                {avatarPreview && (
                  <div className="relative w-24 h-24">
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                      className={`w-full h-full rounded-lg object-cover border-2 ${
                        imageLoadError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {imageLoadError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg">
                        <span className="text-xs text-red-600 text-center px-1">Lỗi tải ảnh</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                {/* Upload File Input */}
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Tải ảnh lên</span>
                    </div>
                  </label>
                </div>

                {/* URL Input */}
                <input
                  type="url"
                  placeholder="hoặc nhập URL ảnh đại diện"
                  value={formData.avatar}
                  onChange={handleAvatarUrl}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
                
                {errors.avatar && (
                  <p className="text-red-500 text-sm">{errors.avatar}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên HDV *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nhập tên hướng dẫn viên"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="email@example.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0123456789"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm *</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.location ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Đà Nẵng"
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm</label>
        <input
          type="text"
          value={formData.experience}
          onChange={(e) => handleChange('experience', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="5 năm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ngôn ngữ</label>
        <input
          type="text"
          value={formData.languages}
          onChange={(e) => handleChange('languages', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Tiếng Việt, English, 中文 (phân cách bởi dấu phẩy)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên môn</label>
        <input
          type="text"
          value={formData.specialties}
          onChange={(e) => handleChange('specialties', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Văn hóa, Ẩm thực (phân cách bởi dấu phẩy)"
        />
      </div>
      
      <div className="flex gap-3 pt-4">
        <button 
          type="submit" 
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {guide ? 'Cập nhật' : 'Thêm mới'}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Hủy
        </button>
      </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default GuideForm;
