import React, { useState, useEffect } from "react";
import WelcomeBanner from "../components/home/WelcomeBanner";
import UpcomingTourList from "../components/home/UpcomingTourList";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useAuth } from "../../auth/context";
import { useSocket } from "../../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const HomePage = () => {
  const navigate = useNavigate();


  const { user, withAuth } = useAuth();
  const { socket, on, joinRoom } = useSocket();
  const [tours, setTours] = useState([]);
  const [requests, setRequests] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [requestData, tourData, earningsData] = await Promise.all([
          withAuth("/api/guide/custom-requests?status=pending,negotiating"),
          withAuth("/api/itinerary/guide/accepted-tours"),
          withAuth("/api/guide/earnings").catch(() => ({ summary: { thisWeek: 0 } }))
        ]);
        
        // Map requests
        const requestsArray = requestData.tourRequests || requestData.requests || [];
        const reqs = Array.isArray(requestsArray) ? requestsArray.map((it) => ({
              id: it._id,
              tourName: it.tourDetails?.zoneName || it.itineraryId?.zoneName || it.name || 'Custom Tour',
              customerId: it.userId?._id || it.userId,
              customerName: it.userId?.name || 'Khách hàng',
              customerAvatar: it.userId?.avatar?.url || '',
              customerEmail: it.userId?.email || '',
              contactPhone: it.userId?.phone || '',
              departureDate: it.preferredDates?.[0]?.startDate || '',
              location: it.tourDetails?.zoneName || it.itineraryId?.zoneName || '',
              numberOfGuests: it.tourDetails?.numberOfGuests || 1,
              totalPrice: it.initialBudget?.amount || 0,
              requestedAt: it.createdAt,
              raw: it
            }))
          : [];
        setRequests(reqs);
        
        // Map tours
        const myTours = tourData.success && Array.isArray(tourData.tours)
          ? tourData.tours
          : [];
        setTours(myTours);
        
        // Set earnings
        setEarnings(earningsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setTours([]);
        setRequests([]);
        setEarnings({ summary: { thisWeek: 0 } });
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      fetchData();
    }
  }, [user, withAuth]);

  // Join socket room for real-time updates
  useEffect(() => {
    if (!socket || !user?._id) return;
    
    joinRoom(`user-${user._id}`);
    
    // Listen for payment success
    const unsubscribePayment = on('paymentSuccessful', (data) => {
      console.log('💰 Payment successful:', data);
      toast.success(`💰 Khách hàng đã thanh toán cho ${data.tourTitle}`);
      // Optionally refresh data
      setTours(prev => prev); // Trigger re-render or fetch
    });
    
    // Listen for tour marked as done
    const unsubscribeTourDone = on('tourMarkedDone', (data) => {
      console.log('✅ Tour marked done:', data);
      toast.success(`✅ Tour "${data.tourTitle}" đã hoàn thành!`);
    });
    
    return () => {
      unsubscribePayment?.();
      unsubscribeTourDone?.();
    };
  }, [socket, user?._id, joinRoom, on]);

  // Categorize tours
  const now = new Date();
  const ongoingTours = tours.filter((tour) => {
    const preferredDate = tour.preferredDate ? new Date(tour.preferredDate) : null;
    return preferredDate && preferredDate.toDateString() === now.toDateString();
  });
  
  const upcomingTours = tours.filter((tour) => {
    const preferredDate = tour.preferredDate ? new Date(tour.preferredDate) : null;
    return preferredDate && preferredDate > now;
  });

  // Danh sách yêu cầu mới trong 48h
  const newRequests = requests.filter((r) => {
    try {
      return new Date() - new Date(r.requestedAt) < 48 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  });

  const pendingRequests = requests.length;

  // Modal hiển thị khi có yêu cầu mới hơn số lần trước
  const [showBlogNotification, setShowBlogNotification] = useState(false);

  useEffect(() => {
    const prevCount = parseInt(
      localStorage.getItem("lastRequestCount") || "0",
      10
    );

    // Nếu hiện tại có nhiều yêu cầu hơn lần trước → hiện modal
    if (newRequests.length > prevCount) {
      setShowBlogNotification(true);
      localStorage.setItem("hasSeenGuideNotification", "false");
    }

    // Lưu lại số lượng hiện tại
    localStorage.setItem("lastRequestCount", newRequests.length);
  }, [newRequests.length]);

  const handleCloseBlogNotification = () => {
    setShowBlogNotification(false);
    localStorage.setItem("hasSeenGuideNotification", "true");
  };

  // Đọc trạng thái đã xem yêu cầu
  const [hasViewedRequests, setHasViewedRequests] = useState(() => {
    return localStorage.getItem("hasViewedGuideRequests") === "true";
  });

  const handleViewRequests = () => {
    localStorage.setItem("hasViewedGuideRequests", "true");
    setHasViewedRequests(true);
    navigate("/guide/requests");
  };

  // Cập nhật lại "đã xem yêu cầu" khi modal đóng
  useEffect(() => {
    if (!showBlogNotification) return;
    const timer = setTimeout(() => {
      localStorage.setItem("hasViewedGuideRequests", "false");
      setHasViewedRequests(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [showBlogNotification]);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Yêu cầu mới */}
        <Card className="text-center relative">
          <div className="text-4xl mb-2">📬</div>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? "..." : pendingRequests}
          </div>
          <div className="text-sm text-gray-500">Yêu cầu mới</div>
          {pendingRequests > 0 && (
            <div className="relative mt-3">
              <Button
                size="sm"
                variant="primary"
                fullWidth
                onClick={handleViewRequests}
              >
                Xem yêu cầu
              </Button>
              {/* Dấu chấm than đỏ chỉ hiện khi có yêu cầu tour mới */}
              {newRequests.length > 0 && !hasViewedRequests && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce text-xs">
                  !
                </span>
              )}
            </div>
          )}
        </Card>

        {/* Tour đang diễn ra */}
        <Card className="text-center">
          <div className="text-4xl mb-2">🚀</div>
          <div className="text-2xl font-bold text-[#02A0AA]">
            {loading ? "..." : ongoingTours.length}
          </div>
          <div className="text-sm text-gray-500">Đang diễn ra</div>
          {ongoingTours.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              fullWidth
              onClick={() => navigate("/guide/tours")}
            >
              Xem ngay
            </Button>
          )}
        </Card>

        {/* Tour sắp tới */}
        <Card className="text-center">
          <div className="text-4xl mb-2">📆</div>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? "..." : upcomingTours.length}
          </div>
          <div className="text-sm text-gray-500">Tour sắp tới</div>
        </Card>

        {/* Doanh thu */}
        <Card className="text-center">
          <div className="text-4xl mb-2">💰</div>
          <div className="text-2xl font-bold text-[#02A0AA]">
            {loading ? "..." : earnings?.summary?.thisWeek ? 
              `${(earnings.summary.thisWeek / 1000000).toFixed(1)}M` : 
              "0"}
          </div>
          <div className="text-sm text-gray-500">Tuần này</div>
        </Card>
      </div>

      {/* Tour đang diễn ra */}
      {ongoingTours.length > 0 && !loading && (
        <Card className="border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#02A0AA] text-white rounded-full flex items-center justify-center animate-pulse flex-shrink-0">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">Tour đang diễn ra</p>
                <p className="text-sm text-gray-600">
                  {ongoingTours[0].tourName} - {ongoingTours[0].progress || 0}% hoàn
                  thành
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              className="sm:w-auto"
              onClick={() => navigate(`/guide/tours/${ongoingTours[0]._id || ongoingTours[0].id}`)}
            >
              Tiếp tục
            </Button>
          </div>
        </Card>
      )}

  {/* Tour sắp tới */}
  {!loading && <UpcomingTourList tours={upcomingTours} />}

      {/* Modal thông báo mới */}
      <AnimatePresence>
        {showBlogNotification && newRequests.length > 0 && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseBlogNotification}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
              {/* Nút đóng */}
              <button
                onClick={handleCloseBlogNotification}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Nội dung modal */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#02A0AA] text-white rounded-full flex items-center justify-center">
                  <span className="text-2xl">📬</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Thông báo mới
                  </h3>
                  <p className="text-sm text-gray-500">
                    Bạn có yêu cầu tour mới
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-gray-700 text-sm mb-2">
                  Bạn có{" "}
                  <strong className="text-[#02A0AA]">
                    {newRequests.length}
                  </strong>{" "}
                  yêu cầu đặt tour mới. Khách hàng đang chờ phản hồi của bạn.
                </p>
                <p className="text-xs text-gray-500">
                  Vui lòng xem và phản hồi sớm để đảm bảo dịch vụ tốt nhất!
                </p>
              </div>

              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  handleCloseBlogNotification();
                  handleViewRequests();
                }}
              >
                Xem chi tiết
              </Button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
