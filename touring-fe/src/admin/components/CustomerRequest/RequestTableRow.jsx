import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  MapPin, 
  DollarSign,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TYPE_LABELS,
  TYPE_COLORS
} from '../../data/customerRequestData';

const RequestTableRow = ({ request, onView, onUpdateStatus }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return formatDate(dateString);
  };

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-gray-900 mb-1">
                {request.requestId}
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-2">
                {request.subject}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${TYPE_COLORS[request.type]}`}>
                  {TYPE_LABELS[request.type]}
                </span>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${PRIORITY_COLORS[request.priority]}`}>
                  {PRIORITY_LABELS[request.priority]}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{request.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-3 h-3" />
                  {request.email}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="w-3 h-3" />
                  {request.phone}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2 p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </td>

        <td className="px-6 py-4">
          {request.destination && (
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              {request.destination}
            </div>
          )}
          {request.numberOfPeople && (
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <Users className="w-4 h-4 text-gray-400" />
              {request.numberOfPeople} người
            </div>
          )}
          {request.preferredDates && request.preferredDates.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              {new Date(request.preferredDates[0]).toLocaleDateString('vi-VN')}
            </div>
          )}
          {request.budget && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <DollarSign className="w-4 h-4 text-gray-400" />
              {new Intl.NumberFormat('vi-VN').format(request.budget)} VNĐ
            </div>
          )}
        </td>

        <td className="px-6 py-4">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${STATUS_COLORS[request.status]}`}>
            {STATUS_LABELS[request.status]}
          </span>
          {request.assignedTo && (
            <div className="text-xs text-gray-500 mt-2">
              Phụ trách: <span className="font-medium">{request.assignedTo}</span>
            </div>
          )}
        </td>

        <td className="px-6 py-4">
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <Clock className="w-3 h-3" />
            {getTimeAgo(request.createdAt)}
          </div>
          {request.notes && request.notes.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <MessageSquare className="w-3 h-3" />
              {request.notes.length} ghi chú
            </div>
          )}
        </td>

        <td className="px-6 py-4">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onView(request)}
              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
            >
              Xem chi tiết
            </button>
            <button
              onClick={() => onUpdateStatus(request)}
              className="px-3 py-1.5 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
            >
              Cập nhật
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Details */}
      {isExpanded && (
        <tr className="bg-gray-50">
          <td colSpan="5" className="px-6 py-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Nội dung yêu cầu:</h4>
                <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                  {request.message}
                </p>
              </div>
              
              {request.notes && request.notes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Ghi chú xử lý:</h4>
                  <div className="space-y-2">
                    {request.notes.map((note, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">{note.content}</p>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">{note.createdBy}</span> • {formatDate(note.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default RequestTableRow;
