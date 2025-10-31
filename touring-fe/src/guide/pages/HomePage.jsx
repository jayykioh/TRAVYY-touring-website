import React, { useState, useEffect } from "react";
import WelcomeBanner from "../components/home/WelcomeBanner";
import UpcomingTourList from "../components/home/UpcomingTourList";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useAuth } from "../../auth/context";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const HomePage = () => {
  const navigate = useNavigate();


  const { user, withAuth } = useAuth();
  const [tours, setTours] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [tourData, requestData] = await Promise.all([
          withAuth("/api/tours"),
          withAuth("/api/itinerary/guide/requests"),
        ]);
        // Filter tours by current user's agencyId
        const myTours = Array.isArray(tourData)
          ? tourData.filter((tour) =>
              tour.agencyId &&
              (tour.agencyId._id === user?.agencyId || tour.agencyId === user?.agencyId)
            )
          : [];
        setTours(myTours);
        // Map backend requests to UI format
        const reqs = requestData.success && Array.isArray(requestData.requests)
          ? requestData.requests.map((it) => ({
              id: it._id,
              tourName: it.name || it.zoneName,
              customerId: it.userId?._id || it.userId,
              customerName: it.userId?.name || 'Khách hàng',
              customerAvatar: it.userId?.avatar?.url || '',
              customerEmail: it.userId?.email || '',
              contactPhone: it.userId?.phone || '',
              departureDate: '',
              startTime: '',
              endTime: '',
              location: it.zoneName,
              pickupPoint: '',
              numberOfGuests: '',
              duration: '',
              totalPrice: '',
              earnings: '',
              requestedAt: it.tourGuideRequest?.requestedAt,
              specialRequests: '',
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
            }))
          : [];
        setRequests(reqs);
      } catch {
        setTours([]);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    }
    if (user?.agencyId) fetchData();
  }, [user?.agencyId, withAuth]);

  // Categorize tours
  const now = new Date();
  const ongoingTours = tours.filter((tour) => {
    if (tour.isHidden || tour.status === "canceled") return false;
    if (tour.status === "completed") return false;
    if (tour.departures && tour.departures.length > 0) {
      // Ongoing if any departure is today
      return tour.departures.some((d) => {
        if (!d.date) return false;
        const depDate = new Date(d.date);
        return (
          depDate.toDateString() === now.toDateString()
        );
      });
    }
    return false;
  });
  const upcomingTours = tours.filter((tour) => {
    if (tour.isHidden || tour.status === "canceled") return false;
    if (tour.status === "completed") return false;
    if (tour.departures && tour.departures.length > 0) {
      // Upcoming if any departure is in the future
      return tour.departures.some((d) => {
        if (!d.date) return false;
        const depDate = new Date(d.date);
        return depDate > now;
      });
    }
    return false;
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce">
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
          <div className="text-2xl font-bold text-[#02A0AA]">15.7M</div>
          <div className="text-sm text-gray-500">Tuần này</div>
        </Card>
      </div>

      {/* Tour đang diễn ra */}
      {ongoingTours.length > 0 && !loading && (
        <Card className="border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#02A0AA] text-white rounded-full flex items-center justify-center animate-pulse">
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseBlogNotification}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
