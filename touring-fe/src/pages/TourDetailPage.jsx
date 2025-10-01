import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, MapPin, Star, Plus, Minus } from "lucide-react";
// import { destinationList } from "../mockdata/destinationList";
import TourCard from "../components/TourCard";
import { useEffect } from "react";

export default function TourDetailPage() {
  const { id } = useParams();
  const tourId = id;
  const [tour, setTour] = useState(null);
  const [allTours, setAllTours] = useState([]);

  useEffect(() => {

    fetch(`http://localhost:5000/api/tours/${id}`)

      .then((res) => res.json())
      .then((data) => setTour(data))
      .catch((err) => console.error("Error fetching tour:", err));

    // Lấy danh sách để gợi ý

    fetch("http://localhost:5000/api/tours")


      .then((res) => res.json())
      .then((data) => setAllTours(data))
      .catch((err) => console.error("Error fetching tours:", err));

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tourId]);

  const [isFav, setIsFav] = useState(false);
  // const [selectedDate, setSelectedDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  // const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showMoreService, setShowMoreService] = useState(false);
  const navigate = useNavigate();

  // const allTours = Object.values(destinationList).flat();
  // const tour = allTours.find((t) => t.id.toString() === tourId);

  // if (!tour) return <div className="p-6">Không tìm thấy tour</div>;

  // const suggestedTours = allTours.filter((t) => t.id !== tour.id).slice(0, 4);

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const discountPercent = tour?.originalPrice
    ? Math.round(
        ((tour.originalPrice - tour.currentPrice) / tour.originalPrice) * 100
      )
    : null;

  if (!tour) {
    return <div className="p-6">Đang tải tour...</div>;
  }

  const handleFavorite = () => setIsFav(!isFav);

  const handleBooking = () => {
    alert(
      `Đặt tour: ${tour.title}\nSố lượng: ${quantity}\nTổng tiền: ${(
        tour.currentPrice * quantity
      ).toLocaleString()}₫`
    );
  };

  const suggestedTours = allTours
    .filter((t) => t._id !== tour?._id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center text-sm text-gray-600">
            <span className="text-blue-500 font-medium">Travyy Travel</span>
            <span className="mx-2">›</span>
            <span>{tour.location}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
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
                <div className="flex items-center gap-1 text-gray-600">
                  <span>{tour.booked} Đã đặt</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{tour.location}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-full border ${
                isFav
                  ? "bg-red-50 border-red-200"
                  : "bg-gray-50 border-gray-200"
              } hover:shadow-sm transition-all`}
            >
              <Heart
                className={`w-5 h-5 ${
                  isFav ? "text-red-500 fill-current" : "text-gray-400"
                }`}
              />
            </button>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="col-span-4 md:col-span-2 relative">
              <img
                src={tour.image}
                alt={tour.title}
                className="w-full h-64 md:h-80 object-cover rounded-lg"
              />
            </div>
            <div className="col-span-2 md:col-span-1 grid grid-rows-2 gap-2">
              <img
                src={tour.gallery?.[0] || tour.image}
                alt="Gallery 1"
                className="w-full h-32 md:h-39 object-cover rounded-lg"
              />
              <img
                src={tour.gallery?.[1] || tour.image}
                alt="Gallery 2"
                className="w-full h-32 md:h-39 object-cover rounded-lg"
              />
            </div>
            <div className="col-span-2 md:col-span-1 grid grid-rows-2 gap-2">
              <img
                src={tour.gallery?.[0] || tour.image}
                alt="Gallery 3"
                className="w-full h-32 md:h-39 object-cover rounded-lg"
              />
              <div className="relative">
                <img
                  src={tour.gallery?.[1] || tour.image}
                  alt="Gallery 4"
                  className="w-full h-32 md:h-39 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                  <button
                    // onClick={() => setShowAllPhotos(true)}
                    className="text-white font-medium text-sm"
                  >
                    Thư viện ảnh
                  </button>
                </div>
              </div>
            </div>
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
                  • Tại sân bay, đại diện của chúng tôi sẽ chào đón quý khách và
                  hỗ trợ quý khách trong mọi thủ tục giấy tờ tại sân bay một
                  cách nhanh chóng và thuận tiện nhất
                </p>
                {!showMoreService && (
                  <button
                    onClick={() => setShowMoreService(true)}
                    className="text-blue-600 font-medium underline text-sm"
                  >
                    Xem thêm ›
                  </button>
                )}

                {showMoreService && (
                  <p className="text-sm text-gray-600 mt-2">
                    {tour.moreServiceInfo}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Priority Banner */}
          <div
            //cần tạo thêm route /discounts trong App.jsx
            onClick={() => navigate("/discounts")}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-3 rounded-lg cursor-pointer border border-gray-300 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-between text-white font-semibold">
              <span>Ưu đãi cho bạn</span>
              <div className="flex items-center gap-2">
                <span className="bg-white text-blue-500 text-xs px-2 py-1 rounded">
                  Giảm 9%
                </span>
                <span>›</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Important Notes */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-blue-600 mb-4 border-l-4 border-blue-500 pl-3">
                  Những điều cần lưu ý
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Xác nhận</h3>
                    <p className="text-sm text-gray-600">
                      • Xác nhận ngay tức thời. Nếu bạn không nhận được email
                      xác nhận đơn hàng, hãy liên hệ với chúng tôi
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Điều kiện</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Trẻ em từ 2+ tuổi sẽ được tính phí như người lớn</p>
                      <p>
                        • Trẻ em dưới 2 tuổi được miễn phí nhưng phải đi cùng ít
                        nhất một người lớn. Nếu bạn có trẻ em dưới 2 tuổi đi
                        kèm, vui lòng cung cấp họ tên đầy đủ, quốc tịch và năm
                        sinh tại trang thanh toán
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Thông tin thêm</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        • <strong>Chú ý:</strong> Travyy và nhà cung cấp dịch vụ
                        sẽ không chịu trách nhiệm cho những vấn đề liên quan đến
                        VISA của quý khách. Dịch vụ đón tiễn ưu tiên không bao
                        gồm dịch vụ VISA
                      </p>
                      <p>• Not available from 00:00 AM to 05:00 AM everyday.</p>
                      <p>• Support Hotline: +84866624188</p>
                      <p>
                        {" "}
                        <p>
                          {tour.itinerary?.[0]?.description ||
                            "Chưa có lịch trình"}
                        </p>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-blue-600 mb-4 border-l-4 border-blue-500 pl-3">
                  Địa điểm
                </h2>
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Bản đồ sẽ hiển thị ở đây</p>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-blue-600 mb-4 border-l-4 border-blue-500 pl-3">
                  Đánh giá
                </h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="text-3xl">😊</div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {tour.rating}
                      </div>
                      <div className="text-sm text-gray-500">Hài lòng</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    / 5 | {tour.reviews?.toLocaleString()} Đánh giá
                  </div>
                </div>

                {/* Review Filters */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  <button className="px-3 py-1 text-sm border border-orange-300 text-orange-600 rounded-full">
                    Đánh giá phù hợp nhất
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded-full">
                    Tất cả
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded-full">
                    Có hình ảnh
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded-full">
                    Chỉ tiếng Việt
                  </button>
                </div>

                {/* Sample Review */}
                <div className="border-t pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-sm font-semibold">
                      J
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          Joselle ********
                        </span>
                        <span className="text-xs text-gray-500">
                          2025/07/29
                        </span>
                        <div className="flex items-center gap-1 ml-auto">
                          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                            Hài lòng
                          </span>
                          <span className="text-yellow-500 text-sm">5.0</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Đánh giá cho: Chuyến Bay Đêm • Chuyến bay quốc tế • Ưu
                        tiên
                      </p>
                      <p className="text-sm">
                        Một giá đình cả hài bé mới biết đi và một em bé đây là
                        một lần đi KHÔNG CẦN PHẢI SUY NGHĨ. Sân bay TSN không có
                        hàng ưu tiên, vì vậy dịch vụ này rất cần thiết, đặc biệt
                        đối với những người phải bắt chuyến bay khác, như chúng
                        tôi. Rất đáng giá.
                      </p>
                      <button className="text-sm text-blue-600 underline mt-2">
                        Hiển thị đánh giá gốc (NỘI dung tiếng đã được dịch)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Booking */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h3 className="font-semibold mb-4">Số lượng</h3>

                <div className="flex items-center justify-between mb-6">
                  <span className="text-gray-700">Người lớn</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decreaseQuantity}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{quantity}</span>
                    <button
                      onClick={increaseQuantity}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold">
                      ₫ {tour.currentPrice?.toLocaleString()}
                    </span>
                    {tour.originalPrice && (
                      <span className="text-gray-400 line-through text-sm">
                        ₫ {tour.originalPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {discountPercent && (
                    <div className="flex gap-2">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Sale
                      </span>
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
                        Giảm {discountPercent}%
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Vui lòng hoàn tất các mục yêu cầu để chuyển đến bước tiếp
                    theo
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleBooking}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Thêm vào giỏ hàng
                  </button>
                  <button
                    onClick={handleBooking}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Đặt ngay
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4 border-l-4 border-blue-500 pl-3">
              Câu hỏi thường gặp
            </h2>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Hỗ trợ khách hàng
            </button>
          </div>

          {/* Related Tours */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-blue-600 mb-6 border-l-4 border-blue-500 pl-3">
              Bạn có thể sẽ thích
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {suggestedTours.map((t) => (
                <TourCard
                  key={t._id}
                  to={`/tours/${t._id}`}
                  image={t.imageItems?.[0]?.imageUrl}
                  title={t.description}
                  location={t.locations?.[0]?.name || "Địa điểm"}
                  rating={t.isRating}
                  reviews={t.isReview}
                  bookedText={`${t.usageCount} Đã được đặt`}
                  priceFrom={t.basePrice}
                  originalPrice={t.basePrice}
                  onFav={() => handleFavorite(t._id)}
                  isFav={isFav}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
