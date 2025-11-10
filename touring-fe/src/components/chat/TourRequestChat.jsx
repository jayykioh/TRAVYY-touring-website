import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, X, Download, Edit2, Trash2, CheckCheck, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { format } from 'date-fns';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function TourRequestChat({ requestId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat history
  const fetchMessages = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
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
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  // Send text message
  const sendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    try {
      setSending(true);
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
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
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

  // Poll for new messages
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [requestId, fetchMessages]);

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
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Chat with {currentUser.role === 'user' ? 'Tour Guide' : 'Traveller'}</h3>
          {unreadCount > 0 && (
            <span className="text-sm text-blue-600">{unreadCount} unread message(s)</span>
          )}
        </div>
      </div>

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
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.sender.userId?.avatar} />
                      <AvatarFallback>
                        {message.sender.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Message Content */}
                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      <div className="text-xs text-gray-500 mb-1">
                        {message.sender.name}
                      </div>
                      
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 border'
                        }`}
                      >
                        {/* Text content */}
                        {message.content && (
                          <p className="whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}

                        {/* File attachments */}
                        {message.messageType === 'file' && message.attachments?.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((file, index) => (
                              <div
                                key={index}
                                className={`flex items-center gap-2 p-2 rounded ${
                                  isOwn ? 'bg-blue-700' : 'bg-gray-100'
                                }`}
                              >
                                <Paperclip className="w-4 h-4" />
                                <span className="text-sm flex-1 truncate">
                                  {file.filename}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => downloadFile(file.fileId, file.filename)}
                                  className={isOwn ? 'text-white hover:bg-blue-800' : ''}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Timestamp and read status */}
                        <div className={`text-xs mt-1 flex items-center gap-1 ${
                          isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {format(new Date(message.createdAt), 'HH:mm')}
                          {isOwn && (
                            message.isRead ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )
                          )}
                        </div>
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
      <div className="p-4 border-t bg-white">
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
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            disabled={sending}
          />

          <Button
            onClick={sendMessage}
            disabled={sending || (!newMessage.trim() && selectedFiles.length === 0)}
            className="px-6"
          >
            {sending ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Max 5 files, 10MB each. Supported: Images, PDF, DOC, XLS, TXT
        </div>
      </div>
    </Card>
  );
}
