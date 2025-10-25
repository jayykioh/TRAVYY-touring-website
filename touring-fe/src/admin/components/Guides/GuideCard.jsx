// 📁 src/components/Guides/GuideCard.jsx
// ============================================
// Admin chỉ xem, đồng bộ, thống kê - không tạo dữ liệu gốc

import React, { useState } from 'react';
import {
  Eye,
  RefreshCw,
  Star,
  MapPin,
  Phone,
  Mail,
  X,
  CheckCircle,
  Loader,
  Building2
} from 'lucide-react';
import { formatPrice } from '../../utils/guideHelpers';

const GuideCard = ({ guide, onView, onSync, onStatusChange }) => {
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [reason, setReason] = useState('');
  const [showSyncPopup, setShowSyncPopup] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const statusOptions = [
    { value: 'active', label: 'Đang hoạt động', color: 'text-green-600', icon: '🟢' },
    { value: 'hidden', label: 'Tạm ẩn', color: 'text-gray-600', icon: '⚪' },
    { value: 'suspended', label: 'Bị đình chỉ', color: 'text-red-600', icon: '🔴' }
  ];

  const handleStatusClick = (currentActivityStatus) => {
    setSelectedStatus(null);
    setShowStatusPopup(true);
  };

  const handleConfirmStatusChange = () => {
    if (!selectedStatus) {
      alert('Vui lòng chọn trạng thái mới');
      return;
    }
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do chuyển đổi trạng thái');
      return;
    }
    onStatusChange(guide, selectedStatus, reason);
    setShowStatusPopup(false);
    setReason('');
    setSelectedStatus(null);
  };

  const handleCancelStatusChange = () => {
    setShowStatusPopup(false);
    setReason('');
    setSelectedStatus(null);
  };

  const handleSyncClick = () => {
    setShowSyncPopup(true);
  };

  const handleConfirmSync = async () => {
    setIsSyncing(true);
    try {
      await onSync(guide);
      setSyncSuccess(true);
      setTimeout(() => {
        setShowSyncPopup(false);
        setSyncSuccess(false);
        setIsSyncing(false);
      }, 2000);
    } catch (error) {
      setIsSyncing(false);
      alert('Đồng bộ thất bại. Vui lòng thử lại!');
    }
  };

  const handleCancelSync = () => {
    setShowSyncPopup(false);
  };

  const currentStatus = statusOptions.find(s => s.value === guide.activityStatus) || statusOptions[0];

  return (
    <>
      {/* Guide Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition">
        <div className="p-6">
          {/* Header với avatar và info */}
          <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-100">
            <img
              src={guide.avatar}
              alt={guide.name}
              className="w-20 h-20 rounded-full border-2 border-gray-200 flex-shrink-0 object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">{guide.name}</h3>
                <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200 ml-3">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1.5 text-sm font-bold text-gray-900">{guide.rating}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{guide.location}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span>Kinh nghiệm: {guide.experience}</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Building2 className="w-4 h-4 mr-2 flex-shrink-0 text-blue-600" />
                  <span className="font-medium">{guide.agencyName}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                <span>{guide.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                <span>{guide.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{guide.totalTours}</p>
                <p className="text-xs text-gray-600">Tours</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{guide.completedTours}</p>
                <p className="text-xs text-gray-600">Hoàn thành</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">₫{formatPrice(guide.revenue)}</p>
                <p className="text-xs text-gray-600">Doanh thu</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Ngôn ngữ:</p>
              <div className="flex flex-wrap gap-1">
                {guide.languages.map((lang, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Chuyên môn:</p>
              <div className="flex flex-wrap gap-1">
                {guide.specialties.map((specialty, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Trạng thái hoạt động */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">Trạng thái hoạt động:</p>
              <button
                onClick={() => handleStatusClick(guide.activityStatus)}
                className={`flex items-center px-3 py-1.5 rounded-lg border-2 transition-all text-sm font-medium ${currentStatus.color} border-current bg-opacity-10 hover:shadow-md`}
              >
                <span className="mr-1.5">{currentStatus.icon}</span>
                {currentStatus.label}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onView(guide)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                Xem chi tiết
              </button>
              
              <button 
                onClick={handleSyncClick}
                className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 text-sm flex items-center font-medium"
                title="Đồng bộ dữ liệu HDV"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Đồng bộ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Confirmation Popup */}
      {showSyncPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            {!syncSuccess ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Xác nhận đồng bộ</h3>
                  <button 
                    onClick={handleCancelSync}
                    disabled={isSyncing}
                    className="p-1 hover:bg-gray-100 rounded transition disabled:opacity-50"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <RefreshCw className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-700 mb-2">
                        Đồng bộ thông tin hướng dẫn viên <strong>{guide.name}</strong> từ dữ liệu Agency.
                      </p>
                      <p className="text-sm text-gray-600">
                        Hệ thống sẽ cập nhật thông tin mới nhất từ Agency về Admin Dashboard.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmSync}
                    disabled={isSyncing}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSyncing ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Đang đồng bộ...
                      </>
                    ) : (
                      'Xác nhận đồng bộ'
                    )}
                  </button>
                  <button
                    onClick={handleCancelSync}
                    disabled={isSyncing}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Đồng bộ thành công!</h3>
                <p className="text-sm text-gray-600">
                  Thông tin của <strong>{guide.name}</strong> đã được cập nhật.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Change Confirmation Popup */}
      {showStatusPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Xác nhận chuyển trạng thái</h3>
              <button 
                onClick={handleCancelStatusChange}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Bạn đang chuyển trạng thái của <strong>{guide.name}</strong> từ <strong className={currentStatus.color}>{currentStatus.icon} {currentStatus.label}</strong> sang:
              </p>
              <div className="space-y-2">
                {statusOptions
                  .filter(status => status.value !== guide.activityStatus)
                  .map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setSelectedStatus(status.value)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        selectedStatus === status.value
                          ? `${status.color} border-current bg-opacity-20`
                          : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-2 text-lg">{status.icon}</span>
                      <span>{status.label}</span>
                    </button>
                  ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do chuyển đổi <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do chuyển đổi trạng thái (sẽ được lưu vào lịch sử)..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lý do này sẽ được lưu vào lịch sử thay đổi trạng thái
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmStatusChange}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Xác nhận
              </button>
              <button
                onClick={handleCancelStatusChange}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GuideCard;