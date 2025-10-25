// 📁 src/components/Guides/GuideFilters.jsx
// ============================================

import React, { useState } from 'react';
import { Search, RefreshCw, X, CheckCircle, Loader } from 'lucide-react';

const GuideFilters = ({ 
  searchTerm, 
  onSearchChange, 
  combinedStatusFilter, 
  onCombinedStatusChange,
  onSyncAll 
}) => {
  const [showSyncPopup, setShowSyncPopup] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const COMBINED_STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'verified-active', label: 'Đã xác minh - 🟢 Đang hoạt động' },
    { value: 'verified-hidden', label: 'Đã xác minh - ⚪ Tạm ẩn' },
    { value: 'verified-suspended', label: 'Đã xác minh - 🔴 Bị đình chỉ' },
    { value: 'pending', label: 'Chờ xác minh' },
    { value: 'rejected', label: 'Từ chối' }
  ];

  const handleSyncClick = () => {
    setShowSyncPopup(true);
  };

  const handleConfirmSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncAll();
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

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm hướng dẫn viên..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Combined Status Filter */}
        <select
          value={combinedStatusFilter}
          onChange={(e) => onCombinedStatusChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[250px]"
        >
          {COMBINED_STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Sync All Button */}
        <button 
          onClick={handleSyncClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors whitespace-nowrap"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Đồng bộ HDV
        </button>
      </div>
    </div>

      {/* Sync Confirmation Popup */}
      {showSyncPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            {!syncSuccess ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Xác nhận đồng bộ hướng dẫn viên</h3>
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
                        Tất cả hướng dẫn viên sẽ được đồng bộ từ dữ liệu của các Agency.
                      </p>
                      <p className="text-sm text-gray-600">
                        Hệ thống sẽ cập nhật thông tin mới nhất từ các Agency về Admin Dashboard.
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
                  Dữ liệu hướng dẫn viên đã được cập nhật từ các Agency.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GuideFilters;