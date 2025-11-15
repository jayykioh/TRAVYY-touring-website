import React, { useState, useEffect, useCallback, useRef } from "react";
// ❌ Bỏ import icon thư viện
// import { X, MessageCircle, ArrowLeft, Bell } from 'lucide-react';
import { useAuth } from "../../../auth/context";
import logger from '@/utils/logger';
import { useSocket } from "../../../context/SocketContext";
import ChatBox from "./ChatBox";
import TravellerChatBox from "../../../components/TravellerChatBox";

const PRIMARY = "#02A0AA";

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
      logger.error("[ChatPopup] Error fetching requests:", error);
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] transition-opacity"
        onClick={handleClose}
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      />

      {/* Popup */}
      <div className="fixed bottom-24 right-8 w-[420px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[85vh] bg-white rounded-2xl shadow-2xl z-[9999] flex flex-col overflow-hidden animate-slideUp">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 text-white"
          style={{
            background: `linear-gradient(90deg, ${PRIMARY} 0%, #32c6cf 100%)`,
          }}
        >
          <div className="flex items-center gap-2">
            {/* Nút back (không dùng icon) */}
            {selectedRequest && (
              <button
                onClick={handleBackToList}
                className="px-2 h-7 rounded-full hover:bg-white/20 transition-colors mr-1 text-sm font-semibold"
                aria-label="Quay lại"
              >
                ←
              </button>
            )}

            {/* Điểm nhấn chat (dấu chấm) */}
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: "white" }}
              aria-hidden="true"
            />
            <h3 className="font-semibold">
              {selectedRequest
                ? (userRole || user?.role) === "TourGuide"
                  ? selectedRequest.userId?.name || "Khách hàng"
                  : selectedRequest.guideId?.name || "Hướng dẫn viên"
                : (userRole || user?.role) === "TourGuide"
                ? "Chat với Khách hàng"
                : "Chat với Hướng dẫn viên"}
            </h3>

            {/* Tổng unread (dấu chấm + số) */}
            {!selectedRequest && totalUnread > 0 && (
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"
                style={{ backgroundColor: "#ef4444" }}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" />
                {totalUnread}
              </span>
            )}
          </div>

          {/* Nút đóng (không dùng icon) */}
          <button
            onClick={handleClose}
            className="px-2 h-7 rounded-full hover:bg-white/20 transition-colors text-sm font-semibold"
            aria-label="Đóng"
          >
            Đóng
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
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-2 border-b-transparent"
                  style={{ borderColor: PRIMARY }}
                />
              </div>
            ) : activeRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                {/* Vòng tròn mô phỏng icon chat (không dùng icon) */}
                <div
                  className="mb-4 w-16 h-16 rounded-full border-4 opacity-60"
                  style={{ borderColor: PRIMARY }}
                  aria-hidden="true"
                />
                <p className="text-center">
                  Chưa có yêu cầu tour nào đang hoạt động
                </p>
                <p className="text-sm text-center mt-2 text-gray-400">
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
                      className="w-full p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-[#f0fbfc] hover:to-[#e6f7f8] rounded-xl border-2 border-gray-200 hover:border-[#7bd4da] transition-all text-left group relative"
                    >
                      {/* Badge unread (dấu chấm + số) */}
                      {requestUnread > 0 && (
                        <div className="absolute -top-1 -right-1 px-2 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-bounce shadow-lg gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" />
                          {requestUnread}
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4
                            className="font-semibold text-gray-900 transition-colors group-hover:text-[#129aa3]"
                            style={{}}
                          >
                            {tourName}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {displayName}
                          </p>
                        </div>
                        {requestUnread > 0 && (
                          <span
                            className="text-xs font-bold px-2 py-1 rounded-full shadow-md text-white"
                            style={{
                              background:
                                "linear-gradient(90deg,#ef4444,#ec4899)",
                            }}
                          >
                            {requestUnread} mới
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                        <span className="flex items-center gap-1">
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: PRIMARY }}
                          />
                          {days} ngày
                        </span>
                        <span className="flex items-center gap-1">
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: PRIMARY }}
                          />
                          {guests} khách
                        </span>
                      </div>

                      {request.latestMessage && (
                        <div
                          className={`mt-3 p-2 rounded-lg border ${
                            requestUnread > 0
                              ? "bg-[#e6f7f8] border-[#7bd4da]"
                              : "bg-white/80 border-gray-200"
                          }`}
                        >
                          <p
                            className={`text-sm truncate ${
                              requestUnread > 0
                                ? "text-[#087c83] font-medium"
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

        {/* Footer - Only show when no request selected */}
        {!selectedRequest && (
          <div
            className="p-4 border-t border-gray-200"
            style={{ background: "linear-gradient(90deg,#f9fafb,#fff)" }}
          >
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-500">
                Click vào yêu cầu để xem chi tiết và chat
              </p>
              {socket?.connected ? (
                <div
                  className="flex items-center gap-1"
                  style={{ color: "#16a34a" }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: "#22c55e" }}
                  />
                  <span className="font-medium">Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
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
