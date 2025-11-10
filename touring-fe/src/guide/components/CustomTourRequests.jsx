import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Calendar,
  User,
  MapPin,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function CustomTourRequests({ withAuth }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await withAuth('/api/guide/custom-requests');
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error loading custom requests:', error);
      toast.error('Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClaim = async (requestId) => {
    try {
      await withAuth(`/api/guide/custom-requests/${requestId}/claim`, {
        method: 'POST'
      });
      toast.success('Đã nhận yêu cầu thành công');
      loadRequests();
    } catch {
      toast.error('Không thể nhận yêu cầu');
    }
  };

  const handleCounterOffer = async (requestId) => {
    if (!counterPrice || parseFloat(counterPrice) <= 0) {
      toast.error('Vui lòng nhập giá hợp lệ');
      return;
    }

    setSubmitting(true);
    try {
      await withAuth(`/api/guide/custom-requests/${requestId}/counter-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          counterPrice: parseFloat(counterPrice),
          message: message.trim()
        })
      });
      
      toast.success('Đã gửi đề xuất giá');
      setCounterPrice('');
      setMessage('');
      setSelectedRequest(null);
      loadRequests();
    } catch {
      toast.error('Không thể gửi đề xuất');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (requestId) => {
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      await withAuth(`/api/guide/custom-requests/${requestId}/message`, {
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
      setSubmitting(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await withAuth(`/api/guide/custom-requests/${requestId}/accept`, {
        method: 'POST'
      });
      
      toast.success('Đã chấp nhận yêu cầu thành công!');
      loadRequests();
    } catch {
      toast.error('Không thể chấp nhận yêu cầu');
    }
  };

  const handleReject = async (requestId, reason) => {
    try {
      await withAuth(`/api/guide/custom-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      toast.success('Đã từ chối yêu cầu');
      loadRequests();
    } catch {
      toast.error('Không thể từ chối yêu cầu');
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#02A0AA]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Chưa có yêu cầu custom tour nào</p>
        </div>
      ) : (
        requests.map((request) => (
          <div
            key={request._id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {request.itineraryId?.zoneName || 'Custom Tour Request'}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {request.numberOfPeople} người
                    </span>
                    {request.preferredDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(request.preferredDate).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                    <span className="font-mono text-gray-500">
                      #{request.requestNumber}
                    </span>
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>

              {/* Customer Info */}
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {request.userId?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {request.userId?.name || 'Khách hàng'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {request.userId?.email || ''}
                    </p>
                    {request.contactPhone && (
                      <p className="text-sm text-gray-600">📞 {request.contactPhone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-900 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">Ngân sách khách</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {request.proposedPrice?.toLocaleString('vi-VN')} đ
                  </p>
                </div>

                {request.guideCounterPrice && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-900 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">Đề xuất của bạn</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {request.guideCounterPrice?.toLocaleString('vi-VN')} đ
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
                          msg.sender === 'guide'
                            ? 'bg-[#02A0AA]/10 ml-8'
                            : 'bg-gray-50 mr-8'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-700">
                            {msg.sender === 'guide' ? 'Bạn' : 'Khách hàng'}
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

              {/* Actions */}
              {request.status === 'pending' && !request.claimedBy && (
                <button
                  onClick={() => handleClaim(request._id)}
                  className="w-full px-4 py-3 bg-[#02A0AA] text-white rounded-lg hover:bg-[#029ca6] transition-colors font-medium"
                >
                  Nhận yêu cầu này
                </button>
              )}

              {request.status === 'claimed' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Giá đề xuất (VND)"
                      value={selectedRequest?._id === request._id ? counterPrice : ''}
                      onChange={(e) => {
                        setSelectedRequest(request);
                        setCounterPrice(e.target.value);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02A0AA] focus:border-transparent"
                    />
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        handleCounterOffer(request._id);
                      }}
                      disabled={submitting || !counterPrice}
                      className="px-4 py-2 bg-[#02A0AA] text-white rounded-lg hover:bg-[#029ca6] transition-colors disabled:opacity-50 font-medium"
                    >
                      Gửi đề xuất
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Tin nhắn cho khách hàng..."
                    value={selectedRequest?._id === request._id ? message : ''}
                    onChange={(e) => {
                      setSelectedRequest(request);
                      setMessage(e.target.value);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02A0AA] focus:border-transparent resize-none"
                  />
                </div>
              )}

              {request.status === 'negotiating' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập tin nhắn..."
                      value={selectedRequest?._id === request._id ? message : ''}
                      onChange={(e) => {
                        setSelectedRequest(request);
                        setMessage(e.target.value);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          setSelectedRequest(request);
                          handleSendMessage(request._id);
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02A0AA] focus:border-transparent"
                    />
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        handleSendMessage(request._id);
                      }}
                      disabled={submitting || !message.trim()}
                      className="px-4 py-2 bg-[#02A0AA] text-white rounded-lg hover:bg-[#029ca6] transition-colors disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAccept(request._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Chấp nhận deal
                    </button>
                    <button
                      onClick={() => handleReject(request._id, 'Không thể đạt được thỏa thuận')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      <XCircle className="w-5 h-5" />
                      Từ chối
                    </button>
                  </div>
                </div>
              )}

              {/* Expiry Timer */}
              {request.expiresAt && ['pending', 'claimed', 'negotiating'].includes(request.status) && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    Hết hạn: {new Date(request.expiresAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
