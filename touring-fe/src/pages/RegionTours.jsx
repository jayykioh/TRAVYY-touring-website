import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TourCard from "../components/TourCard";
import logger from "../utils/logger";
import { MapPin, Package, ChevronLeft } from "lucide-react";

const API_BASE = "http://localhost:4000/api"; // như file 1

export default function RegionTours() {
  const { slug } = useParams(); // slug = locationId trong MongoDB
  const navigate = useNavigate();

  const [tours, setTours] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [sortBy, setSortBy] = useState("popular");
  const [filterCategory] = useState("all"); // để sau dùng filter nâng cao
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const toursPerPage = 20;
  const [loading, setLoading] = useState(true);

  // Scroll to top khi VÀO trang RegionTours (không áp dụng khi quay lại)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // chỉ chạy 1 lần khi mount

  // Reset page khi đổi sort/filter/slug
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, filterCategory, slug]);

  // Gọi API giống file 1
  useEffect(() => {
    if (!slug) return;
    fetchToursByLocation(slug);
  }, [slug]);

  async function fetchToursByLocation(locationId) {
    try {
      setLoading(true);
      logger.debug("🔍 [Frontend] Fetching tours for locationId:", locationId);

      const res = await fetch(`${API_BASE}/location-tours/${locationId}`);
      if (!res.ok) {
        logger.error(`❌ [Frontend] HTTP error! status: ${res.status}`);
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      logger.debug("✅ [Frontend] Received tours:", data);
      logger.debug("📊 [Frontend] Tours count:", data.length);

      setTours(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      logger.error("❌ [Frontend] Fetch tours failed:", err);
      setTours([]);
      setLoading(false);
    }
  }

  const handleFavoriteToggle = (tourId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(tourId) ? next.delete(tourId) : next.add(tourId);
      return next;
    });
  };

  // Lấy tên khu vực từ tour (locations có thể là array hoặc object)
  const getLocationName = () => {
    if (!tours.length) return "";
    const first = tours[0];
    const loc = first.locations;
    if (Array.isArray(loc)) {
      return loc[0]?.name || "";
    }
    if (loc && typeof loc === "object") {
      return loc.name || "";
    }
    return "";
  };

  const locationName = getLocationName();

  // Filter + Sort (style như file 2, nhưng dùng field của BE như file 1)
  const filteredTours = tours
    .filter(
      (tour) => filterCategory === "all" || tour.category === filterCategory
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.basePrice || 0) - (b.basePrice || 0);
        case "price-high":
          return (b.basePrice || 0) - (a.basePrice || 0);
        case "rating":
          return (b.isRating || 0) - (a.isRating || 0);
        case "popular":
          return (b.usageCount || 0) - (a.usageCount || 0);
        case "recently-added":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "recommended": {
          // Tạm thời coi "Đề xuất" = ưu tiên rating + usageCount
          const scoreA = (a.isRating || 0) * 1000 + (a.usageCount || 0);
          const scoreB = (b.isRating || 0) * 1000 + (b.usageCount || 0);
          return scoreB - scoreA;
        }
        default:
          return 0;
      }
    });

  // Pagination logic (giữ y chang style file 2)
  const totalPages = Math.ceil(filteredTours.length / toursPerPage);
  const startIndex = (currentPage - 1) * toursPerPage;
  const endIndex = startIndex + toursPerPage;
  const currentTours = filteredTours.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Loading state (giữ style mềm của file 2)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-teal-50/30 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Đang tải tour...</p>
      </div>
    );
  }

  // Không có tour
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
      {/* Header (style giống file 2) */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-600 hover:text-[#007980] transition-colors duration-300 group mb-2"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Quay lại</span>
          </button>

          <div className="flex items-center gap-2 my-2 ml-5">
            <MapPin className="w-5 h-7 text-gray-500 mb-5" />
            <div>
              <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r bg-gray-800 bg-clip-text text-transparent leading-tight">
                Các tour tại {locationName || "khu vực này"}
              </h2>
              <p className="text-gray-600 text-sm mt-0.5">
                {filteredTours.length > 999 ? "999+" : filteredTours.length}{" "}
                tour & hoạt động
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-1 py-3">
        {/* Sort dropdown (giữ nguyên style file 2) */}
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 items-end lg:items-center justify-end">
          <span className="text-gray-600 font-medium">Sắp xếp:</span>
          <div className="relative inline-block my-2 mb-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#03B3BE] min-w-[200px]"
            >
              <span className="flex-1 text-left text-gray-900">
                {sortBy === "recommended" && "Đề xuất"}
                {sortBy === "recently-added" && "Mới thêm gần đây"}
                {sortBy === "popular" && "Phổ biến nhất"}
                {sortBy === "rating" && "Đánh giá cao"}
                {sortBy === "price-low" && "Giá thấp đến cao"}
                {sortBy === "price-high" && "Giá cao đến thấp"}
              </span>
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {/* Đề xuất */}
                <button
                  onClick={() => {
                    setSortBy("recommended");
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 first:rounded-t-lg flex items-center justify-between ${
                    sortBy === "recommended"
                      ? "text-[#03B3BE] font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <span>Đề xuất</span>
                  {sortBy === "recommended" && (
                    <svg
                      className="w-5 h-5 text-[#03B3BE]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>

                {/* Giá thấp đến cao */}
                <button
                  onClick={() => {
                    setSortBy("price-low");
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                    sortBy === "price-low"
                      ? "text-[#03B3BE] font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <span>Giá thấp đến cao</span>
                  {sortBy === "price-low" && (
                    <svg
                      className="w-5 h-5 text-[#03B3BE]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>

                {/* Giá cao đến thấp */}
                <button
                  onClick={() => {
                    setSortBy("price-high");
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                    sortBy === "price-high"
                      ? "text-[#03B3BE] font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <span>Giá cao đến thấp</span>
                  {sortBy === "price-high" && (
                    <svg
                      className="w-5 h-5 text-[#03B3BE]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>

                {/* Phổ biến nhất */}
                <button
                  onClick={() => {
                    setSortBy("popular");
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                    sortBy === "popular"
                      ? "text-[#03B3BE] font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <span>Phổ biến nhất</span>
                  {sortBy === "popular" && (
                    <svg
                      className="w-5 h-5 text-[#03B3BE]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>

                {/* Mới thêm gần đây */}
                <button
                  onClick={() => {
                    setSortBy("recently-added");
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                    sortBy === "recently-added"
                      ? "text-[#03B3BE] font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <span>Mới thêm gần đây</span>
                  {sortBy === "recently-added" && (
                    <svg
                      className="w-5 h-5 text-[#03B3BE]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>

                {/* Đánh giá cao */}
                <button
                  onClick={() => {
                    setSortBy("rating");
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 last:rounded-b-lg flex items-center justify-between ${
                    sortBy === "rating"
                      ? "text-[#03B3BE] font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <span>Đánh giá cao</span>
                  {sortBy === "rating" && (
                    <svg
                      className="w-5 h-5 text-[#03B3BE]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tours Grid (style file 2, data BE) */}
        {currentTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {currentTours.map((tour) => (
              <TourCard
                key={tour._id}
                to={`/tours/${tour._id}`}
                image={tour.imageItems?.[0]?.imageUrl}
                title={tour.title}
                location={
                  Array.isArray(tour.locations)
                    ? tour.locations[0]?.name
                    : tour.locations?.name || "Địa điểm"
                }
                tags={tour.tags}
                rating={tour.isRating}
                reviews={tour.isReview}
                bookedText={`${tour.usageCount || 0} đã được đặt`}
                priceFrom={tour.basePrice}
                isFav={favorites.has(tour._id)}
                onFav={() => handleFavoriteToggle(tour._id)}
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

        {/* Pagination (giữ nguyên style file 2) */}
        {filteredTours.length > toursPerPage && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${
                currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() =>
                  typeof page === "number" && handlePageChange(page)
                }
                disabled={page === "..."}
                className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-all ${
                  page === currentPage
                    ? "bg-gray-800 text-white shadow-md"
                    : page === "..."
                    ? "text-gray-400 cursor-default"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full ${
                currentPage === totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
