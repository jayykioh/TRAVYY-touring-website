import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X, MapPin, Calendar, Users, Clock } from 'lucide-react';
import { useAuth } from '../../../auth/context';
import { toast } from 'sonner';

const ChatBox = ({ requestId, customerName, tourInfo }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showTourInfo, setShowTourInfo] = useState(true);
  const messagesEndRef = useRef(null);
  const { withAuth, user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat history
  useEffect(() => {
    const fetchMessages = async () => {
      if (!requestId) return;
      
      try {
        setLoading(true);
        const data = await withAuth(`/api/chat/${requestId}/messages`);
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('[Chat] Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [requestId, withAuth]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const data = await withAuth(`/api/chat/${requestId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageText,
          senderRole: 'guide'
        })
      });

      if (data.success && data.message) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
      // Restore message on error
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          💬 Chat với {customerName || 'Khách hàng'}
        </h3>
        <p className="text-xs text-gray-500 mt-1">Trò chuyện về chi tiết tour</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Tour Info Card - Always shown at top */}
        {tourInfo && (
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-200 sticky top-0 z-10 shadow-sm mb-4">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                🎯 Thông tin Tour
              </h4>
              <button
                onClick={() => setShowTourInfo(!showTourInfo)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                {showTourInfo ? '▼' : '▶'}
              </button>
            </div>
            
            {showTourInfo && (
              <div className="space-y-2 text-sm">
                <div className="font-semibold text-gray-900 mb-2">
                  {tourInfo.tourName || tourInfo.name}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {tourInfo.location && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <span className="text-xs truncate">{tourInfo.location}</span>
                    </div>
                  )}
                  
                  {tourInfo.departureDate && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-xs">
                        {new Date(tourInfo.departureDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                  
                  {tourInfo.numberOfGuests && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="text-xs">{tourInfo.numberOfGuests} khách</span>
                    </div>
                  )}
                  
                  {tourInfo.duration && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-xs">{tourInfo.duration}</span>
                    </div>
                  )}
                </div>

                {tourInfo.itinerary && tourInfo.itinerary.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-teal-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Lộ trình ({tourInfo.itinerary.length} điểm):</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {tourInfo.itinerary.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                          <span className="text-teal-600 font-bold min-w-[16px]">{idx + 1}.</span>
                          <span className="line-clamp-1">{item.title}</span>
                        </div>
                      ))}
                      {tourInfo.itinerary.length > 5 && (
                        <p className="text-xs text-gray-500 italic pl-5">
                          +{tourInfo.itinerary.length - 5} địa điểm khác...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {tourInfo.totalPrice && (
                  <div className="mt-3 pt-3 border-t border-teal-200 flex items-center justify-between">
                    <span className="text-xs text-gray-600">Tổng giá:</span>
                    <span className="text-sm font-bold text-teal-600">
                      {tourInfo.totalPrice.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-4xl mb-2">💬</p>
            <p className="text-sm">Chưa có tin nhắn nào</p>
            <p className="text-xs">Bắt đầu trò chuyện với khách hàng</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMyMessage = msg.senderRole === 'guide' || msg.senderId === user?.sub;
            return (
              <div
                key={msg._id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isMyMessage
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {!isMyMessage && (
                    <p className="text-xs font-semibold mb-1 opacity-80">
                      {msg.senderName || customerName}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.message || msg.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isMyMessage ? 'text-teal-100' : 'text-gray-500'
                    }`}
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
        className="p-4 border-t border-gray-200 bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
