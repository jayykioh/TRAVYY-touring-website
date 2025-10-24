import { useState, useMemo } from 'react';
import { Search, Lock, Unlock, Key, Trash2, Shield, LogIn, Calendar } from 'lucide-react';
import { 
  MOCK_GUIDE_ACCOUNTS, 
  ACCOUNT_STATUS_LABELS, 
  ACCOUNT_STATUS_COLORS,
  GUIDE_ROLES 
} from '../../data/guideData';

const GuideAccountsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredAccounts = useMemo(() => {
    return MOCK_GUIDE_ACCOUNTS.filter(account => {
      const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           account.username.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || 
                         account.role.toLowerCase().replace(' ', '-') === roleFilter;
      
      const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchTerm, roleFilter, statusFilter]);

  const paginatedAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAccounts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAccounts, currentPage]);

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  const handleAction = (account, action) => {
    setSelectedAccount(account);
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmAction = () => {
    console.log(`${actionType} for account:`, selectedAccount);
    // Call API based on actionType
    setShowActionModal(false);
    setSelectedAccount(null);
    setActionType('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    });
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

  const getActionConfig = () => {
    const configs = {
      reset: {
        title: 'Đặt lại mật khẩu',
        icon: <Key className="w-6 h-6 text-blue-600" />,
        message: 'Mật khẩu mới sẽ được gửi qua email.',
        buttonText: 'Đặt lại',
        buttonClass: 'bg-blue-600 hover:bg-blue-700'
      },
      lock: {
        title: 'Khóa tài khoản',
        icon: <Lock className="w-6 h-6 text-red-600" />,
        message: 'Tài khoản sẽ không thể đăng nhập.',
        buttonText: 'Khóa',
        buttonClass: 'bg-red-600 hover:bg-red-700'
      },
      unlock: {
        title: 'Mở khóa tài khoản',
        icon: <Unlock className="w-6 h-6 text-green-600" />,
        message: 'Tài khoản sẽ được phép đăng nhập trở lại.',
        buttonText: 'Mở khóa',
        buttonClass: 'bg-green-600 hover:bg-green-700'
      },
      delete: {
        title: 'Xóa tài khoản',
        icon: <Trash2 className="w-6 h-6 text-red-600" />,
        message: 'Hành động này không thể hoàn tác!',
        buttonText: 'Xóa',
        buttonClass: 'bg-red-600 hover:bg-red-700'
      }
    };
    return configs[actionType] || configs.reset;
  };

  const stats = {
    total: MOCK_GUIDE_ACCOUNTS.length,
    active: MOCK_GUIDE_ACCOUNTS.filter(a => a.status === 'active').length,
    locked: MOCK_GUIDE_ACCOUNTS.filter(a => a.status === 'locked').length,
    inactive: MOCK_GUIDE_ACCOUNTS.filter(a => a.status === 'inactive').length
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tài Khoản Hướng Dẫn Viên</h1>
        <p className="text-gray-600">Quản lý tài khoản, quyền hạn và truy cập của hướng dẫn viên</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng tài khoản</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Shield className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hoạt động</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <Unlock className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã khóa</p>
              <p className="text-2xl font-bold text-red-600">{stats.locked}</p>
            </div>
            <Lock className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Không hoạt động</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            </div>
            <LogIn className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {GUIDE_ROLES.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="locked">Đã khóa</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tài Khoản
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai Trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng Thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lần Đăng Nhập Cuối
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số Lần Đăng Nhập
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày Tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAccounts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Shield className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500">Không tìm thấy tài khoản nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={account.avatar}
                          alt={account.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{account.name}</p>
                          <p className="text-sm text-gray-500">{account.email}</p>
                          <p className="text-xs text-gray-400">@{account.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Shield className="w-3 h-3 mr-1" />
                        {account.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ACCOUNT_STATUS_COLORS[account.status]}`}>
                        {ACCOUNT_STATUS_LABELS[account.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <LogIn className="w-4 h-4 mr-1" />
                        {formatDateTime(account.lastLogin)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 font-medium">{account.loginCount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(account.createdDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {account.canResetPassword && (
                          <button
                            onClick={() => handleAction(account, 'reset')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Đặt lại mật khẩu"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                        )}
                        {account.canLock && (
                          <>
                            {account.status === 'locked' ? (
                              <button
                                onClick={() => handleAction(account, 'unlock')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                title="Mở khóa"
                              >
                                <Unlock className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction(account, 'lock')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Khóa tài khoản"
                              >
                                <Lock className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                        {account.canDelete && (
                          <button
                            onClick={() => handleAction(account, 'delete')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
                  {Math.min(currentPage * itemsPerPage, filteredAccounts.length)}
                </span>{' '}
                trong tổng số <span className="font-medium">{filteredAccounts.length}</span> kết quả
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

      {/* Action Confirmation Modal */}
      {showActionModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              {getActionConfig().icon}
              <h3 className="text-lg font-semibold ml-2">{getActionConfig().title}</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Bạn có chắc chắn muốn {getActionConfig().title.toLowerCase()} cho <strong>{selectedAccount.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-4">{getActionConfig().message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedAccount(null);
                  setActionType('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 text-white rounded-lg ${getActionConfig().buttonClass}`}
              >
                {getActionConfig().buttonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideAccountsPage;
