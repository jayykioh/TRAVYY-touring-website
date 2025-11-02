import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MessageSquare,
  Calendar,
  FileText,
  Mail,
  Phone
} from 'lucide-react';

// Import data từ customerRequestData
import {
  MOCK_CUSTOMER_REQUESTS,
  CUSTOMER_REQUEST_STATUS,
  REQUEST_PRIORITY,
  STATUS_LABELS,
  PRIORITY_LABELS,
  TYPE_LABELS
} from '../../data/customerRequestData';

const STATUS_OPTIONS = [
  { value: CUSTOMER_REQUEST_STATUS.PENDING, label: STATUS_LABELS[CUSTOMER_REQUEST_STATUS.PENDING], color: 'yellow', icon: AlertCircle },
  { value: CUSTOMER_REQUEST_STATUS.IN_PROGRESS, label: STATUS_LABELS[CUSTOMER_REQUEST_STATUS.IN_PROGRESS], color: 'blue', icon: Clock },
  { value: CUSTOMER_REQUEST_STATUS.COMPLETED, label: STATUS_LABELS[CUSTOMER_REQUEST_STATUS.COMPLETED], color: 'green', icon: CheckCircle },
  { value: CUSTOMER_REQUEST_STATUS.CANCELLED, label: STATUS_LABELS[CUSTOMER_REQUEST_STATUS.CANCELLED], color: 'red', icon: XCircle }
];

const PRIORITY_OPTIONS = [
  { value: REQUEST_PRIORITY.LOW, label: PRIORITY_LABELS[REQUEST_PRIORITY.LOW] },
  { value: REQUEST_PRIORITY.MEDIUM, label: PRIORITY_LABELS[REQUEST_PRIORITY.MEDIUM] },
  { value: REQUEST_PRIORITY.HIGH, label: PRIORITY_LABELS[REQUEST_PRIORITY.HIGH] },
  { value: REQUEST_PRIORITY.URGENT, label: PRIORITY_LABELS[REQUEST_PRIORITY.URGENT] }
];

const RequestUpdatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Tìm request từ MOCK_CUSTOMER_REQUESTS dựa trên requestId
  const request = useMemo(() => {
    return MOCK_CUSTOMER_REQUESTS.find(req => req.requestId === id);
  }, [id]);

  const [formData, setFormData] = useState({
    status: request?.status || 'pending',
    priority: request?.priority || 'low',
    assignedTo: request?.assignedTo || '',
    note: '',
    sendNotification: true
  });
  const [saving, setSaving] = useState(false);

  // Nếu không tìm thấy request
  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy yêu cầu</h2>
          <p className="text-gray-600 mb-4">Yêu cầu với ID "{id}" không tồn tại</p>
          <button
            onClick={() => navigate('/admin/customer-requests')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBack = () => {
    if (confirm('Bạn có chắc muốn quay lại? Các thay đổi chưa lưu sẽ bị mất.')) {
      navigate('/admin/customer-requests');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.note.trim()) {
      alert('Vui lòng nhập ghi chú cập nhật');
      return;
    }

    setSaving(true);

    // Simulate API call
    setTimeout(() => {
      const newHistoryEntry = {
        action: 'updated',
        status: formData.status,
        priority: formData.priority,
        assignedTo: formData.assignedTo,
        note: formData.note,
        createdBy: 'Admin',
        createdAt: new Date().toISOString()
      };

      console.log('Cập nhật yêu cầu:', {
        requestId: request.requestId,
        updates: formData,
        history: newHistoryEntry
      });

      setSaving(false);
      alert('Đã cập nhật yêu cầu thành công!');
      
      setFormData(prev => ({
        ...prev,
        note: ''
      }));

      navigate(`/admin/customer-requests/${request.requestId}`);
    }, 1000);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      in_progress: 'blue',
      completed: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Cập nhật yêu cầu {request.requestId}
              </h1>
              <p className="text-gray-600">
                Khách hàng: <span className="font-medium text-gray-900">{request.customerName}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Update Form - Left Side */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin cập nhật</h2>

              <div className="space-y-6">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {STATUS_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const isSelected = formData.status === option.value;
                      const colorClasses = {
                        yellow: {
                          border: 'border-yellow-500',
                          bg: 'bg-yellow-50',
                          text: 'text-yellow-600',
                          textDark: 'text-yellow-900'
                        },
                        blue: {
                          border: 'border-blue-500',
                          bg: 'bg-blue-50',
                          text: 'text-blue-600',
                          textDark: 'text-blue-900'
                        },
                        green: {
                          border: 'border-green-500',
                          bg: 'bg-green-50',
                          text: 'text-green-600',
                          textDark: 'text-green-900'
                        },
                        red: {
                          border: 'border-red-500',
                          bg: 'bg-red-50',
                          text: 'text-red-600',
                          textDark: 'text-red-900'
                        }
                      };
                      const colors = colorClasses[option.color];
                      
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleInputChange('status', option.value)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? `${colors.border} ${colors.bg}`
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${
                              isSelected ? colors.text : 'text-gray-400'
                            }`} />
                            <span className={`font-medium ${
                              isSelected ? colors.textDark : 'text-gray-700'
                            }`}>
                              {option.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mức độ ưu tiên <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Người phụ trách
                  </label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                    placeholder="Nhập tên người phụ trách"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú cập nhật <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => handleInputChange('note', e.target.value)}
                    placeholder="Nhập nội dung cập nhật, ghi chú cho yêu cầu này..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required
                  />
                </div>

                {/* Send Notification */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sendNotification"
                    checked={formData.sendNotification}
                    onChange={(e) => handleInputChange('sendNotification', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="sendNotification" className="text-sm text-gray-700">
                    Gửi thông báo email cho khách hàng
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? (
                      <>
                        <Clock className="w-5 h-5 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Lưu cập nhật
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Request Info - Right Side */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Thông tin khách hàng
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Tên khách hàng</p>
                  <p className="font-medium text-gray-900">{request.customerName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${request.email}`} className="text-sm text-blue-600 hover:underline">
                    {request.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${request.phone}`} className="text-sm text-blue-600 hover:underline">
                    {request.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Request Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Chi tiết yêu cầu
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Loại yêu cầu</p>
                  <p className="font-medium text-gray-900">{TYPE_LABELS[request.type]}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tiêu đề</p>
                  <p className="font-medium text-gray-900">{request.subject}</p>
                </div>
                {request.destination && (
                  <div>
                    <p className="text-sm text-gray-600">Điểm đến</p>
                    <p className="font-medium text-gray-900">{request.destination}</p>
                  </div>
                )}
                {request.numberOfPeople && (
                  <div>
                    <p className="text-sm text-gray-600">Số người</p>
                    <p className="font-medium text-gray-900">{request.numberOfPeople} người</p>
                  </div>
                )}
                {request.budget && (
                  <div>
                    <p className="text-sm text-gray-600">Ngân sách</p>
                    <p className="font-medium text-gray-900">
                      {parseInt(request.budget).toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Thời gian
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Ngày tạo</p>
                  <p className="font-medium text-gray-900">{formatDate(request.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cập nhật lần cuối</p>
                  <p className="font-medium text-gray-900">{formatDate(request.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Notes History */}
            {request.notes && request.notes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Lịch sử ghi chú
                </h3>
                <div className="space-y-3">
                  {request.notes.map((note, index) => (
                    <div key={index} className="pb-3 border-b border-gray-100 last:border-0">
                      <p className="text-sm text-gray-900 mb-1">{note.content}</p>
                      <p className="text-xs text-gray-500">
                        {note.createdBy} - {formatDate(note.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestUpdatePage;