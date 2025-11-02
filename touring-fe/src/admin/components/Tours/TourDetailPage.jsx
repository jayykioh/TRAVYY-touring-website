import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Star,
  Building2,
  Clock,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import { useState, useEffect } from "react";

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Hàm chuẩn hóa dữ liệu tour từ backend
  const formatTourData = (data) => {
    const durationText = data.duration
      ? `${data.duration.days} ngày ${data.duration.nights} đêm`
      : "Chưa xác định";

    const locationText = data.locations?.length
      ? data.locations.map((l) => l.name).join(" - ")
      : "Chưa xác định";

    const images = Array.isArray(data.imageItems)
      ? data.imageItems.map((i) => i.imageUrl || i).filter(Boolean)
      : [];

    const agency = {
      _id: data.agencyId._id,
      name: data.agencyId.name || "Chưa có tên",
      // contact là string email trực tiếp, phone là field riêng
      email: data.agencyId.contact || "Không có email",
      phone: data.agencyId.phone || "Không có số",
      address: data.agencyId.address || "Chưa có địa chỉ",
      logo:
        data.agencyId.image ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          data.agencyId.name || "Agency"
        )}&background=007980&color=fff`,
    };

    const itinerary = (data.itinerary || []).map((item, idx) => ({
      day: item.day || idx + 1,
      title: item.title || `Ngày ${idx + 1}`,
      part: item.part,
      activities: Array.isArray(item.description)
        ? item.description
        : [item.description].filter(Boolean),
    }));

    return {
      ...data,
      durationText,
      locationText,
      images,
      agency,
      itinerary,
    };
  };

  // ✅ Lấy dữ liệu tour & reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

        const [tourRes, reviewRes] = await Promise.all([
          fetch(`${API_URL}/api/tours/${id}`),
          fetch(`${API_URL}/api/reviews/tour/${id}`),
        ]);

        if (!tourRes.ok) throw new Error("Không thể tải thông tin tour");

        const tourData = await tourRes.json();
        const reviewsData = reviewRes.ok ? await reviewRes.json() : [];

        setTour(formatTourData(tourData));
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        setError(null);
      } catch (err) {
        console.error("❌ Error fetching:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ✅ Trạng thái loading
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007980] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin tour...</p>
        </div>
      </div>
    );

  // ✅ Trạng thái lỗi
  if (error || !tour)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
          <div className="text-5xl mb-3">⚠️</div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">
            Không thể tải tour
          </h3>
          <p className="text-gray-600 mb-6">
            {error || "Tour không tồn tại hoặc đã bị xóa"}
          </p>
          <button
            onClick={() => navigate("/admin/tours")}
            className="bg-[#007980] hover:bg-[#006670] text-white px-6 py-2.5 rounded-lg"
          >
            Quay lại danh sách tour
          </button>
        </div>
      </div>
    );

  // ✅ Tính toán thống kê
  const totalSeats =
    tour.departures?.reduce((sum, d) => sum + (d.seatsTotal || 0), 0) || 0;
  const bookedSeats =
    tour.departures?.reduce(
      (sum, d) => sum + ((d.seatsTotal || 0) - (d.seatsLeft || 0)),
      0
    ) || 0;
  const availableSeats =
    tour.departures?.reduce((sum, d) => sum + (d.seatsLeft || 0), 0) || 0;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  // ✅ Render giao diện
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate("/admin/tours")}
            className="flex items-center text-gray-600 hover:text-[#007980] transition mb-3 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Quay lại danh sách tour</span>
          </button>

          <div className="flex justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {tour.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5 text-[#007980]" />
                  <span>{tour.locationText}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5 text-[#007980]" />
                  <span>{tour.durationText}</span>
                </div>
                {reviews.length > 0 && (
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1.5 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{avgRating}</span>
                    <span className="ml-1">({reviews.length} đánh giá)</span>
                  </div>
                )}
              </div>
            </div>

            {tour.basePrice && (
              <div className="bg-gradient-to-br from-[#007980] to-[#005f68] text-white px-6 py-4 rounded-xl shadow-lg">
                <div className="text-sm opacity-90 mb-1">Giá từ</div>
                <div className="text-3xl font-bold">
                  {tour.basePrice.toLocaleString("vi-VN")}
                  <span className="text-lg ml-1">VNĐ</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          {tour.images?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <img
                src={tour.images[0]}
                alt={tour.title}
                className="w-full h-auto object-cover"
                onError={(e) =>
                  (e.target.src =
                    "https://via.placeholder.com/800x400?text=No+Image")
                }
              />
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Mô tả chi tiết
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {tour.description}
            </p>
          </div>

          {/* Itinerary */}
          {tour.itinerary?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-[#007980]" />
                Lịch trình chi tiết
              </h2>
              <div className="space-y-5">
                {tour.itinerary.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative pl-6 border-l-4 border-[#007980] pb-5 last:pb-0"
                  >
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-[#007980] border-4 border-white"></div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      Ngày {item.day}: {item.title}
                    </h3>
                    {item.part && (
                      <p className="text-sm text-[#007980] mt-1">{item.part}</p>
                    )}
                    {item.activities?.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {item.activities.map((a, i) => (
                          <li key={i} className="text-sm text-gray-700 flex">
                            <span className="text-[#007980] mr-2">•</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500 fill-yellow-500" />
              Đánh giá từ khách hàng
            </h2>
            {reviews.length > 0 ? (
              reviews.map((r) => (
                <div
                  key={r._id}
                  className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0"
                >
                  <div className="flex gap-3">
                    <img
                      src={
                        r.userId?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          r.userId?.name || "User"
                        )}&background=007980&color=fff`
                      }
                      alt={r.userId?.name || "User"}
                      className="w-12 h-12 rounded-full border"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {r.userId?.name || "Anonymous"}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      <p className="text-sm text-gray-600 mt-2">{r.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-6">
                Chưa có đánh giá nào
              </p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="space-y-6">
          {/* Agency Info */}
          {tour.agency && (
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-[#007980]" />
                Công ty quản lý
              </h2>
              <div className="flex items-center gap-3 mb-4 border-b pb-3">
                <img
                  src={tour.agency.logo}
                  alt={tour.agency.name}
                  className="w-14 h-14 rounded-full border-2 border-[#007980]/20"
                />
                <div>
                  <h3 className="font-bold">{tour.agency.name}</h3>
                  <p className="text-xs text-gray-500">Travel Agency</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-3 text-[#007980]" />
                  {tour.agency.phone}
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-3 text-[#007980]" />
                  {tour.agency.email}
                </div>
                <div className="flex items-start pt-2 border-t">
                  <MapPin className="w-4 h-4 mr-3 text-[#007980] mt-0.5" />
                  <span>{tour.agency.address}</span>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="bg-gradient-to-br from-[#007980] to-[#005f68] text-white rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Thống kê</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tổng chỗ:</span> <span>{totalSeats}</span>
              </div>
              <div className="flex justify-between">
                <span>Đã đặt:</span> <span>{bookedSeats}</span>
              </div>
              <div className="flex justify-between">
                <span>Còn lại:</span> <span>{availableSeats}</span>
              </div>
              <div className="flex justify-between">
                <span>Tỉ lệ đặt:</span>
                <span>
                  {totalSeats
                    ? Math.round((bookedSeats / totalSeats) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;
