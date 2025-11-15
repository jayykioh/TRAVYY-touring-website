import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";
import UpcomingTourList from "../components/home/UpcomingTourList";
import NewRequestModal from "../components/home/NewRequestModal";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useAuth } from "../../auth/context";
import { useSocket } from "../../context/SocketContext";
import { toast } from "sonner";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, withAuth } = useAuth();
  const { socket, on, joinRoom } = useSocket();
  const [tours, setTours] = useState([]);
  const [requests, setRequests] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBlogNotification, setShowBlogNotification] = useState(false);
  const [hasViewedRequests, setHasViewedRequests] = useState(
    () => localStorage.getItem("hasViewedGuideRequests") === "true"
  );

  // === FETCH DATA ===
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [requestData, tourData, earningsData] = await Promise.all([
          withAuth("/api/guide/custom-requests?status=pending,negotiating"),
          withAuth("/api/guide/custom-requests?status=accepted,agreement_pending"),
          withAuth("/api/guide/earnings").catch(() => ({
            summary: { thisWeek: 0 },
          })),
        ]);

        console.log("[HomePage] Raw request data:", requestData);
        console.log("[HomePage] Raw tour data:", tourData);
        console.log("[HomePage] Raw earnings data:", earningsData);

        // Map requests using cuocthi structure
        const requestsArray =
          requestData.tourRequests || requestData.requests || [];
        const reqs = Array.isArray(requestsArray)
          ? requestsArray.map((it) => ({
              id: it._id,
              tourName:
                it.tourDetails?.zoneName ||
                it.itineraryId?.zoneName ||
                it.name ||
                "Custom Tour",
              customerId: it.userId?._id || it.userId,
              customerName: it.userId?.name || "Khách hàng",
              customerAvatar: it.userId?.avatar?.url || "",
              customerEmail: it.userId?.email || "",
              contactPhone: it.userId?.phone || "",
              departureDate: it.preferredDates?.[0]?.startDate || "",
              location:
                it.tourDetails?.zoneName || it.itineraryId?.zoneName || "",
              numberOfGuests: it.tourDetails?.numberOfGuests || 1,
              totalPrice: it.initialBudget?.amount || 0,
              requestedAt: it.createdAt,
              raw: it,
            }))
          : [];
        setRequests(reqs);

        // Map tours with images like MyToursPage - now from tour requests instead of itinerary
        const tourRequestsArray = tourData.tourRequests || tourData.requests || [];
        const myTours =
          tourData.success && Array.isArray(tourData.tours)
            ? tourData.tours
            : [];
        setTours(myTours);

        // Set earnings
        setEarnings(earningsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setTours([]);
        setRequests([]);
        setEarnings({ summary: { thisWeek: 0 } });
      } finally {
        setLoading(false);
      }
    }

    if (user) fetchData();
  }, [user, withAuth]);

  // Join socket room for real-time updates
  useEffect(() => {
    if (!socket || !user?._id) return;

    joinRoom(`user-${user._id}`);

    // Listen for payment success
    const unsubscribePayment = on("paymentSuccessful", (data) => {
      console.log("💰 Payment successful:", data);
      toast.success(`💰 Khách hàng đã thanh toán cho ${data.tourTitle}`);
    });

    // Listen for tour marked as done
    const unsubscribeTourDone = on("tourMarkedDone", (data) => {
      console.log("✅ Tour marked done:", data);
      toast.success(`✅ Tour "${data.tourTitle}" đã hoàn thành!`);
    });

    return () => {
      unsubscribePayment?.();
      unsubscribeTourDone?.();
    };
  }, [socket, user?._id, joinRoom, on]);

  // === TOUR CATEGORIZATION ===
  const now = new Date();
  const ongoingTours = tours.filter((tour) => {
    const preferredDate = tour.preferredDate
      ? new Date(tour.preferredDate)
      : null;
    return preferredDate && preferredDate.toDateString() === now.toDateString();
  });
  const upcomingTours = tours || [];

  // === NEW REQUESTS (24h) ===
  const newRequests = requests.filter((r) => {
    try {
      return new Date() - new Date(r.requestedAt) < 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  });

  // === MODAL NOTIFICATION ===
  useEffect(() => {
    const prevCount = parseInt(
      localStorage.getItem("lastRequestCount") || "0",
      10
    );
    if (newRequests.length > prevCount) {
      setShowBlogNotification(true);
      localStorage.setItem("hasSeenGuideNotification", "false");
    }
    localStorage.setItem("lastRequestCount", newRequests.length);
  }, [newRequests.length]);

  const handleCloseBlogNotification = () => {
    setShowBlogNotification(false);
    localStorage.setItem("hasSeenGuideNotification", "true");
  };

  const handleViewRequests = () => {
    localStorage.setItem("hasViewedGuideRequests", "true");
    setHasViewedRequests(true);
    navigate("/guide/requests");
  };

  useEffect(() => {
    if (!showBlogNotification) return;
    const timer = setTimeout(() => {
      localStorage.setItem("hasViewedGuideRequests", "false");
      setHasViewedRequests(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [showBlogNotification]);

  // === RENDER ===
  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      <div className="max-w-7xl mx-auto px-5">
        {/* ===== HERO SECTION ===== */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center mt-1 mb-4">
          <div className="md:col-span-1">
            <h1 className="text-4xl font-light text-black leading-snug tracking-wide">
              Chào mừng trở lại, Hướng dẫn viên!
            </h1>
            <h1 className="text-3xl font-light text-black leading-snug tracking-wide">
              Sẵn sàng cho chuyến đi tiếp theo?
            </h1>
          </div>

          <div className="grid md:grid-cols-3 items-center ml-20">
            <div className="md:col-span-2">
              <p className="text-base text-gray-600 mb-3">
                Quản lý tour & trải nghiệm khách.
                <br /> Xem nhanh yêu cầu và chuẩn bị cho chuyến đi.
              </p>
            </div>
            <div>
              <div className="flex items-center justify-start">
                <div className="relative">
                  <Button
                    variant="primary"
                    onClick={handleViewRequests}
                    className="px-5 py-1 rounded-2xl font-medium"
                  >
                    Xem yêu cầu
                  </Button>
                  {newRequests.length > 0 && !hasViewedRequests && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-bounce">
                      !
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ===== IMAGE ===== */}
        <section className="relative mt-1">
          <div className="w-full h-[410px] rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1609155627149-8c6b32d4e222?auto=format&fit=crop&q=80&w=1470"
              alt="Mountain Adventure"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* ===== TOURS SECTION ===== */}
        <div className="mt-6">
          <div className="bg-white p-6 rounded-2xl shadow space-y-4">
            {/* Ongoing Tour */}
            {ongoingTours.length > 0 && !loading && (
              <Card className="border-gray-200 bg-[#f8f9fa]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#02A0AA] text-white rounded-full flex items-center justify-center animate-pulse">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        Tour đang diễn ra
                      </p>
                      <p className="text-sm text-gray-600">
                        {ongoingTours[0].tourName} -{" "}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    onClick={() =>
                      navigate(
                        `/guide/tours/${
                          ongoingTours[0]._id || ongoingTours[0].id
                        }`
                      )
                    }
                  >
                    Tiếp tục
                  </Button>
                </div>
              </Card>
            )}

            {/* Upcoming Tours */}
            {!loading && <UpcomingTourList tours={upcomingTours} />}

            {/* ===== GUIDE INTRO SECTION (3 BOX) ===== */}
            <div className="mt-20">
              <h2 className="text-3xl ml-9 font-semibold text-gray-900 mb-6">
                Giới thiệu dành cho Hướng dẫn viên
              </h2>

              <div className="grid md:grid-cols-3 gap-30 justify-items-center mt-10 mx-30">
                {/* Box 1 */}
                <div className="max-w-sm text-center">
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#02A0AA]/10 flex items-center justify-center">
                      {/* Target icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 text-[#02A0AA]"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                    </div>

                    <h3 className="font-semibold text-lg text-gray-800">
                      Vai trò của bạn
                    </h3>
                  </div>

                  <p className="text-gray-600 text-sm">
                    Bạn là cầu nối giữa khách du lịch và trải nghiệm địa phương.
                    Hệ thống giúp bạn quản lý yêu cầu, điều phối lịch trình và
                    tối ưu thời gian.
                  </p>
                </div>

                {/* Box 2 */}
                <div className="max-w-sm text-center">
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#02A0AA]/10 flex items-center justify-center">
                      {/* Map icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 text-[#02A0AA]"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z"
                        />
                      </svg>
                    </div>

                    <h3 className="font-semibold text-lg text-gray-800">
                      Lịch trình thông minh
                    </h3>
                  </div>

                  <p className="text-gray-600 text-sm">
                    Nhận yêu cầu mới, xem chi tiết hành trình và chuẩn bị cho
                    chuyến đi tiếp theo.
                  </p>
                </div>

                {/* Box 3 */}
                <div className="max-w-sm text-center">
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#02A0AA]/10 flex items-center justify-center">
                      {/* Star icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 text-[#02A0AA]"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 17.75l-6.172 3.245 1.179-6.873L2 8.755l6.9-1.003L12 1.75l3.1 6.002 6.9 1.003-4.007 5.367 1.179 6.873L12 17.75z"
                        />
                      </svg>
                    </div>

                    <h3 className="font-semibold text-lg text-gray-800">
                      Nâng cao trải nghiệm khách
                    </h3>
                  </div>

                  <p className="text-gray-600 text-sm">
                    Cập nhật thông tin khách, dự đoán nhu cầu và mang lại hành
                    trình hoàn hảo nhất.
                  </p>
                </div>
              </div>
            </div>

            {/* ===== TIMELINE: Hệ thống giúp bạn làm gì? ===== */}
            <div className="mt-20 mb-10">
              <h2 className="text-3xl ml-9 font-semibold text-gray-900 mb-6">
                Hệ thống giúp bạn làm gì?
              </h2>

              <div className="relative ml-15 pl-9 border-l-2 border-[#02A0AA]/40 space-y-8">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[14px] top-1 w-7 h-7 bg-[#02A0AA] text-white rounded-full flex items-center justify-center shadow-md">
                    {/* Icon Inbox */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 13V7a2 2 0 00-2-2h-3m-6 0H6a2 2 0 00-2 2v6m16 0h-3l-2 3h-4l-2-3H4m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4"
                      />
                    </svg>
                  </div>

                  <div className="ml-7">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Nhận yêu cầu mới từ khách hàng
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Xem thông tin hành trình, số lượng khách và dự toán chi
                      phí ngay lập tức.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-[14px] top-1 w-7 h-7 bg-[#02A0AA] text-white rounded-full flex items-center justify-center shadow-md">
                    {/* Icon Calendar */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>

                  <div className="ml-7">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Quản lý lịch trình & tour đã nhận
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Theo dõi tour đang diễn ra hoặc sắp tới, vào chi tiết chỉ
                      với 1 click.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-[14px] top-1 w-7 h-7 bg-[#02A0AA] text-white rounded-full flex items-center justify-center shadow-md">
                    {/* Icon Users */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 20h5V10l-5 5m-5-5a4 4 0 110-8 4 4 0 010 8zm6 8a6 6 0 00-12 0"
                      />
                    </svg>
                  </div>

                  <div className="ml-7">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Quản lý thông tin & nhu cầu của khách
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Nắm bắt sở thích, liên hệ và yêu cầu riêng của khách để
                      phục vụ tốt hơn.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className="absolute -left-[14px] top-1 w-7 h-7 bg-[#02A0AA] text-white rounded-full flex items-center justify-center shadow-md">
                    {/* Icon Check */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  <div className="ml-7">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Hoàn thành tour & nâng cao đánh giá
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Hoàn thiện từng bước trong tour, tạo trải nghiệm đáng nhớ
                      để tăng đánh giá.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      <NewRequestModal
        show={showBlogNotification}
        newRequests={newRequests}
        onClose={handleCloseBlogNotification}
        onViewDetails={handleViewRequests}
      />
    </div>
  );
};

export default HomePage;
