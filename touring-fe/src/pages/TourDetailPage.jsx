import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, MapPin, Star, Plus, Minus } from "lucide-react";
import TourCard from "../components/TourCard";

const API_BASE = "http://localhost:4000/api";

export default function TourDetailPage() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [allTours, setAllTours] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showMoreService, setShowMoreService] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // Fetch tour + list (để gợi ý). Scroll to top khi đổi id
  useEffect(() => {
    let ignore = false;
    const ac = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setErrMsg("");

        const [tourRes, listRes] = await Promise.all([
          fetch(`${API_BASE}/tours/${routeId}`, { signal: ac.signal }),
          fetch(`${API_BASE}/tours`, { signal: ac.signal }),
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

  // Helpers cho giá/discount
  const currentPrice = tour?.currentPrice ?? tour?.basePrice ?? 0;
  const originalPrice = tour?.originalPrice ?? tour?.basePrice ?? null;
  const discountPercent = useMemo(() => {
    if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return null;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }, [originalPrice, currentPrice]);

  // Gợi ý tour khác
  const suggestedTours = useMemo(() => {
    const curId = getId(tour);
    return allTours
      .filter((t) => getId(t) !== curId)
      .slice(0, 4);
  }, [allTours, tour]);

  const increaseQuantity = () => setQuantity((n) => n + 1);
  const decreaseQuantity = () => setQuantity((n) => Math.max(1, n - 1));
  const handleFavorite = () => setIsFav((v) => !v);
  const handleBooking = () => {
    if (!tour) return;
    alert(
      `Đặt tour: ${getTitle(tour)}\nSố lượng: ${quantity}\nTổng tiền: ${(currentPrice * quantity).toLocaleString()}₫`
    );
  };

  if (loading) return <div className="p-6">Đang tải tour...</div>;
  if (errMsg) return <div className="p-6 text-red-600">Lỗi: {errMsg}</div>;
  if (!tour) return <div className="p-6">Không tìm thấy tour</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center text-sm text-gray-600">
            <span className="text-blue-500 font-medium">Travyy Travel</span>
            <span className="mx-2">›</span>
            <span>{getLocation(tour)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {getTitle(tour)}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold">{tour?.rating ?? "—"}</span>
                  <span className="text-gray-500">
                    ({formatNumber(tour?.reviews)} Đánh giá)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <span>{formatNumber(tour?.usageCount ?? tour?.booked)} Đã đặt</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{getLocation(tour)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-full border ${
                isFav ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
              } hover:shadow-sm transition-all`}
              aria-label="Yêu thích"
            >
              <Heart
                className={`w-5 h-5 ${isFav ? "text-red-500 fill-current" : "text-gray-400"}`}
              />
            </button>
          </div>

          {/* Service Description */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎉</div>
              <div className="space-y-2 text-sm">
                <p>
                  • Dịch vụ đón/tiễn ưu tiên tại sân bay (fast track) sẽ giúp
                  quý khách tiết kiệm thời gian, đặc biệt vào các khung giờ cao
                  điểm, trong quá trình chờ đợi làm thủ tục tại sân bay.
                </p>
                <p>
                  • Đại diện của chúng tôi sẽ chào đón và hỗ trợ quý khách làm
                  thủ tục nhanh chóng, thuận tiện.
                </p>
                {!showMoreService ? (
                  <button
                    onClick={() => setShowMoreService(true)}
                    className="text-blue-600 font-medium underline text-sm"
                  >
                    Xem thêm ›
                  </button>
                ) : (
                  <p className="text-sm text-gray-600 mt-2">
                    {tour?.moreServiceInfo || "Hiện chưa có thông tin thêm."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Priority Banner */}
          <div
            onClick={() => navigate("/discounts")}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-3 rounded-lg cursor-pointer border border-gray-300 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-between text-white font-semibold">
              <span>Ưu đãi cho bạn</span>
              <div className="flex items-center gap-2">
                {discountPercent ? (
                  <span className="bg-white text-blue-500 text-xs px-2 py-1 rounded">
                    Giảm {discountPercent}%
                  </span>
                ) : (
                  <span className="bg-white text-blue-500 text-xs px-2 py-1 rounded">
                    Deal hot
                  </span>
                )}
                <span>›</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">
              <Gallery tour={tour} />

              {/* Important Notes */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-blue-600 mb-4 border-l-4 border-blue-500 pl-3">
                  Những điều cần lưu ý
                </h2>
                <div className="space-y-4">
                  <Section title="Xác nhận">
                    <li>Xác nhận ngay tức thời. Nếu không nhận được email xác nhận, hãy liên hệ với chúng tôi.</li>
                  </Section>
                  <Section title="Điều kiện">
                    <li>Trẻ em từ 2+ tuổi được tính phí như người lớn.</li>
                    <li>Trẻ dưới 2 tuổi miễn phí nhưng phải đi cùng ít nhất một người lớn.</li>
                  </Section>
                  <Section title="Thông tin thêm">
                    <li>
                      <strong>Chú ý:</strong> Dịch vụ đón tiễn ưu tiên không bao gồm dịch vụ VISA.
                    </li>
                    <li>Not available from 00:00–05:00 h hằng ngày.</li>
                    <li>Hotline: +84866624188</li>
                    <li>{tour?.itinerary?.[0]?.description || "Chưa có lịch trình"}</li>
                  </Section>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-blue-600 mb-4 border-l-4 border-blue-500 pl-3">
                  Địa điểm
                </h2>
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Bản đồ sẽ hiển thị ở đây</p>
                </div>
              </div>

              <Reviews tour={tour} />

              <FAQSection />
            </div>

            {/* Right – Booking */}
            <div className="lg:col-span-1">
              <BookingSidebar
                tour={tour}
                quantity={quantity}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                discountPercent={discountPercent}
                onBooking={handleBooking}
                currentPrice={currentPrice}
                originalPrice={originalPrice}
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
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">{children}</ul>
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
        <img src={mainImg} alt={getTitle(tour)} className="w-full h-64 md:h-80 object-cover rounded-lg" />
      </div>
      <div className="col-span-2 md:col-span-1 grid grid-rows-2 gap-2">
        <img src={g0} alt="Gallery 1" className="w-full h-32 object-cover rounded-lg" />
        <img src={g1} alt="Gallery 2" className="w-full h-32 object-cover rounded-lg" />
      </div>
      <div className="col-span-2 md:col-span-1 grid grid-rows-2 gap-2">
        <img src={g0} alt="Gallery 3" className="w-full h-32 object-cover rounded-lg" />
        <div className="relative">
          <img src={g1} alt="Gallery 4" className="w-full h-32 object-cover rounded-lg" />
          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
            <button className="text-white font-medium text-sm">Thư viện ảnh</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Reviews({ tour }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-blue-600 mb-4 border-l-4 border-blue-500 pl-3">
        Đánh giá
      </h2>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="text-3xl">😊</div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{tour?.rating ?? "—"}</div>
            <div className="text-sm text-gray-500">Hài lòng</div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          / 5 | {formatNumber(tour?.reviews)} Đánh giá
        </div>
      </div>

      {/* Review Filters (placeholder) */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button className="px-3 py-1 text-sm border border-orange-300 text-orange-600 rounded-full">
          Đánh giá phù hợp nhất
        </button>
        <button className="px-3 py-1 text-sm border border-gray-300 rounded-full">Tất cả</button>
        <button className="px-3 py-1 text-sm border border-gray-300 rounded-full">Có hình ảnh</button>
        <button className="px-3 py-1 text-sm border border-gray-300 rounded-full">Chỉ tiếng Việt</button>
      </div>

      {/* Sample Review (placeholder) */}
      <div className="border-t pt-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-sm font-semibold">J</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">Joselle ********</span>
              <span className="text-xs text-gray-500">2025/07/29</span>
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">Hài lòng</span>
                <span className="text-yellow-500 text-sm">5.0</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Đánh giá cho: Chuyến Bay Đêm • Chuyến bay quốc tế • Ưu tiên
            </p>
            <p className="text-sm">
              Dịch vụ rất cần thiết khi phải nối chuyến. Rất đáng giá.
            </p>
            <button className="text-sm text-blue-600 underline mt-2">
              Hiển thị đánh giá gốc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingSidebar({
  tour,
  quantity,
  onIncrease,
  onDecrease,
  discountPercent,
  onBooking,
  currentPrice,
  originalPrice,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
      <h3 className="font-semibold mb-4">Số lượng</h3>
      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-700">Người lớn</span>
        <div className="flex items-center gap-3">
          <button onClick={onDecrease} className="w-8 h-8 border rounded hover:bg-gray-50">
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center">{quantity}</span>
          <button onClick={onIncrease} className="w-8 h-8 border rounded hover:bg-gray-50">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="border-t pt-4 mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold">₫ {formatNumber(currentPrice)}</span>
          {originalPrice && originalPrice !== currentPrice && (
            <span className="text-gray-400 line-through text-sm">₫ {formatNumber(originalPrice)}</span>
          )}
        </div>
        {discountPercent && (
          <div className="flex gap-2">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Sale</span>
            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">Giảm {discountPercent}%</span>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Vui lòng hoàn tất các mục yêu cầu để chuyển đến bước tiếp theo
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onBooking}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Thêm vào giỏ hàng
        </button>
        <button
          onClick={onBooking}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Đặt ngay
        </button>
      </div>
    </div>
  );
}

function FAQSection() {
  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-blue-600 mb-4 border-l-4 border-blue-500 pl-3">
        Câu hỏi thường gặp
      </h2>
      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
        Hỗ trợ khách hàng
      </button>
    </div>
  );
}

function RelatedTours({ tours, onFav, isFav }) {
  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-blue-600 mb-6 border-l-4 border-blue-500 pl-3">
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

/* ================= Utils ================= */

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
  return t?.imageItems?.[0]?.imageUrl ?? t?.image ?? t?.gallery?.[0] ?? "https://via.placeholder.com/800x600";
}
function formatNumber(n) {
  if (typeof n !== "number") return "0";
  return n.toLocaleString();
}
