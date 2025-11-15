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
        {showTourInfo && tourInfo && (
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-3 border-2 border-teal-200 shadow-sm">
            <div className="space-y-2 text-sm font-semibold">
              {tourInfo.tourName || tourInfo.name}
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
