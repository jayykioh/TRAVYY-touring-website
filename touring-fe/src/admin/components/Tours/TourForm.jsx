// components/TourForm.jsx
import React, { useState } from 'react';
import { validateTourData, formatPrice, getTodayDate } from '../../utils/tourHelpers.js';

const TourForm = ({ tour, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: tour?.title || '',
    price: tour?.price || '',
    capacity: tour?.capacity || '',
    location: tour?.location || '',
    guide: tour?.guide || '',
    duration: tour?.duration || '',
    startDate: tour?.startDate || getTodayDate()
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
   
    const validation = validateTourData(formData);
   
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
   
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên Tour *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nhập tên tour"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
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
          placeholder="Nhập địa điểm"
        />
        {errors.location && (
          <p className="text-red-500 text-sm mt-1">{errors.location}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giá *</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => handleChange('price', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
          {formData.price && !errors.price && (
            <p className="text-gray-500 text-sm mt-1">
              {formatPrice(formData.price)} VNĐ
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa *</label>
          <input
            type="number"
            value={formData.capacity}
            onChange={(e) => handleChange('capacity', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.capacity ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
          />
          {errors.capacity && (
            <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hướng dẫn viên</label>
        <input
          type="text"
          value={formData.guide}
          onChange={(e) => handleChange('guide', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập tên hướng dẫn viên"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
        <input
          type="text"
          value={formData.duration}
          onChange={(e) => handleChange('duration', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="VD: 3 ngày 2 đêm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày khởi hành *</label>
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => handleChange('startDate', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.startDate ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.startDate && (
          <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
        )}
      </div>
     
      <div className="flex gap-3 pt-4">
        <button 
          type="submit" 
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {tour ? 'Cập nhật' : 'Thêm mới'}
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

export default TourForm;