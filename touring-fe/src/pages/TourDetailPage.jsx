import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, MapPin, Star, Plus, Minus } from "lucide-react";
import { destinationList } from "../mockdata/destinationList";
import TourCard from "../components/TourCard";

export default function TourDetailPage() {
  const { id } = useParams();
  const tourId = id;
  const navigate = useNavigate();

  const [isFav, setIsFav] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showMoreService, setShowMoreService] = useState(false);

  // Scroll to top khi đổi tour
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tourId]);

  const allTours = Object.values(destinationList).flat();
  const tour = allTours.find((t) => t.id.toString() === tourId);

  if (!tour) return <div className="p-6">Không tìm thấy tour</div>;

  const suggestedTours = allTours.filter((t) => t.id !== tour.id).slice(0, 4);

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleFavorite = () => setIsFav(!isFav);

  const discountPercent = tour.originalPrice
    ? Math.round(((tour.originalPrice - tour.currentPrice) / tour.originalPrice) * 100)
    : null;

  const handleBooking = () => {
    alert(
      `Đặt tour: ${tour.title}\nSố lượng: ${quantity}\nTổng tiền: ${(tour.currentPrice * quantity).toLocaleString()}₫`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <Breadcrumb location={tour.location} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <TourHeader
          tour={tour}
          isFav={isFav}
          onFavorite={handleFavorite}
        />

        {/* Image Gallery */}
        <Gallery tour={tour} />

        {/* Service Highlight */}
        <ServiceHighlight
          showMore={showMoreService}
          onToggle={() => setShowMoreService(true)}
          moreInfo={tour.moreServiceInfo}
        />

        {/* Discount Banner */}
        <DiscountBanner onClick={() => navigate("/discounts")} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ImportantNotes />
            <MapSection />
            <Reviews tour={tour} />
          </div>

          <BookingSidebar
            tour={tour}
            quantity={quantity}
            onIncrease={increaseQuantity}
            onDecrease={decreaseQuantity}
            discountPercent={discountPercent}
            onBooking={handleBooking}
          />
        </div>

        <FAQSection />
        <RelatedTours tours={suggestedTours} onFav={handleFavorite} isFav={isFav} />
      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function Breadcrumb({ location }) {
  return (
    <div className="bg-white px-4 py-3 border-b">
      <div className="max-w-7xl mx-auto flex items-center text-sm text-gray-600">
        <span className="text-blue-500 font-medium">Travyy Travel</span>
        <span className="mx-2">›</span>
        <span>{location}</span>
      </div>
    </div>
  );
}

function TourHeader({ tour, isFav, onFavorite }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {tour.title}
          </h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-semibold">{tour.rating}</span>
              <span className="text-gray-500">
                ({tour.reviews?.toLocaleString()} Đánh giá)
              </span>
            </div>
            <span className="text-gray-600">{tour.booked} Đã đặt</span>
            <span className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4" />
              {tour.location}
            </span>
          </div>
        </div>
        <button
          onClick={onFavorite}
          className={`p-2 rounded-full border ${isFav ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"} hover:shadow-sm`}
        >
          <Heart className={`w-5 h-5 ${isFav ? "text-red-500 fill-current" : "text-gray-400"}`} />
        </button>
      </div>
    </div>
  );
}

function Gallery({ tour }) {
  return (
    <div className="grid grid-cols-4 gap-2 mb-6">
      <div className="col-span-4 md:col-span-2">
        <img src={tour.image} alt={tour.title} className="w-full h-64 md:h-80 object-cover rounded-lg" />
      </div>
      <div className="col-span-2 md:col-span-1 grid grid-rows-2 gap-2">
        <img src={tour.gallery?.[0] || tour.image} alt="Gallery 1" className="w-full h-32 object-cover rounded-lg" />
        <img src={tour.gallery?.[1] || tour.image} alt="Gallery 2" className="w-full h-32 object-cover rounded-lg" />
      </div>
      <div className="col-span-2 md:col-span-1 grid grid-rows-2 gap-2">
        <img src={tour.gallery?.[0] || tour.image} alt="Gallery 3" className="w-full h-32 object-cover rounded-lg" />
        <div className="relative">
          <img src={tour.gallery?.[1] || tour.image} alt="Gallery 4" className="w-full h-32 object-cover rounded-lg" />
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
            <button className="text-white font-medium text-sm">Thư viện ảnh</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceHighlight({ showMore, onToggle, moreInfo }) {
  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-6">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🎉</div>
        <div className="space-y-2 text-sm">
          <p>• Dịch vụ đón/tiễn ưu tiên tại sân bay giúp tiết kiệm thời gian làm thủ tục.</p>
          <p>• Đại diện của chúng tôi sẽ hỗ trợ bạn trong mọi thủ tục nhanh chóng, thuận tiện.</p>
          {!showMore && (
            <button onClick={onToggle} className="text-blue-600 font-medium underline text-sm">
              Xem thêm ›
            </button>
          )}
          {showMore && <p className="text-sm text-gray-600 mt-2">{moreInfo}</p>}
        </div>
      </div>
    </div>
  );
}

function DiscountBanner({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-3 rounded-lg cursor-pointer hover:shadow-lg transition"
    >
      <div className="flex items-center justify-between text-white font-semibold">
        <span>Ưu đãi cho bạn</span>
        <span className="flex items-center gap-2">
          <span className="bg-white text-blue-500 text-xs px-2 py-1 rounded">Giảm 9%</span> ›
        </span>
      </div>
    </div>
  );
}

function ImportantNotes() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-blue-600 mb-4 border-l-4 border-blue-500 pl-3">Những điều cần lưu ý</h2>
      <ul className="space-y-3 text-sm text-gray-600">
        <li><strong>Xác nhận:</strong> Ngay tức thời. Nếu không nhận được email, vui lòng liên hệ.</li>
        <li><strong>Điều kiện:</strong> Trẻ em từ 2 tuổi tính phí như người lớn. Dưới 2 tuổi miễn phí nhưng cần đi kèm người lớn.</li>
        <li><strong>Thông tin thêm:</strong> Không bao gồm VISA. Không hỗ trợ từ 00:00–05:00. Hotline: +84866624188</li>
      </ul>
    </div>
  );
}

function MapSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-blue-600 mb-4 border-l-4 border-blue-500 pl-3">Địa điểm</h2>
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Bản đồ sẽ hiển thị ở đây</p>
      </div>
    </div>
  );
}

function Reviews({ tour }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-blue-600 mb-4 border-l-4 border-blue-500 pl-3">Đánh giá</h2>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="text-3xl">😊</div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{tour.rating}</div>
            <div className="text-sm text-gray-500">Hài lòng</div>
          </div>
        </div>
        <div className="text-sm text-gray-600">/ 5 | {tour.reviews?.toLocaleString()} Đánh giá</div>
      </div>
      {/* sample review giữ nguyên */}
    </div>
  );
}

function BookingSidebar({ tour, quantity, onIncrease, onDecrease, discountPercent, onBooking }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
      <h3 className="font-semibold mb-4">Số lượng</h3>
      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-700">Người lớn</span>
        <div className="flex items-center gap-3">
          <button onClick={onDecrease} className="w-8 h-8 border rounded hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
          <span className="w-8 text-center">{quantity}</span>
          <button onClick={onIncrease} className="w-8 h-8 border rounded hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="border-t pt-4 mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold">₫ {tour.currentPrice?.toLocaleString()}</span>
          {tour.originalPrice && <span className="text-gray-400 line-through text-sm">₫ {tour.originalPrice?.toLocaleString()}</span>}
        </div>
        {discountPercent && (
          <div className="flex gap-2">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Sale</span>
            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">Giảm {discountPercent}%</span>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <button onClick={onBooking} className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600">Thêm vào giỏ hàng</button>
        <button onClick={onBooking} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">Đặt ngay</button>
      </div>
    </div>
  );
}

function FAQSection() {
  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-blue-600 mb-4 border-l-4 border-blue-500 pl-3">Câu hỏi thường gặp</h2>
      <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Hỗ trợ khách hàng</button>
    </div>
  );
}

function RelatedTours({ tours, onFav, isFav }) {
  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-blue-600 mb-6 border-l-4 border-blue-500 pl-3">Bạn có thể sẽ thích</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tours.map((t) => (
          <TourCard
            key={t.id}
            to={`/tours/${t.id}`}
            image={t.image}
            title={t.title}
            location={t.location}
            rating={t.rating}
            reviews={t.reviews}
            bookedText={`${t.booked?.toLocaleString()} Đã đặt`}
            priceFrom={t.currentPrice}
            onFav={() => onFav(t.id)}
            isFav={isFav}
          />
        ))}
      </div>
    </div>
  );
}
