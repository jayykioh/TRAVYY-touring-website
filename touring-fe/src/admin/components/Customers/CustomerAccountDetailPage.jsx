import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Lock,
  Unlock,
  Trash2,
  Send,
  Download,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Star,
  DollarSign
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MOCK_CUSTOMER_ACCOUNTS,
  formatCurrency,
  formatDate,
  formatDateTime,
  CUSTOMER_STATUS,
  STATUS_LABELS,
  STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  GENDER_LABELS,
  ACTIVITY_LABELS,
  ACTIVITY_ICONS
} from '../../data/customerAccountData';

export default function CustomerAccountDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Find customer by ID
  const customer = useMemo(() => {
    return MOCK_CUSTOMER_ACCOUNTS.find(c => c._id === id);
  }, [id]);

  if (!customer) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Không tìm thấy khách hàng</h2>
          <p className="text-gray-500 mb-4">ID: {id}</p>
          <button
            onClick={() => navigate('/admin/customers/accounts')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const handleAction = (action) => {
    switch (action) {
      case 'lock':
        if (window.confirm(`Bạn có chắc muốn khóa tài khoản ${customer.fullName}?`)) {
          alert('Đã khóa tài khoản');
        }
        break;
      case 'unlock':
        if (window.confirm(`Bạn có chắc muốn mở khóa tài khoản ${customer.fullName}?`)) {
          alert('Đã mở khóa tài khoản');
        }
        break;
      case 'delete':
        if (window.confirm(`Bạn có chắc muốn xóa tài khoản ${customer.fullName}? Hành động này không thể hoàn tác!`)) {
          alert('Đã xóa tài khoản');
          navigate('/admin/customers/accounts');
        }
        break;
      case 'email':
        alert(`Gửi email tới: ${customer.email}`);
        break;
      case 'export':
        alert('Xuất báo cáo hoạt động của khách hàng');
        break;
      default:
        break;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/customers/accounts')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết Khách hàng</h1>
            <p className="text-sm text-gray-500 mt-1">ID: {customer._id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleAction('email')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            Gửi email
          </button>
          <button
            onClick={() => handleAction('export')}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* 1️⃣ Overview Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={customer.avatar}
              alt={customer.fullName}
              className="w-32 h-32 rounded-full border-4 border-gray-100"
            />
          </div>

          {/* Basic Info */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Họ tên</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{customer.fullName}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Email</label>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-900">{customer.email}</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Số điện thoại</label>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-900">{customer.phone}</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Giới tính</label>
              <p className="text-sm text-gray-900 mt-1">{GENDER_LABELS[customer.gender]}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Ngày sinh</label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-900">{formatDate(customer.dateOfBirth)}</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Địa chỉ</label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-900">{customer.address}</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Ngày tạo tài khoản</label>
              <p className="text-sm text-gray-900 mt-1">{formatDate(customer.createdAt)}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Trạng thái</label>
              <div className="mt-1">
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[customer.status]}`}>
                  {customer.status === CUSTOMER_STATUS.ACTIVE ? '🟢' : customer.status === CUSTOMER_STATUS.BANNED ? '🔴' : '⚫'} {STATUS_LABELS[customer.status]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center p-4 bg-teal-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-5 h-5 text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-teal-600">{formatCurrency(customer.totalSpent)}</p>
            <p className="text-sm text-gray-600 mt-1">Tổng chi tiêu</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{customer.totalBookings}</p>
            <p className="text-sm text-gray-600 mt-1">Tổng tour đã đặt</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">⭐ {customer.averageRating}</p>
            <p className="text-sm text-gray-600 mt-1">Đánh giá trung bình</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {customer.bookingHistory.filter(b => b.status === 'completed').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Tour hoàn thành</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'bookings'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📅 Lịch sử đặt tour
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'requests'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              💬 Yêu cầu & Phản hồi
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'activity'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Hoạt động gần đây
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* 2️⃣ Booking History Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lịch sử đặt tour ({customer.bookingHistory.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã tour</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên tour</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày khởi hành</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đánh giá</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customer.bookingHistory.map((booking, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{booking.bookingId}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{booking.tourName}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(booking.departureDate)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-teal-600">{formatCurrency(booking.price)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${BOOKING_STATUS_COLORS[booking.status]}`}>
                            {booking.status === 'completed' ? '✅' : booking.status === 'pending' ? '⏳' : booking.status === 'cancelled' ? '❌' : '🔄'} {BOOKING_STATUS_LABELS[booking.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {booking.reviewRating ? (
                            <span className="text-yellow-600">⭐ {booking.reviewRating}</span>
                          ) : (
                            <span className="text-gray-400">Chưa đánh giá</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => alert(`Xem chi tiết booking: ${booking.bookingId}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            [Chi tiết]
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3️⃣ Requests & Feedback Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Yêu cầu & Phản hồi ({customer.requests.length})
                </h3>
              </div>
              <div className="space-y-3">
                {customer.requests.map((request, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded">
                            {request.type === 'custom_tour' ? 'Custom Tour' : 
                             request.type === 'feedback' ? 'Feedback' :
                             request.type === 'complaint' ? 'Complaint' : 
                             request.type === 'special_request' ? 'Special Request' : 'Inquiry'}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            request.status === 'completed' ? 'bg-green-100 text-green-700' :
                            request.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {request.status === 'completed' ? 'Đã xử lý' : 
                             request.status === 'in_progress' ? 'Đang xử lý' :
                             request.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 font-medium mb-1">{request.summary}</p>
                        <p className="text-xs text-gray-500">Ngày gửi: {formatDate(request.date)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {customer.requests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có yêu cầu hoặc phản hồi nào</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4️⃣ Activity Log Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Hoạt động gần đây ({customer.activityLog.length})
                </h3>
              </div>
              <div className="space-y-3">
                {customer.activityLog.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0 text-2xl">
                      {ACTIVITY_ICONS[activity.type]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{ACTIVITY_LABELS[activity.type]}</p>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDateTime(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
                {customer.activityLog.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có hoạt động nào</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5️⃣ Admin Actions Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Quản trị / Hành động</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {customer.status === CUSTOMER_STATUS.ACTIVE ? (
            <button
              onClick={() => handleAction('lock')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
            >
              <Lock className="w-5 h-5" />
              Khóa tài khoản
            </button>
          ) : customer.status === CUSTOMER_STATUS.BANNED ? (
            <button
              onClick={() => handleAction('unlock')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
            >
              <Unlock className="w-5 h-5" />
              Mở khóa tài khoản
            </button>
          ) : null}
          
          <button
            onClick={() => handleAction('delete')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            <Trash2 className="w-5 h-5" />
            Xóa tài khoản
          </button>
          
          <button
            onClick={() => handleAction('email')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
          >
            <Mail className="w-5 h-5" />
            Gửi email/thông báo
          </button>
          
          <button
            onClick={() => handleAction('export')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            Xuất báo cáo
          </button>
        </div>
      </div>
    </div>
  );
}
