import { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { MOCK_SYNC_HISTORY } from '../../data/guideData';
import Pagination from '../Common/Pagination';

const SyncFromAgencyPage = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const lastSync = MOCK_SYNC_HISTORY[0];
  const totalPages = Math.ceil(MOCK_SYNC_HISTORY.length / itemsPerPage);
  const paginatedHistory = MOCK_SYNC_HISTORY.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSync = () => {
    setIsSyncing(true);
    // Simulate API call
    setTimeout(() => {
      setIsSyncing(false);
      alert('Đồng bộ thành công!');
    }, 3000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    if (status === 'success') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'failed') return <XCircle className="w-5 h-5 text-red-600" />;
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  const getStatusBadge = (status) => {
    const badges = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    const labels = {
      success: 'Thành công',
      failed: 'Thất bại',
      pending: 'Đang xử lý'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Đồng Bộ Từ Agency</h1>
        <p className="text-gray-600">Đồng bộ dữ liệu hướng dẫn viên từ các agency đối tác</p>
      </div>

      {/* Sync Control */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Đồng bộ dữ liệu</h2>
            <p className="text-sm text-gray-600">
              Lần đồng bộ cuối: {lastSync ? formatDate(lastSync.syncDate) : 'Chưa có'}
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              isSyncing
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
          </button>
        </div>

        {/* Last Sync Stats */}
        {lastSync && lastSync.status === 'success' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-xs text-gray-600">Thêm mới</p>
                <p className="text-xl font-bold text-gray-900">{lastSync.newGuides}</p>
              </div>
            </div>
            <div className="flex items-center">
              <RefreshCw className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-xs text-gray-600">Cập nhật</p>
                <p className="text-xl font-bold text-gray-900">{lastSync.updatedGuides}</p>
              </div>
            </div>
            <div className="flex items-center">
              <TrendingDown className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <p className="text-xs text-gray-600">Xóa</p>
                <p className="text-xl font-bold text-gray-900">{lastSync.deletedGuides}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-gray-500 mr-3" />
              <div>
                <p className="text-xs text-gray-600">Thời gian</p>
                <p className="text-xl font-bold text-gray-900">{lastSync.duration}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sync History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lịch Sử Đồng Bộ</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời Gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng Thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thêm Mới
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cập Nhật
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xóa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng Xử Lý
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời Lượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thực Hiện Bởi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedHistory.map((sync) => (
                <tr key={sync.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(sync.syncDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(sync.status)}
                      {getStatusBadge(sync.status)}
                    </div>
                    {sync.error && (
                      <p className="text-xs text-red-600 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {sync.error}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      {sync.newGuides > 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                          <span className="text-green-700 font-medium">{sync.newGuides}</span>
                        </>
                      ) : (
                        <>
                          <Minus className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-gray-500">0</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      {sync.updatedGuides > 0 ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-1 text-blue-500" />
                          <span className="text-blue-700 font-medium">{sync.updatedGuides}</span>
                        </>
                      ) : (
                        <>
                          <Minus className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-gray-500">0</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      {sync.deletedGuides > 0 ? (
                        <>
                          <TrendingDown className="w-4 h-4 mr-1 text-red-500" />
                          <span className="text-red-700 font-medium">{sync.deletedGuides}</span>
                        </>
                      ) : (
                        <>
                          <Minus className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-gray-500">0</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{sync.totalProcessed}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{sync.duration}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{sync.performedBy}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={MOCK_SYNC_HISTORY.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncFromAgencyPage;
