import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Check, CheckCheck, Trash2, Mail, DollarSign, Ticket, 
  AlertCircle, MessageCircle, HandshakeIcon, XCircle, CheckCircle,
  TrendingUp, Users
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/auth/context';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  
  // Check if user is a tour guide (they have a dedicated notifications page)
  const isGuide = user?.role === 'TourGuide';

  // Memoize icon getter to avoid recreating on every render
  const getNotificationIcon = useCallback((type) => {
    switch (type) {
      case 'payment_success':
      case 'booking_success':
      case 'deposit_paid':
      case 'payment_failed':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      
      case 'new_message':
        return <MessageCircle className="w-5 h-5 text-teal-600" />;
      
      case 'register':
        return <Mail className="w-5 h-5 text-blue-600" />;
      
      case 'new_tour':
      case 'new_request':
      case 'new_tour_request':
        return <Ticket className="w-5 h-5 text-purple-600" />;
      
      case 'password_reset':
      case 'password_changed':
      case 'security_alert':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      
      case 'tour_guide_accepted':
      case 'request_accepted':
      case 'user_agreed':
      case 'guide_agreed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      
      case 'tour_guide_rejected':
      case 'request_cancelled':
      case 'cancellation':
        return <XCircle className="w-5 h-5 text-red-600" />;
      
      case 'agreement_complete':
        return <HandshakeIcon className="w-5 h-5 text-blue-600" />;
      
      case 'price_offer':
      case 'guide_price_offer':
      case 'user_price_offer':
        return <TrendingUp className="w-5 h-5 text-indigo-600" />;
      
      case 'tour_completed':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      
      case 'tour_reminder':
      case 'schedule_change':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      
      case 'review':
      case 'refund_processed':
        return <Users className="w-5 h-5 text-yellow-600" />;
      
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  }, []);

  // Memoize notification click handler
  const handleNotificationClick = useCallback(async (notification) => {
    console.log('[NotificationBell] Clicked notification:', {
      id: notification._id,
      type: notification.type,
      relatedId: notification.relatedId,
      relatedModel: notification.relatedModel,
      data: notification.data
    });

    if (notification.status !== 'read' && !notification.read) {
      await markAsRead([notification._id]);
    }
    
    // Navigate based on notification type and relatedId/relatedModel
    const type = notification.type;
    const relatedId = notification.relatedId;
    const relatedModel = notification.relatedModel;
    
    setIsOpen(false);
    
    // Message notifications -> navigate to tour request (chat is embedded in request page)
    if (type === 'new_message' && relatedId) {
      if (relatedModel === 'TourCustomRequest') {
        console.log('[NotificationBell] Navigating to tour request:', relatedId);
        navigate(`/tour-request/${relatedId}`);
      } else if (relatedModel === 'Itinerary') {
        console.log('[NotificationBell] Navigating to itinerary:', relatedId);
        navigate(`/itinerary/${relatedId}`);
      } else {
        // Generic chat - may need to update based on your chat routing
        console.log('[NotificationBell] Navigating to chat:', relatedId);
        navigate(`/chat/${relatedId}`);
      }
      return;
    }
    
    // Tour request related notifications -> navigate to request details
    if (
      ['new_request', 'new_tour_request', 'price_offer', 'guide_price_offer', 
       'user_price_offer', 'user_agreed', 'guide_agreed', 'agreement_complete',
       'request_accepted', 'request_cancelled'].includes(type) && relatedId
    ) {
      if (relatedModel === 'TourCustomRequest') {
        navigate(`/tour-request/${relatedId}`);
      } else if (relatedModel === 'Itinerary') {
        navigate(`/itinerary/${relatedId}`);
      } else {
        // Fallback
        navigate(`/tour-request/${relatedId}`);
      }
      return;
    }
    
    // Payment/Booking related -> navigate to booking history
    if (
      ['payment_success', 'booking_success', 'deposit_paid', 'tour_completed', 
       'cancellation', 'refund_processed', 'payment_failed'].includes(type)
    ) {
      // Always go to booking history for payment-related notifications
      console.log('[NotificationBell] Navigating to booking history for payment notification');
      navigate('/profile/booking-history');
      return;
    }
    
    // Guide acceptance/rejection -> navigate to tour requests
    if (['tour_guide_accepted', 'tour_guide_rejected'].includes(type)) {
      console.log('[NotificationBell] Navigating to tour requests');
      navigate('/tour-requests');
      return;
    }
    
    // Security/Password -> no navigation, just mark as read
    if (['password_reset', 'password_changed', 'security_alert'].includes(type)) {
      console.log('[NotificationBell] Security notification, no navigation');
      return;
    }
    
    // Register notification -> go to home/tours
    if (type === 'register') {
      console.log('[NotificationBell] Navigating to tours page');
      navigate('/tours');
      return;
    }
    
    // Default: if has relatedId, try to navigate based on relatedModel
    if (relatedId && relatedModel) {
      console.log('[NotificationBell] Default navigation with relatedModel:', relatedModel);
      if (relatedModel === 'TourCustomRequest') {
        navigate(`/tour-request/${relatedId}`);
      } else if (relatedModel === 'Booking') {
        navigate('/profile/booking-history');
      } else if (relatedModel === 'Tour') {
        navigate(`/tour/${relatedId}`);
      } else if (relatedModel === 'Itinerary') {
        navigate(`/itinerary/${relatedId}`);
      }
    } else if (notification.data?.bookingId) {
      console.log('[NotificationBell] Navigating to booking history via data.bookingId');
      navigate('/profile/booking-history');
    } else {
      console.log('[NotificationBell] No navigation handler for this notification');
    }
  }, [navigate, markAsRead]);

  // Memoize mark all read handler
  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  // Memoize delete handler
  const handleDelete = useCallback(async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  }, [deleteNotification]);

  // Memoize toggle dropdown handler
  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Memoize formatted notifications to avoid recalculating on every render
  const hasNotifications = useMemo(() => notifications.length > 0, [notifications.length]);
  const isLoading = useMemo(() => loading && notifications.length === 0, [loading, notifications.length]);

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:text-teal-600 transition-colors"
        aria-label="Thông báo"
        aria-expanded={isOpen}
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
            onClick={closeDropdown}
            aria-hidden="true"
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
              
              {hasNotifications && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                  aria-label="Đánh dấu tất cả đã đọc"
                >
                  <CheckCheck className="w-4 h-4" />
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              ) : !hasNotifications ? (
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
            {hasNotifications && isGuide && (
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    closeDropdown();
                    navigate('/notifications');
                  }}
                  className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium"
                  aria-label="Xem tất cả thông báo"
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
