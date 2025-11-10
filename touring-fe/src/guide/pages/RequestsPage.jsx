import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/context";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { toast } from "sonner";


const RequestsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [requests, setRequests] = useState([]);
  const [highlightNew, setHighlightNew] = useState(true);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Fetch real requests from backend
  const { withAuth } = useAuth();
  
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await withAuth("/api/itinerary/guide/requests");
      if (data.success && Array.isArray(data.requests)) {
        // Map backend itinerary to request format for UI
        const mappedRequests = data.requests.map((it) => ({
          id: it._id,
          tourName: it.name || it.zoneName,
          customerId: it.userId?._id || it.userId,
          customerName: it.userId?.name || 'Khách hàng',
          customerAvatar: it.userId?.avatar?.url || '',
          customerEmail: it.userId?.email || '',
          contactPhone: it.userId?.phone || '',
          departureDate: it.preferredDate || '',
          startTime: it.startTime || '',
          endTime: it.endTime || '',
          location: it.zoneName,
          pickupPoint: '',
          numberOfGuests: it.numberOfPeople || '',
          duration: it.totalDuration ? `${Math.floor(it.totalDuration / 60)}h${it.totalDuration % 60}m` : '',
          totalPrice: it.estimatedCost || '',
          earnings: '',
          requestedAt: it.tourGuideRequest?.requestedAt,
          specialRequests: it.preferences?.specialRequests || '',
          paymentStatus: '',
          paymentMethod: '',
          imageItems: [],
          itinerary: it.items?.map(item => ({
            title: item.name,
            time: item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : '',
            description: item.address || ''
          })) || [],
          includedServices: [],
          raw: it
        }));
        setRequests(mappedRequests);
      }
    } catch (e) {
      console.error('Lỗi khi lấy yêu cầu tour guide:', e);
      toast.error('Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  }, [withAuth]);

  useEffect(() => {
    fetchRequests();
    const timer = setTimeout(() => setHighlightNew(false), 3000);
    return () => clearTimeout(timer);
  }, [fetchRequests]);

  // tính yêu cầu mới (trong 48h)
  const isNewRequest = (requestedAt) => {
    try {
      return new Date() - new Date(requestedAt) < 48 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  };

  // Filter requests based on time
  const filterRequestsByTime = (requests, filterValue) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (filterValue) {
      case 'today':
        return requests.filter(r => {
          try {
            const reqDate = new Date(r.requestedAt);
            return reqDate >= today;
          } catch {
            return false;
          }
        });
      case 'week':
        return requests.filter(r => {
          try {
            const reqDate = new Date(r.requestedAt);
            return reqDate >= weekAgo;
          } catch {
            return false;
          }
        });
      default:
        return requests;
    }
  };

  const filteredRequests = filterRequestsByTime(requests, filter);

  const filterOptions = [
    { value: "all", label: "Tất cả", count: requests.length },
    { value: "today", label: "Hôm nay", count: filterRequestsByTime(requests, 'today').length },
    { value: "week", label: "Tuần này", count: filterRequestsByTime(requests, 'week').length },
  ];

  const handleAccept = async (requestId) => {
    try {
      setProcessingId(requestId);
      const response = await withAuth(`/api/itinerary/${requestId}/accept-tour-guide`, {
        method: 'POST'
      });
      
      if (response.success) {
        toast.success('Đã chấp nhận yêu cầu tour!');
        // Remove from list immediately
        setRequests(prev => prev.filter(r => r.id !== requestId));
      } else {
        toast.error(response.error || 'Không thể chấp nhận yêu cầu');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Có lỗi xảy ra khi chấp nhận yêu cầu');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      setProcessingId(requestId);
      const response = await withAuth(`/api/itinerary/${requestId}/reject-tour-guide`, {
        method: 'POST'
      });
      
      if (response.success) {
        toast.success('Đã từ chối yêu cầu');
        // Remove from list immediately
        setRequests(prev => prev.filter(r => r.id !== requestId));
      } else {
        toast.error(response.error || 'Không thể từ chối yêu cầu');
      }
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Có lỗi xảy ra khi từ chối yêu cầu');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu tour</h1>
        <p className="text-gray-500">Xem và phản hồi các yêu cầu tour từ khách hàng</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === option.value
                ? "bg-[#02A0AA] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {option.label} ({option.count})
          </button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-[#02A0AA] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500">Đang tải yêu cầu...</p>
          </div>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-6xl mb-4">📬</p>
          <p className="text-gray-500 mb-2">Không có yêu cầu</p>
          <p className="text-sm text-gray-400">
            Các yêu cầu tour mới sẽ hiển thị ở đây
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRequests.map((request) => {
            const isNew = isNewRequest(request.requestedAt);
            const isProcessing = processingId === request.id;
            return (
              <Card
                key={request.id}
                hover
                className={`transition-all duration-300 ${
                  highlightNew && isNew
                    ? "ring-2 ring-[#02A0AA] shadow-xl animate-pulse"
                    : ""
                } ${isProcessing ? "opacity-60 pointer-events-none" : ""}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={request.customerAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(request.customerName)}
                      alt={request.customerName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {request.customerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.requestedAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  {isNew && <Badge variant="warning">Mới</Badge>}
                </div>

                {/* Tour Info */}
                <h3 className="font-bold text-gray-900 mb-3 line-clamp-2">
                  {request.tourName}
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span>�</span>
                    <span className="text-gray-600 line-clamp-1">
                      {request.location}
                    </span>
                  </div>
                  {request.numberOfGuests && (
                    <div className="flex items-center gap-2">
                      <span>👥</span>
                      <span className="text-gray-600">
                        {request.numberOfGuests} khách
                      </span>
                    </div>
                  )}
                  {request.departureDate && (
                    <div className="flex items-center gap-2">
                      <span>�</span>
                      <span className="text-gray-600">
                        {new Date(request.departureDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  )}
                  {request.duration && (
                    <div className="flex items-center gap-2">
                      <span>⏱️</span>
                      <span className="text-gray-600">{request.duration}</span>
                    </div>
                  )}
                </div>

                {/* Itinerary Preview */}
                {request.itinerary && request.itinerary.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Lộ trình:</p>
                    <div className="space-y-1">
                      {request.itinerary.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                          <span className="text-[#02A0AA] font-bold">{idx + 1}.</span>
                          <span className="line-clamp-1">{item.title}</span>
                        </div>
                      ))}
                      {request.itinerary.length > 3 && (
                        <p className="text-xs text-gray-500 italic">
                          +{request.itinerary.length - 3} địa điểm khác...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Price */}
                {request.totalPrice && (
                  <div className="bg-emerald-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tổng giá</span>
                      <span className="text-lg font-bold text-[#02A0AA]">
                        {request.totalPrice.toLocaleString("vi-VN")} VND
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => navigate(`/guide/requests/${request.id}`)}
                    disabled={isProcessing}
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => handleDecline(request.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '...' : '❌'}
                  </Button>
                  <Button
                    variant="success"
                    size="md"
                    onClick={() => handleAccept(request.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '...' : '✅'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RequestsPage;
