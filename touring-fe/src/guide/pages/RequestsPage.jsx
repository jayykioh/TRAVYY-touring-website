import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../auth/context";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import {
  Inbox,
  Calendar,
  Users,
  MapPin,
  Clock,
  XCircle,
  CheckCircle,
  Eye,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

const RequestsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [requests, setRequests] = useState([]);
  const [highlightNew, setHighlightNew] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const lastCountRef = useRef(0);

  const { withAuth } = useAuth();

  // 🟢 Fetch danh sách yêu cầu
  useEffect(() => {
    async function fetchRequests() {
      try {
        const data = await withAuth("/api/itinerary/guide/requests");
        if (data.success && Array.isArray(data.requests)) {
          const mapped = data.requests.map((it) => ({
            id: it._id,
            tourName: it.name || it.zoneName,
            customerId: it.userId?._id || it.userId,
            customerName: it.userId?.name || "Khách hàng",
            customerAvatar: it.userId?.avatar?.url || "",
            customerEmail: it.userId?.email || "",
            contactPhone: it.userId?.phone || "",
            location: it.zoneName,
            numberOfGuests: "",
            totalPrice: 500000,
            requestedAt: it.tourGuideRequest?.requestedAt,
            raw: it,
          }));

          const prev = lastCountRef.current || 0;
          if (mapped.length > prev) {
            setShowBanner(true);
            setTimeout(() => setShowBanner(false), 5000);
          }
          lastCountRef.current = mapped.length;
          setRequests(mapped);
        }
      } catch (e) {
        console.error("Lỗi khi lấy yêu cầu tour guide:", e);
      }
    }

    fetchRequests();
    const interval = setInterval(fetchRequests, 15000);
    const timer = setTimeout(() => setHighlightNew(false), 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [withAuth]);

  const isNewRequest = (requestedAt) => {
    try {
      return new Date() - new Date(requestedAt) < 48 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  };

  // 🟠 Hàm phản hồi API (giả lập)
  const guideRespond = async ({ requestId, action }) => {
    console.log("Guide Respond:", { requestId, action });
    await new Promise((r) => setTimeout(r, 800)); // mô phỏng delay
    return { success: true };
  };

  // 🟡 Xử lý click Accept / Decline -> mở modal
  const handleAccept = (id) => {
    setPendingAction({ id, type: "accept" });
  };
  const handleDecline = (id) => {
    setPendingAction({ id, type: "decline" });
  };

  const filterOptions = [
    { value: "all", label: "Tất cả", count: requests.length },
    { value: "today", label: "Hôm nay", count: 2 },
    { value: "week", label: "Tuần này", count: 4 },
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu tour</h1>
        <p className="text-gray-500">Xem và phản hồi các yêu cầu tour</p>
      </div>

      {/* 🔔 Banner thông báo yêu cầu mới */}
      {showBanner && (
        <div className="mb-4">
          <div className="bg-[#02A0AA] text-white px-4 py-2 rounded-lg flex items-center justify-between">
            <div className="text-sm">📬 Bạn có yêu cầu mới</div>
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

      {/* 🔘 Bộ lọc */}
      <div className="flex flex-wrap gap-2 mb-6">
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

      {/* 📭 Danh sách yêu cầu */}
      {requests.length === 0 ? (
        <Card className="text-center py-12">
          <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Không có yêu cầu</p>
          <p className="text-sm text-gray-400">
            Các yêu cầu tour mới sẽ hiển thị ở đây
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {requests.map((request) => {
            const isNew = isNewRequest(request.requestedAt);
            return (
              <Card
                key={request.id}
                hover
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/guide/requests/${request.id}`);
                  }
                }}
                className={`transition-all duration-300 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#02A0AA] ${
                  highlightNew && isNew
                    ? "ring-2 ring-[#02A0AA] shadow-xl animate-pulse"
                    : "hover:shadow-lg"
                }`}
                onClick={() => navigate(`/guide/requests/${request.id}`)}
              >
                <div className="flex items-start justify-between mb-4 relative">
                  <div className="flex items-center gap-3">
                    <img
                      src={request.customerAvatar}
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
                  <div className="absolute top-0 right-0 flex items-center gap-2">
                    {isNew && <Badge variant="warning">Mới</Badge>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/guide/requests/${request.id}`);
                      }}
                      className="p-2 rounded-full hover:bg-gray-100 transition"
                      title="Xem chi tiết"
                      aria-label="Xem chi tiết yêu cầu"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 mb-3 line-clamp-2">
                  {request.tourName}
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{request.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {request.numberOfGuests || "—"} khách
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tổng giá</span>
                    <span className="text-lg font-bold text-[#02A0AA]">
                      {request.totalPrice.toLocaleString("vi-VN")} VND
                    </span>
                  </div>
                </div>

                <div
                  className="flex gap-2 pt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="danger"
                    size="md"
                    className="flex-1 py-1 border-full font-semibold"
                    onClick={() => handleDecline(request.id)}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Từ chối
                  </Button>
                  <Button
                    variant="success"
                    size="md"
                    className="flex-1 py-1 border-full font-semibold"
                    onClick={() => handleAccept(request.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Chấp nhận
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ✅ Modal xác nhận */}
      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(v) => {
          if (!v) setPendingAction(null);
        }}
      >
        <AlertDialogContent className="max-w-md bg-white/95 backdrop-blur-xl border border-neutral-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-neutral-900">
              {pendingAction?.type === "accept"
                ? "Xác nhận chấp nhận hành trình"
                : "Xác nhận từ chối hành trình"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-neutral-500 pt-2">
              {pendingAction?.type === "accept"
                ? "Sau khi chấp nhận, hệ thống sẽ gửi thông báo cho người dùng."
                : "Bạn có chắc muốn từ chối hành trình này?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full px-4 py-2 border">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingAction) return;
                setActionLoading(true);
                try {
                  const res = await guideRespond({
                    requestId: pendingAction.id,
                    action:
                      pendingAction.type === "accept" ? "accept" : "reject",
                  });
                  if (res.success) {
                    setRequests((prev) =>
                      prev.filter((r) => r.id !== pendingAction.id)
                    );
                  }
                } catch (err) {
                  console.error("Respond error", err);
                } finally {
                  setActionLoading(false);
                  setPendingAction(null);
                }
              }}
              className="rounded-full px-4 py-2 bg-[#02A0AA] text-white"
            >
              {actionLoading
                ? "Đang xử lý..."
                : pendingAction?.type === "accept"
                ? "Chấp nhận"
                : "Từ chối"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RequestsPage;
