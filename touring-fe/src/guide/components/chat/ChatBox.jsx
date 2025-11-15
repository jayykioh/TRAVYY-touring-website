import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  MapPin,
  Calendar,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Map,
  X,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../../../auth/context";
import { useTourRequestChat } from "../../../hooks/useTourRequestChat";
import PriceAgreementCard from "../../../components/chat/PriceAgreementCard";

const ChatBox = ({ requestId, tourInfo }) => {
  const { user } = useAuth();

  // Input states
  const [newMessage, setNewMessage] = useState("");
  const [showTourInfo, setShowTourInfo] = useState(true);
  const [showItinerary, setShowItinerary] = useState(false);

  // Price offer related state handled inside PriceAgreementCard

  const messagesEndRef = useRef(null);

  // Custom hook from cuocthi
  const {
    messages,
    requestDetails,
    loading,
    sending,
    connected,
    sendMessage: sendMessageAPI,
    sendOffer,
    agreeToTerms,
    sendTypingIndicator,
  } = useTourRequestChat(requestId, "/api/chat");

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const formatTime = (ts) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  /* ------------------------------------------------------
     📌 Sending Message
  ------------------------------------------------------ */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !connected) return;

    const success = await sendMessageAPI(newMessage.trim());
    if (success) {
      setNewMessage("");
      scrollToBottom();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (e.target.value.trim()) {
      sendTypingIndicator(true);
      if (window.typingTimeout) clearTimeout(window.typingTimeout);

      window.typingTimeout = setTimeout(() => {
        sendTypingIndicator(false);
      }, 2000);
    } else {
      sendTypingIndicator(false);
    }
  };

  /* ------------------------------------------------------
     📌 Price Offers
  ------------------------------------------------------ */
  // Offer/min-price actions are handled in PriceAgreementCard via props

  /* ------------------------------------------------------
     📌 Accept / Decline
  ------------------------------------------------------ */
  // Accept/decline handled via PriceAgreementCard or guide UI actions

  /* ======================================================
     📌 RENDER UI
  ====================================================== */
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* HEADER */}
      <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium">Đang hoạt động</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-300 rounded-full" />
                <span className="text-xs font-medium">Đang kết nối...</span>
              </>
            )}
          </div>

          <button
            onClick={() => setShowTourInfo(!showTourInfo)}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-all"
          >
            {showTourInfo ? "🔼" : "🔽"} Chi tiết tour
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {/* Tour Info */}
        {showTourInfo && (requestDetails || tourInfo) && (
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-3 border-2 border-teal-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-1 text-sm font-semibold">
                <div className="text-base font-bold">
                  {(requestDetails?.tourDetails?.zoneName || tourInfo?.tourName || tourInfo?.name) || 'Tour'}
                </div>
                <div className="text-xs text-gray-600">
                  {requestDetails?.tourDetails?.numberOfDays || tourInfo?.duration || ''} • {requestDetails?.tourDetails?.numberOfGuests || tourInfo?.numberOfGuests || ''} khách
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => setShowItinerary((s) => !s)}
                  className="text-xs px-3 py-1 bg-white/60 rounded-lg hover:bg-white/80"
                >
                  {showItinerary ? 'Ẩn hành trình' : 'Xem hành trình'}
                </button>
              </div>
            </div>

            {/* Itinerary list - prefer requestDetails.tourDetails.items */}
            {showItinerary && (
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                {(requestDetails?.tourDetails?.items || tourInfo?.items || []).length === 0 ? (
                  <div className="text-xs text-gray-500">Hành trình chưa có chi tiết</div>
                ) : (
                  (requestDetails?.tourDetails?.items || tourInfo?.items || []).map((it, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 bg-white/80 rounded-lg border">
                      <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-semibold">{idx+1}</div>
                      <div className="flex-1">
                        <div className="font-medium">{it.name || it.title || it.placeName}</div>
                        {it.address && <div className="text-xs text-gray-500">{it.address}</div>}
                        {(it.startTime || it.endTime) && (
                          <div className="text-xs text-gray-400 mt-1">{it.startTime || ''}{it.startTime && it.endTime ? ' - ' : ''}{it.endTime || ''}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Price Agreement Card */}
        {requestDetails && (
          <PriceAgreementCard
            requestDetails={requestDetails}
            userRole="guide"
            onSendOffer={sendOffer}
            onAgree={agreeToTerms}
            loading={sending}
          />
        )}

        {/* MESSAGES */}
        <div className="space-y-3">
          {loading && messages.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 border-b-2 border-teal-500 rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Chưa có tin nhắn nào
            </div>
          ) : (
            messages.map((msg) => {
              const senderUserId =
                msg.sender?.userId?._id ||
                msg.sender?.userId?.toString() ||
                msg.sender?.userId;

              const currentUserId = user?._id?.toString() || user?._id;

              const isMe =
                msg.sender?.role === "guide" && senderUserId === currentUserId;

              return (
                <div
                  key={msg._id}
                  className={`flex gap-2 ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Bubble */}
                  <div
                    className={`rounded-xl px-4 py-2 shadow-md max-w-[70%] ${
                      isMe
                        ? "bg-gradient-to-br from-teal-500 to-cyan-500 text-white"
                        : "bg-white border-2 border-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <p
                      className={`text-[11px] mt-1 text-right ${
                        isMe ? "text-teal-100" : "text-gray-400"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t bg-white flex items-end gap-2"
      >
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Nhập tin nhắn..."
          disabled={sending || !connected}
          className="flex-1 px-3 py-2 border-2 rounded-xl focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl"
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
