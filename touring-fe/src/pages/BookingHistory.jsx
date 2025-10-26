import { useEffect, useState } from "react";
import { useAuth } from "../auth/context";
import { Calendar, Users, Ticket, CreditCard, Loader2, Receipt } from "lucide-react";
import { formatVND, formatCurrency } from "@/lib/utils";

export default function BookingHistory() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`/api/bookings/my`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Không thể tải lịch sử đặt tour");
        const data = await response.json();
        const bookings = data.bookings || data.data || [];
        setBookings(bookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchBookings();
  }, [user]);

  const formatDateVN = (d) =>
    new Date(d).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const statusUI = (status) => {
    switch (status) {
      case "paid":
        return { text: "Đã thanh toán", className: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200" };
      case "pending":
        return { text: "Chờ thanh toán", className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200" };
      case "cancelled":
        return { text: "Thanh toán thất bại", className: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200" };
      case "refunded":
        return { text: "Đã hoàn tiền", className: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200" };
      default:
        return { text: "Đã hủy", className: "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200" };
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#02A0AA" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-rose-600 mb-3 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-2 rounded-md text-white text-sm"
            style={{ backgroundColor: "#02A0AA" }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

 return (
  // Toàn màn hình, không scroll body
  <div className="h-screen bg-neutral-50 overflow-hidden">
    {/* Container hẹp + full height */}
    <div className="max-w-4xl mx-auto h-full flex flex-col px-3 md:px-4 py-4 md:py-6">

      {/* Header (glass) cố định trên */}
      <h1
        className="relative mb-4 md:mb-5 text-xl md:text-2xl font-semibold tracking-tight 
                   text-neutral-800 backdrop-blur-md bg-white/40 border border-white/60 
                   shadow-sm rounded-xl px-4 py-3 flex items-center gap-2 shrink-0"
      >
        <span className="inline-block w-1.5 h-7 rounded-full" style={{ backgroundColor: "#02A0AA" }} />
        <span className="font-medium text-neutral-900">Lịch sử đặt tour</span>
      </h1>

      {/* Khu vực scroll riêng cho content */}
      <div className="relative flex-1 overflow-hidden">
        <div
          className="absolute inset-0 overflow-y-auto pr-1" 
          // pr-1 tránh che mất scrollbar bởi rounded/border
        >
          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
              <Ticket className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-700">Bạn chưa có booking nào</p>
              <button
                onClick={() => (window.location.href = "/")}
                className="mt-3 px-4 py-2 rounded-md text-white text-sm"
                style={{ backgroundColor: "#02A0AA" }}
              >
                Khám phá tour ngay
              </button>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {bookings.map((booking) => {
                const ui = statusUI(booking.status);
                return (
                  <div key={booking._id} className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                    {/* Header card */}
                    <div className="px-4 py-3 border-b border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 items-center">
                      <div className="flex items-center gap-2 text-neutral-900">
                        <Receipt className="w-4 h-4" style={{ color: "#02A0AA" }} />
                        <div className="leading-tight">
                          <p className="text-[11px] text-neutral-500">Mã đặt chỗ</p>
                          <p className="text-sm font-medium">
                            {booking.orderRef || booking._id.substring(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="sm:justify-center">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset"
                          style={{ color: "#03656B", backgroundColor: "#E6F7F8", borderColor: "#C7EFF2" }}
                          title="Ngày tạo booking"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDateVN(booking.createdAt)}
                        </span>
                      </div>

                      <div className="sm:justify-self-end">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${ui.className}`}>
                          {ui.text}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="space-y-3 mb-4">
                        {booking.items?.map((item, idx) => (
                          <div key={idx} className="flex gap-3 pb-3 border-b border-neutral-200 last:border-b-0">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-14 h-14 object-cover rounded-md border border-neutral-200"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-neutral-900 mb-1 line-clamp-1">
                                {item.name || "Tour"}
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                                <div className="flex items-center gap-1.5 text-neutral-600">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span className="truncate">{item.date}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-neutral-600">
                                  <Users className="w-3.5 h-3.5" />
                                  <span className="truncate">
                                    {item.adults > 0 && `${item.adults} người lớn`}
                                    {item.adults > 0 && item.children > 0 && ", "}
                                    {item.children > 0 && `${item.children} trẻ em`}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-1 text-[12px] text-neutral-500">
                                Giá {formatVND(item.unitPriceAdult || 0)}/người lớn
                                {item.children > 0 && ` · ${formatVND(item.unitPriceChild || 0)}/trẻ em`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2 text-neutral-700">
                          <CreditCard className="w-4 h-4" />
                          <div className="text-sm">
                            <span className="text-neutral-500">Thanh toán:&nbsp;</span>
                            <span className="font-semibold text-neutral-900">
                              {booking.payment?.provider || "N/A"}
                            </span>
                            {booking.payment?.orderId && (
                              <span className="ml-2 text-[12px] text-neutral-500">(ID: {booking.payment.orderId})</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          {/* Hiển thị giá gốc và discount nếu có */}
                          {booking.discountAmount > 0 && (
                            <div className="mb-1 space-y-0.5">
                              <div className="flex items-center justify-end gap-2 text-xs text-neutral-500">
                                <span>Tổng tiền:</span>
                                <span className="line-through">
                                  {formatCurrency(booking.originalAmount || 0, booking.currency || 'VND')}
                                </span>
                              </div>
                              <div className="flex items-center justify-end gap-2 text-xs font-medium" style={{ color: "#02A0AA" }}>
                                <span className="bg-teal-50 px-2 py-0.5 rounded text-[11px] uppercase font-semibold">
                                  {booking.voucherCode || 'VOUCHER'}
                                </span>
                                <span>-{formatCurrency(booking.discountAmount || 0, booking.currency || 'VND')}</span>
                              </div>
                            </div>
                          )}
                          <p className="text-base font-semibold tracking-tight" style={{ color: "#02A0AA" }}>
                            {formatCurrency(
                              booking.totalVND || booking.totalUSD || 0, 
                              booking.currency || 'VND'
                            )}
                          </p>
                        </div>
                      </div>

                      {booking.qrCode && (
                        <div className="mt-4 text-center">
                          <img src={booking.qrCode} alt="QR Code" className="w-24 h-24 mx-auto rounded border border-neutral-200" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}