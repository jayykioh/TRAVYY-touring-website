// src/pages/guide/RequestsPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../auth/context";
import { toast } from "sonner";
import Card from "../components/common/Card";
import RequestCard from "../components/common/RequestCard";
import { Inbox } from "lucide-react";
// ✅ dùng modal xác nhận dùng chung
import { useConfirm } from "../components/common/ConfirmProvider";

const RequestsPage = () => {
  const { withAuth } = useAuth();
  const confirm = useConfirm();

  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const lastCountRef = useRef(0);

  // Map TourCustomRequest (cuocthi API) to UI format
  const mapBackendRequest = (req) => {
    const itinerary = req.itineraryId || {};
    const customer = req.userId || {};

    // Get preferred date
    const preferredDate = req.preferredDates?.[0] || {};
    const startDate = preferredDate.startDate
      ? new Date(preferredDate.startDate)
      : null;
    const endDate = preferredDate.endDate
      ? new Date(preferredDate.endDate)
      : null;

    // Calculate duration in days
    let durationDays = 1;
    if (startDate && endDate) {
      durationDays =
        Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;
    }

    return {
      id: req._id,
      requestNumber: req.requestNumber || req._id.slice(-6),

      // Tour info
      tourName:
        req.tourDetails?.zoneName ||
        itinerary.zoneName ||
        itinerary.name ||
        "Custom Tour",
      location:
        req.tourDetails?.zoneName ||
        itinerary.zoneName ||
        req.tourDetails?.province ||
        "",
      numberOfGuests:
        req.tourDetails?.numberOfGuests || req.tourDetails?.numberOfPeople || 1,
      numberOfDays: durationDays,

      // Customer info
      customerId: customer._id || "",
      customerName: customer.name || "Khách hàng",
      customerAvatar:
        customer.avatar?.url ||
        customer.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          customer.name || "Khách hàng"
        )}`,
      customerEmail: customer.email || req.contactInfo?.email || "",
      contactPhone: customer.phone || req.contactInfo?.phone || "",

      // Dates
      departureDate: startDate ? startDate.toISOString() : "",
      returnDate: endDate ? endDate.toISOString() : "",
      startTime: startDate
        ? startDate.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      endTime: endDate
        ? endDate.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",

      // Pricing
      totalPrice: req.initialBudget?.amount || 0,
      currency: req.initialBudget?.currency || "VND",
      earnings: Math.round((req.initialBudget?.amount || 0) * 0.8), // 80% commission

      // Duration
      duration: itinerary.totalDuration
        ? `${Math.floor(itinerary.totalDuration / 60)}h ${
            itinerary.totalDuration % 60
          }m`
        : `${durationDays} ngày`,

      // Other info
      requestedAt: req.createdAt,
      specialRequests:
        req.specialRequirements || req.tourDetails?.specialRequirements || "",
      status: req.status,

      // Itinerary items
      itinerary: (itinerary.items || []).map((item) => ({
        title: item.name || item.placeName || "Điểm tham quan",
      })),

      // Keep raw data
      raw: req,
      rawItinerary: itinerary,
    };
  };

  const fetchRequests = useCallback(
    async (isInitialLoad = false) => {
      if (isInitialLoad) setLoading(true);
      try {
        const data = await withAuth(
          "/api/guide/custom-requests?status=pending,negotiating"
        );
        console.log("[RequestsPage] Raw API response:", data);

        const requestsArray = data.tourRequests || data.requests || [];

        if (Array.isArray(requestsArray)) {
          const mapped = requestsArray.map(mapBackendRequest);

          if (!isInitialLoad && mapped.length > lastCountRef.current) {
            setShowBanner(true);
            setTimeout(() => setShowBanner(false), 5000);
          }
          lastCountRef.current = mapped.length;

          setRequests(mapped);
        } else {
          console.warn("[RequestsPage] Invalid response format:", data);
          setRequests([]);
        }
      } catch (e) {
        console.error("[RequestsPage] Error fetching requests:", e);
        if (isInitialLoad) toast.error("Không thể tải danh sách yêu cầu");
      } finally {
        if (isInitialLoad) setLoading(false);
      }
    },
    [withAuth]
  );

  useEffect(() => {
    fetchRequests(true);
    const interval = setInterval(() => fetchRequests(false), 15000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  // === FILTER THEO MỤC TIÊU NGHIỆP VỤ ===
  const filterRequests = (all, filterValue) => {
    if (filterValue === "all") return all;

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return all.filter((r) => {
      const requestedAt = r.requestedAt ? new Date(r.requestedAt) : null;
      const departureDate = r.departureDate ? new Date(r.departureDate) : null;

      if (filterValue === "new") {
        return requestedAt && requestedAt >= twentyFourHoursAgo;
      }

      if (filterValue === "upcoming") {
        return (
          departureDate &&
          departureDate >= now &&
          departureDate <= sevenDaysAhead
        );
      }

      return true;
    });
  };

  const filteredRequests = filterRequests(requests, filter);

  const filterOptions = [
    { value: "all", label: "Tất cả", count: requests.length },
    {
      value: "new",
      label: "Mới (24h qua)",
      count: filterRequests(requests, "new").length,
    },
    {
      value: "upcoming",
      label: "Sắp khởi hành (7 ngày)",
      count: filterRequests(requests, "upcoming").length,
    },
  ];

  // === HÀNH ĐỘNG NHẤN NÚT XÁC NHẬN / TỪ CHỐI (dùng modal confirm chung) ===
  const handleAction = async (id, type) => {
    const isAccept = type === "accept";
    const ok = await confirm({
      title: isAccept
        ? "Xác nhận chấp nhận hành trình"
        : "Xác nhận từ chối hành trình",
      description: isAccept
        ? "Sau khi chấp nhận, hệ thống sẽ gửi thông báo cho người dùng và chuyển tour này vào danh sách 'Tour sắp diễn ra'."
        : "Bạn có chắc muốn từ chối hành trình này? Hành động này không thể hoàn tác.",
      confirmText: isAccept ? "Chấp nhận" : "Từ chối",
      cancelText: "Hủy",
      variant: isAccept ? "success" : "danger",
    });

    if (!ok) return;

    setActionLoading(true);
    const endpoint = isAccept
      ? `/api/guide/custom-requests/${id}/accept`
      : `/api/guide/custom-requests/${id}/reject`;

    try {
      console.log("[RequestsPage] Sending action to:", endpoint);
      const res = await withAuth(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isAccept
            ? {
                finalAmount: 0, // Backend will calculate from negotiation
                currency: "VND",
              }
            : {
                reason: "Declined by guide",
              }
        ),
      });

      console.log("[RequestsPage] Action response:", res);

      if (res.success) {
        toast.success(
          isAccept ? "✅ Đã chấp nhận yêu cầu tour!" : "✅ Đã từ chối yêu cầu"
        );
        setRequests((prev) => prev.filter((r) => r.id !== id));
        // Refetch after short delay to ensure backend state is synchronized
        setTimeout(() => fetchRequests(false), 800);
      } else {
        toast.error(res.error || "Xử lý thất bại");
      }
    } catch (e) {
      console.error("[RequestsPage] Error in action:", e);
      toast.error("❌ Có lỗi xảy ra: " + (e.message || "Lỗi không xác định"));
    } finally {
      setActionLoading(false);
    }
  };

  // Dùng để highlight các request được gửi trong HÔM NAY
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  return (
    <div className="px-6 py-4 min-h-screen">
      <div className="mb-6 ml-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
          Yêu cầu tour
        </h1>
        <p className="text-sm md:text-base text-gray-500">
          Xem và phản hồi các yêu cầu tour đang chờ bạn
        </p>
      </div>

      {showBanner && (
        <div className="mb-4">
          <div className="bg-[#02A0AA] text-white px-4 py-2 rounded-lg flex items-center justify-between">
            <div className="text-sm">Bạn có yêu cầu mới</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBanner(false)}
                className="text-xs px-3 py-1 bg-white/10 rounded"
              >
                Đóng
              </button>
              <button
                onClick={() => window.location.reload()}
                className="text-xs px-3 py-1 bg-white rounded text-[#02A0AA]"
              >
                Xem ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BỘ LỌC */}
      <div className="flex justify-end mb-6">
        <div className="flex flex-wrap gap-3">
          {filterOptions.map((opt) => {
            const isActive = filter === opt.value;
            const showBadge = opt.count > 0;

            return (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={[
                  "relative inline-flex items-center rounded-full",
                  "px-4 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#02A0AA] text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200",
                ].join(" ")}
              >
                <span>{opt.label}</span>
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 text-[11px] font-semibold text-white shadow">
                    {opt.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-[#02A0AA] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500">Đang tải yêu cầu...</p>
          </div>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className="text-center py-12">
          <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Không có yêu cầu</p>
          <p className="text-sm text-gray-400">
            Các yêu cầu tour mới sẽ hiển thị ở đây
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((r) => {
            const requestedAtDate = r.requestedAt
              ? new Date(r.requestedAt)
              : null;
            const isToday = requestedAtDate && requestedAtDate >= startOfToday;

            return (
              <RequestCard
                key={r.id}
                request={r}
                highlightNew={!!isToday}
                onActionClick={(id, type) =>
                  !actionLoading && handleAction(id, type)
                }
                disabled={actionLoading}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RequestsPage;
