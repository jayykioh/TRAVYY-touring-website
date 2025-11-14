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
      const data = await withAuth("/api/guide/custom-requests?status=pending,negotiating");
      console.log('[RequestsPage] Raw API response:', data);
      
      const requestsArray = data.tourRequests || data.requests || [];
      
      if (Array.isArray(requestsArray)) {
        // Map TourCustomRequest to UI format
        const mappedRequests = requestsArray.map((req) => {
          const itinerary = req.itineraryId || {};
          const customer = req.userId || {};
          
          // Get preferred date
          const preferredDate = req.preferredDates?.[0] || {};
          const startDate = preferredDate.startDate ? new Date(preferredDate.startDate) : null;
          const endDate = preferredDate.endDate ? new Date(preferredDate.endDate) : null;
          
          // Calculate duration in days
          let durationDays = 1;
          if (startDate && endDate) {
            durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;
          }
          
          return {
            id: req._id,
            requestNumber: req.requestNumber || req._id.slice(-6),
            
            // Tour info
            tourName: req.tourDetails?.zoneName || itinerary.zoneName || itinerary.name || 'Custom Tour',
            location: req.tourDetails?.zoneName || itinerary.zoneName || req.tourDetails?.province || '',
            numberOfGuests: req.tourDetails?.numberOfGuests || req.tourDetails?.numberOfPeople || 1,
            numberOfDays: durationDays,
            
            // Customer info
            customerId: customer._id || '',
            customerName: customer.name || 'Khách hàng',
            customerAvatar: customer.avatar?.url || customer.avatar || '',
            customerEmail: customer.email || req.contactInfo?.email || '',
            contactPhone: customer.phone || req.contactInfo?.phone || '',
            
            // Dates
            departureDate: startDate ? startDate.toISOString() : '',
            returnDate: endDate ? endDate.toISOString() : '',
            startTime: startDate ? startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
            endTime: endDate ? endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
            
            // Pricing
            totalPrice: req.initialBudget?.amount || 0,
            currency: req.initialBudget?.currency || 'VND',
            earnings: Math.round((req.initialBudget?.amount || 0) * 0.8), // 80% commission
            
            // Duration
            duration: itinerary.totalDuration ? 
              `${Math.floor(itinerary.totalDuration / 60)}h ${itinerary.totalDuration % 60}m` : 
              `${durationDays} ngày`,
            
            // Other info
            requestedAt: req.createdAt,
            specialRequests: req.specialRequirements || req.tourDetails?.specialRequirements || '',
            status: req.status,
            negotiationHistory: req.negotiationHistory || [],
            
            // Itinerary items
            itinerary: (itinerary.items || []).map(item => ({
              title: item.name || item.placeName || 'Điểm tham quan',
              time: item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : item.timeSlot || '',
              description: item.address || item.description || '',
              duration: item.duration || ''
            })),
            
            pickupPoint: itinerary.items?.[0]?.address || req.tourDetails?.pickupLocation || '',
            
            // Keep raw data for detailed view
            raw: req,
            rawItinerary: itinerary
          };
        });
        
        console.log('[RequestsPage] Mapped requests:', mappedRequests);
        setRequests(mappedRequests);
      } else {
        console.warn('[RequestsPage] Invalid response format:', data);
        setRequests([]);
      }
    } catch (e) {
      console.error('[RequestsPage] Error fetching requests:', e);
      toast.error('Không thể tải danh sách yêu cầu');
      setRequests([]);
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
      console.log('[RequestsPage] Accepting request:', requestId);
      
      const response = await withAuth(`/api/guide/custom-requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalAmount: 0, // Will be set by backend based on negotiation
          currency: 'VND'
        })
      });
      
      console.log('[RequestsPage] Accept response:', response);
      
      if (response.success) {
        toast.success('✅ Đã chấp nhận yêu cầu tour!');
        // Remove from list immediately for better UX
        setRequests(prev => prev.filter(r => r.id !== requestId));
        // Refetch after short delay to ensure backend state is synchronized
        setTimeout(() => {
          console.log('[RequestsPage] Refetching after accept');
          fetchRequests();
        }, 800);
      } else {
        toast.error(response.error || 'Không thể chấp nhận yêu cầu');
      }
    } catch (error) {
      console.error('[RequestsPage] Error accepting request:', error);
      toast.error('❌ Có lỗi xảy ra: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      setProcessingId(requestId);
      console.log('[RequestsPage] Declining request:', requestId);
      
      const response = await withAuth(`/api/guide/custom-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Declined by guide'
        })
      });
      
      console.log('[RequestsPage] Decline response:', response);
      
      if (response.success) {
        toast.success('✅ Đã từ chối yêu cầu');
        // Remove from list immediately for better UX
        setRequests(prev => prev.filter(r => r.id !== requestId));
        // Refetch after short delay to ensure backend state is synchronized
        setTimeout(() => {
          console.log('[RequestsPage] Refetching after decline');
          fetchRequests();
        }, 800);
      } else {
        toast.error(response.error || 'Không thể từ chối yêu cầu');
      }
    } catch (error) {
      console.error('[RequestsPage] Error declining request:', error);
      toast.error('❌ Có lỗi xảy ra: ' + (error.message || 'Lỗi không xác định'));
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={request.customerAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(request.customerName)}
                      alt={request.customerName}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {request.customerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.requestedAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  {isNew && <Badge variant="warning" className="ml-2 flex-shrink-0">Mới</Badge>}
                </div>

                {/* Tour Info */}
                <h3 className="font-bold text-gray-900 mb-3 line-clamp-2">
                  {request.tourName}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 text-xs sm:text-sm">
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
                {request.totalPrice > 0 && (
                  <div className="bg-emerald-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Ngân sách</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {request.totalPrice.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Thu nhập của bạn (80%)</span>
                      <span className="text-sm font-semibold text-[#02A0AA]">
                        ~{request.earnings.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Special Requests */}
                {request.specialRequests && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                    <p className="text-xs font-semibold text-yellow-800 mb-1">Yêu cầu đặc biệt:</p>
                    <p className="text-xs text-yellow-700 line-clamp-2">{request.specialRequests}</p>
                  </div>
                )}
                
                {/* Contact Info */}
                <div className="flex gap-2 mb-4 text-xs">
                  {request.contactPhone && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <span>📞</span>
                      <span>{request.contactPhone}</span>
                    </div>
                  )}
                  {request.customerEmail && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <span>📧</span>
                      <span className="line-clamp-1">{request.customerEmail}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => navigate(`/guide/requests/${request.id}`)}
                    disabled={isProcessing}
                    className="text-sm"
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="px-3 py-2"
                    onClick={() => handleDecline(request.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '...' : '❌'}
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    className="px-3 py-2"
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
