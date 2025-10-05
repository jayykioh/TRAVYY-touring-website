import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { destinationList } from "../mockdata/destinationList";
import TourCard from "./TourCard";
import { MapPin, Package, Filter, SlidersHorizontal, ChevronLeft, Sparkles } from "lucide-react";

export default function RegionTours() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [sortBy, setSortBy] = useState("popular");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Lấy tour theo slug như file 1
  useEffect(() => {
    if (slug && destinationList[slug]) {
      setTours(destinationList[slug]);
    } else {
      setTours([]);
    }
  }, [slug]);

  const handleFavoriteToggle = (tourId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(tourId) ? next.delete(tourId) : next.add(tourId);
      return next;
    });
  };

  // Lấy categories duy nhất
  const categories = ["all", ...new Set(tours.map((tour) => tour.category))];

  // Filter + Sort
  const filteredTours = tours
    .filter((tour) => filterCategory === "all" || tour.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.currentPrice - b.currentPrice;
        case "price-high":
          return b.currentPrice - a.currentPrice;
        case "rating":
          return b.rating - a.rating;
        case "popular":
        default:
          return parseInt(b.booked) - parseInt(a.booked);
      }
    });

  if (!tours.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-teal-50/30 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-gradient-to-r from-[#03B3BE] to-[#007980] rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Không tìm thấy tour
          </h2>
          <p className="text-gray-600 mb-6">
            Không có tour nào cho khu vực này.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-[#03B3BE] to-[#007980] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-teal-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#007980] transition-colors duration-300 group mb-4"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform [duration]-300" />
            <span className="font-medium">Quay lại</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-[#03B3BE] to-[#007980] rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r bg-[#007980] bg-clip-text text-transparent">
                {slug.replace("-", " ").toUpperCase()}
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredTours.length} tour & hoạt động
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & Sort */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Category Filter */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <Filter className="w-5 h-5 text-[#007980]" />
                <span>Lọc theo:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      filterCategory === cat
                        ? "bg-gradient-to-r bg-[#03B3BE] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat === "all" ? "Tất cả" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <SlidersHorizontal className="w-5 h-5 text-[#007980]" />
                <span>Sắp xếp:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03B3BE] focus:border-transparent transition-all duration-300 bg-white"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="rating">Đánh giá cao</option>
                <option value="price-low">Giá thấp đến cao</option>
                <option value="price-high">Giá cao đến thấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tours Grid */}
        {filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTours.map((tour) => (
              <TourCard
                key={tour.id}
                to={`/tours/${tour.id}`}
                image={tour.image}
                title={tour.title}
                location={tour.location}
                tags={tour.tags}
                rating={tour.rating}
                reviews={tour.reviews}
                bookedText={`${tour.booked} Đã được đặt`}
                priceFrom={tour.currentPrice.toString()}
                isFav={favorites.has(tour.id)}
                onFav={() => handleFavoriteToggle(tour.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Không tìm thấy tour
            </h3>
            <p className="text-gray-600">
              Không có tour nào phù hợp với bộ lọc của bạn.
            </p>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-16 bg-gradient-to-r from-[#03B3BE] to-[#007980] rounded-2xl p-8 text-center text-white shadow-2xl">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6" />
            <h3 className="text-2xl font-bold">Không tìm thấy tour phù hợp?</h3>
          </div>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Hãy để chúng tôi giúp bạn thiết kế hành trình du lịch độc đáo theo phong cách riêng của bạn
          </p>
          <button
            onClick={() => navigate("/experiences/custom")}
            className="bg-white text-[#007980] px-8 py-3 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95"
          >
            Tùy chỉnh tour của bạn
          </button>
        </div>
      </div>
    </div>
  );
}
