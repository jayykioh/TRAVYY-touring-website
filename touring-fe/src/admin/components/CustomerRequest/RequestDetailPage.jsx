import React, {useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  MapPin, 
  DollarSign,
  Clock,
  MessageSquare,
  CheckCircle,
  FileText,
  User,
  Edit
} from 'lucide-react';

// Import data từ customerRequestData
import {
  MOCK_CUSTOMER_REQUESTS,
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TYPE_LABELS
} from '../../data/customerRequestData';

const RequestDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Tìm request từ MOCK_CUSTOMER_REQUESTS dựa trên requestId
  const request = useMemo(() => {
    return MOCK_CUSTOMER_REQUESTS.find(req => req.requestId === id);
  }, [id]);

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
    navigate('/admin/customer-requests');
  };

  const handleUpdate = () => {
    navigate(`/admin/customer-requests/${id}/update`);
  };

  const handleQuickEmail = () => {
    window.location.href = `mailto:${request.email}`;
  };

  const handleQuickCall = () => {
    window.location.href = `tel:${request.phone}`;
  };

  const handleCreateQuote = () => {
    navigate(`/admin/quotes/create?requestId=${id}`);
  };

  // Danh sách việc cần làm dựa trên loại và trạng thái yêu cầu
  const getTodoList = () => {
    const todos = [];

    if (request.status === 'pending') {
      todos.push(
        { id: 1, text: 'Xác nhận đã nhận yêu cầu với khách hàng', completed: false },
        { id: 2, text: 'Phân công nhân viên phụ trách', completed: false },
        { id: 3, text: 'Đánh giá mức độ ưu tiên', completed: false }
      );
    }

    if (request.type === 'general_inquiry') {
      todos.push(
        { id: 4, text: 'Chuẩn bị tài liệu tư vấn', completed: false },
        { id: 5, text: 'Liên hệ khách hàng qua điện thoại/email', completed: false },
        { id: 6, text: 'Gửi thông tin chi tiết về tour', completed: false }
      );
    }

    if (request.type === 'booking_inquiry' || request.type === 'custom_tour') {
      todos.push(
        { id: 7, text: 'Kiểm tra tình trạng còn chỗ', completed: false },
        { id: 8, text: 'Gửi báo giá chi tiết', completed: false },
        { id: 9, text: 'Xác nhận booking và thanh toán', completed: false }
      );
    }

    if (request.type === 'complaint') {
      todos.push(
        { id: 10, text: 'Xác minh thông tin khiếu nại', completed: false },
        { id: 11, text: 'Tìm giải pháp khắc phục', completed: false },
        { id: 12, text: 'Liên hệ khách hàng để giải quyết', completed: false }
      );
    }

    if (request.destination) {
      todos.push(
        { id: 13, text: 'Chuẩn bị thông tin về điểm đến', completed: false }
      );
    }

    todos.push(
      { id: 14, text: 'Cập nhật trạng thái xử lý', completed: false },
      { id: 15, text: 'Ghi chú quá trình xử lý', completed: false }
    );

    return todos;
  };

  const todoList = getTodoList();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại danh sách
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {request.requestId}
                </h1>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${STATUS_COLORS[request.status]}`}>
                  {STATUS_LABELS[request.status]}
                </span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${PRIORITY_COLORS[request.priority]}`}>
                  {PRIORITY_LABELS[request.priority]}
                </span>
              </div>
              <h2 className="text-xl text-gray-700 mb-1">{request.subject}</h2>
              <p className="text-sm text-gray-500">
                Loại: <span className="font-medium">{TYPE_LABELS[request.type]}</span>
              </p>
            </div>
            
            <button
              onClick={handleUpdate}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <Edit className="w-5 h-5" />
              Cập nhật trạng thái
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Thông tin khách hàng</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Họ tên</p>
                    <p className="font-medium text-gray-900">{request.customerName}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href={`mailto:${request.email}`} className="font-medium text-blue-600 hover:text-blue-700">
                      {request.email}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <a href={`tel:${request.phone}`} className="font-medium text-blue-600 hover:text-blue-700">
                      {request.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Thời gian gửi</p>
                    <p className="font-medium text-gray-900">{formatDate(request.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Request Details */}
            {(request.destination || request.numberOfPeople || request.preferredDates?.length > 0 || request.budget) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Chi tiết yêu cầu</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {request.destination && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Điểm đến</p>
                        <p className="font-medium text-gray-900">{request.destination}</p>
                      </div>
                    </div>
                  )}
                  
                  {request.numberOfPeople && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Số người</p>
                        <p className="font-medium text-gray-900">{request.numberOfPeople} người</p>
                      </div>
                    </div>
                  )}
                  
                  {request.preferredDates && request.preferredDates.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Ngày dự kiến</p>
                        <p className="font-medium text-gray-900">
                          {new Date(request.preferredDates[0]).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {request.budget && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Ngân sách</p>
                        <p className="font-medium text-gray-900">
                          {new Intl.NumberFormat('vi-VN').format(request.budget)} VNĐ
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Message Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Nội dung yêu cầu</h3>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {request.message}
                </p>
              </div>
            </div>

            {/* Processing Notes */}
            {request.notes && request.notes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Ghi chú xử lý</h3>
                </div>
                
                <div className="space-y-3">
                  {request.notes.map((note, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-gray-700 mb-2">{note.content}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium">{note.createdBy}</span>
                        <span>•</span>
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Assignment Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin xử lý</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Người phụ trách</p>
                  {request.assignedTo ? (
                    <p className="font-medium text-gray-900">{request.assignedTo}</p>
                  ) : (
                    <p className="text-orange-600 font-medium">Chưa phân công</p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Cập nhật lần cuối</p>
                  <p className="font-medium text-gray-900">{formatDate(request.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Todo List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Việc cần làm</h3>
              </div>
              
              <div className="space-y-2">
                {todoList.map((todo) => (
                  <div 
                    key={todo.id} 
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {todo.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <p className={`text-sm ${todo.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                      {todo.text}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tiến độ</span>
                  <span className="font-semibold text-gray-900">
                    0/{todoList.length}
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành động nhanh</h3>
              
              <div className="space-y-2">
                <button 
                  onClick={handleQuickEmail}
                  className="w-full px-4 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center gap-3 border border-gray-200"
                >
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span>Gửi email cho khách hàng</span>
                </button>
                
                <button 
                  onClick={handleQuickCall}
                  className="w-full px-4 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center gap-3 border border-gray-200"
                >
                  <Phone className="w-5 h-5 text-green-600" />
                  <span>Gọi điện thoại</span>
                </button>
                
                <button 
                  onClick={handleCreateQuote}
                  className="w-full px-4 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center gap-3 border border-gray-200"
                >
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span>Tạo báo giá</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailPage;