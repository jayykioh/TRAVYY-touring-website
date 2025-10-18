import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  MapPin,
  Star,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import TourCard from "../components/TourCard";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../auth/context";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { createPortal } from "react-dom";
import { toast, Toaster } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import LocationCard from "../components/LocationCard";
import { optimizeImage } from "@/utils/imageUrl";
import ItinerarySection from "@/components/ItinerarySection";

export default function TourDetailPage() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { user } = useAuth();

  const [tour, setTour] = useState(null);
  const [allTours, setAllTours] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const primaryLoc = Array.isArray(tour?.locations) ? tour.locations[0] : null;
  const lat = primaryLoc?.coordinates?.lat ?? primaryLoc?.lat ?? null;
  const lng = primaryLoc?.coordinates?.lng ?? primaryLoc?.lng ?? null;
  const title = primaryLoc?.name || "Địa điểm";
  // gallery modal
  const [openGallery, setOpenGallery] = useState(false);

  // số lượng vé
  const [qtyAdult, setQtyAdult] = useState(1);
  const [qtyChild, setQtyChild] = useState(0);

  // show more service
  const [showMoreService, setShowMoreService] = useState(false);

  useEffect(() => {
    let ignore = false;
    const ac = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setErrMsg("");

        const [tourRes, listRes] = await Promise.all([
          fetch(`/api/tours/${routeId}`, { signal: ac.signal }),
          fetch(`/api/tours`, { signal: ac.signal }),
        ]);

        if (!tourRes.ok) throw new Error(`Tour ${routeId} not found`);
        if (!listRes.ok) throw new Error(`Cannot load tours list`);

        const [tourData, listData] = await Promise.all([
          tourRes.json(),
          listRes.json(),
        ]);

        if (!ignore) {
          setTour(tourData);
          if (user?.token) {
            fetch(`/api/wishlist/check/${tourData._id}`, {
              headers: { Authorization: `Bearer ${user.token}` },
            })
              .then((res) => res.json())
              .then((data) => setIsFav(data.isFav))
              .catch(() => {});
          }
          setAllTours(Array.isArray(listData) ? listData : []);
        }
      } catch (e) {
        if (!ignore && e.name !== "AbortError") {
          setErrMsg(e.message || "Lỗi tải dữ liệu");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      ignore = true;
      ac.abort();
    };
  }, [routeId, user?.token]);

  /* ========== GIÁ + NGÀY ========== */

  // danh sách departure mở
  const openDeps = useMemo(() => {
    const arr = Array.isArray(tour?.departures) ? tour.departures : [];
    return arr.filter(
      (d) => d?.status === "open" && typeof d?.date === "string"
    );
  }, [tour]);

  const openDates = useMemo(() => openDeps.map((d) => d.date), [openDeps]);

  // auto chọn ngày mở gần nhất
  const nearestOpenDate = useMemo(() => {
    if (!openDates.length) return "";
    return openDates.slice().sort((a, b) => new Date(a) - new Date(b))[0];
  }, [openDates]);

  const [selectedDate, setSelectedDate] = useState("");
  useEffect(() => {
    setSelectedDate(nearestOpenDate || "");
  }, [nearestOpenDate]);

  // departure đang chọn
  const selectedDeparture = useMemo(
    () => openDeps.find((d) => d.date === selectedDate),
    [openDeps, selectedDate]
  );

  // giá người lớn / trẻ em theo ngày (fallback basePrice nếu thiếu)
  const priceAdult = toNumber(
    selectedDeparture?.priceAdult ?? tour?.basePrice ?? 0
  );
  const priceChild = toNumber(
    selectedDeparture?.priceChild ??
      Math.round((selectedDeparture?.priceAdult ?? tour?.basePrice ?? 0) * 0.5)
  );

  // giá gốc (dùng để tính % giảm)
  const originalAdult = toNumber(
    selectedDeparture?.priceOriginalAdult ??
      selectedDeparture?.priceOriginal ??
      tour?.originalPrice ??
      null
  );

  const discountPercent = useMemo(() => {
    if (!originalAdult || originalAdult <= priceAdult) return null;
    return Math.round(((originalAdult - priceAdult) / originalAdult) * 100);
  }, [originalAdult, priceAdult]);

  // tổng tiền
  const subtotal = useMemo(
    () => priceAdult * qtyAdult + priceChild * qtyChild,
    [priceAdult, qtyAdult, priceChild, qtyChild]
  );

  const originalSubtotal = useMemo(() => {
    if (!originalAdult || originalAdult === priceAdult) return null;
    return originalAdult * qtyAdult + priceChild * qtyChild; // chỉ gạch phần người lớn nếu có giá gốc
  }, [originalAdult, priceAdult, qtyAdult, priceChild, qtyChild]);

  // gợi ý tour
  const suggestedTours = useMemo(() => {
    const curId = getId(tour);
    return allTours.filter((t) => getId(t) !== curId).slice(0, 4);
  }, [allTours, tour]);

  /* ========== HÀNH ĐỘNG ========== */

  const handleAdd = async () => {
    if (!tour) return;
    if (!user?.token) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }
    if (!selectedDate || !openDates.includes(selectedDate)) {
      toast("Vui lòng chọn ngày khởi hành hợp lệ");
      return;
    }
    if (qtyAdult <= 0) {
      toast.error("Phải có ít nhất 1 người lớn");
      return;
    }

    await add(
      {
        id: getId(tour),
        name: getTitle(tour),
        image: getMainImage(tour),
        selected: true, // không sao, BE vẫn kiểm soát cuối
        available: true,
      },
      qtyAdult,
      {
        date: selectedDate,
        adults: qtyAdult,
        children: qtyChild,
        // các field giá FE gửi chỉ để hiển thị — BE sẽ snapshot lại
        priceAdult,
        priceChild,
      }
    );
  };

  const handleBuyNow = async () => {
    if (!tour) return;
    if (!user?.token) {
      toast.error("Vui lòng đăng nhập để đặt ngay");
      return;
    }
    if (!selectedDate || !openDates.includes(selectedDate)) {
      toast("Vui lòng chọn ngày khởi hành hợp lệ");
      return;
    }
    if (qtyAdult <= 0) {
      toast.error("Phải có ít nhất 1 người lớn");
      return;
    }
    // Gửi thêm snapshot giá để trang checkout có thể tạo phiên MoMo chính xác
    const snapshotSubtotal = priceAdult * qtyAdult + priceChild * qtyChild;
    navigate("/booking", {
      state: {
        mode: "buy-now",
        item: {
          tourId: getId(tour),
          date: selectedDate,
          adults: qtyAdult,
          children: qtyChild,
          priceAdult, // giá người lớn tại thời điểm chọn
          priceChild, // giá trẻ em tại thời điểm chọn
          originalAdult, // giá gốc người lớn (nếu có) để hiển thị/giảm giá
          subtotal: snapshotSubtotal,
          originalSubtotal: originalSubtotal || null,
          discountPercent: discountPercent || null,
        },
      },
    });
  };

  const handleFavorite = async () => {
    if (!user?.token) {
      toast("Bạn cần đăng nhập để thêm vào wishlist");
      return;
    }
    try {
      const res = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ tourId: getId(tour) }),
      });
      const data = await res.json();
      setIsFav(data.isFav);
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(245,247,250,1),rgba(237,241,245,1))]">
        {/* breadcrumb skeleton */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/60 border-b border-white/40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <Skeleton className="h-5 w-64 rounded-md" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* header card */}
          <div className="rounded-2xl p-6 backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-7 w-2/3" />
                <div className="flex gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>

            {/* gallery grid */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              <Skeleton className="col-span-4 md:col-span-2 h-64 md:h-80 rounded-2xl" />
              <div className="col-span-2 md:col-span-1 grid grid-rows-2 gap-2">
                <Skeleton className="h-32 md:h-39 rounded-2xl" />
                <Skeleton className="h-32 md:h-39 rounded-2xl" />
              </div>
              <div className="col-span-2 md:col-span-1 grid grid-rows-2 gap-2">
                <Skeleton className="h-32 md:h-39 rounded-2xl" />
                <Skeleton className="h-32 md:h-39 rounded-2xl" />
              </div>
            </div>

            {/* 2 cột: content + booking */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* left content */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl p-6 backdrop-blur-xl bg-white/60 border border-white/50">
                  <Skeleton className="h-6 w-52 mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
                <div className="rounded-2xl p-6 bg-white/60 border border-white/50">
                  <Skeleton className="h-6 w-40 mb-4" />
                  <Skeleton className="h-64 w-full rounded-lg" />
                </div>
                <div className="rounded-2xl p-6 bg-white/60 border border-white/50">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              </div>

              {/* booking sidebar */}
              <div className="lg:col-span-1">
                <div className="rounded-2xl p-6 sticky top-6 bg-white/60 border border-white/50">
                  <Skeleton className="h-5 w-44 mb-3" />
                  <div className="flex flex-wrap gap-2 mb-5">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-28 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </div>

                  <Skeleton className="h-5 w-24 mb-4" />

                  <div className="space-y-4 mb-6">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>

                  <div className="space-y-3">
                    <Skeleton className="h-11 w-full rounded-2xl" />
                    <Skeleton className="h-11 w-full rounded-2xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* related */}
            <div className="mt-8 rounded-2xl p-6 bg-white/60 border border-white/50">
              <Skeleton className="h-6 w-56 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Skeleton className="h-60 rounded-xl" />
                <Skeleton className="h-60 rounded-xl" />
                <Skeleton className="h-60 rounded-xl" />
                <Skeleton className="h-60 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errMsg) return <div className="p-6 text-red-600">Lỗi: {errMsg}</div>;
  if (!tour) return <div className="p-6">Không tìm thấy tour</div>;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(245,247,250,1),rgba(237,241,245,1))]">
      {/* Breadcrumb (glass) */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/60 border-b border-white/40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <BreadcrumbNav
            items={[
              { label: "Travyy Travel", href: "/" },
              { label: getTitle(tour), href: `/tours/${routeId}` },
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header card (glass) */}
        <div className="rounded-2xl p-6 mb-6 backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <div className="flex justify-between items-start mb-4 gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                {getTitle(tour)}
              </h1>
              {/* Hiển thị thông tin đại lý */}
              {tour?.agencyId && (
                <div className="flex items-center gap-2 mt-1">
                  <img
                    src={tour.agencyId.image}
                    alt={tour.agencyId.name}
                    className="w-7 h-7 rounded-full object-cover border-2 border-gray-300 shadow-sm"
                  />
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{tour.agencyId.name}</span>
                    <div className="text-xs text-gray-500">
                      {tour.agencyId.contact}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="font-semibold">{tour?.isRating ?? "—"}</span>
                  <span className="text-gray-500">
                    ({formatNumber(tour?.isReview)} Đánh giá)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <span>
                    {formatNumber(tour?.usageCount ?? tour?.booked)} Đã đặt
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{getLocation(tour)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleFavorite}
              className={`shrink-0 p-2 rounded-full border transition-all hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 ${
                isFav
                  ? "bg-rose-50 border-rose-200"
                  : "bg-white/70 border-white/60"
              }`}
              aria-label="Yêu thích"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFav ? "text-rose-500 fill-current" : "text-gray-400"
                }`}
              />
            </button>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="col-span-4 md:col-span-2 relative">
              <img
                src={optimizeImage(tour.imageItems?.[0]?.imageUrl, 1920)}
                className="w-full h-64 md:h-80 object-cover rounded-2xl"
                onClick={() => setOpenGallery(true)}
              />
            </div>
            <div className="col-span-2 md:col-span-1 grid grid-rows-2 gap-2">
              <img
                src={optimizeImage(
                  tour.imageItems?.[1]?.imageUrl ||
                    tour.imageItems?.[0]?.imageUrl,
                  1920
                )}
                alt="Gallery 1"
                className="w-full h-32 md:h-39 object-cover rounded-2xl"
                onClick={() => setOpenGallery(true)}
              />
              <img
                src={optimizeImage(
                  tour.imageItems?.[2]?.imageUrl ||
                    tour.imageItems?.[0]?.imageUrl,
                  1920
                )}
                alt="Gallery 2"
                className="w-full h-32 md:h-39 object-cover rounded-2xl"
                onClick={() => setOpenGallery(true)}
              />
            </div>
            <div className="col-span-2 md:col-span-1 grid grid-rows-2 gap-2">
              <img
                src={optimizeImage(
                  tour.imageItems?.[3]?.imageUrl ||
                    tour.imageItems?.[0]?.imageUrl,
                  1920
                )}
                alt="Gallery 3"
                className="w-full h-32 md:h-39 object-cover rounded-2xl"
                onClick={() => setOpenGallery(true)}
              />
              <div className="relative">
                <img
                  src={optimizeImage(
                    tour.imageItems?.[4]?.imageUrl ||
                      tour.imageItems?.[0]?.imageUrl,
                    1920
                  )}
                  alt="Gallery 4"
                  className="w-full h-32 md:h-39 object-cover rounded-2xl"
                  onClick={() => setOpenGallery(true)}
                />
                <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center">
                  <button
                    onClick={() => setOpenGallery(true)}
                    className="text-white font-medium text-sm px-3 py-1 rounded-full border border-white/50 backdrop-blur-md"
                  >
                    Thư viện ảnh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {openGallery && (
            <ImageGalleryModal
              images={tour.imageItems}
              onClose={() => setOpenGallery(false)}
            />
          )}

          {/* Service Description */}
          <div className="p-4 rounded-2xl mb-6 backdrop-blur-xl bg-white/60 border border-white/50">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎉</div>
              <div className="space-y-2 text-sm">
                <p>
                  • Dịch vụ đón/tiễn ưu tiên tại sân bay (fast track) sẽ giúp
                  quý khách tiết kiệm thời gian.
                </p>
                <p>
                  • Đại diện của chúng tôi sẽ chào đón và hỗ trợ quý khách làm
                  thủ tục nhanh chóng, thuận tiện.
                </p>
                {!showMoreService ? (
                  <button
                    onClick={() => setShowMoreService(true)}
                    className="text-gray-900 font-medium underline text-sm hover:opacity-80"
                  >
                    Xem thêm ›
                  </button>
                ) : (
                  <p className="text-sm text-gray-700 mt-2">
                    {tour?.moreServiceInfo || "Hiện chưa có thông tin thêm."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Priority Banner */}
          <div
            onClick={() => navigate("/discounts")}
            className="cursor-pointer rounded-2xl px-4 py-3 backdrop-blur-xl bg-white/60 border border-white/50 hover:bg-white/70 transition-colors"
          >
            <div className="flex items-center justify-between text-gray-900 font-semibold">
              <span>Ưu đãi cho bạn</span>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full border border-black/10 bg-black/5">
                  {discountPercent ? `Giảm ${discountPercent}%` : "Deal hot"}
                </span>
                <span aria-hidden>›</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">
              {/* Notes */}
              <div className="rounded-2xl p-6 backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pl-3 border-l-4 border-gray-800/80">
                  Những điều cần lưu ý
                </h2>
                <div className="space-y-4">
                  <Section title="Xác nhận">
                    <li>
                      Xác nhận ngay tức thời. Nếu không nhận được email xác
                      nhận, hãy liên hệ với chúng tôi.
                    </li>
                  </Section>
                  <Section title="Điều kiện">
                    <li>Trẻ em từ 2+ tuổi được tính phí như người lớn.</li>
                    <li>
                      Trẻ dưới 2 tuổi miễn phí nhưng phải đi cùng ít nhất một
                      người lớn.
                    </li>
                  </Section>
                  <Section title="Thông tin thêm">
                    <li>
                      <strong>Chú ý:</strong> Dịch vụ đón tiễn ưu tiên không bao
                      gồm dịch vụ VISA.
                    </li>
                    <li>Not available from 00:00–05:00 h hằng ngày.</li>
                    <li>Hotline: +84866624188</li>
                  </Section>
                  <Section title="Lịch trình chi tiết">
                    <ItinerarySection itinerary={tour.itinerary} />
                  </Section>
                </div>
              </div>

              <div className="mt-6">
                <LocationCard lat={lat} lng={lng} title={title} />
              </div>
              <Reviews tour={tour} />
              <FAQSection />
            </div>

            {/* Right – Booking (glass sidebar) */}
            <div className="lg:col-span-1">
              <BookingSidebar
                // ngày
                openDeps={openDeps}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                // số lượng
                qtyAdult={qtyAdult}
                setQtyAdult={setQtyAdult}
                qtyChild={qtyChild}
                setQtyChild={setQtyChild}
                // giá + tổng
                priceAdult={priceAdult}
                priceChild={priceChild}
                discountPercent={discountPercent}
                subtotal={subtotal}
                originalSubtotal={originalSubtotal}
                onBuyNow={handleBuyNow}
                // action
                onAdd={handleAdd}
                tour={tour}
              />
            </div>
          </div>

          {/* Related Tours */}
          <RelatedTours
            tours={suggestedTours}
            onFav={handleFavorite}
            isFav={isFav}
          />
        </div>
      </div>
    </div>
  );
}

/* ================= Sub-components ================= */

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-semibold mb-2 text-gray-900">{title}</h3>
      <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
        {children}
      </ul>
    </div>
  );
}

function Reviews({ tour }) {
  return (
    <div className="rounded-2xl p-6 backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pl-3 border-l-4 border-gray-800/80">
        Đánh giá
      </h2>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="text-3xl">😊</div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {tour?.rating ?? "—"}
            </div>
            <div className="text-sm text-gray-600">Hài lòng</div>
          </div>
        </div>
        <div className="text-sm text-gray-700">
          / 5 | {formatNumber(tour?.reviews)} Đánh giá
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button className="px-3 py-1 text-sm rounded-full border border-black/10 bg-black/5 hover:bg-black/10">
          Đánh giá phù hợp nhất
        </button>
        <button className="px-3 py-1 text-sm rounded-full border border-black/10 bg-white/50 hover:bg-white/70">
          Tất cả
        </button>
        <button className="px-3 py-1 text-sm rounded-full border border-black/10 bg-white/50 hover:bg-white/70">
          Có hình ảnh
        </button>
        <button className="px-3 py-1 text-sm rounded-full border border-black/10 bg-white/50 hover:bg-white/70">
          Chỉ tiếng Việt
        </button>
      </div>

      <div className="border-t border-white/60 pt-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-sm font-semibold">
            J
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-gray-900">
                Joselle ********
              </span>
              <span className="text-xs text-gray-500">2025/07/29</span>
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                  Hài lòng
                </span>
                <span className="text-amber-500 text-sm">5.0</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Đánh giá cho: Chuyến Bay Đêm • Chuyến bay quốc tế • Ưu tiên
            </p>
            <p className="text-sm text-gray-800">
              Dịch vụ rất cần thiết khi phải nối chuyến. Rất đáng giá.
            </p>
            <button className="text-sm text-gray-900 underline mt-2 hover:opacity-80">
              Hiển thị đánh giá gốc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingSidebar({
  // ngày
  openDeps = [],
  selectedDate = "",
  onSelectDate = () => {},
  // số lượng
  qtyAdult,
  setQtyAdult,
  qtyChild,
  setQtyChild,
  // giá + tổng
  priceAdult,
  priceChild,
  discountPercent,
  subtotal,
  originalSubtotal,
  // action
  onAdd,
  onBuyNow,
}) {
  const hasDates = Array.isArray(openDeps) && openDeps.length > 0;
  const canAddChild = qtyAdult > 0;

  return (
    <div className="rounded-2xl p-6 sticky top-6 backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      {/* Chọn ngày */}
      <h3 className="font-semibold mb-3 text-gray-900">Chọn ngày khởi hành</h3>
      {hasDates ? (
        <div className="flex flex-wrap gap-2 mb-5">
          {openDeps.map((d) => {
            const active = d.date === selectedDate;
            const soldOut = d.status === "soldout" || d.seatsLeft === 0;
            return (
              <button
                key={d.date}
                type="button"
                disabled={soldOut}
                onClick={() => onSelectDate(d.date)}
                className={[
                  "px-3 py-1.5 rounded-full text-sm border transition",
                  active
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white/70 border-black/10 hover:bg-white",
                  soldOut ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
                title={formatDateVN(d.date)}
              >
                {formatDateVN(d.date)}
                {Number.isFinite(d.seatsLeft) && d.seatsLeft !== null
                  ? ` • còn ${d.seatsLeft}`
                  : ""}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mb-5 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
          Chưa có lịch khởi hành khả dụng
        </div>
      )}

      {/* Số lượng */}
      <h3 className="font-semibold mb-4 text-gray-900">Số lượng</h3>

      {/* Người lớn */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-gray-800">Người lớn</span>
          <span className="text-xs text-gray-500">
            ₫ {formatCurrency(priceAdult)} / khách
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQtyAdult(Math.max(0, qtyAdult - 1))}
            className="w-9 h-9 border border-black/10 rounded-full hover:bg-black/5 focus:outline-none"
            aria-label="Giảm NL"
          >
            <Minus className="w-4 h-4 mx-auto" />
          </button>
          <span className="w-8 text-center tabular-nums">{qtyAdult}</span>
          <button
            onClick={() => {
              const limit =
                openDeps.find((d) => d.date === selectedDate)?.seatsLeft ??
                Infinity;
              if (qtyAdult + qtyChild >= limit) {
                toast.error("Số lượng vé vượt quá số ghế còn lại");
                return;
              }
              setQtyAdult(qtyAdult + 1);
            }}
            className="w-9 h-9 border border-black/10 rounded-full hover:bg-black/5 focus:outline-none"
            aria-label="Tăng NL"
          >
            <Plus className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      {/* Trẻ em */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <span className="text-gray-800">Trẻ em</span>
          <span className="text-xs text-gray-500">
            ₫ {formatCurrency(priceChild)} / khách
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQtyChild(Math.max(0, qtyChild - 1))}
            className="w-9 h-9 border border-black/10 rounded-full hover:bg-black/5 focus:outline-none"
            aria-label="Giảm TE"
          >
            <Minus className="w-4 h-4 mx-auto" />
          </button>
          <span className="w-8 text-center tabular-nums">{qtyChild}</span>
          <button
            onClick={() => {
              const limit =
                openDeps.find((d) => d.date === selectedDate)?.seatsLeft ??
                Infinity;
              if (!canAddChild) {
                toast.error(
                  "Phải có ít nhất 1 người lớn trước khi chọn vé trẻ em"
                );
                return;
              }
              if (qtyAdult + qtyChild >= limit) {
                toast.error("Số lượng vé vượt quá số ghế còn lại");
                return;
              }
              setQtyChild(qtyChild + 1);
            }}
            className={`w-9 h-9 border border-black/10 rounded-full focus:outline-none ${
              canAddChild ? "hover:bg-black/5" : "opacity-50"
            }`}
          >
            <Plus className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      {/* Tổng tiền */}
      <div className="border-t border-white/60 pt-4 mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-gray-900">
            ₫ {formatCurrency(subtotal)}
          </span>
          {originalSubtotal && originalSubtotal !== subtotal && (
            <span className="text-gray-400 line-through text-sm">
              ₫ {formatCurrency(originalSubtotal)}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-600">
          (Giá hiển thị theo ngày đã chọn; tổng tiền = NL + TE)
        </div>

        {discountPercent && (
          <div className="flex gap-2 mt-2">
            <span className="text-xs px-2 py-1 rounded-full border border-rose-200 bg-rose-50 text-rose-600">
              Sale
            </span>
            <span className="text-xs px-2 py-1 rounded-full border border-rose-200 bg-rose-50 text-rose-600">
              Giảm {discountPercent}%
            </span>
          </div>
        )}
      </div>

      {/* Hành động */}
      <div className="space-y-3">
        <button
          onClick={onAdd}
          disabled={!selectedDate || qtyAdult <= 0}
          className={`w-full py-3 rounded-2xl font-semibold border border-black/10 text-white ${
            selectedDate && qtyAdult > 0
              ? "bg-[#02A0AA]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Thêm vào giỏ hàng
        </button>
        <button
          onClick={onBuyNow}
          disabled={!selectedDate || qtyAdult <= 0}
          className={`w-full py-3 rounded-2xl font-semibold border text-white ${
            selectedDate && qtyAdult > 0
              ? "bg-[#029faacc]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Đặt ngay
        </button>
      </div>
    </div>
  );
}

function FAQSection() {
  return (
    <div className="mt-8 rounded-2xl p-6 backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pl-3 border-l-4 border-gray-800/80">
        Câu hỏi thường gặp
      </h2>
      <button className="px-4 py-2 rounded-full text-sm border border-black/10 bg-white/70 hover:bg-white/90">
        Hỗ trợ khách hàng
      </button>
    </div>
  );
}

function RelatedTours({ tours }) {
  return (
    <div className="mt-8 rounded-2xl p-6 backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <h2 className="text-xl font-bold text-gray-900 mb-6 pl-3 border-l-4 border-gray-800/80">
        Bạn có thể sẽ thích
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tours.map((tour) => {
          return (
            <TourCard
              id={tour._id}
              to={`/tours/${tour._id}`}
              image={optimizeImage(tour.imageItems?.[0]?.imageUrl, 800)}
              title={tour.description}
              location={tour.locations?.[0]?.name || "Địa điểm"}
              tags={tour.tags}
              bookedText={`${tour.usageCount} Đã được đặt`}
              rating={tour.isRating}
              reviews={tour.isReview}
              priceFrom={tour.departures?.[0]?.priceAdult?.toString() || "N/A"}
              originalPrice={tour.basePrice}
            />
          );
        })}
      </div>
    </div>
  );
}

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
        <X className="w-6 h-6" />
      </button>

      <div className="flex-1 flex items-center justify-center w-full max-w-6xl">
        <button
          onClick={prevImage}
          className="absolute left-4 md:left-10 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <img
          src={images[currentIndex].imageUrl || images[currentIndex]}
          alt={`Ảnh ${currentIndex + 1}`}
          className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-xl"
        />

        <button
          onClick={nextImage}
          className="absolute right-4 md:right-10 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <span className="absolute bottom-6 right-6 text-white text-sm bg-black/50 px-3 py-1 rounded-lg">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      <div className="flex gap-2 mt-4 mb-6 overflow-x-auto px-4">
        {images.map((img, i) => (
          <img
            key={i}
            src={img.imageUrl || img}
            onClick={() => goToImage(i)}
            alt={`Thumbnail ${i + 1}`}
            className={`h-20 w-28 object-cover rounded-lg cursor-pointer transition ${
              i === currentIndex
                ? "ring-2 ring-white"
                : "opacity-70 hover:opacity-100"
            }`}
          />
        ))}
      </div>
    </div>,
    document.body
  );
}

/* ========== Helpers ========== */
function getId(t) {
  return t?._id ?? t?.id ?? String(t?.slug ?? "");
}
function getTitle(t) {
  return t?.title ?? t?.name ?? t?.description ?? "Tour";
}
function getLocation(t) {
  if (t?.location?.address) return t.location.address;
  if (Array.isArray(t?.locations) && t.locations[0]?.name)
    return t.locations[0].name;
  return "Địa điểm";
}
function getMainImage(t) {
  return (
    t?.imageItems?.[0]?.imageUrl ??
    t?.image ??
    t?.gallery?.[0] ??
    "https://via.placeholder.com/800x600"
  );
}
function formatNumber(n) {
  if (typeof n !== "number") return "0";
  return n.toLocaleString();
}
function toNumber(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}
function formatCurrency(n) {
  return new Intl.NumberFormat("vi-VN").format(toNumber(n));
}
function formatDateVN(dateStr) {
  if (!dateStr) return "";
  const s = String(dateStr).slice(0, 10); // "YYYY-MM-DD" / "YYYY-MM-DDT..."
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
  if (m) {
    const y = m[1];
    const mm = m[2].padStart(2, "0");
    const dd = m[3].padStart(2, "0");
    return `${dd}/${mm}/${y}`;
  }
  // fallback: cố parse nếu không đúng định dạng
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
