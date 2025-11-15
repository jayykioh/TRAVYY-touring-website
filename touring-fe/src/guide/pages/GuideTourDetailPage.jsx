// src/pages/guide/GuideTourDetailPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import ChatBox from "../components/chat/ChatBox";
import { useAuth } from "../../auth/context";
import { useSocket } from "../../context/SocketContext";
import { toast } from "sonner";
// ✅ dùng confirm modal dùng chung
import { useConfirm } from "../components/common/ConfirmProvider";
import { AnimatePresence } from "framer-motion";

const PRIMARY = "#02A0AA";

const GuideTourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const [cancelReason, setCancelReason] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");

  const { withAuth } = useAuth();
  const { socket, on, joinRoom, connected } = useSocket();
  // Removed: isRequestView is no longer needed - we now try both endpoints

  // ========= LỊCH TRÌNH THEO TAB (PHẦN 1/PHẦN 2) =========
  const [activePartIdx, setActivePartIdx] = useState(0);

  // DATA FETCHING - Logic từ cuocthi
  const fetchTourData = useCallback(async () => {
    setLoading(true);
    try {
      // Try custom-requests first (for both pending requests and accepted/agreement_pending tours)
      // This endpoint works for all statuses now
      let data = null;

      try {
        const response = await withAuth(`/api/guide/custom-requests/${id}`);
        data = response;
        console.log("[GuideTourDetail] Successfully fetched from custom-requests:", data);
      } catch (customError) {
        console.log("[GuideTourDetail] Custom-requests failed, trying itinerary endpoint");
        
        // Fall back to itinerary endpoint only if custom-requests fails
        try {
          const response = await withAuth(`/api/itinerary/guide/tours/${id}`);
          data = response;
          console.log("[GuideTourDetail] Successfully fetched from itinerary:", data);
        } catch (itineraryError) {
          console.error("[GuideTourDetail] Both endpoints failed. Custom error:", customError, "Itinerary error:", itineraryError);
          throw itineraryError;
        }
      }

      console.log("[GuideTourDetail] Raw data from API:", data);

      // API returns { success: true, tourRequest: {...} } for custom requests
      if (data && (data.success || data._id || data.tourRequest)) {
        const tourRequest = data.tourRequest || data; // Handle both wrapped and unwrapped responses
        const itinerary = tourRequest.itineraryId || data;
        const customer = tourRequest.userId || data.userId || data.customerInfo;

        console.log("[GuideTourDetail] Parsed:", {
          tourRequest,
          itinerary,
          customer,
        });

        // Transform to UI format
        const transformedTour = {
          ...tourRequest,
          id: tourRequest._id || data._id,
          requestNumber: tourRequest.requestNumber,

          // Tour info - prefer tourDetails from TourCustomRequest
          tourName:
            tourRequest.tourDetails?.zoneName ||
            itinerary?.zoneName ||
            itinerary?.name ||
            "Tour",
          location:
            tourRequest.tourDetails?.zoneName || itinerary?.zoneName || "N/A",
          numberOfGuests:
            tourRequest.tourDetails?.numberOfGuests || data.numberOfPeople || 1,

          // Dates
          departureDate:
            tourRequest.preferredDates?.[0]?.startDate || data.preferredDate,
          startTime: tourRequest.preferredDates?.[0]?.startDate
            ? new Date(
                tourRequest.preferredDates[0].startDate
              ).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "08:00",
          endTime: tourRequest.preferredDates?.[0]?.endDate
            ? new Date(
                tourRequest.preferredDates[0].endDate
              ).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "18:00",

          // Duration
          duration: itinerary?.totalDuration
            ? `${Math.floor(itinerary.totalDuration / 60)}h ${
                itinerary.totalDuration % 60
              }m`
            : tourRequest.tourDetails?.numberOfDays
            ? `${tourRequest.tourDetails.numberOfDays} ngày`
            : "N/A",

          // Pricing - use agreed price if available, fallback to initial budget
          totalPrice: tourRequest.finalPrice?.amount || tourRequest.initialBudget?.amount || 0,
          currency: tourRequest.finalPrice?.currency || tourRequest.initialBudget?.currency || "VND",
          earnings: (tourRequest.finalPrice?.amount || tourRequest.initialBudget?.amount || 0) * 0.8, // 80% for guide
          
          // Pricing details for display
          agreedPrice: tourRequest.finalPrice?.amount,
          initialBudget: tourRequest.initialBudget?.amount,

          // ✅ Agreement status - only show payment if both parties agreed
          agreement: tourRequest.agreement || {},
          bothAgreed: tourRequest.agreement?.userAgreed && tourRequest.agreement?.guideAgreed,

          // Customer info
          customerName: customer?.name || "Khách hàng",
          customerId:
            customer?._id || (typeof customer === "string" ? customer : "N/A"),
          customerAvatar:
            customer?.avatar?.url ||
            customer?.avatar ||
            "https://via.placeholder.com/150",
          customerEmail:
            customer?.email || tourRequest.contactInfo?.email || "",
          contactPhone: customer?.phone || tourRequest.contactInfo?.phone || "",

          // Itinerary details - use tourDetails.items from TourCustomRequest
          itinerary: (
            tourRequest.tourDetails?.items ||
            itinerary?.items ||
            []
          ).map((item) => ({
            title: item.name,
            description: item.address || item.description || "",
            time:
              item.startTime && item.endTime
                ? `${item.startTime} - ${item.endTime}`
                : item.timeSlot || "",
            day: item.day,
            part: item.part,
            duration: item.duration ? `${item.duration} phút` : "",
            itemType: item.itemType,
          })),

          // Images - lấy từ BE, không hardcode
          imageItems: (itinerary?.items || []).flatMap((item) =>
            item.imageUrl
              ? [{ imageUrl: item.imageUrl }]
              : item.photos
              ? item.photos.map((photo) => ({ imageUrl: photo }))
              : []
          ),

          // Special requests & notes
          specialRequests:
            tourRequest.specialRequirements ||
            data.notes ||
            data.specialRequests ||
            "",

          // Status
          status:
            tourRequest.status || data.tourGuideRequest?.status || "pending",
          paymentStatus:
            tourRequest.paymentStatus || data.paymentStatus || "unpaid",
          paymentMethod: data.paymentMethod || "N/A",

          // Route info
          pickupPoint:
            data.pickupLocation || itinerary?.items?.[0]?.address || null,
          routePolyline: itinerary?.routePolyline,
          totalDistance: itinerary?.totalDistance,

          // Keep raw data
          rawData: data,
          tourRequestData: tourRequest,
          itineraryData: itinerary,
        };

        console.log("[GuideTourDetail] Transformed tour:", transformedTour);
        console.log("[GuideTourDetail] Pricing:", {
          totalPrice: transformedTour.totalPrice,
          earnings: transformedTour.earnings,
          initialBudget: tourRequest.initialBudget,
          finalPrice: tourRequest.finalPrice,
          estimatedCost: data.estimatedCost,
        });
        console.log("[GuideTourDetail] Agreement status:", {
          rawAgreement: tourRequest.agreement,
          userAgreed: tourRequest.agreement?.userAgreed,
          guideAgreed: tourRequest.agreement?.guideAgreed,
          bothAgreed: transformedTour.bothAgreed,
        });
        setTour(transformedTour);
      } else {
        console.error("[GuideTourDetail] Invalid data format:", data);
        setTour(null);
      }
    } catch (error) {
      console.error("[GuideTourDetail] Error fetching tour:", error);
      setTour(null);
    } finally {
      setLoading(false);
    }
  }, [id, withAuth]);

  useEffect(() => {
    fetchTourData();
  }, [fetchTourData]);

  // Join socket room and listen for real-time updates
  useEffect(() => {
    if (!socket || !connected || !tour?._id) return;

    // Join booking-specific room to receive payment and completion updates
    joinRoom(`booking-${tour._id}`);

    // Join request room to receive payment updates
    if (tour.id) {
      joinRoom(`request-${tour.id}`);
    }

    // Listen for payment updates
    const unsubscribePayment = on("paymentUpdated", (data) => {
      console.log("💰 Payment updated via socket:", data);
      if (data.requestId === tour.id || data.bookingId === tour._id) {
        // Refetch tour data to get updated payment status
        fetchTourData();
        toast.success("✅ Khách hàng đã thanh toán! Tour sắp sàng lên lịch.");
      }
    });

    // Listen for payment successful event
    const unsubscribePaymentSuccess = on("paymentSuccessful", (data) => {
      console.log("💳 Payment successful via socket:", data);
      if (data.requestId === tour.id) {
        fetchTourData();
        toast.success("💰 Thanh toán thành công! Tour đã được cập nhật.");
      }
    });

    return () => {
      unsubscribePayment?.();
      unsubscribePaymentSuccess?.();
    };
  }, [socket, connected, tour?.id, tour?._id, joinRoom, fetchTourData, on]);

  // Helper group itinerary -> các "Phần"
  const buildItineraryParts = useCallback((items = []) => {
    if (!items.length) return [];
    // Ưu tiên group theo item.day hoặc item.part nếu có
    const byKey = items.some((i) => i?.day || i?.part);
    if (byKey) {
      const map = new Map();
      items.forEach((it) => {
        const key = it.day ?? it.part ?? 1;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(it);
      });
      const sorted = [...map.entries()].sort((a, b) => (a[0] > b[0] ? 1 : -1));
      return sorted.map(([, arr], idx) => ({
        label: `Phần ${idx + 1}`,
        items: arr,
      }));
    }
    // Không có metadata -> chia đôi
    if (items.length <= 6) return [{ label: "Phần 1", items }];
    const mid = Math.ceil(items.length / 2);
    return [
      { label: "Phần 1", items: items.slice(0, mid) },
      { label: "Phần 2", items: items.slice(mid) },
    ];
  }, []);

  // Tính parts (memo để không tính lại vô ích)
  const itineraryParts = useMemo(
    () => buildItineraryParts(tour?.itinerary || []),
    [tour?.itinerary, buildItineraryParts]
  );

  // Nếu số tab đổi làm index hiện tại out-of-range -> đưa về 0
  useEffect(() => {
    if (activePartIdx > Math.max(0, itineraryParts.length - 1)) {
      setActivePartIdx(0);
    }
  }, [itineraryParts.length, activePartIdx]);

  // EVENT HANDLERS (dùng confirm modal dùng chung + API logic từ cuocthi)
  const handleAcceptRequest = async () => {
    const ok = await confirm({
      title: "Xác nhận chấp nhận hành trình",
      description:
        "Sau khi chấp nhận, hệ thống sẽ gửi thông báo cho người dùng và chuyển tour này vào danh sách 'Tour sắp diễn ra'.",
      confirmText: "Chấp nhận",
      cancelText: "Hủy",
      variant: "success",
    });
    if (!ok) return;

    try {
      console.log("[GuideTourDetail] Accepting request:", id);
      const response = await withAuth(
        `/api/guide/custom-requests/${id}/accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            finalAmount: 0, // Will be set by backend based on negotiation
            currency: "VND",
          }),
        }
      );

      console.log("[GuideTourDetail] Accept response:", response);

      if (response.success) {
        toast.success("Đã chấp nhận yêu cầu tour!");
        setTimeout(() => {
          navigate("/guide/tours");
        }, 1000);
      } else {
        toast.error(response.error || "Không thể chấp nhận yêu cầu");
      }
    } catch (error) {
      console.error("[GuideTourDetail] Error accepting request:", error);
      toast.error(
        "❌ Có lỗi xảy ra: " + (error.message || "Lỗi không xác định")
      );
    }
  };

  const handleDeclineRequest = async () => {
    const ok = await confirm({
      title: "Xác nhận từ chối hành trình",
      description:
        "Bạn có chắc muốn từ chối hành trình này? Hành động này không thể hoàn tác.",
      confirmText: "Từ chối",
      cancelText: "Hủy",
      variant: "danger",
    });
    if (!ok) return;

    try {
      console.log("[GuideTourDetail] Declining request:", id);
      const response = await withAuth(
        `/api/guide/custom-requests/${id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: "Declined by guide",
          }),
        }
      );

      console.log("[GuideTourDetail] Decline response:", response);

      if (response.success) {
        toast.success(" Đã từ chối yêu cầu");
        setTimeout(() => {
          navigate("/guide/requests");
        }, 1000);
      } else {
        toast.error(response.error || "Không thể từ chối yêu cầu");
      }
    } catch (error) {
      console.error("[GuideTourDetail] Error declining request:", error);
      toast.error("Có lỗi xảy ra: " + (error.message || "Lỗi không xác định"));
    }
  };

  const handleCompleteTour = async () => {
    // Check if booking is paid first
    if (tour.paymentStatus !== 'paid') {
      toast.error('❌ Tour chưa được thanh toán! Khách hàng cần thanh toán trước khi hoàn thành tour.');
      return;
    }

    try {
      console.log("[GuideTourDetail] Completing tour:", tour._id || id, completionNotes);

      // Use correct endpoint: /api/bookings/:bookingId/complete
      const bookingId = tour._id || id;
      const response = await withAuth(`/api/bookings/${bookingId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: completionNotes || "Tour completed successfully",
        }),
      });

      console.log("[GuideTourDetail] Complete response:", response);

      if (response.success) {
        toast.success("🎉 Tour đã được đánh dấu hoàn thành!");
        setShowCompleteModal(false);
        setTimeout(() => {
          navigate("/guide/tours");
        }, 1000);
      } else {
        toast.error(response.error || "Không thể hoàn thành tour");
      }
    } catch (error) {
      console.error("[GuideTourDetail] Error completing tour:", error);
      toast.error(
        "❌ Có lỗi xảy ra: " + (error.message || "Lỗi không xác định")
      );
    }
  };

  const handleCancelTour = () => {
    // TODO: call API cancel nếu cần
    setShowCancelModal(false);
    navigate("/guide/tours");
  };

  const handleNavigateToLocation = () => {
    if (tour?.pickupPoint || tour?.location) {
      const location = tour.pickupPoint || tour.location;
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          location
        )}`,
        "_blank"
      );
    }
  };

  // Hero image - LẤY TỮ BE, KHÔNG HARDCODE
  const heroImage = tour?.imageItems?.[0]?.imageUrl || null;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: PRIMARY }}
        />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="p-6">
        <Card className="text-center py-12">
          <p className="text-gray-500 mb-4">Không tìm thấy tour</p>
          <Button
            onClick={() => navigate("/guide/tours")}
            className="rounded-full px-5 py-2.5 bg-[#02A0AA] text-white"
          >
            Quay lại Tour của tôi
          </Button>
        </Card>
      </div>
    );
  }

  // STATUS - Map to correct TourCustomRequest statuses
  const isRequest =
    tour.status === "pending" || 
    tour.status === "negotiating" || 
    tour.status === "agreement_pending";
  const isOngoing = tour.status === "ongoing" || tour.status === "in_progress";
  const isUpcoming = tour.status === "accepted";
  const isCompleted = tour.status === "completed";
  const isRejected = tour.status === "rejected";
  const isCancelled = tour.status === "cancelled";
  const isExpired = tour.status === "expired";

  console.log("[GuideTourDetail] Status check:", {
    tourStatus: tour.status,
    isRequest,
    isOngoing,
    isUpcoming,
    isCompleted,
    isRejected,
    isCancelled,
    isExpired,
  });

  const statusColors = {
    pending: "warning",
    negotiating: "info",
    agreement_pending: "info",
    ongoing: "success",
    accepted: "success",
    completed: "default",
    canceled: "danger",
    cancelled: "danger",
    rejected: "danger",
    expired: "warning",
  };

  return (
    <div className="min-h-screen mx-8 my-3 bg-white rounded-3xl">
      <div className="max-w-7xl mx-auto p-6 sm:p-6 ">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-medium">Quay lại</span>
          </button>

          {isRequest ? (
            <Badge
              variant="warning"
              className="text-xs px-3 py-1.5 rounded-full"
            >
              {tour.status === "pending" && "Yêu cầu mới"}
              {tour.status === "negotiating" && "Đang đàm phán"}
              {tour.status === "agreement_pending" && "Chờ xác nhận"}
            </Badge>
          ) : (
            tour.status && (
              <Badge
                variant={statusColors[tour.status]}
                className="text-xs px-3 py-1.5 rounded-full"
              >
                {tour.status === "ongoing" && "Đang diễn ra"}
                {tour.status === "in_progress" && "Đang diễn ra"}
                {tour.status === "accepted" && "Đã chấp nhận"}
                {tour.status === "completed" && "Đã hoàn thành"}
                {tour.status === "canceled" && "Đã hủy"}
                {tour.status === "cancelled" && "Đã hủy"}
                {tour.status === "rejected" && "Đã từ chối"}
                {tour.status === "expired" && "Đã hết hạn"}
              </Badge>
            )
          )}
        </div>

        {/* Title */}
        <div className="mb-4 ml-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {tour.tourName}
          </h1>
          <p className="text-gray-500 text-sm">Mã tour: {tour.id}</p>
        </div>

        {/* Hero Image - chỉ hiển thị nếu có ảnh từ BE */}
        {heroImage && (
          <div className="rounded-xl overflow-hidden mb-6">
            <div className="relative">
              <img
                src={heroImage}
                alt="Tour"
                className="w-full object-cover"
                style={{ aspectRatio: "16/5" }}
                onClick={() =>
                  tour.imageItems?.length > 1 && setShowGallery(true)
                }
              />
              {tour.imageItems?.length > 1 && (
                <button
                  onClick={() => setShowGallery(true)}
                  className="absolute bottom-3 right-3 text-white text-sm px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: `${PRIMARY}CC` }}
                >
                  Xem {tour.imageItems.length} ảnh
                </button>
              )}
            </div>
          </div>
        )}

        {/* Info Chips */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-15 py-2 px-20">
          <Chip
            label="Ngày đi"
            value={new Date(tour.departureDate).toLocaleDateString("vi-VN")}
          />
          <Chip label="Giờ" value={`${tour.startTime} - ${tour.endTime}`} />
          <Chip label="Khách" value={`${tour.numberOfGuests} người`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-0">
            <Card className="bg-transparent shadow-none border border-gray-200 rounded-xl">
              {/* Customer Info */}
              <section className="border-b border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin khách hàng
                </h2>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={tour.customerAvatar}
                          alt={tour.customerName}
                          className="w-14 h-14 rounded-full object-cover ring-2"
                          style={{ ringColor: `${PRIMARY}33` }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-base">
                          {tour.customerName}
                        </p>
                        <p className="text-sm text-gray-500">Khách hàng</p>
                        {!isRequest && (
                          <>
                            {tour.customerEmail && (
                              <p className="text-sm text-gray-900 mt-1">
                                Email: {tour.customerEmail}
                              </p>
                            )}
                            {tour.contactPhone && (
                              <p className="text-sm text-gray-900 mt-1">
                                SĐT: {tour.contactPhone}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex-shrink-0">
                    <button
                      onClick={() => setShowChat(true)}
                      className="w-full px-4 py-2.5 rounded-full border text-sm font-medium transition"
                      style={{
                        borderColor: `${PRIMARY}33`,
                        backgroundColor: "#fff",
                        color: "#0f172a",
                      }}
                    >
                      Nhắn tin
                    </button>
                  </div>
                </div>
              </section>

              {/* Location */}
              <section className="border-b border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Điểm đón khách
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                    <div
                      className="w-2 h-2 rounded-full mt-2.5"
                      style={{ backgroundColor: PRIMARY }}
                    />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">
                        Địa điểm tour
                      </p>
                      <p className="text-gray-900 font-medium">
                        {tour.location}
                      </p>
                    </div>
                  </div>

                  {tour.pickupPoint && (
                    <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4">
                      <div className="w-2 h-2 rounded-full mt-2.5 bg-blue-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Điểm đón</p>
                        <p className="text-gray-900 font-medium mb-2">
                          {tour.pickupPoint}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleNavigateToLocation}
                          className="rounded-full px-3 py-1.5 text-xs"
                          style={{
                            borderColor: `${PRIMARY}55`,
                            color: PRIMARY,
                          }}
                        >
                          Chỉ đường
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* ========== NHỮNG ĐIỀU CẦN LƯU Ý (dành cho Hướng dẫn viên) ========== */}
              <section className="border-b border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Những điều cần lưu ý
                </h2>

                <div className="space-y-5 text-sm">
                  {/* Trước chuyến đi */}
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">
                      Trước chuyến đi
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 space-y-1">
                      <li>
                        Xác nhận lịch ngay sau khi khách chốt; nếu không thấy
                        email hãy kiểm tra Spam.
                      </li>
                      <li>
                        Nhắn khách trước giờ đón 12h: điểm đón, giờ dự kiến, số
                        liên hệ.
                      </li>
                      <li>
                        Chuẩn bị sẵn vé/đặt chỗ, kiểm tra thời tiết, mang đồ y
                        tế cơ bản.
                      </li>
                    </ul>
                  </div>

                  {/* Trong chuyến đi */}
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">
                      Trong chuyến đi
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 space-y-1">
                      <li>
                        Đến sớm 10–15 phút; cập nhật nếu thay đổi tuyến/giờ.
                      </li>
                      <li>
                        Nhắc an toàn, quản lý chi phí minh bạch (gửi bill khi
                        cần).
                      </li>
                      <li>
                        Trẻ ≥2 tuổi có thể tính như người lớn; &lt;2 tuổi miễn
                        phí nhưng phải đi cùng người lớn.
                      </li>
                    </ul>
                  </div>

                  {/* Chính sách & liên hệ */}
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">
                      Chính sách & liên hệ
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 space-y-1">
                      <li>
                        Thay đổi nhỏ vì thời tiết/ùn tắc: thông báo và đề xuất
                        phương án tương đương.
                      </li>
                      <li>
                        Hủy/đổi gấp: tuân thủ chính sách, báo CSKH ngay để hỗ
                        trợ.
                      </li>
                      <li>
                        Hotline điều phối: <strong>+848666624188</strong>{" "}
                        (00:00–05:00 phản hồi có thể chậm).
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* ========== LỊCH TRÌNH CHI TIẾT (TAB GIỐNG ẢNH) ========== */}
              {itineraryParts.length > 0 && (
                <section className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Lịch trình chi tiết
                  </h2>

                  {/* Tabs */}
                  <div className="flex items-center gap-2 mb-4">
                    {itineraryParts.map((p, i) => {
                      const active = i === activePartIdx;
                      return (
                        <button
                          key={i}
                          onClick={() => setActivePartIdx(i)}
                          className={[
                            "px-4 py-1.5 rounded-full text-sm font-semibold border",
                            active
                              ? "text-white"
                              : "text-gray-700 bg-white border-gray-200 hover:bg-gray-50",
                          ].join(" ")}
                          style={{
                            backgroundColor: active ? PRIMARY : undefined,
                            borderColor: active ? PRIMARY : undefined,
                          }}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Card nội dung giống ảnh */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    {/* Tiêu đề chặng (tùy chọn) */}
                    <p className="italic text-gray-700 mb-4">
                      {tour.rawData?.routeLabel ||
                        `${tour.location || "Điểm đến"} – Lịch trình tham khảo`}
                    </p>

                    <div className="space-y-3">
                      {itineraryParts[activePartIdx].items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          {/* Dot */}
                          <span
                            className="mt-2 inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: PRIMARY }}
                          />
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-x-2">
                              {item.time && (
                                <span className="text-sm font-semibold text-gray-900">
                                  {item.time}
                                </span>
                              )}
                              <span className="text-sm text-gray-700">
                                {item.title}
                                {item.description
                                  ? `, ${item.description}`
                                  : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </Card>

            {/* Special Requests */}
            {tour.specialRequests && (
              <Card
                className="border-l-4 mt-6 rounded-xl"
                style={{ borderLeftColor: "#f59e0b" }}
              >
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Yêu cầu đặc biệt
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {tour.specialRequests}
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1 space-y-6 sticky top-29 self-start">
            {/* Payment */}
            <Card className="rounded-xl">
              <div className="p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Thanh toán
                </h2>

            {/* ✅ Show pricing ONLY if both parties agreed */}
                {tour.bothAgreed ? (
                  <div className="space-y-3">
                    {/* Show agreed price vs initial budget if different */}
                    {tour.agreedPrice && tour.initialBudget && tour.agreedPrice !== tour.initialBudget ? (
                      <div className="pb-3 border-b border-gray-100 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Ngân sách khách đề xuất</span>
                          <span className="text-gray-500 line-through text-sm">
                            {tour.initialBudget?.toLocaleString("vi-VN") || 0} ₫
                          </span>
                        </div>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <span className="text-gray-900 font-semibold">Giá thỏa thuận</span>
                          <span className="text-xl font-bold text-emerald-600">
                            {tour.agreedPrice?.toLocaleString("vi-VN") || 0} ₫
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <span className="text-gray-600">Tổng giá trị</span>
                        <span className="text-xl font-bold text-gray-900">
                          {tour.totalPrice?.toLocaleString("vi-VN") || 0} ₫
                        </span>
                      </div>
                    )}

                    {tour.earnings !== undefined && tour.earnings !== null ? (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            Phí nền tảng (20%)
                          </span>
                          <span className="text-gray-700 font-medium">
                            -
                            {(tour.totalPrice - tour.earnings).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            ₫
                          </span>
                        </div>

                        <div
                          className="rounded-lg p-4 border"
                          style={{
                            background: "#ecfeff",
                            borderColor: "#bae6fd",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">
                              Thu nhập
                            </span>
                            <span
                              className="text-2xl font-bold"
                              style={{ color: PRIMARY }}
                            >
                              {tour.earnings?.toLocaleString("vi-VN") || 0} ₫
                            </span>
                          </div>
                        </div>
                      </>
                    ) : null}

                    {tour.paymentStatus && (
                      <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                        <span className="text-gray-600">Trạng thái</span>
                        <Badge
                          variant={
                            tour.paymentStatus === "paid" ? "success" : "warning"
                          }
                          className="rounded-full px-2.5 py-1 text-xs"
                        >
                          {tour.paymentStatus === "paid"
                            ? "Đã thanh toán"
                            : "Chưa thanh toán"}
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="p-4 rounded-lg border-l-4 bg-amber-50"
                    style={{ borderLeftColor: "#f59e0b" }}
                  >
                    <p className="text-sm text-gray-700 mb-3">
                      <span className="font-semibold">⏳ Đang đàm phán</span>
                    </p>
                    <div className="bg-white rounded-lg p-3 border border-amber-100">
                      <p className="text-xs text-gray-600 mb-1">Ngân sách khách đề xuất:</p>
                      <p className="text-lg font-bold text-gray-900">
                        {tour.initialBudget?.toLocaleString("vi-VN") || 0} ₫
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                      Giá thanh toán sẽ được xác định sau khi cả hai bên đồng ý về điều khoản.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Actions */}
            <Card className="rounded-xl">
              <div className="p-5 space-y-2">
                {/* Debug info */}
                <div className="text-xs text-gray-400 mb-2">
                  Status: {tour.status || "undefined"} | Agreement: {tour.bothAgreed ? "✅ Both agreed" : "⏳ Negotiating"}
                </div>

                {isRequest && (
                  <>
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={handleAcceptRequest}
                      className="rounded-full px-4 py-2.5 text-sm font-semibold"
                      style={{ backgroundColor: PRIMARY, color: "#fff" }}
                    >
                      Chấp nhận yêu cầu
                    </Button>
                    <Button
                      variant="danger"
                      fullWidth
                      onClick={handleDeclineRequest}
                      className="rounded-full px-4 py-2.5 text-sm font-semibold"
                    >
                      Từ chối yêu cầu
                    </Button>
                  </>
                )}

                {isUpcoming && (
                  <>
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={handleNavigateToLocation}
                      className="rounded-full px-4 py-2.5 text-sm font-semibold"
                      style={{ backgroundColor: PRIMARY, color: "#fff" }}
                    >
                      Chỉ đường
                    </Button>
                    <Button
                      fullWidth
                      onClick={() => setShowCancelModal(true)}
                      className="rounded-full px-4 py-2.5 text-sm font-semibold border-2 bg-red border-red-600 text-red-600 hover:bg-red-50"
                    >
                      Hủy Tour
                    </Button>
                  </>
                )}

                {isOngoing && (
                  <>
                    {/* Show payment status warning if not paid */}
                    {tour.paymentStatus !== 'paid' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 mb-2">
                        ⚠️ Chờ khách hàng thanh toán trước khi hoàn thành tour
                      </div>
                    )}
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => setShowCompleteModal(true)}
                      disabled={tour.paymentStatus !== 'paid'}
                      className="rounded-full px-4 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: PRIMARY, color: "#fff" }}
                    >
                      Hoàn thành Tour
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={handleNavigateToLocation}
                      className="rounded-full px-4 py-2.5 text-sm font-semibold"
                      style={{ borderColor: `${PRIMARY}55`, color: PRIMARY }}
                    >
                      Chỉ đường
                    </Button>
                  </>
                )}

                {isCompleted && (
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setShowChat(true)}
                    className="rounded-full px-4 py-2.5 text-sm font-semibold"
                    style={{ borderColor: `${PRIMARY}55`, color: PRIMARY }}
                  >
                    Nhắn tin khách
                  </Button>
                )}

                {/* Fallback buttons if no status matches */}
                {!isRequest && !isUpcoming && !isOngoing && !isCompleted && (
                  <>
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={handleNavigateToLocation}
                      className="rounded-full px-4 py-2.5 text-sm font-semibold"
                      style={{ backgroundColor: PRIMARY, color: "#fff" }}
                    >
                      Chỉ đường
                    </Button>
                    <Button
                      fullWidth
                      onClick={() => setShowCancelModal(true)}
                      className="rounded-full px-4 py-2.5 text-sm font-semibold border-2 bg-red border-red-600 text-red-600 hover:bg-red-50"
                    >
                      Hủy Tour
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Hoàn thành Tour"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Bạn có chắc chắn muốn đánh dấu tour này là đã hoàn thành?
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú hoàn thành (Tùy chọn)
            </label>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Thêm ghi chú về tour..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              rows={4}
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowCompleteModal(false)}
            >
              Hủy
            </Button>
            <Button variant="success" fullWidth onClick={handleCompleteTour}>
              Xác nhận hoàn thành
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal — replace the old <Modal>...</Modal> block with this */}
      <AnimatePresence>
        {showCancelModal && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCancelModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative"
            >
              {/* Close button (top-right) */}
              <button
                onClick={() => setShowCancelModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Đóng"
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

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-1">Hủy Tour</h3>
              <p className="text-gray-600 mb-4">
                Vui lòng cung cấp lý do hủy tour. Khách hàng sẽ được thông báo.
              </p>

              {/* Reason */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do hủy <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowCancelModal(false)}
                  className="rounded-full"
                >
                  Quay lại
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={handleCancelTour}
                  disabled={!cancelReason.trim()}
                  className="rounded-full"
                >
                  Xác nhận hủy
                </Button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Image gallery modal (nếu có nhiều ảnh) */}
      {showGallery && (
        <ImageGalleryModal
          images={tour.imageItems}
          onClose={() => setShowGallery(false)}
        />
      )}

      {/* Chat Modal Portal */}
      {showChat &&
        (isRequest || isUpcoming || isOngoing) &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl">
              <ChatBox
                requestId={id}
                customerName={tour.customerName}
                tourInfo={{
                  tourName: tour.tourName,
                  name: tour.tourName,
                  location: tour.location,
                  departureDate: tour.departureDate,
                  numberOfGuests: tour.numberOfGuests,
                  duration: tour.duration,
                  itinerary: tour.itinerary,
                  totalPrice: tour.totalPrice,
                }}
                onClose={() => setShowChat(false)}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

/* Tiny Chip component */
function Chip({ label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-lg p-3 border border-gray-200">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "#f0fdff" }}
      >
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: PRIMARY }}
        />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold text-gray-900 text-sm">{value}</p>
      </div>
    </div>
  );
}

/* Image Gallery Modal */
function ImageGalleryModal({ images, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasImages = Array.isArray(images) && images.length > 0;

  const prevImage = useCallback(() => {
    if (!hasImages) return;
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [hasImages, images]);

  const nextImage = useCallback(() => {
    if (!hasImages) return;
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [hasImages, images]);

  const goToImage = useCallback(
    (i) => {
      if (!hasImages) return;
      setCurrentIndex(i);
    },
    [hasImages]
  );

  const handleKey = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") onClose();
    },
    [prevImage, nextImage, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!hasImages) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white shadow-lg transition"
      >
        <svg
          className="w-6 h-6"
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

      <div className="flex-1 flex items-center justify-center w-full max-w-6xl px-4">
        <button
          onClick={prevImage}
          className="absolute left-4 md:left-10 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors z-10"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <img
          src={images[currentIndex]?.imageUrl || images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
        />

        <button
          onClick={nextImage}
          className="absolute right-4 md:right-10 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors z-10"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <span className="absolute bottom-6 right-6 text-white text-sm bg-black/50 px-3 py-1 rounded-lg">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      <div className="flex gap-2 mt-4 mb-6 overflow-x-auto px-4 max-w-6xl">
        {images.map((img, i) => (
          <img
            key={i}
            src={img?.imageUrl || img}
            onClick={() => goToImage(i)}
            alt={`Thumbnail ${i + 1}`}
            className={`h-16 w-24 object-cover rounded-lg cursor-pointer transition-all ${
              i === currentIndex
                ? "ring-2 ring-emerald-500 scale-105"
                : "opacity-70 hover:opacity-100"
            }`}
          />
        ))}
      </div>
    </div>,
    document.body
  );
}

export default GuideTourDetailPage;
