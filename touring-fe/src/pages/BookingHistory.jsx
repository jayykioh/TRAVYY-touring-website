import { useEffect, useState } from "react";
import { useAuth } from "../auth/context";
import { Calendar, Users, Ticket, CreditCard, Loader2, Receipt, Star } from "lucide-react";
import { formatVND, formatCurrency } from "@/lib/utils";
import { ReviewModal } from "../components/ProfileReviews";

export default function BookingHistory() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewModal, setReviewModal] = useState(null); // { isOpen, tourId, tourTitle, bookingId }
  const [reviewedBookings, setReviewedBookings] = useState(new Set()); // Track reviewed bookings

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
        console.log("=== BOOKING DATA LOADED ===");
        console.log("Raw booking data:", data);
        const bookings = data.bookings || data.data || [];
        console.log("Processed bookings:", bookings);
        bookings.forEach((booking, index) => {
          console.log(`Booking ${index}:`, {
            _id: booking._id,
            status: booking.status,
            items: booking.items?.map(item => ({
              tourId: item.tourId,
              name: item.name,
              date: item.date
            }))
          });
        });
        setBookings(bookings);
        
        // Check which bookings have been reviewed
        await checkReviewedBookings(bookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const checkReviewedBookings = async (bookings) => {
      try {
        const reviewedSet = new Set();
        
        // Get user's reviews to check which bookings have been reviewed
        const response = await fetch('/api/reviews/my', {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          const userReviews = data.reviews || [];
          
          // Add reviewed booking IDs to set (normalize to string _id)
          userReviews.forEach(review => {
            if (review.bookingId) {
              const bid = typeof review.bookingId === 'object'
                ? (review.bookingId._id ? review.bookingId._id.toString() : review.bookingId.toString())
                : review.bookingId.toString();
              reviewedSet.add(bid);
            }
          });
          
          setReviewedBookings(reviewedSet);
        }
      } catch (error) {
        console.error("Error checking reviewed bookings:", error);
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
      default:
        return { text: "Đã hủy", className: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200" };
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
                            {booking.bookingCode || booking._id.substring(0, 8).toUpperCase()}
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
                            <span className="font-medium text-neutral-900 uppercase">
                              {booking.payment?.provider || "N/A"}
                            </span>
                            {booking.payment?.orderID && (
                              <span className="ml-2 text-[12px] text-neutral-500">(ID: {booking.payment.orderID})</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
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

                      {/* Review section for paid tours */}
                      {booking.status === 'paid' && booking.items && booking.items.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-neutral-200">
                          {reviewedBookings.has(booking._id) ? (
                            /* Already reviewed */
                            <div className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg">
                              <Star className="w-4 h-4 fill-current" />
                              Đã đánh giá
                            </div>
                          ) : (
                            /* Can review */
                            <div className="flex flex-wrap gap-2">
                              {booking.items.map((item, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    console.log("Review button clicked - item:", item);
                                    // normalize tourId: sometimes item.tourId may be populated object
                                    const normalizedTourId = item?.tourId && typeof item.tourId === 'object'
                                      ? (item.tourId._id || item.tourId.toString())
                                      : item.tourId;

                                    setReviewModal({
                                      isOpen: true,
                                      tourId: normalizedTourId,
                                      tourTitle: item.name || 'Tour',
                                      bookingId: booking._id
                                    });
                                  }}
                                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                                  style={{ backgroundColor: "#02A0AA" }}
                                >
                                  <Star className="w-4 h-4" />
                                  Đánh giá tour
                                </button>
                              ))}
                            </div>
                          )}
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

    {/* Review Modal */}
    {reviewModal?.isOpen && (
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal(null)}
        tourId={reviewModal.tourId}
        tourTitle={reviewModal.tourTitle}
        bookingId={reviewModal.bookingId}
        onReviewSubmitted={(createdReview) => {
            setReviewModal(null);
            // If server returned the created review, use its bookingId to mark reviewed
            const rawBookingId = createdReview?.bookingId || reviewModal?.bookingId;
            const reviewedBookingId = typeof rawBookingId === 'object'
              ? (rawBookingId._id ? rawBookingId._id.toString() : rawBookingId.toString())
              : String(rawBookingId);
            if (reviewedBookingId) {
              setReviewedBookings(prev => new Set([...prev, reviewedBookingId]));
            }
          }}
      />
    )}
  </div>
  );
}