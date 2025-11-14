import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, MessageCircle, ArrowLeft, Bell } from 'lucide-react';
import { useAuth } from '../../../auth/context';
import { useSocket } from '../../../context/SocketContext';
import ChatBox from './ChatBox';

const ChatPopup = ({ isOpen, onClose, userRole }) => {
  const { user, withAuth } = useAuth();
  const { socket, joinRoom, leaveRoom, on } = useSocket() || {};
  const [activeRequests, setActiveRequests] = useState([]);
  const activeRequestsRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const selectedRequestRef = useRef(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const socketListenersRef = useRef([]);

  const fetchActiveRequests = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[ChatPopup] fetchActiveRequests - auth context:', { user: user?.id, hasWithAuth: !!withAuth, userRole });
      
      // Determine user role from props or user object
      const roleToCheck = userRole || user?.role;
      const isGuide = roleToCheck === 'TourGuide';
      
      console.log('[ChatPopup] Role detection: roleToCheck=', roleToCheck, 'isGuide=', isGuide);
      
      // ✅ INCLUDE 'pending' so guide can chat about request details before accepting
      const endpoint = isGuide 
        ? '/api/guide/custom-requests?status=pending,accepted,negotiating,agreement_pending'
        : '/api/tour-requests/?status=pending,accepted,negotiating,agreement_pending';
      
      console.log('[ChatPopup] Fetching from endpoint:', endpoint, 'isGuide:', isGuide);
      
      const response = await withAuth(endpoint);
      
      console.log('[ChatPopup] API response:', response);
      
      if (response.success) {
        const requests = response.requests || response.tourRequests || [];
        
        // Normalize the data: ensure all requests have required fields from tourDetails
        const normalizedRequests = requests.map(req => {
          const tourDetails = req.tourDetails || {
            zoneName: req.itineraryId?.zoneName || req.itineraryId?.name || 'Tour',
            numberOfGuests: req.numberOfGuests || 0,
            numberOfDays: req.itineraryId?.items?.length || 0
          };
          
          return {
            ...req,
            tourDetails,
            startDate: req.preferredDates?.[0] || req.startDate,
            initialBudget: req.initialBudget,
            finalPrice: req.finalPrice
          };
        });
        
        console.log('[ChatPopup] Loaded requests:', normalizedRequests.length, 'normalized:', normalizedRequests);
        setActiveRequests(normalizedRequests);
        activeRequestsRef.current = normalizedRequests;
        
        // Fetch unread counts for each request
        const counts = {};
        for (const req of normalizedRequests) {
          try {
            const chatRes = await withAuth(`/api/chat/${req._id}/unread`);
            if (chatRes.success) {
              counts[req._id] = chatRes.unreadCount || 0;
            }
          } catch {
            console.warn('Failed to fetch unread count for', req._id);
          }
        }
        setUnreadCounts(counts);
      }
      } catch (error) {
        console.error('[ChatPopup] Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    }, [withAuth, user, userRole]);

  // Fetch active tour requests with chat
  useEffect(() => {
    if (isOpen && user) {
      console.log('[ChatPopup] isOpen & user detected, fetching requests...');
      fetchActiveRequests();
      setSelectedRequest(null); // Reset selection when opening
    } else {
      console.log('[ChatPopup] isOpen=' + isOpen + ', user=' + !!user);
    }
  }, [isOpen, user, fetchActiveRequests]);

  // Setup WebSocket listeners for realtime updates
  useEffect(() => {
    if (!isOpen || !socket || !on || !joinRoom || !user) return;

    // Join user's personal room for notifications
    const userRoom = `user-${user.id || user.sub}`;
    joinRoom(userRoom);

    // Listen for new messages across all chat rooms
    const handleNewMessage = (msg) => {
      if (!msg || !msg.tourRequestId) {
        console.warn('[ChatPopup] Received invalid message event:', msg);
        return;
      }
      
      // Check if this message is for one of our active requests
      const requestId = msg.tourRequestId.toString();
      const hasRequest = activeRequestsRef.current.some(req => req._id === requestId);

      console.log('[ChatPopup] newMessage event received:', {
        messageId: msg._id,
        requestId,
        senderRole: msg.sender?.role,
        hasMatchingRequest: hasRequest,
        content: msg.content?.substring(0, 50)
      });

      // Only count as unread for guide when sender is not guide
      if (hasRequest && msg.sender?.role !== 'guide') {
        // Increment unread count if not already in that chat
        if (!selectedRequestRef.current || selectedRequestRef.current._id !== requestId) {
          console.log('[ChatPopup] Incrementing unread count for request:', requestId);
          setUnreadCounts(prev => ({
            ...prev,
            [requestId]: (prev[requestId] || 0) + 1
          }));
          
          // Update latest message in the list
          setActiveRequests(prev => {
            const next = prev.map(req => req._id === requestId ? { ...req, latestMessage: msg.content } : req);
            activeRequestsRef.current = next;
            return next;
          });
        }
      }
    };

    const handleMessagesRead = ({ requestId, unreadCount }) => {
      if (requestId) {
        setUnreadCounts(prev => ({
          ...prev,
          [requestId]: unreadCount || 0
        }));
      }
    };

    const handleTourRequestUpdated = (doc) => {
      if (!doc || !doc._id) return;
      
      // Update the request in our list if it exists
      setActiveRequests(prev => {
        const next = prev.map(req => req._id === doc._id ? { ...req, ...doc } : req);
        activeRequestsRef.current = next;
        return next;
      });
    };

    const handleNotification = (notification) => {
      // Refresh list if notification is about a tour request
      if (notification.type === 'new_message' || notification.type === 'tour_request_update') {
        fetchActiveRequests();
      }
    };

    // Register listeners
    const offNewMessage = on('newMessage', handleNewMessage);
    const offMessagesRead = on('messagesRead', handleMessagesRead);
    const offTourRequestUpdated = on('tourRequestUpdated', handleTourRequestUpdated);
    const offNotification = on('notificationCreated', handleNotification);

    socketListenersRef.current = [
      offNewMessage,
      offMessagesRead,
      offTourRequestUpdated,
      offNotification
    ].filter(Boolean);

    return () => {
      // Cleanup all listeners
      socketListenersRef.current.forEach(off => {
        if (typeof off === 'function') off();
      });
      socketListenersRef.current = [];
      
      if (leaveRoom) leaveRoom(userRoom);
    };
  }, [isOpen, socket, on, joinRoom, leaveRoom, user, activeRequests, selectedRequest, fetchActiveRequests]);

  const handleClose = () => {
    setSelectedRequest(null);
    selectedRequestRef.current = null;
    onClose();
  };

  const handleBackToList = () => {
    setSelectedRequest(null);
    // Refresh list when going back
    fetchActiveRequests();
  };

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    selectedRequestRef.current = request;

    // Mark as read locally and server-side if endpoint exists
    setUnreadCounts(prev => ({
      ...prev,
      [request._id]: 0
    }));

    // Call backend to mark messages as read for this chat (non-blocking, with delay to ensure auth is ready)
    setTimeout(() => {
      (async () => {
        try {
          if (withAuth) {
            console.log(`[ChatPopup] Marking ${request._id} as read...`);
            await withAuth(`/api/chat/${request._id}/read`, { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({}) 
            });
            console.log(`[ChatPopup] ✅ Marked ${request._id} as read`);
          }
        } catch (e) {
          // ignore silently - UI already updated optimistically
          console.warn(`[ChatPopup] Mark as read failed for ${request._id}:`, e?.message || e);
        }
      })();
    }, 100); // Small delay to ensure auth context is fully loaded
  };

  // Calculate total unread count
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998] transition-opacity"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className="fixed bottom-24 right-8 w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl z-[9999] flex flex-col overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
          <div className="flex items-center gap-2">
            {selectedRequest && (
              <button
                onClick={handleBackToList}
                className="p-1 hover:bg-white/20 rounded-full transition-colors mr-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <MessageCircle className="w-5 h-5" />
            <h3 className="font-semibold">
              {selectedRequest ? (
                (userRole || user?.role) === 'TourGuide' 
                  ? (selectedRequest.userId?.name || 'Khách hàng')
                  : (selectedRequest.guideId?.name || 'Hướng dẫn viên')
              ) : ((userRole || user?.role) === 'TourGuide' ? 'Chat với Khách hàng' : 'Chat với Hướng dẫn viên')}
            </h3>
            {!selectedRequest && totalUnread > 0 && (
              <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">
                <Bell className="w-3 h-3" />
                {totalUnread}
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {selectedRequest ? (
          // Show chat for selected request
          <div className="flex-1 overflow-hidden">
            <ChatBox
              requestId={selectedRequest._id}
              customerName={
                (userRole || user?.role) === 'TourGuide' 
                  ? (selectedRequest.userId?.name || 'Khách hàng')
                  : (selectedRequest.guideId?.name || 'Hướng dẫn viên')
              }
              tourInfo={{
                tourName: selectedRequest.tourDetails?.zoneName || 'Tour',
                name: selectedRequest.tourDetails?.zoneName,
                location: selectedRequest.tourDetails?.zoneName,
                departureDate: selectedRequest.startDate,
                numberOfGuests: selectedRequest.tourDetails?.numberOfGuests || selectedRequest.numberOfGuests,
                duration: `${selectedRequest.tourDetails?.numberOfDays || 0} ngày`,
                totalPrice: selectedRequest.finalPrice?.amount || selectedRequest.initialBudget?.amount
              }}
            />
          </div>
        ) : (
          // Show list of requests
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : activeRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-center">Chưa có yêu cầu tour nào đang hoạt động</p>
                <p className="text-sm text-center mt-2">
                  {(userRole || user?.role) === 'TourGuide' 
                    ? 'Chấp nhận yêu cầu để bắt đầu chat với khách hàng'
                    : 'Tạo yêu cầu tour để bắt đầu chat với hướng dẫn viên'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeRequests.map((request) => {
                  const requestUnread = unreadCounts[request._id] || 0;
                  const displayName = (userRole || user?.role) === 'TourGuide' 
                    ? (request.userId?.name || 'Khách hàng')
                    : (request.guideId?.name || 'Hướng dẫn viên');
                  const tourName = request.tourDetails?.zoneName || 'Tour Request';
                  const days = request.tourDetails?.numberOfDays || 0;
                  const guests = request.tourDetails?.numberOfGuests || request.numberOfGuests || 0;
                  
                  return (
                    <button
                      key={request._id}
                      onClick={() => handleSelectRequest(request)}
                      className="w-full p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-teal-50 hover:to-cyan-50 rounded-xl border-2 border-gray-200 hover:border-teal-300 transition-all text-left group relative"
                    >
                      {requestUnread > 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-bounce shadow-lg">
                          {requestUnread}
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                            {tourName}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {displayName}
                          </p>
                        </div>
                        {requestUnread > 0 && (
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                            {requestUnread} mới
                          </span>
                        )}
                      </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                      <span className="flex items-center gap-1">
                        📅 {days} ngày
                      </span>
                      <span className="flex items-center gap-1">
                        👥 {guests} khách
                      </span>
                    </div>

                      {request.latestMessage && (
                        <div className={`mt-3 p-2 rounded-lg border ${
                          requestUnread > 0 
                            ? 'bg-teal-50 border-teal-300' 
                            : 'bg-white/80 border-gray-200'
                        }`}>
                          <p className={`text-sm truncate ${
                            requestUnread > 0 ? 'text-teal-700 font-medium' : 'text-gray-700'
                          }`}>
                            {request.latestMessage}
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer - Only show when no request selected */}
        {!selectedRequest && (
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-500">
                Click vào yêu cầu để xem chi tiết và chat
              </p>
              {socket?.connected ? (
                <div className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-400">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>Offline</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatPopup;
