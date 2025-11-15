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
import { toast } from "sonner";

const ChatBox = ({ requestId, customerName, tourInfo }) => {
  const { user, withAuth } = useAuth();

  // Input states
  const [newMessage, setNewMessage] = useState("");
  const [showTourInfo, setShowTourInfo] = useState(true);
  const [showItinerary, setShowItinerary] = useState(false);

  // Price offer modals
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");

  const [showMinPriceModal, setShowMinPriceModal] = useState(false);
  const [minPriceAmount, setMinPriceAmount] = useState("");

  const [processingAction, setProcessingAction] = useState(null);

  const messagesEndRef = useRef(null);

  // Custom hook from cuocthi
  const {
    messages,
    requestDetails,
    loading,
    sending,
    connected,
    typingUsers,
    sendMessage: sendMessageAPI,
    sendOffer,
    agreeToTerms,
    sendTypingIndicator,
    setMinPrice,
    refetchRequest,
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
  const handleSendOffer = async () => {
    const amount = parseFloat(offerAmount.replace(/[^0-9.]/g, ""));
    if (!amount || amount <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    const success = await sendOffer({ amount, message: offerMessage });
    if (success) {
      setShowOfferModal(false);
      setOfferAmount("");
      setOfferMessage("");
    }
  };

  const handleSetMinPrice = async () => {
    const amount = parseFloat(minPriceAmount.replace(/[^0-9.]/g, ""));
    if (!amount || amount <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    const success = await setMinPrice(amount, "VND");
    if (success) {
      setShowMinPriceModal(false);
      setMinPriceAmount("");
      toast.success("Đã đặt giá tối thiểu thành công");
    }
  };

  /* ------------------------------------------------------
     📌 Accept / Decline
  ------------------------------------------------------ */
  const handleAcceptRequest = async () => {
    if (!window.confirm("Bạn chắc chắn chấp nhận yêu cầu này?")) return;

    setProcessingAction("accept");

    try {
      const res = await withAuth(
        `/api/guide/custom-requests/${requestId}/accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ finalAmount: 0, currency: "VND" }),
        }
      );

      if (res.success) {
        toast.success("Đã chấp nhận yêu cầu");
        await refetchRequest();
      } else toast.error(res.error || "Không thể chấp nhận yêu cầu");
    } catch (err) {
      toast.error("Có lỗi xảy ra");
    }

    setProcessingAction(null);
  };

  const handleDeclineRequest = async () => {
    if (!window.confirm("Bạn chắc chắn muốn từ chối yêu cầu?")) return;

    setProcessingAction("decline");

    try {
      const res = await withAuth(
        `/api/guide/custom-requests/${requestId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: "Declined by guide" }),
        }
      );

      if (res.success) {
        toast.success("Đã từ chối yêu cầu");
        await refetchRequest();
      } else toast.error(res.error || "Không thể từ chối");
    } catch (err) {
      toast.error("Có lỗi xảy ra");
    }

    setProcessingAction(null);
  };

  /* ======================================================
     📌 RENDER UI
  ====================================================== */
  return (
    <div className="flex flex-col h-full bg-[#f5f5f7] overflow-hidden rounded-2xl shadow-xl">
      {/* HEADER - Minimalist style */}
      {/* HEADER - Minimalist style */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          {/* Left: avatar + name + status (giữ nguyên nhưng gọn hơn) */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-lg">💬</span>
              </div>
              {connected && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">
                {customerName || "Khách hàng"}
              </h3>
              <p className="text-xs text-gray-500">
                {connected ? "Đang hoạt động" : "Đang kết nối..."}
              </p>
            </div>
          </div>

          {/* Right: nút toggle chi tiết (ẩn = ! ; hiện = ×) */}
          <button
            onClick={() => setShowTourInfo((p) => !p)}
            aria-label="Bật/tắt chi tiết tour"
            className={`w-5 h-5 rounded-full border transition-colors flex items-center justify-center
        ${
          showTourInfo
            ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
        }`}
          >
            <span className="text-sm leading-none select-none">
              {showTourInfo ? "×" : "!"}
            </span>
          </button>
        </div>
      </div>

      {/* BODY - Clean background */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Tour Info - Subtle card */}
        {showTourInfo && tourInfo && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="space-y-2">
              <p className="font-semibold text-gray-900 text-sm">
                {tourInfo.tourName || tourInfo.name}
              </p>
              {tourInfo.location && (
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {tourInfo.location}
                </p>
              )}
            </div>
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

        {/* MESSAGES - iMessage style */}
        <div className="space-y-2">
          {loading && messages.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 py-12 text-sm">
              Chưa có tin nhắn nào
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
                <div key={msg._id}>
                  {showTime && (
                    <div className="flex justify-center my-3">
                      <span className="text-xs text-gray-400 px-3 py-1 bg-white rounded-full">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {/* Bubble - iMessage style */}
                    <div
                      className={`rounded-[20px] px-4 py-2.5 max-w-[75%] ${
                        isMe
                          ? "bg-[#007AFF] text-white shadow-sm"
                          : "bg-white text-gray-900 shadow-sm border border-gray-100"
                      }`}
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-white rounded-[20px] px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1">
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

      {/* INPUT - Clean minimal design */}
      <form
        onSubmit={handleSendMessage}
        className="px-4 py-3 bg-white border-t border-gray-100"
      >
        <div className="flex items-center gap-2 bg-gray-100 rounded-[24px] px-4 py-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Tin nhắn..."
            disabled={sending || !connected}
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-900 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`p-2 rounded-full transition-all ${
              newMessage.trim() && !sending
                ? "bg-[#007AFF] text-white hover:bg-[#0051D5]"
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
