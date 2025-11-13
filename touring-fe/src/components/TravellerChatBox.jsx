import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MapPin, Calendar, Users, Clock, X, Paperclip, Download, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../auth/context';
import { useNavigate } from 'react-router-dom';
import { useTourRequestChat } from '../hooks/useTourRequestChat';
import PriceAgreementCard from './chat/PriceAgreementCard';

const TravellerChatBox = ({ requestId, guideName, tourInfo }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showTourInfo, setShowTourInfo] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

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
    sendTypingIndicator,
    editMessage,
    deleteMessage,
    sendFileMessage
  } = useTourRequestChat(requestId, '/api/chat');

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    console.log('[TravellerChatBox] mounted for requestId:', requestId);
    return () => console.log('[TravellerChatBox] unmounted for requestId:', requestId);
  }, [requestId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    const messageText = newMessage.trim();
    let success = false;

    if (selectedFiles.length > 0) {
      success = await sendFileMessage(messageText || `Sent ${selectedFiles.length} file(s)`, selectedFiles);
    } else {
      success = await sendMessageAPI(messageText);
    }
    
    if (success) {
      setNewMessage('');
      setSelectedFiles([]);
      scrollToBottom();
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    const success = await editMessage(messageId, newContent);
    if (success) {
      setEditingMessage(null);
      setEditContent('');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(messageId);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      alert('Maximum 5 files per message');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Max 10MB per file.`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const downloadFile = async (fileId, filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/chat/${requestId}/file/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
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

  const startEditing = (message) => {
    setEditingMessage(message._id);
    setEditContent(message.content);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const handleProceedToPayment = () => {
    navigate(`/payment/tour-request/${requestId}`, {
      state: {
        requestId,
        amount: requestDetails?.latestOffer?.amount || requestDetails?.initialBudget?.amount,
        tourInfo: requestDetails
      }
    });
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
    <>
      <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden rounded-lg shadow-xl">
      {/* Header - Minimal since popup already has header */}
      <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-label="Connected"></div>
                <span className="text-xs font-medium">Đang hoạt động</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-400 rounded-full" aria-label="Connecting"></div>
                <span className="text-xs font-medium">Đang kết nối...</span>
              </>
            )}
          </div>
          <button
            onClick={() => setShowTourInfo(!showTourInfo)}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={showTourInfo ? "Hide tour details" : "Show tour details"}
            aria-expanded={showTourInfo}
          >
            {showTourInfo ? '🔼' : '🔽'} Chi tiết tour
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-800" role="log" aria-live="polite" aria-label="Chat messages">
        {/* Tour Info Card - Collapsible */}
        {tourInfo && showTourInfo && (
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-3 border-2 border-teal-200 dark:border-teal-700 shadow-sm transition-all duration-300">
            <div className="space-y-2 text-sm">
              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                {tourInfo.tourName || tourInfo.name}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tourInfo.location && (
                  <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-700/70 p-1.5 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span className="text-xs truncate">{tourInfo.location}</span>
                  </div>
                )}
                
                {tourInfo.departureDate && (
                  <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-700/70 p-1.5 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs">
                      {new Date(tourInfo.departureDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
                
                {tourInfo.numberOfGuests && (
                  <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-700/70 p-1.5 rounded-lg">
                    <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs">{tourInfo.numberOfGuests} khách</span>
                  </div>
                )}
                
                {tourInfo.duration && (
                  <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-700/70 p-1.5 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs">{tourInfo.duration}</span>
                  </div>
                )}
              </div>

              {tourInfo.totalPrice && (
                <div className="pt-2 border-t border-teal-200 dark:border-teal-700 flex items-center justify-between bg-white/70 dark:bg-gray-700/70 p-2 rounded-lg">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Tổng giá:</span>
                  <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
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
          userRole="user"
          onSendOffer={sendOffer}
          onAgree={agreeToTerms}
          onProceedToPayment={handleProceedToPayment}
          loading={sending}
        />

        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 dark:border-teal-400"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-500">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm">Chưa có tin nhắn</p>
            <p className="text-xs">Hãy bắt đầu hỏi guide về tour</p>
            {!connected && (
              <p className="text-xs text-orange-500 dark:text-orange-400 mt-2">⚠️ Đang kết nối...</p>
            )}
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              // Check if message is from current user (traveller)
              const isMyMessage = msg.sender?.role === 'user' || msg.sender?.userId === user?.sub;
              const senderName = isMyMessage 
                ? 'Bạn' 
                : (msg.sender?.name || guideName || 'Tour Guide');
              
              return (
                <div
                  key={msg._id}
                  className={`flex gap-2 group ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  role="article"
                  aria-label={`Message from ${senderName}`}
                >
                  {/* Avatar for guide messages */}
                  {!isMyMessage && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {senderName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="flex flex-col max-w-[70%] sm:max-w-[80%]">
                    {/* Sender name above bubble */}
                    <p className={`text-xs font-medium mb-1 px-1 ${
                      isMyMessage ? 'text-right text-gray-500 dark:text-gray-400' : 'text-left text-gray-600 dark:text-gray-300'
                    }`}>
                      {senderName}
                    </p>
                    
                    {/* Message bubble */}
                    <div className="relative group">
                      {editingMessage === msg._id ? (
                        <div className="bg-white dark:bg-gray-700 border-2 border-teal-300 rounded-2xl p-3 shadow-lg">
                          <textarea
                            ref={inputRef}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full px-2 py-1 border rounded resize-none text-sm bg-transparent focus:outline-none"
                            rows={Math.min(5, editContent.split('\n').length)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleEditMessage(msg._id, editContent);
                              } else if (e.key === 'Escape') {
                                cancelEditing();
                              }
                            }}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={cancelEditing}
                              className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => handleEditMessage(msg._id, editContent)}
                              className="px-3 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                            >
                              Lưu
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-md transition-all duration-200 hover:shadow-lg ${
                            isMyMessage
                              ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-tr-sm'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-tl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                            {msg.content}
                          </p>

                          {/* File attachments */}
                          {msg.messageType === 'file' && msg.attachments?.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {msg.attachments.map((file, index) => (
                                <div
                                  key={index}
                                  className={`flex items-center gap-2 p-2 rounded-lg ${
                                    isMyMessage ? 'bg-teal-600' : 'bg-gray-100 dark:bg-gray-600'
                                  }`}
                                >
                                  <Paperclip className="w-4 h-4 flex-shrink-0" />
                                  <span className="text-sm flex-1 truncate">
                                    {file.filename}
                                  </span>
                                  <button
                                    onClick={() => downloadFile(file.fileId, file.filename)}
                                    className={`p-1 rounded hover:bg-opacity-20 transition-colors ${
                                      isMyMessage ? 'hover:bg-white' : 'hover:bg-gray-200 dark:hover:bg-gray-500'
                                    }`}
                                    title="Download file"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-1.5">
                            <div className={`text-xs ${
                              isMyMessage ? 'text-teal-100' : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              {formatTime(msg.createdAt || msg.timestamp)}
                            </div>
                            
                            {/* Message actions for own messages */}
                            {isMyMessage && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditing(msg)}
                                  className="p-1 text-teal-100 hover:bg-white/20 rounded transition-colors"
                                  title="Edit message"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(msg._id)}
                                  className="p-1 text-teal-100 hover:bg-white/20 rounded transition-colors"
                                  title="Delete message"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            
                            {isMyMessage && !editingMessage && (
                              <span className="text-teal-100" aria-label="Message sent">✓✓</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Avatar for traveller messages */}
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
              <div className="flex gap-2 justify-start" aria-label="Someone is typing">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {guideName?.charAt(0).toUpperCase() || 'G'}
                </div>
                <div className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md">
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

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white dark:bg-gray-600 px-3 py-2 rounded-lg border shadow-sm"
              >
                <Paperclip className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm truncate max-w-[120px]">
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form 
        onSubmit={handleSendMessage}
        className="p-3 border-t-2 border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"
      >
        <div className="flex items-end gap-2">
          {/* File upload button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || !connected}
            className="p-2.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            title="Attach files"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Nhập tin nhắn của bạn... (Shift+Enter để xuống dòng)"
              className="w-full px-3 py-2.5 pr-10 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm resize-none min-h-[40px] max-h-[120px]"
              disabled={sending || !connected}
              rows={1}
              style={{ height: 'auto' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            {newMessage.trim() && (
              <span className="absolute right-3 top-2.5 text-xs text-gray-400 dark:text-gray-500">
                {newMessage.length}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending || !connected}
            className="p-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-teal-500 disabled:hover:to-cyan-500 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* File upload info */}
        {selectedFiles.length > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            {selectedFiles.length} file(s) sẽ được gửi cùng tin nhắn
          </div>
        )}
        
        {!connected && (
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            Đang kết nối chat...
          </div>
        )}
      </form>
    </div>
    </>
  );
};

export default TravellerChatBox;
