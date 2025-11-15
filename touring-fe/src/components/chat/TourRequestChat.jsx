import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, X, Download, Edit2, Trash2, CheckCheck, Check, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function TourRequestChat({ requestId, currentUser, tourRequest }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [tourData, setTourData] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const editInputRef = useRef(null);

  const { joinRoom, leaveRoom, on } = useSocket() || {};

  // Fetch tour request details if not provided
  useEffect(() => {
    if (tourRequest) {
      setTourData(tourRequest);
    } else if (requestId) {
      const fetchTourData = async () => {
        try {
          const token = localStorage.getItem('token');
          const isGuide = currentUser?.role === 'guide';
          const endpoint = isGuide
            ? `/api/guide/custom-requests/${requestId}`
            : `/api/tour-requests/${requestId}`;
          
          const response = await axios.get(`${API_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.tourRequest) {
            setTourData(response.data.tourRequest);
          }
        } catch (error) {
          console.warn('Failed to fetch tour request details:', error);
        }
      };
      
      fetchTourData();
    }
  }, [requestId, tourRequest, currentUser?.role]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat history
  const fetchMessages = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/chat/${requestId}/messages?page=${pageNum}&limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const newMessages = response.data.messages;
        setMessages(prev => pageNum === 1 ? newMessages : [...prev, ...newMessages]);
        setUnreadCount(response.data.unreadCount);
        setHasMore(response.data.pagination.page < response.data.pagination.totalPages);
        setCurrentPage(pageNum);
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  // Send text message
  const sendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    try {
      setSending(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (selectedFiles.length > 0) {
        // Send with files
        const formData = new FormData();
        formData.append('content', newMessage || `Sent ${selectedFiles.length} file(s)`);
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });

        const response = await axios.post(
          `${API_URL}/api/chat/${requestId}/file`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          setMessages(prev => [...prev, response.data.message]);
          setNewMessage('');
          setSelectedFiles([]);
          scrollToBottom();
        }
      } else {
        // Send text only
        const response = await axios.post(
          `${API_URL}/api/chat/${requestId}/message`,
          { content: newMessage },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          setMessages(prev => [...prev, response.data.message]);
          setNewMessage('');
          scrollToBottom();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Edit message
  const editMessage = async (messageId, newContent) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/chat/${requestId}/message/${messageId}`,
        { content: newContent },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setMessages(prev => prev.map(m => 
          m._id === messageId ? { ...m, content: newContent, edited: true } : m
        ));
        setEditingMessage(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('Error editing message:', error);
      setError('Failed to edit message. Please try again.');
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/api/chat/${requestId}/message/${messageId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setMessages(prev => prev.filter(m => m._id !== messageId));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message. Please try again.');
    }
  };

  // Start editing message
  const startEditing = (message) => {
    setEditingMessage(message._id);
    setEditContent(message.content);
    setTimeout(() => editInputRef.current?.focus(), 100);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  // Handle file selection
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

  // Remove selected file
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Download file
  const downloadFile = async (fileId, filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/chat/${requestId}/file/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (unreadCount === 0) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/chat/${requestId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [requestId, unreadCount]);

  // Poll for new messages (prefer sockets, fallback to polling)
  useEffect(() => {
    let offNew, offUpdated, offDeleted, offRead;
    let pollInterval;

    // load initial history
    fetchMessages();

  // use joinRoom/on/leaveRoom from hook (declared at top-level)

    // If socket helper available, use it
    if (joinRoom && on) {
      try {
        joinRoom(`chat-${requestId}`);

        offNew = on('newMessage', (msg) => {
          setMessages(prev => [...prev, msg]);
          if (document.visibilityState === 'visible') {
            setUnreadCount(0);
          }
          scrollToBottom();
        });

        offUpdated = on('messageUpdated', (updated) => {
          setMessages(prev => prev.map(m => (m._id === updated._id ? updated : m)));
        });

        offDeleted = on('messageDeleted', ({ messageId }) => {
          setMessages(prev => prev.filter(m => m._id !== messageId));
        });

        offRead = on('messagesRead', ({ requestId: rid, unreadCount: uc }) => {
          if (rid === requestId) setUnreadCount(uc || 0);
        });
      } catch (e) {
        console.warn('Socket handlers failed, falling back to polling', e?.message);
        pollInterval = setInterval(() => fetchMessages(), 5000);
      }
    } else {
      // No socket available (provider not mounted or not connected) -> fallback polling
      pollInterval = setInterval(() => fetchMessages(), 5000);
    }

    return () => {
      try {
        if (offNew) offNew();
        if (offUpdated) offUpdated();
        if (offDeleted) offDeleted();
        if (offRead) offRead();

  if (leaveRoom) leaveRoom(`chat-${requestId}`);

        if (pollInterval) clearInterval(pollInterval);
      } catch (e) {
        console.warn('cleanup error', e?.message);
      }
    };
  }, [requestId, fetchMessages, joinRoom, on, leaveRoom]);

  // Mark as read when viewing
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages.length, markAsRead]);

  // Auto scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
      <div className="flex flex-col h-[600px] bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header with Tour Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-b-2 border-gray-200 dark:border-gray-700">
        {/* Connection Status Bar */}
        <div className="p-3 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : connectionStatus === 'connecting' ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {connectionStatus === 'connected' ? 'Online' : 
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
              </span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                {unreadCount}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Đang chat với {currentUser.role === 'user' ? 'Tour Guide' : 'Khách hàng'}
          </h3>
        </div>

        {/* Tour Request Info */}
        {tourData && (
          <div className="p-4 space-y-3">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 space-y-3">
              {/* Zone & Details */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {tourData.tourDetails?.zoneName || 'Tour Request'}
                  </h4>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {tourData.tourDetails?.numberOfDays && (
                      <span>📅 {tourData.tourDetails.numberOfDays} ngày</span>
                    )}
                    {tourData.tourDetails?.numberOfGuests && (
                      <span>👥 {tourData.tourDetails.numberOfGuests} khách</span>
                    )}
                    {tourData.initialBudget?.amount && (
                      <span>💰 {tourData.initialBudget.amount.toLocaleString('vi-VN')} {tourData.initialBudget.currency}</span>
                    )}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  tourData.status === 'accepted' ? 'bg-green-100 text-green-700' :
                  tourData.status === 'agreement_pending' ? 'bg-blue-100 text-blue-700' :
                  tourData.status === 'negotiating' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {tourData.status === 'accepted' ? '✅ Đã chấp nhận' :
                   tourData.status === 'agreement_pending' ? '⏳ Chờ xác nhận' :
                   tourData.status === 'negotiating' ? '🤝 Thương lượng' :
                   '📋 Mới tạo'}
                </div>
              </div>

              {/* Agreement Status */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      tourData.travellerAgreed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {tourData.travellerAgreed ? '✓' : '○'}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {currentUser.role === 'user' ? 'Bạn' : 'Khách hàng'} đã động ý
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      tourData.guideAgreed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {tourData.guideAgreed ? '✓' : '○'}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {currentUser.role === 'guide' ? 'Bạn' : 'Guide'} đã động ý
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Only show if not fully agreed */}
              {(!tourData.travellerAgreed || !tourData.guideAgreed) && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
                    💰 Gọi ý giá
                  </button>
                  <button className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors">
                    ✓ Động ý
                  </button>
                </div>
              )}

              {/* Final Price & Decision */}
              {tourData.finalPrice?.amount && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-600 dark:to-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">💡 Quyết định yêu cầu</div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Giá cuối cùng: {tourData.finalPrice.amount.toLocaleString('vi-VN')} {tourData.finalPrice.currency}
                      </span>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded transition-colors">
                          ✓ Chấp nhận
                        </button>
                        <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors">
                          ✕ Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {loading && messages.length === 0 ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
        ) : (
          <>
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchMessages(currentPage + 1)}
                className="w-full"
              >
                Load older messages
              </Button>
            )}
            
            {messages.map((message) => {
              const isOwn = message.sender.userId === currentUser.id;
              
              return (
                <div
                  key={message._id}
                  className={`flex group ${isOwn ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div className={`flex gap-2 max-w-[70%] sm:max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {message.sender.name?.charAt(0) || 'U'}
                    </div>

                    {/* Message Content */}
                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
                        {message.sender.name}
                      </div>
                      
                      <div className="relative group">
                        {editingMessage === message._id ? (
                          <div className="bg-white dark:bg-gray-700 border-2 border-blue-300 rounded-lg p-3 shadow-lg min-w-[200px]">
                            <textarea
                              ref={editInputRef}
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full px-2 py-1 border rounded resize-none text-sm bg-transparent focus:outline-none dark:text-white dark:bg-gray-700"
                              rows={Math.min(5, editContent.split('\n').length)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  editMessage(message._id, editContent);
                                } else if (e.key === 'Escape') {
                                  cancelEditing();
                                }
                              }}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditing}
                                className="text-xs"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => editMessage(message._id, editContent)}
                                className="text-xs"
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`rounded-2xl px-4 py-3 shadow-md transition-all duration-200 hover:shadow-lg ${
                              isOwn
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-sm'
                                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-tl-sm'
                            }`}
                          >
                            {/* Text content */}
                            {message.content && (
                              <p className="whitespace-pre-wrap break-words leading-relaxed">
                                {message.content}
                              </p>
                            )}

                            {/* Edited indicator */}
                            {message.edited && (
                              <span className={`text-xs italic ${
                                isOwn ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'
                              }`}>
                                (edited)
                              </span>
                            )}

                            {/* File attachments */}
                            {message.messageType === 'file' && message.attachments?.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {message.attachments.map((file, index) => (
                                  <div
                                    key={index}
                                    className={`flex items-center gap-2 p-2 rounded-lg ${
                                      isOwn ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-600'
                                    }`}
                                  >
                                    <Paperclip className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm flex-1 truncate">
                                      {file.filename}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => downloadFile(file.fileId, file.filename)}
                                      className={`p-1 h-auto ${
                                        isOwn ? 'text-white hover:bg-blue-700' : 'hover:bg-gray-200 dark:hover:bg-gray-500'
                                      }`}
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Timestamp and actions */}
                            <div className="flex items-center justify-between mt-2">
                              <div className={`text-xs ${
                                isOwn ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'
                              }`}>
                                {format(new Date(message.createdAt), 'HH:mm')}
                              </div>
                              
                              {/* Message actions for own messages */}
                              {isOwn && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => startEditing(message)}
                                    className="p-1 text-blue-100 hover:bg-white/20 rounded transition-colors"
                                    title="Edit message"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => deleteMessage(message._id)}
                                    className="p-1 text-blue-100 hover:bg-white/20 rounded transition-colors"
                                    title="Delete message"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                              
                              {/* Read status */}
                              {isOwn && (
                                <div className="flex items-center">
                                  {message.isRead ? (
                                    <CheckCheck className="w-3 h-3 text-blue-100" />
                                  ) : (
                                    <Check className="w-3 h-3 text-blue-200" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-2 bg-gray-100 border-t">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border"
              >
                <Paperclip className="w-4 h-4" />
                <span className="text-sm truncate max-w-[150px]">
                  {file.name}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(index)}
                  className="p-1 h-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="flex-1 min-h-[40px] max-h-[120px] resize-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            disabled={sending}
          />

          <Button
            onClick={sendMessage}
            disabled={sending || (!newMessage.trim() && selectedFiles.length === 0)}
            className="px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-between">
          <span>Max 5 files, 10MB each. Supported: Images, PDF, DOC, XLS, TXT</span>
          {newMessage.length > 0 && (
            <span className={`${newMessage.length > 1000 ? 'text-red-500' : 'text-gray-400'}`}>
              {newMessage.length}/1000
            </span>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
