import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MapPin, X, Paperclip, Download, Edit2, Trash2, AlertCircle, ChevronDown, ChevronUp, Calendar, CheckCheck, Check, Users, Clock, Map } from 'lucide-react';
import { useAuth } from '../auth/context';
import { useNavigate } from 'react-router-dom';
import { useTourRequestChat } from '../hooks/useTourRequestChat';
import PriceAgreementCard from './chat/PriceAgreementCard';
import { format } from 'date-fns';

const TravellerChatBox = ({ requestId, guideName, tourInfo }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showTourInfo, setShowTourInfo] = useState(true);
  const [showItinerary, setShowItinerary] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [error, setError] = useState(null);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
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
    sendFileMessage,
    socketError,
    reconnectAttempts
  } = useTourRequestChat(requestId, '/api/chat');

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    console.log('[TravellerChatBox] Component state:', {
      requestId,
      hasRequestDetails: !!requestDetails,
      requestDetailsKeys: requestDetails ? Object.keys(requestDetails) : [],
      hasTourDetails: !!requestDetails?.tourDetails,
      tourDetailsItemsCount: requestDetails?.tourDetails?.items?.length || 0,
      hasMinPrice: !!requestDetails?.minPrice,
      minPriceAmount: requestDetails?.minPrice?.amount,
      agreement: requestDetails?.agreement,
      bothAgreed: requestDetails?.agreement?.userAgreed && requestDetails?.agreement?.guideAgreed
    });
  }, [requestId, requestDetails]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    const messageText = newMessage.trim();
    let success = false;

    try {
      if (selectedFiles.length > 0) {
        success = await sendFileMessage(messageText || `Sent ${selectedFiles.length} file(s)`, selectedFiles);
      } else {
        success = await sendMessageAPI(messageText);
      }
      
      if (success) {
        setNewMessage('');
        setSelectedFiles([]);
        setError(null);
        scrollToBottom();
      } else {
        setError('Gửi tin nhắn thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      setError(err.message || 'Gửi tin nhắn thất bại. Vui lòng thử lại.');
      console.error('Error sending message:', err);
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
    if (window.confirm('Bạn chắc chắn muốn xóa tin nhắn này?')) {
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
    setError(null);
    
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

  const handleProceedToPayment = async () => {
    // Validate status first
    if (requestDetails?.status !== 'accepted' && requestDetails?.status !== 'agreement_pending') {
      alert('⚠️ Yêu cầu chưa được guide chấp nhận chính thức. Vui lòng đợi.');
      return;
    }

    // Double check that both parties agreed
    if (!requestDetails?.agreement?.userAgreed || !requestDetails?.agreement?.guideAgreed) {
      alert('⚠️ Cả hai bên phải đồng ý trước khi thanh toán');
      return;
    }

    // Get final agreed price (should use finalPrice if available, otherwise latestOffer or initialBudget)
    const finalAmount = requestDetails?.finalPrice?.amount || requestDetails?.latestOffer?.amount || requestDetails?.initialBudget?.amount;
    
    if (!finalAmount || finalAmount <= 0) {
      alert('❌ Không có giá hợp lệ để thanh toán');
      return;
    }

    // Show confirmation modal
    setShowPaymentConfirmation(true);
  };

  const confirmPayment = async () => {
    setShowPaymentConfirmation(false);

    const finalAmount = requestDetails?.finalPrice?.amount || requestDetails?.latestOffer?.amount || requestDetails?.initialBudget?.amount;
    const itinerary = requestDetails?.tourDetails?.items || [];
    const zoneName = requestDetails?.tourDetails?.zoneName || '';
    const numberOfDays = requestDetails?.tourDetails?.numberOfDays || 1;

    console.log('[TravellerChatBox] Proceeding to payment:', {
      requestId,
      finalAmount,
      itinerary: itinerary.length,
      zoneName,
      numberOfDays,
      agreement: requestDetails?.agreement,
      status: requestDetails?.status
    });

    navigate('/booking', {
      state: {
        mode: 'tour-request',
        requestId: requestId,
        tourInfo: requestDetails,
        itinerary: itinerary,
        zoneName: zoneName,
        numberOfDays: numberOfDays,
        numberOfGuests: requestDetails?.numberOfGuests || 1,
        totalAmount: finalAmount,
        summaryItems: [{
          id: requestId,
          name: `Tour tùy chỉnh - ${zoneName}`,
          image: itinerary[0]?.image || '',
          price: finalAmount,
          originalPrice: finalAmount,
          numberOfDays: numberOfDays,
          itinerary: itinerary,
          zoneName: zoneName,
        }]
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* HEADER - Apple Style */}
      <div className="px-5 py-4 bg-white border-b border-gray-200/80 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                {(guideName || "G")[0].toUpperCase()}
              </div>
              {connected && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-[2.5px] border-white shadow-sm" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base leading-tight">
                {guideName || "Tour Guide"}
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

          {/* Toggle tour info */}
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

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Socket Error Banner */}
      {socketError && (
        <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800 flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="text-sm text-orange-700 dark:text-orange-400">
            {socketError}
            {reconnectAttempts > 0 && ` (Thử lần ${reconnectAttempts})`}
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-800" role="log" aria-live="polite" aria-label="Chat messages">
        {/* Tour Info Card - Collapsible */}
        {tourInfo && showTourInfo && (
          <div className="bg-linear-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-3 border-2 border-teal-200 dark:border-teal-700 shadow-sm transition-all duration-300">
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

        {/* Itinerary Toggle Button - Always Available */}
        {(tourInfo || requestDetails?.tourDetails?.items) && (
          <button
            onClick={() => setShowItinerary(!showItinerary)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 border-2 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2"
          >
            <Map className="w-4 h-4" />
            {showItinerary ? 'Ẩn hành trình' : 'Xem hành trình chi tiết'}
          </button>
        )}

        {/* Itinerary Details - Collapsible */}
        {showItinerary && requestDetails?.tourDetails?.items && (
          <div className="bg-white dark:bg-gray-700 rounded-xl p-3 border-2 border-blue-200 dark:border-blue-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <Map className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Hành trình ({requestDetails.tourDetails.items.length} điểm)
              </h4>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {requestDetails.tourDetails.items.map((item, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-600 rounded-lg p-2 border border-gray-200 dark:border-gray-500">
                  <div className="flex items-start gap-2">
                    <div className="shrink-0 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {item.name}
                      </div>
                      {item.address && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {item.address}
                        </div>
                      )}
                      {(item.startTime || item.duration) && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-300">
                          {item.startTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.startTime}
                            </span>
                          )}
                          {item.duration && (
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                              {item.duration} phút
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request Details & Price Info Card */}
        {requestDetails && (
          <div className="bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-3 border-2 border-amber-200 dark:border-amber-700 shadow-sm">
            <div className="space-y-2 text-sm">
              <div className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                💰 Thông tin giá
              </div>
              
              {/* Initial Budget */}
              <div className="flex items-center justify-between bg-white/70 dark:bg-gray-700/70 p-2 rounded-lg">
                <span className="text-xs text-gray-600 dark:text-gray-400">Giá bạn đề xuất:</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {requestDetails.initialBudget?.amount?.toLocaleString('vi-VN')} {requestDetails.initialBudget?.currency || 'VND'}
                </span>
              </div>

              {/* Guide's Counter Offer */}
              {requestDetails.latestOffer && (
                <div className="flex items-center justify-between bg-white/70 dark:bg-gray-700/70 p-2 rounded-lg border-l-4 border-green-500">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Giá guide đề xuất:</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {requestDetails.latestOffer.amount?.toLocaleString('vi-VN')} {requestDetails.latestOffer.currency || 'VND'}
                  </span>
                </div>
              )}

              {/* Number of Guests */}
              {requestDetails.numberOfGuests && (
                <div className="flex items-center justify-between bg-white/70 dark:bg-gray-700/70 p-2 rounded-lg">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Số lượng khách:</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {requestDetails.numberOfGuests} người
                  </span>
                </div>
              )}

              {/* Agreement Status */}
              {requestDetails.status && (
                <div className="flex items-center justify-between bg-white/70 dark:bg-gray-700/70 p-2 rounded-lg">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Trạng thái:</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    requestDetails.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    requestDetails.status === 'agreed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    requestDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                    {requestDetails.status === 'confirmed' ? '✅ Đã xác nhận' :
                     requestDetails.status === 'agreed' ? '✅ Đã thỏa thuận' :
                     requestDetails.status === 'pending' ? '⏳ Chờ xử lý' :
                     requestDetails.status}
                  </span>
                </div>
              )}

              {/* Minimum Price (set by guide) */}
              {requestDetails.minPrice?.amount && (
                <div className="flex items-center justify-between bg-orange-100/70 dark:bg-orange-900/30 p-2 rounded-lg border-l-4 border-orange-500">
                  <span className="text-xs text-orange-700 dark:text-orange-300 font-medium">🔐 Giá tối thiểu guide:</span>
                  <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                    {requestDetails.minPrice.amount.toLocaleString('vi-VN')} {requestDetails.minPrice.currency || 'VND'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Price Agreement Card */}
        {requestDetails && (
          <PriceAgreementCard
            requestDetails={requestDetails}
            userRole="user"
            onSendOffer={sendOffer}
            onAgree={agreeToTerms}
            loading={sending}
          />
        )}

        {/* Payment Initiation Card - Always show when request details are available */}
        {requestDetails && (() => {
          const userAgreed = requestDetails?.agreement?.userAgreed;
          const guideAgreed = requestDetails?.agreement?.guideAgreed;
          const bothAgreed = userAgreed && guideAgreed;
          const status = requestDetails?.status;
          
          console.log('[TravellerChatBox] Payment card check:', {
            requestDetails: !!requestDetails,
            agreement: requestDetails?.agreement,
            userAgreed,
            guideAgreed,
            bothAgreed,
            status
          });
          
          return (
            <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border-2 border-green-300 dark:border-green-700 shadow-md">
              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white">
                  <span>💳</span>
                </div>
                <div className="font-bold text-green-700 dark:text-green-300">
                  {bothAgreed ? 'Cả hai bên đã đồng ý giá' : 'Thanh toán tour'}
                </div>
              </div>

              {/* Agreement Status */}
              {!bothAgreed && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <div className="font-semibold mb-1">Trạng thái thỏa thuận:</div>
                    <div className="flex flex-col gap-1 text-sm">
                    <div>
                      <span className="font-semibold">Bạn (Khách hàng):</span>
                      {userAgreed ? ' ✅ Đã đồng ý' : ' ⏳ Chưa đồng ý'}
                    </div>

                    <div>
                      <span className="font-semibold">Hướng dẫn viên:</span>
                      {guideAgreed ? ' ✅ Đã đồng ý' : ' ⏳ Chưa đồng ý'}
                    </div>
                  </div>

                    <div className="mt-2 text-xs">
                      Bạn có thể tiến hành thanh toán ngay khi đã thỏa thuận xong giá.
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="space-y-3">
                {/* Tour Information */}
                <div className="bg-white/70 dark:bg-gray-700/70 rounded-lg p-3 border-l-4 border-green-500">
                  <div className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                    📍 Thông tin tour
                  </div>
                  <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Địa điểm:</span>
                      <span className="font-medium">{requestDetails.tourDetails?.zoneName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Số ngày:</span>
                      <span className="font-medium">{requestDetails.tourDetails?.numberOfDays || 1} ngày</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Số khách:</span>
                      <span className="font-medium">{requestDetails.numberOfGuests || 1} người</span>
                    </div>
                  </div>
                </div>

                {/* Itinerary Preview */}
                {requestDetails.tourDetails?.items && requestDetails.tourDetails.items.length > 0 && (
                  <div className="bg-white/70 dark:bg-gray-700/70 rounded-lg p-3">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                      📋 Hành trình tour
                    </div>
                    <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                      {requestDetails.tourDetails.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="font-bold text-green-600 dark:text-green-400 min-w-4">
                            {idx + 1}.
                          </span>
                          <span className="flex-1">
                            {item.name || item.activity || `Điểm dừng ${idx + 1}`}
                          </span>
                        </div>
                      ))}
                      {requestDetails.tourDetails.items.length > 3 && (
                        <div className="text-gray-600 dark:text-gray-400 italic">
                          + {requestDetails.tourDetails.items.length - 3} điểm khác
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Final Price */}
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-lg p-3 border border-green-400 dark:border-green-600">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Giá tour
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {(requestDetails.finalPrice?.amount || requestDetails.latestOffer?.amount || requestDetails.initialBudget?.amount)?.toLocaleString('vi-VN')} VND
                  </div>
                </div>

                {/* Payment Button */}
                <div className="space-y-2">
                  <button
                    onClick={handleProceedToPayment}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-base"
                  >
                    <span>💳</span>
                    Thanh toán
                  </button>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                  Bạn sẽ được chuyển đến trang thanh toán để hoàn tất giao dịch
                </div>
              </div>
            </div>
          );
        })()}

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
              // Handle both ObjectId and string formats for userId comparison
              const senderUserId = msg.sender?.userId?._id || msg.sender?.userId?.toString() || msg.sender?.userId;
              const currentUserId = user?._id?.toString() || user?._id;
              const isMyMessage = msg.sender?.role === 'user' && senderUserId === currentUserId;
              const senderName = isMyMessage 
                ? 'Bạn' 
                : (msg.sender?.name || guideName || 'Tour Guide');
              
              console.log('[TravellerChatBox] Rendering message:', {
                id: msg._id,
                isMyMessage,
                role: msg.sender?.role,
                senderUserId,
                currentUserId,
                senderName
              });
              
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

                          {/* Edited indicator */}
                          {msg.edited && (
                            <span className={`text-xs italic ${
                              isMyMessage ? 'text-teal-100' : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              (đã chỉnh sửa)
                            </span>
                          )}

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
                              {format(new Date(msg.createdAt || msg.timestamp), 'HH:mm')}
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
                            
                            {/* Read status */}
                            {isMyMessage && (
                              <div className="flex items-center">
                                {msg.isRead ? (
                                  <CheckCheck className="w-3 h-3 text-teal-100" />
                                ) : (
                                  <Check className="w-3 h-3 text-teal-200" />
                                )}
                              </div>
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
            
            {/* Typing indicator - only show when guide is typing (not self) */}
            {typingUsers && typingUsers.size > 0 && (() => {
              const typingArray = Array.from(typingUsers);
              const currentUserId = user?._id?.toString() || user?.id;
              const otherTyping = typingArray.filter(t => t !== currentUserId);
              
              return otherTyping.length > 0 && (
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
              );
            })()}
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

      {/* INPUT - Apple Messages Style */}
      <form 
        onSubmit={handleSendMessage}
        className="px-4 py-3.5 bg-white border-t border-gray-200/80 backdrop-blur-xl"
      >
        {/* Attached Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl border border-blue-200"
              >
                <Paperclip className="w-4 h-4 text-blue-600" />
                <span className="text-sm truncate max-w-[150px] text-gray-700">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2.5 bg-gray-100 rounded-[26px] px-4 py-2.5 hover:bg-gray-150 transition-colors duration-200">
          {/* File Upload Button */}
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
            className="p-1.5 hover:bg-gray-200 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title="Đính kèm file"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          {/* Message Input */}
          <textarea
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Tin nhắn..."
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-900 placeholder-gray-400 leading-tight resize-none min-h-[40px] max-h-[120px]"
            disabled={sending || !connected}
            rows={1}
            style={{ height: 'auto' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          
          <button
            type="submit"
            disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending}
            className={`p-2 rounded-full transition-all duration-200 ${
              (newMessage.trim() || selectedFiles.length > 0) && !sending
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
        
        {!connected && (
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg animate-pulse">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Đang kết nối chat...
          </div>
        )}
      </form>

      {/* Payment Confirmation Modal */}
      {showPaymentConfirmation && (() => {
        const finalAmount = requestDetails?.finalPrice?.amount || requestDetails?.latestOffer?.amount || requestDetails?.initialBudget?.amount;
        return (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-[10000]" 
              onClick={() => setShowPaymentConfirmation(false)}
            ></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10001] w-[90%] max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Xác nhận thanh toán</h3>
                <button
                  onClick={() => setShowPaymentConfirmation(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">Bạn sắp thanh toán cho tour:</p>
                
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 rounded-xl border-2 border-teal-300 dark:border-teal-700">
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">
                    {requestDetails?.tourDetails?.zoneName || 'Tour'}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Số khách:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {requestDetails?.numberOfGuests || 1} người
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Số điểm tham quan:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {requestDetails?.tourDetails?.items?.length || 0} điểm
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-teal-300 dark:border-teal-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Tổng tiền:</span>
                      <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                        {finalAmount?.toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-800 dark:text-orange-300">
                      ⚠️ Sau khi thanh toán, yêu cầu sẽ được xác nhận và bạn không thể hủy. 
                      Vui lòng đọc kỹ điều khoản trước khi xác nhận.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPaymentConfirmation(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-medium transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmPayment}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Xác nhận thanh toán
                </button>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
};

export default TravellerChatBox;