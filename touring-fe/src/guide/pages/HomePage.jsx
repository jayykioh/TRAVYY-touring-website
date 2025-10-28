import React, { useState } from "react";
import WelcomeBanner from "../components/home/WelcomeBanner";
import UpcomingTourList from "../components/home/UpcomingTourList";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { mockTours } from "../data/mockTours";
import { mockRequests } from "../data/mockRequests";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const HomePage = () => {
  const navigate = useNavigate();
  const [showBlogNotification, setShowBlogNotification] = useState(() => {
    // Chỉ hiện lần đầu, kiểm tra localStorage
    const hasSeenNotification = localStorage.getItem(
      "hasSeenGuideNotification"
    );
    return !hasSeenNotification && true;
  });

  const handleCloseBlogNotification = () => {
    setShowBlogNotification(false);
    localStorage.setItem("hasSeenGuideNotification", "true");
  };

  const ongoingTours = mockTours.ongoing || [];
  const upcomingTours = mockTours.upcoming || [];
  const pendingRequests = mockRequests.length;

  // tính số yêu cầu mới: requested trong 48 giờ gần nhất
  const newRequests = mockRequests.filter((r) => {
    try {
      return new Date() - new Date(r.requestedAt) < 48 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  });

  // Kiểm tra đã xem requests chưa
  const [hasViewedRequests, setHasViewedRequests] = useState(() => {
    return localStorage.getItem("hasViewedGuideRequests") === "true";
  });

  const handleViewRequests = () => {
    localStorage.setItem("hasViewedGuideRequests", "true");
    setHasViewedRequests(true);
    navigate("/guide/requests");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-4xl mb-2">📬</div>
          <div className="text-2xl font-bold text-gray-900">
            {pendingRequests}
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
              {newRequests.length > 0 && !hasViewedRequests && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  !
                </span>
              )}
            </div>
          )}
        </Card>

        <Card className="text-center">
          <div className="text-4xl mb-2">🚀</div>
          <div className="text-2xl font-bold text-[#02A0AA]">
            {ongoingTours.length}
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

        <Card className="text-center">
          <div className="text-4xl mb-2">📆</div>
          <div className="text-2xl font-bold text-gray-900">
            {upcomingTours.length}
          </div>
          <div className="text-sm text-gray-500">Tour sắp tới</div>
        </Card>

        <Card className="text-center">
          <div className="text-4xl mb-2">💰</div>
          <div className="text-2xl font-bold text-[#02A0AA]">15.7M</div>
          <div className="text-sm text-gray-500">Tuần này</div>
        </Card>
      </div>

      {/* Ongoing Tour Alert */}
      {ongoingTours.length > 0 && (
        <Card className="border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#02A0AA] text-white rounded-full flex items-center justify-center animate-pulse">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">Tour đang diễn ra</p>
                <p className="text-sm text-gray-600">
                  {ongoingTours[0].tourName} - {ongoingTours[0].progress}% hoàn
                  thành
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate(`/guide/tours/${ongoingTours[0].id}`)}
            >
              Tiếp tục
            </Button>
          </div>
        </Card>
      )}

      {/* Upcoming Tours */}
      <UpcomingTourList tours={upcomingTours} />

      {/* Blog notification - dismissible modal with X button & overlay click */}
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
              {/* Close button */}
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

              {/* Icon & Title */}
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

              {/* Content */}
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

              {/* Action button */}
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  handleCloseBlogNotification();
                  navigate("/guide/requests");
                }}
              >
                Xem chi tiết
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Tour Popup */}
      {/* <NewTourPopup
        isOpen={showNewTourPopup}
        onClose={() => setShowNewTourPopup(false)}
        tourRequest={currentRequest}
        onAccept={handleAccept}
        onDecline={handleDecline}
      /> */}
    </div>
  );
};

export default HomePage;
