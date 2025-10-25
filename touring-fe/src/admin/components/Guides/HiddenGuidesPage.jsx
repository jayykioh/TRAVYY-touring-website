import { useState, useMemo } from 'react';
import { Eye, Search, RotateCcw, Calendar, User, AlertCircle } from 'lucide-react';
import { MOCK_HIDDEN_GUIDES } from '../../data/guideData';

const HiddenGuidesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredGuides = useMemo(() => {
    return MOCK_HIDDEN_GUIDES.filter(guide => {
      const matchesSearch = guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           guide.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           guide.agencyName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [searchTerm]);

  const paginatedGuides = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredGuides.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGuides, currentPage]);

  const totalPages = Math.ceil(filteredGuides.length / itemsPerPage);

  const handleRestore = (guide) => {
    setSelectedGuide(guide);
    setShowRestoreModal(true);
  };

  const confirmRestore = () => {
    console.log('Restoring guide:', selectedGuide);
    // Call API to restore guide
    setShowRestoreModal(false);
    setSelectedGuide(null);
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hướng Dẫn Viên Đã Ẩn</h1>
        <p className="text-gray-600">Quản lý danh sách hướng dẫn viên bị ẩn khỏi hệ thống</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng số đã ẩn</p>
              <p className="text-2xl font-bold text-gray-900">{MOCK_HIDDEN_GUIDES.length}</p>
            </div>
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Có thể khôi phục</p>
              <p className="text-2xl font-bold text-green-600">
                {MOCK_HIDDEN_GUIDES.filter(g => g.canRestore).length}
              </p>
            </div>
            <RotateCcw className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Không thể khôi phục</p>
              <p className="text-2xl font-bold text-red-600">
                {MOCK_HIDDEN_GUIDES.filter(g => !g.canRestore).length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, agency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hướng Dẫn Viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lý Do Ẩn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời Gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người Thực Hiện
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedGuides.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Eye className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500">Không tìm thấy hướng dẫn viên nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedGuides.map((guide) => (
                  <tr key={guide.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={guide.avatar}
                          alt={guide.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{guide.name}</p>
                          <p className="text-sm text-gray-500">{guide.email}</p>
                          <p className="text-sm text-gray-500">{guide.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{guide.agencyName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 max-w-xs">{guide.reason}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(guide.hiddenDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-1" />
                        {guide.hiddenBy}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {guide.canRestore ? (
                        <button
                          onClick={() => handleRestore(guide)}
                          className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Khôi phục
                        </button>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Không thể khôi phục
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredGuides.length)}
                </span>{' '}
                trong tổng số <span className="font-medium">{filteredGuides.length}</span> kết quả
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && selectedGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <RotateCcw className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold">Xác nhận khôi phục</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Bạn có chắc chắn muốn khôi phục hướng dẫn viên <strong>{selectedGuide.name}</strong> không?
              Sau khi khôi phục, họ sẽ xuất hiện trở lại trong hệ thống.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  setSelectedGuide(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmRestore}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Khôi phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HiddenGuidesPage;
