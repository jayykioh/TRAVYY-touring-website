// src/pages/guide/components/chat/ChatBox.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Paperclip,
  X,
  MapPin,
  Calendar,
  Users,
  Clock,
  Info,
  MessageCircle,
  MessagesSquare,
  Hash,
} from "lucide-react";
import { useAuth } from "../../../auth/context";
import { toast } from "sonner";

/** Click outside (hỗ trợ bỏ qua nút trigger) */
function useClickOutside(ref, handler, ignoreRef = null) {
  useEffect(() => {
    const listener = (event) => {
      if (ignoreRef?.current?.contains(event.target)) return;
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, ignoreRef]);
}

const ChatBox = ({ requestId, customerName, tourInfo, onClose }) => {
  const { withAuth, user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showTourInfo, setShowTourInfo] = useState(false);

  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const tourInfoRef = useRef(null);
  const infoButtonRef = useRef(null);

  // Đóng toàn bộ modal khi click ra ngoài
  useClickOutside(chatBoxRef, onClose);
  // Đóng popover tour info khi click ra ngoài (bỏ qua nút Info)
  useClickOutside(
    tourInfoRef,
    () => showTourInfo && setShowTourInfo(false),
    infoButtonRef
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat history + polling
  useEffect(() => {
    const fetchMessages = async () => {
      if (!requestId) return;
      try {
        setLoading(true);
        const data = await withAuth(`/api/chat/${requestId}/messages`);
        if (data?.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      } catch (e) {
        console.error("[Chat] fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [requestId, withAuth]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const data = await withAuth(`/api/chat/${requestId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, senderRole: "guide" }),
      });

      if (data?.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        scrollToBottom();
      }
    } catch (error) {
      console.error("[Chat] send error:", error);
      toast.error("Không thể gửi tin nhắn");
      setNewMessage(messageText); // khôi phục nội dung khi lỗi
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts) => {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div
      ref={chatBoxRef}
      className="flex flex-col h-[70vh] max-h-[700px] w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label="Hộp chat khách hàng"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 relative">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 truncate">
            <MessageCircle className="w-5 h-5 text-[#02A0AA]" />
            <span className="truncate">
              Chat với {customerName || "Khách hàng"}
            </span>
          </h3>
          {/* subtitle có thể thêm khi cần */}
        </div>

        <div className="flex items-center gap-2">
          <button
            ref={infoButtonRef}
            onClick={() => setShowTourInfo((p) => !p)}
            className={`p-1 rounded-full transition-colors border border-transparent
              ${
                showTourInfo
                  ? "bg-gray-200 text-gray-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            aria-label="Thông tin tour"
          >
            <Info className="w-5 h-5" />
          </button>

          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Đóng chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Popover Info (compact, no icons) */}
        <div className="absolute top-full right-4 mt-2 z-20 w-full max-w-sm">
          {showTourInfo && tourInfo && (
            <div
              ref={tourInfoRef}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  Thông tin tour
                </h4>
              </div>

              {/* Body */}
              <div className="space-y-2 text-[13px]">
                {/* Tên tour */}
                <div className="font-medium text-gray-900 truncate">
                  {tourInfo.tourName || tourInfo.name}
                </div>

                {/* Mã tour */}
                <div className="text-gray-700">
                  <span className="text-gray-500">Mã:&nbsp;</span>
                  <span className="font-medium">{requestId}</span>
                </div>

                {/* Lưới thông tin ngắn */}
                <div className="grid grid-cols-2 gap-2">
                  {tourInfo.location && (
                    <div className="min-w-0">
                      <span className="text-gray-500">Địa điểm:&nbsp;</span>
                      <span className="text-gray-800 truncate inline-block align-top">
                        {tourInfo.location}
                      </span>
                    </div>
                  )}

                  {tourInfo.departureDate && (
                    <div>
                      <span className="text-gray-500">Ngày đi:&nbsp;</span>
                      <span className="text-gray-800">
                        {new Date(tourInfo.departureDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  )}

                  {tourInfo.numberOfGuests && (
                    <div>
                      <span className="text-gray-500">Khách:&nbsp;</span>
                      <span className="text-gray-800">
                        {tourInfo.numberOfGuests}
                      </span>
                    </div>
                  )}

                  {tourInfo.duration && (
                    <div>
                      <span className="text-gray-500">Thời lượng:&nbsp;</span>
                      <span className="text-gray-800">{tourInfo.duration}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02A0AA]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 pt-10">
            <MessagesSquare className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-sm font-medium">Chưa có tin nhắn nào</p>
            <p className="text-xs">Bắt đầu trò chuyện với khách hàng</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine =
              msg.senderRole === "guide" ||
              msg.senderId === user?.id ||
              msg.senderId === user?.sub;

            return (
              <div
                key={msg._id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] px-4 py-2 rounded-2xl shadow-sm break-words
                    ${
                      isMine
                        ? "bg-[#02A0AA] text-white rounded-br-2xl rounded-tl-2xl"
                        : "bg-gray-100 text-gray-900 rounded-bl-2xl rounded-tr-2xl"
                    }`}
                >
                  {!isMine && (
                    <p className="text-xs font-semibold mb-1 text-[#1e6f74]">
                      {msg.senderName || customerName}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">
                    {msg.message || msg.content}
                  </p>
                  <p
                    className={`text-[11px] mt-1 text-right 
                      ${isMine ? "text-white/80" : "text-gray-500"}`}
                  >
                    {formatTime(msg.createdAt || msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t border-gray-200 bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-3 text-gray-500 hover:text-[#02A0AA] hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => toast.info("Chức năng đính kèm tệp sắp ra mắt!")}
            aria-label="Đính kèm tệp"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#02A0AA] focus:border-transparent"
            disabled={sending}
          />

          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-[#02A0AA] text-white rounded-full hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Gửi tin nhắn"
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

/* Tailwind keyframe nhỏ cho popover (optional):
   Nếu bạn muốn mượt hơn, thêm vào globals.css:
   @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
*/
