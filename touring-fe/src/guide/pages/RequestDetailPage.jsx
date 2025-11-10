import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Clock,
  DollarSign,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
  Navigation
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const RequestDetailPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { withAuth } = useAuth();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchRequestDetail = async () => {
    try {
      setLoading(true);
      const data = await withAuth(`/api/itinerary/${requestId}`);
      
      if (data.success && data.itinerary) {
        setRequest(data.itinerary);
      } else {
        toast.error('Không tìm thấy yêu cầu');
        navigate('/guide/requests');
      }
    } catch (error) {
      console.error('Error fetching request detail:', error);
      toast.error('Không thể tải chi tiết yêu cầu');
      navigate('/guide/requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const handleAccept = async () => {
    try {
      setProcessing(true);
      const response = await withAuth(`/api/itinerary/${requestId}/accept-tour-guide`, {
        method: 'POST'
      });
      
      if (response.success) {
        toast.success('Đã chấp nhận yêu cầu tour!');
        navigate('/guide/tours');
      } else {
        toast.error(response.error || 'Không thể chấp nhận yêu cầu');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Có lỗi xảy ra khi chấp nhận yêu cầu');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
      return;
    }

    try {
      setProcessing(true);
      const response = await withAuth(`/api/itinerary/${requestId}/reject-tour-guide`, {
        method: 'POST'
      });
      
      if (response.success) {
        toast.success('Đã từ chối yêu cầu');
        navigate('/guide/requests');
      } else {
        toast.error(response.error || 'Không thể từ chối yêu cầu');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Có lỗi xảy ra khi từ chối yêu cầu');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 text-[#02A0AA] animate-spin" />
          <p className="text-gray-500">Đang tải chi tiết...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-center">Không tìm thấy yêu cầu</p>
      </div>
    );
  }

  const customer = request.userId || {};

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/guide/requests')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách</span>
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {request.name || request.zoneName}
        </h1>
        <p className="text-gray-600">Chi tiết yêu cầu tour</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin khách hàng</h3>
            <div className="flex items-center gap-4">
              <img
                src={customer.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name || 'User')}`}
                alt={customer.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900 text-lg">{customer.name || 'Khách hàng'}</p>
                <p className="text-sm text-gray-600">{customer.email || ''}</p>
                {customer.phone && (
                  <p className="text-sm text-gray-600">📞 {customer.phone}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Tour Details */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin tour</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Ngày khởi hành</p>
                  <p className="font-semibold text-gray-900">
                    {request.preferredDate 
                      ? new Date(request.preferredDate).toLocaleDateString('vi-VN')
                      : 'Chưa xác định'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Số người</p>
                  <p className="font-semibold text-gray-900">
                    {request.numberOfPeople || 'Chưa xác định'} người
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Thời gian</p>
                  <p className="font-semibold text-gray-900">
                    {request.totalDuration 
                      ? `${Math.floor(request.totalDuration / 60)}h${request.totalDuration % 60}m`
                      : 'Chưa tối ưu'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Ngân sách</p>
                  <p className="font-semibold text-gray-900">
                    {request.estimatedCost 
                      ? `${request.estimatedCost.toLocaleString('vi-VN')} VND`
                      : 'Chưa xác định'}
                  </p>
                </div>
              </div>
            </div>

            {request.totalDistance && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Navigation className="w-4 h-4" />
                  <span>Khoảng cách: {request.totalDistance.toFixed(1)} km</span>
                </div>
              </div>
            )}
          </Card>

          {/* Special Requests */}
          {request.preferences?.specialRequests && (
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#02A0AA]" />
                Yêu cầu đặc biệt
              </h3>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-4">
                {request.preferences.specialRequests}
              </p>
            </Card>
          )}

          {/* Itinerary */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Lộ trình chi tiết</h3>
            <div className="space-y-3">
              {request.items && request.items.length > 0 ? (
                request.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-[#02A0AA] text-white rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.address || 'Địa chỉ không xác định'}
                      </p>
                      {item.startTime && item.endTime && (
                        <p className="text-xs text-gray-500 mt-1">
                          ⏱️ {item.startTime} - {item.endTime} ({item.duration} phút)
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có lộ trình chi tiết</p>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card className="sticky top-6">
            <h3 className="font-bold text-gray-900 mb-4">Hành động</h3>
            
            <div className="space-y-3">
              <Button
                variant="success"
                fullWidth
                onClick={handleAccept}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Chấp nhận yêu cầu</span>
                  </>
                )}
              </Button>

              <Button
                variant="danger"
                fullWidth
                onClick={handleReject}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span>Từ chối</span>
                  </>
                )}
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-600">
                <strong>Lưu ý:</strong> Sau khi chấp nhận, bạn sẽ cần liên hệ với khách hàng để xác nhận chi tiết tour.
              </p>
            </div>
          </Card>

          {/* Tour Stats */}
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Thống kê</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Số địa điểm:</span>
                <span className="font-semibold text-gray-900">
                  {request.items?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tình trạng:</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                  Chờ xác nhận
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gửi yêu cầu:</span>
                <span className="text-xs text-gray-500">
                  {request.tourGuideRequest?.requestedAt 
                    ? new Date(request.tourGuideRequest.requestedAt).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailPage;
