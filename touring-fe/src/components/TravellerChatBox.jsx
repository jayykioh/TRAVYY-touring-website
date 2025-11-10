import React, { useState, useEffect, useRef } from 'react';
import { Send, MapPin, Calendar, Users, Clock } from 'lucide-react';
import { useAuth } from '../auth/context';
import { toast } from 'sonner';

const TravellerChatBox = ({ requestId, guideName, tourInfo }) => {
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
          message: messageText
        })
      });

      if (data.success && data.message) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
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
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border-2 border-teal-100 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
        <h3 className="font-semibold flex items-center gap-2">
          💬 Chat với {guideName || 'Tour Guide'}
        </h3>
        <p className="text-xs text-teal-50 mt-1">Trao đổi về chi tiết tour của bạn</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {/* Tour Info Card */}
        {tourInfo && (
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border-2 border-teal-200 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                🎯 Thông tin Tour
              </h4>
              <button
                onClick={() => setShowTourInfo(!showTourInfo)}
                className="text-gray-500 hover:text-gray-700 text-sm transition-transform"
                style={{ transform: showTourInfo ? 'rotate(0deg)' : 'rotate(-90deg)' }}
              >
                ▼
              </button>
            </div>
            
            {showTourInfo && (
              <div className="space-y-3 text-sm">
                <div className="font-semibold text-gray-900 text-base">
                  {tourInfo.tourName || tourInfo.name}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {tourInfo.location && (
                    <div className="flex items-center gap-2 text-gray-700 bg-white/70 p-2 rounded-lg">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <span className="text-xs truncate">{tourInfo.location}</span>
                    </div>
                  )}
                  
                  {tourInfo.departureDate && (
                    <div className="flex items-center gap-2 text-gray-700 bg-white/70 p-2 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-xs">
                        {new Date(tourInfo.departureDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                  
                  {tourInfo.numberOfGuests && (
                    <div className="flex items-center gap-2 text-gray-700 bg-white/70 p-2 rounded-lg">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="text-xs">{tourInfo.numberOfGuests} khách</span>
                    </div>
                  )}
                  
                  {tourInfo.duration && (
                    <div className="flex items-center gap-2 text-gray-700 bg-white/70 p-2 rounded-lg">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-xs">{tourInfo.duration}</span>
                    </div>
                  )}
                </div>

                {tourInfo.itinerary && tourInfo.itinerary.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-teal-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      📍 Lộ trình ({tourInfo.itinerary.length} điểm):
                    </p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-2 custom-scrollbar">
                      {tourInfo.itinerary.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-600 bg-white/60 p-2 rounded">
                          <span className="text-teal-600 font-bold min-w-[20px]">{idx + 1}.</span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800 line-clamp-1">{item.title}</div>
                            {item.time && (
                              <div className="text-gray-500 text-xs mt-0.5">{item.time}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tourInfo.totalPrice && (
                  <div className="mt-3 pt-3 border-t border-teal-200 flex items-center justify-between bg-white/70 p-2 rounded-lg">
                    <span className="text-xs font-medium text-gray-600">Tổng giá tour:</span>
                    <span className="text-base font-bold text-teal-600">
                      {tourInfo.totalPrice.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Messages List */}
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm">Chưa có tin nhắn</p>
            <p className="text-xs">Hãy bắt đầu hỏi guide về tour</p>
          </div>
        ) : (
          messages.map((msg) => {
            // Check if message is from current user
            const isMyMessage = msg.sender?.role === 'user' || msg.sender?.userId === user?.sub;
            return (
              <div
                key={msg._id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                    isMyMessage
                      ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  {!isMyMessage && (
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {msg.sender?.name || guideName || 'Tour Guide'}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {msg.content}
                  </p>
                  <p
                    className={`text-xs mt-1.5 ${
                      isMyMessage ? 'text-teal-100' : 'text-gray-400'
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
        className="p-4 border-t-2 border-gray-100 bg-white"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn của bạn..."
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {sending ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Hỏi guide về bất kỳ điều gì liên quan đến tour
        </p>
      </form>
    </div>
  );
};

export default TravellerChatBox;
