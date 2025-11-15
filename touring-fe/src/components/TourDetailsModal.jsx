import React, { useState } from 'react';
import { X, Calendar, Users, DollarSign, MessageSquare } from 'lucide-react';

const TourDetailsModal = ({ isOpen, onClose, onSubmit, itinerary }) => {
  const [formData, setFormData] = useState({
    preferredDate: itinerary?.preferredDate || '',
    numberOfPeople: itinerary?.numberOfPeople || 1,
    estimatedCost: itinerary?.estimatedCost || '',
    specialRequests: itinerary?.preferences?.specialRequests || ''
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Vui lòng chọn ngày khởi hành';
    } else {
      const selectedDate = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.preferredDate = 'Ngày khởi hành phải từ hôm nay trở đi';
      }
    }
    
    if (!formData.numberOfPeople || formData.numberOfPeople < 1) {
      newErrors.numberOfPeople = 'Số người phải lớn hơn 0';
    }
    
    if (formData.numberOfPeople > 50) {
      newErrors.numberOfPeople = 'Số người không được vượt quá 50';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Thông tin tour</h2>
            <p className="text-sm text-gray-600 mt-1">
              Vui lòng cung cấp thông tin để yêu cầu hướng dẫn viên
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Preferred Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 text-[#02A0AA]" />
              Ngày khởi hành <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.preferredDate}
              onChange={(e) => handleChange('preferredDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#02A0AA] focus:border-transparent transition-all ${
                errors.preferredDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.preferredDate && (
              <p className="text-red-500 text-sm mt-1">{errors.preferredDate}</p>
            )}
          </div>

          {/* Number of People */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-4 h-4 text-[#02A0AA]" />
              Số lượng người <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.numberOfPeople}
              onChange={(e) => handleChange('numberOfPeople', parseInt(e.target.value) || 1)}
              min="1"
              max="50"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#02A0AA] focus:border-transparent transition-all ${
                errors.numberOfPeople ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.numberOfPeople && (
              <p className="text-red-500 text-sm mt-1">{errors.numberOfPeople}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Tối đa 50 người
            </p>
          </div>

          {/* Estimated Cost */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 text-[#02A0AA]" />
              Ngân sách dự kiến (VND)
            </label>
            <input
              type="number"
              value={formData.estimatedCost}
              onChange={(e) => handleChange('estimatedCost', e.target.value)}
              placeholder="Ví dụ: 5000000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02A0AA] focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tùy chọn - Giúp hướng dẫn viên hiểu ngân sách của bạn
            </p>
          </div>

          {/* Special Requests */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 text-[#02A0AA]" />
              Yêu cầu đặc biệt
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => handleChange('specialRequests', e.target.value)}
              placeholder="Ví dụ: Cần xe đưa đón, ăn chay, có trẻ em..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02A0AA] focus:border-transparent resize-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tùy chọn - Mọi yêu cầu đặc biệt bạn muốn thông báo
            </p>
          </div>

          {/* Tour Summary */}
          <div className="bg-gradient-to-br from-[#02A0AA]/5 to-blue-50 rounded-xl p-4 border border-[#02A0AA]/20">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#02A0AA] rounded-full"></span>
              Tóm tắt tour
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tour:</span>
                <span className="font-medium text-gray-900">{itinerary?.name || itinerary?.zoneName}</span>
              </div>
              {itinerary?.items && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Số địa điểm:</span>
                  <span className="font-medium text-gray-900">{itinerary.items.length}</span>
                </div>
              )}
              {itinerary?.totalDuration && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-medium text-gray-900">
                    {Math.floor(itinerary.totalDuration / 60)}h{itinerary.totalDuration % 60}m
                  </span>
                </div>
              )}
              {itinerary?.totalDistance && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Khoảng cách:</span>
                  <span className="font-medium text-gray-900">
                    {itinerary.totalDistance.toFixed(1)} km
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#02A0AA] text-white rounded-lg hover:bg-[#018f95] transition-colors font-medium shadow-lg shadow-[#02A0AA]/30"
            >
              Yêu cầu hướng dẫn viên
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TourDetailsModal;
