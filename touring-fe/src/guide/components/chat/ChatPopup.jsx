import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, ArrowLeft, Clock, Users } from 'lucide-react';
import { useAuth } from "../../../auth/context";
import { useSocket } from "../../../context/SocketContext";
import ChatBox from "./ChatBox";
import TravellerChatBox from "../../../components/TravellerChatBox";

const PRIMARY = "#007AFF";

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
      const roleToCheck = userRole || user?.role;
      const isGuide = roleToCheck === "TourGuide";

      const endpoint = isGuide
        ? "/api/guide/custom-requests?status=pending,accepted,negotiating,agreement_pending"
        : "/api/tour-requests/?status=pending,accepted,negotiating,agreement_pending";

      const response = await withAuth(endpoint);

      if (response.success) {
        const requests = response.requests || response.tourRequests || [];
        const normalizedRequests = requests.map((req) => {
          const tourDetails = req.tourDetails || {
            zoneName:
              req.itineraryId?.zoneName || req.itineraryId?.name || "Tour",
            numberOfGuests: req.numberOfGuests || 0,
            numberOfDays: req.itineraryId?.items?.length || 0,
          };

          return {
            ...req,
            tourDetails,
            startDate: req.preferredDates?.[0] || req.startDate,
            initialBudget: req.initialBudget,
            finalPrice: req.finalPrice,
          };
        });

        setActiveRequests(normalizedRequests);
        activeRequestsRef.current = normalizedRequests;

        const counts = {};
        for (const req of normalizedRequests) {
          try {
            const chatRes = await withAuth(`/api/chat/${req._id}/unread`);
            if (chatRes.success) counts[req._id] = chatRes.unreadCount || 0;
          } catch {
            // ignore
          }
        }
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error("[ChatPopup] Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  }, [withAuth, user, userRole]);

  useEffect(() => {
    if (isOpen && user) {
      fetchActiveRequests();
      setSelectedRequest(null);
    }
  }, [isOpen, user, fetchActiveRequests]);

  // WebSocket listeners
  useEffect(() => {
    if (!isOpen || !socket || !on || !joinRoom || !user) return;

    const userRoom = `user-${user.id || user.sub}`;
    joinRoom(userRoom);

    const handleNewMessage = (msg) => {
      if (!msg || !msg.tourRequestId) return;

      const requestId = msg.tourRequestId.toString();
      const hasRequest = activeRequestsRef.current.some(
        (req) => req._id === requestId
      );

      // Chỉ tăng unread khi người nhận là guide và chưa mở phòng đó
      if (hasRequest && msg.sender?.role !== "guide") {
        if (
          !selectedRequestRef.current ||
          selectedRequestRef.current._id !== requestId
        ) {
          setUnreadCounts((prev) => ({
            ...prev,
            [requestId]: (prev[requestId] || 0) + 1,
          }));

          setActiveRequests((prev) => {
            const next = prev.map((req) =>
              req._id === requestId
                ? { ...req, latestMessage: msg.content }
                : req
            );
            activeRequestsRef.current = next;
            return next;
          });
        }
      }
    };

    const handleMessagesRead = ({ requestId, unreadCount }) => {
      if (requestId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [requestId]: unreadCount || 0,
        }));
      }
    };

    const handleTourRequestUpdated = (doc) => {
      if (!doc || !doc._id) return;
      setActiveRequests((prev) => {
        const next = prev.map((req) =>
          req._id === doc._id ? { ...req, ...doc } : req
        );
        activeRequestsRef.current = next;
        return next;
      });
    };

    const handleNotification = (notification) => {
      if (
        notification.type === "new_message" ||
        notification.type === "tour_request_update"
      ) {
        fetchActiveRequests();
      }
    };

    const offNewMessage = on("newMessage", handleNewMessage);
    const offMessagesRead = on("messagesRead", handleMessagesRead);
    const offTourRequestUpdated = on(
      "tourRequestUpdated",
      handleTourRequestUpdated
    );
    const offNotification = on("notificationCreated", handleNotification);

    socketListenersRef.current = [
      offNewMessage,
      offMessagesRead,
      offTourRequestUpdated,
      offNotification,
    ].filter(Boolean);

    return () => {
      socketListenersRef.current.forEach((off) => {
        if (typeof off === "function") off();
      });
      socketListenersRef.current = [];
      if (leaveRoom) leaveRoom(userRoom);
    };
  }, [
    isOpen,
    socket,
    on,
    joinRoom,
    leaveRoom,
    user,
    activeRequests,
    selectedRequest,
    fetchActiveRequests,
  ]);

  const handleClose = () => {
    setSelectedRequest(null);
    selectedRequestRef.current = null;
    onClose();
  };

  const handleBackToList = () => {
    setSelectedRequest(null);
    fetchActiveRequests();
  };

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    selectedRequestRef.current = request;

    setUnreadCounts((prev) => ({
      ...prev,
      [request._id]: 0,
    }));

    setTimeout(() => {
      (async () => {
        try {
          await withAuth(`/api/chat/${request._id}/read`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
        } catch {
          // ignore
        }
      })();
    }, 100);
  };

  const totalUnread = Object.values(unreadCounts).reduce(
    (sum, c) => sum + c,
    0
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with smooth fade */}
      <div
        className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Popup - Apple style with smooth slide up animation */}
      <div className="fixed bottom-24 right-8 w-[440px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[85vh] bg-white rounded-[20px] shadow-2xl z-[9999] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
        {/* Header - Clean Apple style */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <div className="flex items-center gap-3">
            {/* Back button */}
            {selectedRequest && (
              <button
                onClick={handleBackToList}
                className="p-1.5 hover:bg-white/20 rounded-full transition-all duration-200 active:scale-95"
                aria-label="Quay lại"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            {/* Title with icon */}
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 bg-white rounded-full shadow-md" />
              <h3 className="font-semibold text-[15px] leading-tight">
                {selectedRequest
                  ? (userRole || user?.role) === "TourGuide"
                    ? selectedRequest.userId?.name || "Khách hàng"
                    : selectedRequest.guideId?.name || "Hướng dẫn viên"
                  : (userRole || user?.role) === "TourGuide"
                  ? "Chat với Khách hàng"
                  : "Chat với Hướng dẫn viên"}
              </h3>
            </div>

            {/* Unread badge */}
            {!selectedRequest && totalUnread > 0 && (
              <div className="px-2.5 py-1 bg-red-500 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 animate-in zoom-in duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {totalUnread}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-all duration-200 active:scale-95"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {selectedRequest ? (
          <div className="flex-1 overflow-hidden">
            {(userRole || user?.role) === "TourGuide" ? (
              <ChatBox
                requestId={selectedRequest._id}
                customerName={selectedRequest.userId?.name || "Khách hàng"}
                tourInfo={{
                  tourName: selectedRequest.tourDetails?.zoneName || "Tour",
                  name: selectedRequest.tourDetails?.zoneName,
                  location: selectedRequest.tourDetails?.zoneName,
                  departureDate: selectedRequest.startDate,
                  numberOfGuests:
                    selectedRequest.tourDetails?.numberOfGuests ||
                    selectedRequest.numberOfGuests,
                  duration: `${
                    selectedRequest.tourDetails?.numberOfDays || 0
                  } ngày`,
                  totalPrice:
                    selectedRequest.finalPrice?.amount ||
                    selectedRequest.initialBudget?.amount,
                  items: selectedRequest.tourDetails?.items || selectedRequest.itineraryId?.items || [],
                }}
              />
            ) : (
              <TravellerChatBox
                requestId={selectedRequest._id}
                guideName={selectedRequest.guideId?.name || "Hướng dẫn viên"}
                tourInfo={{
                  tourName: selectedRequest.tourDetails?.zoneName || "Tour",
                  name: selectedRequest.tourDetails?.zoneName,
                  location: selectedRequest.tourDetails?.zoneName,
                  departureDate: selectedRequest.startDate,
                  numberOfGuests:
                    selectedRequest.tourDetails?.numberOfGuests ||
                    selectedRequest.numberOfGuests,
                  duration: `${
                    selectedRequest.tourDetails?.numberOfDays || 0
                  } ngày`,
                  totalPrice:
                    selectedRequest.finalPrice?.amount ||
                    selectedRequest.initialBudget?.amount,
                }}
              />
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-gray-50/50 to-white">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="h-9 w-9 border-[3px] border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : activeRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-in fade-in zoom-in-95 duration-500">
                <div className="mb-5 w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <span className="text-4xl">💬</span>
                </div>
                <p className="text-center font-semibold text-gray-700">
                  Chưa có yêu cầu tour nào đang hoạt động
                </p>
                <p className="text-sm text-center mt-2 text-gray-500 max-w-[280px]">
                  {(userRole || user?.role) === "TourGuide"
                    ? "Chấp nhận yêu cầu để bắt đầu chat với khách hàng"
                    : "Tạo yêu cầu tour để bắt đầu chat với hướng dẫn viên"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeRequests.map((request) => {
                  const requestUnread = unreadCounts[request._id] || 0;
                  const displayName =
                    (userRole || user?.role) === "TourGuide"
                      ? request.userId?.name || "Khách hàng"
                      : request.guideId?.name || "Hướng dẫn viên";
                  const tourName =
                    request.tourDetails?.zoneName || "Tour Request";
                  const days = request.tourDetails?.numberOfDays || 0;
                  const guests =
                    request.tourDetails?.numberOfGuests ||
                    request.numberOfGuests ||
                    0;

                  return (
                    <button
                      key={request._id}
                      onClick={() => handleSelectRequest(request)}
                      className="w-full p-4 bg-white hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-white rounded-2xl border border-gray-200/60 hover:border-blue-300 hover:shadow-lg transition-all duration-200 text-left group relative active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2"
                      style={{ animationDelay: `${activeRequests.indexOf(request) * 50}ms` }}
                    >
                      {/* Unread badge */}
                      {requestUnread > 0 && (
                        <div className="absolute -top-2 -right-2 px-2.5 py-1 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg gap-1.5 animate-in zoom-in duration-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          {requestUnread}
                        </div>
                      )}

                      <div className="flex items-start gap-3 mb-3">
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-base shadow-md flex-shrink-0">
                          {(displayName || "K")[0].toUpperCase()}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                            {tourName}
                          </h4>
                          <p className="text-sm text-gray-600 mt-0.5 leading-tight">
                            {displayName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          {days} ngày
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          {guests} khách
                        </span>
                      </div>

                      {request.latestMessage && (
                        <div
                          className={`p-2.5 rounded-xl border transition-all ${
                            requestUnread > 0
                              ? "bg-blue-50 border-blue-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <p
                            className={`text-sm truncate leading-tight ${
                              requestUnread > 0
                                ? "text-blue-700 font-medium"
                                : "text-gray-700"
                            }`}
                          >
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

        {/* Footer - Clean Apple style */}
        {!selectedRequest && (
          <div className="px-5 py-4 border-t border-gray-200/80 bg-gradient-to-br from-gray-50/50 to-white">
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-500 font-medium">
                Click vào yêu cầu để xem chi tiết
              </p>
              {socket?.connected ? (
                <div className="flex items-center gap-1.5 text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm" />
                  <span className="font-semibold">Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="font-medium">Offline</span>
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
