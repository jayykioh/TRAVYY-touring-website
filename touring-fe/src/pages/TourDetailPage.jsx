import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, MapPin, Star, Plus, Minus } from "lucide-react";
import TourCard from "../components/TourCard";
import { useCart } from "../hooks/useCart";

export default function TourDetailPage() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [tour, setTour] = useState(null);
  const [allTours, setAllTours] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showMoreService, setShowMoreService] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

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
  }, [routeId]);

  const currentPrice = tour?.currentPrice ?? tour?.basePrice ?? 0;
  const originalPrice = tour?.originalPrice ?? tour?.basePrice ?? null;
  const unitPrice = toNumber(currentPrice);
  const unitOriginal = toNumber(originalPrice);

  const subtotal = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);
  const originalSubtotal = useMemo(
    () =>
      unitOriginal && unitOriginal !== unitPrice
        ? unitOriginal * quantity
        : null,
    [unitOriginal, unitPrice, quantity]
  );

  const discountPercent = useMemo(() => {
    if (!originalPrice || !currentPrice || originalPrice <= currentPrice)
      return null;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }, [originalPrice, currentPrice]);

  const suggestedTours = useMemo(() => {
    const curId = getId(tour);
    return allTours.filter((t) => getId(t) !== curId).slice(0, 4);
  }, [allTours, tour]);

  const handleAdd = () => {
    if (!tour) return;
    addToCart({
      id: getId(tour),
      name: getTitle(tour),
      image: getMainImage(tour),
      adults: quantity,
      children: 0,
      price: currentPrice,
      available: true,
      selected: true,
    });
    navigate("/shoppingcarts");
  };

  const increaseQuantity = () => setQuantity((n) => n + 1);
  const decreaseQuantity = () => setQuantity((n) => Math.max(1, n - 1));
  const handleFavorite = () => setIsFav((v) => !v);

  if (loading) return <div className="p-6">Đang tải tour...</div>;
  if (errMsg) return <div className="p-6 text-red-600">Lỗi: {errMsg}</div>;
  if (!tour) return <div className="p-6">Không tìm thấy tour</div>;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(245,247,250,1),rgba(237,241,245,1))]">
      {/* Breadcrumb (glass) */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/60 border-b border-white/40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Travyy Travel</span>
            <span className="mx-2 text-gray-400">›</span>
            <span className="truncate">{getLocation(tour)}</span>
          </div>
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
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="font-semibold">{tour?.rating ?? "—"}</span>
                  <span className="text-gray-500">
                    ({formatNumber(tour?.reviews)} Đánh giá)
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

          {/* Image Gallery (giữ bố cục, skin glass nhẹ) */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="col-span-4 md:col-span-2 relative">
              <img
                src={tour.imageItems?.[0]?.imageUrl}
                alt={tour.title}
                className="w-full h-64 md:h-80 object-cover rounded-2xl"
              />
            </div>
            <div className="col-span-2 md:col-span-1 grid grid-rows-2 gap-2">
              <img
                src={
                  tour.imageItems?.[1]?.imageUrl ||
                  tour.imageItems?.[0]?.imageUrl
                }
                alt="Gallery 1"
                className="w-full h-32 md:h-39 object-cover rounded-2xl"
              />
              <img
                src={
                  tour.imageItems?.[2]?.imageUrl ||
                  tour.imageItems?.[0]?.imageUrl
                }
                alt="Gallery 2"
                className="w-full h-32 md:h-39 object-cover rounded-2xl"
              />
            </div>
            <div className="col-span-2 md:col-span-1 grid grid-rows-2 gap-2">
              <img
                src={
                  tour.imageItems?.[3]?.imageUrl ||
                  tour.imageItems?.[0]?.imageUrl
                }
                alt="Gallery 3"
                className="w-full h-32 md:h-39 object-cover rounded-2xl"
              />
              <div className="relative">
                <img
                  src={
                    tour.imageItems?.[4]?.imageUrl ||
                    tour.imageItems?.[0]?.imageUrl
                  }
                  alt="Gallery 4"
                  className="w-full h-32 md:h-39 object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center">
                  <button className="text-white font-medium text-sm px-3 py-1 rounded-full border border-white/50 backdrop-blur-md">
                    Thư viện ảnh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Service Description (glass info) */}
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

          {/* Priority Banner: bỏ gradient → chip glass */}
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
              {/* Notes (glass card) */}
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
                    <li>
                      {tour?.itinerary?.[0]?.description ||
                        "Chưa có lịch trình"}
                    </li>
                  </Section>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="rounded-2xl p-6 backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pl-3 border-l-4 border-gray-800/80">
                  Địa điểm
                </h2>
                <div className="w-full h-64 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border border-white/50 flex items-center justify-center">
                  <p className="text-gray-500">Bản đồ sẽ hiển thị ở đây</p>
                </div>
              </div>

              <Reviews tour={tour} />
              <FAQSection />
            </div>

            {/* Right – Booking (glass sidebar) */}
            <div className="lg:col-span-1">
              <BookingSidebar
                tour={tour}
                quantity={quantity}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                discountPercent={discountPercent}
                onBooking={handleAdd}
                currentPrice={unitPrice}
                originalPrice={unitOriginal}
                subtotal={subtotal}
                originalSubtotal={originalSubtotal}
                onAdd={handleAdd}
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

function Gallery({ tour }) {
  const mainImg = getMainImage(tour);
  const g0 = tour?.gallery?.[0] || mainImg;
  const g1 = tour?.gallery?.[1] || mainImg;

  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="col-span-4 md:col-span-2">
        <img
          src={mainImg}
          alt={getTitle(tour)}
          className="w-full h-64 md:h-80 object-cover rounded-2xl"
        />
      </div>
      <div className="col-span-2 md:col-span-1 grid grid-rows-2 gap-2">
        <img
          src={g0}
          alt="Gallery 1"
          className="w-full h-32 object-cover rounded-2xl"
        />
        <img
          src={g1}
          alt="Gallery 2"
          className="w-full h-32 object-cover rounded-2xl"
        />
      </div>
      <div className="col-span-2 md:col-span-1 grid grid-rows-2 gap-2">
        <img
          src={g0}
          alt="Gallery 3"
          className="w-full h-32 object-cover rounded-2xl"
        />
        <div className="relative">
          <img
            src={g1}
            alt="Gallery 4"
            className="w-full h-32 object-cover rounded-2xl"
          />
          <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center">
            <button className="text-white font-medium text-sm px-3 py-1 rounded-full border border-white/50 backdrop-blur-md">
              Thư viện ảnh
            </button>
          </div>
        </div>
      </div>
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
  quantity,
  onIncrease,
  onDecrease,
  discountPercent,
  onBooking,
  currentPrice,
  originalSubtotal,
  subtotal,
  onAdd,
}) {
  return (
    <div className="rounded-2xl p-6 sticky top-6 backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <h3 className="font-semibold mb-4 text-gray-900">Số lượng</h3>
      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-800">Người lớn</span>
        <div className="flex items-center gap-3">
          <button
            onClick={onDecrease}
            className="w-9 h-9 border border-black/10 rounded-full hover:bg-black/5 transform hover:scale-110 transition-transform duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Giảm số lượng"
          >
            <Minus className="w-4 h-4 mx-auto" />
          </button>
          <span className="w-8 text-center tabular-nums">{quantity}</span>
          <button
            onClick={onIncrease}
            className="w-9 h-9 border border-black/10 rounded-full hover:bg-black/5 hover:scale-110  focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Tăng số lượng"
          >
            <Plus className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

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

        {/* Nếu vẫn muốn show đơn giá/ người */}
        <div className="text-xs text-gray-600">
          (Đơn giá: ₫ {formatCurrency(currentPrice)} / người)
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
        <p className="text-xs text-gray-600 mt-2">
          Vui lòng hoàn tất các mục yêu cầu để chuyển đến bước tiếp theo
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onAdd}
          className="w-full py-3 rounded-2xl font-semibold border border-black/10 bg-blue-600 text-white transform hover:scale-105 transition-transform duration-300 ease-in-out"
        >
          Thêm vào giỏ hàng
        </button>
        <button
          onClick={onBooking}
          className="w-full py-3 rounded-2xl font-semibold border border-black/10 bg-blue-800 text-white transform hover:scale-105 transition-transform duration-300 ease-in-out"
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

function RelatedTours({ tours, onFav, isFav }) {
  return (
    <div className="mt-8 rounded-2xl p-6 backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <h2 className="text-xl font-bold text-gray-900 mb-6 pl-3 border-l-4 border-gray-800/80">
        Bạn có thể sẽ thích
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tours.map((t) => {
          const id = getId(t);
          return (
            <TourCard
              key={id}
              to={`/tours/${id}`}
              image={getMainImage(t)}
              title={getTitle(t)}
              location={getLocation(t)}
              rating={t?.rating ?? t?.isRating ?? 4.8}
              reviews={t?.reviews ?? t?.isReview ?? 0}
              bookedText={`${formatNumber(t?.usageCount ?? t?.booked)} Đã đặt`}
              priceFrom={t?.currentPrice ?? t?.basePrice ?? 0}
              originalPrice={t?.originalPrice ?? t?.basePrice}
              onFav={() => onFav(id)}
              isFav={isFav}
            />
          );
        })}
      </div>
    </div>
  );
}

function getId(t) {
  return t?._id ?? t?.id ?? String(t?.slug ?? "");
}
function getTitle(t) {
  return t?.title ?? t?.name ?? t?.description ?? "Tour";
}
function getLocation(t) {
  return t?.location ?? t?.locations?.[0]?.name ?? "Địa điểm";
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
