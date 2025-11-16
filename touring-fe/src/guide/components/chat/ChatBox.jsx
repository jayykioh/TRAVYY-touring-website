import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, MapPin, ChevronDown, ChevronUp } from "lucide-react";

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
    typingUsers,
  } = useTourRequestChat(requestId, "/api/chat");

  // Derived values for header and typing indicator
  const customerName = requestDetails?.customer?.name || requestDetails?.customerName || 'Khách hàng';
  const typingArray = Array.from((typeof typingUsers !== 'undefined' && typingUsers) || []);

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
      {/* HEADER - Apple/Facebook Style */}
      <div className="px-5 py-4 bg-white border-b border-gray-200/80 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar with online status */}
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                {(customerName || "K")[0].toUpperCase()}
              </div>
              {connected && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-[2.5px] border-white shadow-sm" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base leading-tight">
                {customerName || "Khách hàng"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                {connected ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Đang hoạt động
                  </span>
                ) : (
                  "Đang kết nối..."
                )}
              </p>
            </div>
          </div>

          {/* Toggle tour info button */}
          <button
            onClick={() => setShowTourInfo((p) => !p)}
            aria-label="Bật/tắt chi tiết tour"
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            {showTourInfo ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* BODY - Clean background with subtle gradient */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-gray-50/30 to-white">
        {/* Tour Info - Elegant card with smooth animation */}
        {showTourInfo && (requestDetails || tourInfo) && (
          <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-4 border border-gray-200/60 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-base font-bold text-gray-900 leading-tight">
                  {(requestDetails?.tourDetails?.zoneName || tourInfo?.tourName || tourInfo?.name) || 'Tour'}
                </h4>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {requestDetails?.tourDetails?.numberOfDays || tourInfo?.duration || ''}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {requestDetails?.tourDetails?.numberOfGuests || tourInfo?.numberOfGuests || ''} khách
                  </span>
                </div>
                {tourInfo?.location && (
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    {tourInfo.location}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowItinerary((s) => !s)}
              className="w-full mt-2 py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              {showItinerary ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Ẩn hành trình
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Xem hành trình
                </>
              )}
            </button>

            {/* Itinerary list with smooth animation */}
            {showItinerary && (
              <div className="mt-3 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-300">
                {(requestDetails?.tourDetails?.items || tourInfo?.items || []).length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4">Hành trình chưa có chi tiết</div>
                ) : (
                  (requestDetails?.tourDetails?.items || tourInfo?.items || []).map((it, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-200/60 hover:shadow-md transition-all duration-200">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm flex-shrink-0">
                        {idx+1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm leading-tight">{it.name || it.title || it.placeName}</div>
                        {it.address && <div className="text-xs text-gray-500 mt-1 leading-tight">{it.address}</div>}
                        {(it.startTime || it.endTime) && (
                          <div className="text-xs text-gray-400 mt-1.5 leading-tight">
                            {it.startTime || ''}{it.startTime && it.endTime ? ' - ' : ''}{it.endTime || ''}
                          </div>
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

        {/* MESSAGES - Apple iMessage Style */}
        <div className="space-y-1">
          {loading && messages.length === 0 ? (
            <div className="flex justify-center py-16">
              <div className="h-9 w-9 border-[3px] border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-sm">Chưa có tin nhắn nào</p>
              <p className="text-xs mt-1 text-gray-400">Bắt đầu cuộc trò chuyện</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const senderUserId =
                msg.sender?.userId?._id ||
                msg.sender?.userId?.toString() ||
                msg.sender?.userId;

              const currentUserId = user?._id?.toString() || user?._id;

              const isMe =
                msg.sender?.role === "guide" && senderUserId === currentUserId;

              // Show timestamp if first message or >5 min gap
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const showTime =
                !prevMsg ||
                new Date(msg.createdAt) - new Date(prevMsg.createdAt) >
                  5 * 60 * 1000;

              return (
                <div key={msg._id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {showTime && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-gray-400 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm font-medium">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex ${isMe ? "justify-end" : "justify-start"} px-1`}
                  >
                    {/* Bubble - iMessage style with better shadows */}
                    <div
                      className={`rounded-[22px] px-4 py-2.5 max-w-[75%] transition-all duration-200 ${
                        isMe
                          ? "bg-gradient-to-br from-[#007AFF] to-[#0051D5] text-white shadow-md hover:shadow-lg"
                          : "bg-white text-gray-900 shadow-md hover:shadow-lg border border-gray-100/50"
                      }`}
                    >
                      <p className="text-[15px] leading-[1.4] whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Typing indicator - only show when customer is typing */}
        {typingArray.filter(t => t !== user?.id && t !== user?._id?.toString()).length > 0 && (
          <div className="flex justify-start px-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white rounded-[22px] px-5 py-3.5 shadow-md border border-gray-100/50">
              <div className="flex gap-1.5">
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT - Apple Messages Style */}
      <form
        onSubmit={handleSendMessage}
        className="px-4 py-3.5 bg-white border-t border-gray-200/80 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2.5 bg-gray-100 rounded-[26px] px-4 py-2.5 hover:bg-gray-150 transition-colors duration-200">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Tin nhắn..."
            disabled={sending || !connected}
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-900 placeholder-gray-400 leading-tight"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`p-2 rounded-full transition-all duration-200 ${
              newMessage.trim() && !sending
                ? "bg-gradient-to-br from-[#007AFF] to-[#0051D5] text-white hover:shadow-lg hover:scale-105 active:scale-95"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
