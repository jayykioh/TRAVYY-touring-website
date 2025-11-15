import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  User, 
  MessageSquare, 
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Send
} from 'lucide-react';
import { useAuth } from '@/auth/context';
import { toast } from 'sonner';

export default function MyTourRequests() {
  const navigate = useNavigate();
  const auth = useAuth();
  const withAuth = auth?.withAuth;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const loadRequests = async () => {
    try {
      console.log('[MyTourRequests] Loading requests...', { hasWithAuth: !!withAuth });
      setLoading(true);
      
      if (!withAuth) {
        console.error('[MyTourRequests] withAuth not available');
        setLoading(false);
        return;
      }
      
      const data = await withAuth('/api/tour-requests');
      console.log('[MyTourRequests] Response:', data);
      setRequests(data.requests || []);
      console.log('[MyTourRequests] Set requests:', data.requests?.length || 0);
    } catch (error) {
      console.error('[MyTourRequests] Error loading requests:', error);
      toast.error('Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[MyTourRequests] Component mounted, loading...');
    if (withAuth) {
      loadRequests();
    } else {
      console.log('[MyTourRequests] Waiting for auth...');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withAuth]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedRequest) return;

    setSending(true);
    try {
      await withAuth(`/api/tour-requests/${selectedRequest._id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() })
      });
      
      toast.success('Đã gửi tin nhắn');
      setMessage('');
      loadRequests();
    } catch {
      toast.error('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleAcceptOffer = async (requestId) => {
    try {
      // First accept the offer
      await withAuth(`/api/tour-requests/${requestId}/accept`, {
        method: 'POST'
      });
      
      toast.success('Đã chấp nhận đề xuất!');
      
      // Then create booking
      const bookingResponse = await withAuth(`/api/tour-requests/${requestId}/create-booking`, {
        method: 'POST'
      });
      
      if (bookingResponse.success && bookingResponse.booking) {
        toast.success('Booking đã được tạo! Chuyển đến trang thanh toán...');
        // Redirect to custom tour payment page
        setTimeout(() => {
          navigate(`/payment/custom-tour/${bookingResponse.booking._id}`);
        }, 1500);
      }
      
      loadRequests();
    } catch {
      toast.error('Không thể chấp nhận đề xuất');
    }
  };

  const handleRejectOffer = async (requestId) => {
    try {
      await withAuth(`/api/tour-requests/${requestId}/reject-offer`, {
        method: 'POST'
      });
      
      toast.success('Đã từ chối đề xuất');
      loadRequests();
    } catch {
      toast.error('Không thể từ chối đề xuất');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      claimed: 'bg-blue-100 text-blue-800',
      negotiating: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      pending: 'Chờ xử lý',
      claimed: 'Đã nhận',
      negotiating: 'Đang thương lượng',
      accepted: 'Đã chấp nhận',
      rejected: 'Đã từ chối',
      expired: 'Hết hạn'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#02A0AA]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yêu cầu Tour của tôi</h1>
              <p className="text-sm text-gray-600 mt-1">
                Quản lý và theo dõi các yêu cầu tour guide
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có yêu cầu nào
            </h3>
            <p className="text-gray-600 mb-6">
              Tạo một hành trình AI và gửi yêu cầu đến hướng dẫn viên
            </p>
            <button
              onClick={() => navigate('/itinerary')}
              className="px-6 py-3 bg-[#02A0AA] text-white rounded-lg hover:bg-[#029ca6] transition-colors font-medium"
            >
              Tạo hành trình ngay
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Request Header */}
                <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {request.tourDetails?.zoneName || request.itineraryId?.zoneName || 'Tour Request'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {request.tourDetails?.numberOfGuests || 1} người
                        </span>
                        <span className="font-mono text-gray-500">
                          #{request.requestNumber}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  {/* Guide Info */}
                  {request.guideId && request.guideId._id && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#02A0AA] to-[#029ca6] flex items-center justify-center text-white font-bold">
                          {request.guideId.name?.charAt(0).toUpperCase() || 'G'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            Hướng dẫn viên: {request.guideId.name || 'Chưa có tên'}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>⭐ {(request.guideId.profile?.rating || request.guideId.rating || 5.0).toFixed(1)}</span>
                            {request.guideId.phone && (
                              <span className="text-gray-400">•</span>
                            )}
                            {request.guideId.phone && (
                              <span>📞 {request.guideId.phone}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Request Body */}
                <div className="p-6">
                  {/* Price Information */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-900 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-medium">Ngân sách của bạn</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {(request.initialBudget?.amount || 0).toLocaleString('vi-VN')} {request.initialBudget?.currency || 'VND'}
                      </p>
                    </div>

                    {request.priceOffers && request.priceOffers.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-900 mb-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm font-medium">Đề xuất của HDV</span>
                        </div>
                        <p className="text-2xl font-bold text-green-900">
                          {(request.priceOffers[request.priceOffers.length - 1].amount || 0).toLocaleString('vi-VN')} {request.priceOffers[request.priceOffers.length - 1].currency || 'VND'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Special Requirements */}
                  {request.specialRequirements && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Yêu cầu đặc biệt</h4>
                      <p className="text-gray-600 text-sm bg-gray-50 rounded-lg p-3">
                        {request.specialRequirements}
                      </p>
                    </div>
                  )}

                  {/* Messages */}
                  {request.messages && request.messages.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Tin nhắn ({request.messages.length})
                      </h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {request.messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg ${
                              msg.sender === 'user'
                                ? 'bg-blue-50 ml-8'
                                : 'bg-gray-50 mr-8'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-700">
                                {msg.sender === 'user' ? 'Bạn' : 'Hướng dẫn viên'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(msg.timestamp).toLocaleString('vi-VN')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800">{msg.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {request.status === 'negotiating' && (
                    <div className="space-y-3">
                      {/* Send Message */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={selectedRequest?._id === request._id ? message : ''}
                          onChange={(e) => {
                            setSelectedRequest(request);
                            setMessage(e.target.value);
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              setSelectedRequest(request);
                              handleSendMessage();
                            }
                          }}
                          placeholder="Nhập tin nhắn..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02A0AA] focus:border-transparent"
                        />
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            handleSendMessage();
                          }}
                          disabled={sending || !message.trim()}
                          className="px-4 py-2 bg-[#02A0AA] text-white rounded-lg hover:bg-[#029ca6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Accept/Reject Counter Offer */}
                      {request.priceOffers && request.priceOffers.length > 0 && request.priceOffers[request.priceOffers.length - 1].offeredBy === 'guide' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAcceptOffer(request._id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Chấp nhận đề xuất
                          </button>
                          <button
                            onClick={() => handleRejectOffer(request._id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                          >
                            <XCircle className="w-5 h-5" />
                            Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* View Itinerary Button */}
                  {request.itineraryId && (
                    <div className="mt-4 pt-4 border-t">
                      <button
                        onClick={() => navigate(`/itinerary/result/${request.itineraryId._id || request.itineraryId}`)}
                        className="w-full px-4 py-2 border-2 border-[#02A0AA] text-[#02A0AA] rounded-lg hover:bg-[#02A0AA] hover:text-white transition-colors font-medium"
                      >
                        Xem hành trình
                      </button>
                    </div>
                  )}

                  {/* Expiry Timer */}
                  {request.expiresAt && request.status === 'pending' && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        Hết hạn: {new Date(request.expiresAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )}

                  
               
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
