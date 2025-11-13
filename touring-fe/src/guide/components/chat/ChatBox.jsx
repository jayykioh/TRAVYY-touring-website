import React, { useState, useEffect, useRef } from 'react';
import { Send, MapPin, Calendar, Users, Clock } from 'lucide-react';
import { useAuth } from '../../../auth/context';
import { useTourRequestChat } from '../../../hooks/useTourRequestChat';
import PriceAgreementCard from '../../../components/chat/PriceAgreementCard';

const ChatBox = ({ requestId, customerName, tourInfo }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showTourInfo, setShowTourInfo] = useState(true);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Use custom hook for chat operations
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
    sendTypingIndicator
  } = useTourRequestChat(requestId, '/api/guide/custom-requests');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    const success = await sendMessageAPI(messageText);
    
    if (success) {
      setNewMessage('');
      scrollToBottom();
    }
  };

  // Handle typing indicator
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (e.target.value.trim()) {
      sendTypingIndicator(true);
      
      // Clear typing after 2 seconds of no input
      if (window.typingTimeout) clearTimeout(window.typingTimeout);
      window.typingTimeout = setTimeout(() => {
        sendTypingIndicator(false);
      }, 2000);
    } else {
      sendTypingIndicator(false);
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
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header - Minimal since popup already has header */}
      <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Đang hoạt động</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-xs font-medium">Đang kết nối...</span>
              </>
            )}
          </div>
          <button
            onClick={() => setShowTourInfo(!showTourInfo)}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-all"
          >
            {showTourInfo ? '🔼' : '🔽'} Chi tiết tour
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {/* Tour Info Card - Collapsible */}
        {tourInfo && showTourInfo && (
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-3 border-2 border-teal-200 shadow-sm">
            <div className="space-y-2 text-sm">
              <div className="font-semibold text-gray-900 text-sm">
                {tourInfo.tourName || tourInfo.name}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {tourInfo.location && (
                  <div className="flex items-center gap-1.5 text-gray-700 bg-white/70 p-1.5 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-xs truncate">{tourInfo.location}</span>
                  </div>
                )}
                
                {tourInfo.departureDate && (
                  <div className="flex items-center gap-1.5 text-gray-700 bg-white/70 p-1.5 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs">
                      {new Date(tourInfo.departureDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
                
                {tourInfo.numberOfGuests && (
                  <div className="flex items-center gap-1.5 text-gray-700 bg-white/70 p-1.5 rounded-lg">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-xs">{tourInfo.numberOfGuests} khách</span>
                  </div>
                )}
                
                {tourInfo.duration && (
                  <div className="flex items-center gap-1.5 text-gray-700 bg-white/70 p-1.5 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-orange-600" />
                    <span className="text-xs">{tourInfo.duration}</span>
                  </div>
                )}
              </div>

              {tourInfo.totalPrice && (
                <div className="pt-2 border-t border-teal-200 flex items-center justify-between bg-white/70 p-2 rounded-lg">
                  <span className="text-xs font-medium text-gray-600">Tổng giá:</span>
                  <span className="text-sm font-bold text-teal-600">
                    {tourInfo.totalPrice.toLocaleString('vi-VN')} VND
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Price Agreement Card */}
        <PriceAgreementCard
          requestDetails={requestDetails}
          userRole="guide"
          onSendOffer={sendOffer}
          onAgree={agreeToTerms}
          loading={sending}
        />

        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm">Chưa có tin nhắn nào</p>
            <p className="text-xs">Bắt đầu trò chuyện với khách hàng</p>
            {!connected && (
              <p className="text-xs text-orange-500 mt-2">⚠️ Đang kết nối...</p>
            )}
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              // Check if message is from current user (guide)
              const isMyMessage = msg.sender?.role === 'guide' || msg.sender?.userId === user?.sub;
              const senderName = isMyMessage 
                ? 'Bạn' 
                : (msg.sender?.name || customerName || 'Khách hàng');
              
              return (
                <div
                  key={msg._id}
                  className={`flex gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  {/* Avatar for customer messages */}
                  {!isMyMessage && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {senderName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="flex flex-col max-w-[70%]">
                    {/* Sender name above bubble */}
                    <p className={`text-xs font-medium mb-1 px-1 ${
                      isMyMessage ? 'text-right text-gray-500' : 'text-left text-gray-600'
                    }`}>
                      {senderName}
                    </p>
                    
                    {/* Message bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-md ${
                        isMyMessage
                          ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-tr-sm'
                          : 'bg-white text-gray-900 border-2 border-gray-200 rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {msg.content}
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-1.5">
                        <p className={`text-xs ${
                          isMyMessage ? 'text-teal-100' : 'text-gray-400'
                        }`}>
                          {formatTime(msg.createdAt || msg.timestamp)}
                        </p>
                        {isMyMessage && (
                          <span className="text-teal-100 text-xs">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Avatar for guide messages */}
                  {isMyMessage && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {senderName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Typing indicator */}
            {typingUsers.size > 0 && (
              <div className="flex gap-2 justify-start animate-fadeIn">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {customerName?.charAt(0).toUpperCase() || 'K'}
                </div>
                <div className="bg-white border-2 border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSendMessage}
        className="p-3 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white"
      >
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Nhập tin nhắn..."
              className="w-full px-3 py-2.5 pr-10 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm bg-white shadow-sm"
              disabled={sending || !connected}
            />
            {newMessage.trim() && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {newMessage.length}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending || !connected}
            className="p-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-teal-500 disabled:hover:to-cyan-500 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        {!connected && (
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            Đang kết nối chat...
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatBox;
