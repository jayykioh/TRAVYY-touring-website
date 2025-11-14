import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, CheckCheck, Trash2, Mail, DollarSign, Ticket, AlertCircle, MessageCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/auth/context';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { withAuth } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment_success':
      case 'booking_success':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'new_message':
        return <MessageCircle className="w-5 h-5 text-teal-600" />;
      case 'register':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'new_tour':
        return <Ticket className="w-5 h-5 text-purple-600" />;
      case 'password_reset':
      case 'password_changed':
      case 'security_alert':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification.status !== 'read') {
      await markAsRead([notification._id]);
    }
    
    // Navigate to chat if it's a new_message notification with relatedId
    if (notification.type === 'new_message' && notification.relatedId) {
      setIsOpen(false);
      navigate(`/tour-request/${notification.relatedId}`);
    }
    // Navigate to relevant page based on notification type
    else if (notification.data?.bookingId) {
      setIsOpen(false);
      navigate('/profile/booking-history');
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-teal-600 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-gray-900">Thông báo</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-4 h-4" />
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">Chưa có thông báo nào</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                        notification.status !== 'read' ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-medium ${
                              notification.status !== 'read' ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {notification.status !== 'read' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead([notification._id]);
                                  }}
                                  className="p-1 text-gray-400 hover:text-teal-600 transition-colors"
                                  title="Đánh dấu đã đọc"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleDelete(e, notification._id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>

                          {/* Metadata */}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span>
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: vi
                              })}
                            </span>
                            
                            {notification.data?.bookingCode && (
                              <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                                Mã: {notification.data.bookingCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/notifications');
                  }}
                  className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Xem tất cả thông báo
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
