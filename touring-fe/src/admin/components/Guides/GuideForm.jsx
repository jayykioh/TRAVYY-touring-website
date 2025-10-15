// 📁 src/components/Guides/GuideForm.jsx
// ============================================

import React, { useState } from 'react';
import { validateGuideData } from '../../utils/guideHelpers';

const GuideForm = ({ guide, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: guide?.name || '',
    email: guide?.email || '',
    phone: guide?.phone || '',
    location: guide?.location || '',
    experience: guide?.experience || '',
    languages: guide?.languages?.join(', ') || '',
    specialties: guide?.specialties?.join(', ') || ''
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
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
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
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
  );
};

export default GuideForm;
