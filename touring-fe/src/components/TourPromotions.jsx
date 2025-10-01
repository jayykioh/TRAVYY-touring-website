import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Award,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import TourCard from "./TourCard";

const TourPromotions = () => {
  const navigate = useNavigate();

  const [currentPromoSlide, setCurrentPromoSlide] = useState(0);
  const [currentTourSlide, setCurrentTourSlide] = useState(0);
  const [favorites, setFavorites] = useState(new Set([2, 4]));
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 👉 tours lấy từ API (toàn bộ, không chỉ Đà Nẵng)
  const [featuredTours, setFeaturedTours] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/tours")
      .then((res) => res.json())
      .then((data) => {
        console.log("Tours from API:", data);
        setFeaturedTours(data);
      })
      .catch((err) => console.error("Error fetching tours:", err));
  }, []);

  // Banner khuyến mãi
  const promotionalBanners = [
    {
      id: 1,
      title: "MÃ GIẢM",
      discount: "50%",
      subtitle: "SĂN DEAL",
      description: "SIÊU HOT",
      buttonText: "Săn Deal ngay",
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      icon: "🔥",
      navigateToDiscounts: true,
    },
    {
      id: 2,
      title: "SIÊU SALE",
      discount: "SINH NHẬT",
      subtitle: "KLOOK 11",
      description: "Chuyến đi trong mơ",
      buttonText: "Săn Sale ngay",
      bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      icon: "💳",
      navigateToDiscounts: true,
    },
    {
      id: 3,
      title: "Sale Sinh Nhật",
      discount: "40%",
      subtitle: "Vé tham quan & Khách sạn",
      description: "Giảm đến 40%",
      buttonText: "Khám phá ngay",
      bgGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      icon: "🎁",
      navigateToDiscounts: true,
    },
  ];

  // Danh sách vùng (grid bên dưới)
  const destinations = [
    {
      id: 1,
      name: "Hà Nội",
      image:
        "https://images.unsplash.com/photo-1537190559482-2ae7d7b9bb0b?q=80&w=800&auto=format&fit=crop",
      slug: "hanoi",
    },
    {
      id: 2,
      name: "Nha Trang",
      image:
        "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&auto=format&fit=crop",
      slug: "nhatrang",
    },
    {
      id: 3,
      name: "Đà Nẵng",
      image:
        "https://images.unsplash.com/photo-1701397955118-79059690ef50?q=80&w=800&auto=format&fit=crop",
      slug: "danang",
    },
    {
      id: 4,
      name: "Thành phố Hồ Chí Minh",
      image:
        "https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?q=80&w=800&auto=format&fit=crop",
      slug: "tphcm",
    },
    {
      id: 5,
      name: "Phú Quốc",
      image:
        "https://images.unsplash.com/photo-1563492065421-1b7901ce8450?q=80&w=800&auto=format&fit=crop",
      slug: "phuquoc",
    },
    {
      id: 6,
      name: "Hội An",
      image:
        "https://images.unsplash.com/photo-1552632306-fca45d7af12b?q=80&w=800&auto=format&fit=crop",
      slug: "hoian",
    },
  ];

  const creativeExperiences = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1170&auto=format&fit=crop",
      title: "Trải nghiệm độc đáo",
      description:
        "Khám phá những hoạt động thú vị tại Đà Nẵng với những trải nghiệm không thể quên.",
      buttonText: "Khám phá ngay",
      link: "/experiences/unique",
      gradientFrom: "amber-600",
      gradientTo: "orange-600",
      icon: <Sparkles className="w-6 h-6" />,
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1170&auto=format&fit=crop",
      title: "Thiết kế tour theo phong cách của bạn",
      description:
        "Tạo ra hành trình du lịch riêng biệt phù hợp với sở thích và ngân sách của bạn.",
      buttonText: "Tùy chỉnh tour",
      link: "/experiences/custom",
      gradientFrom: "blue-600",
      gradientTo: "indigo-600",
      icon: <Award className="w-6 h-6" />,
    },
  ];

  // Auto-play banner
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentPromoSlide((p) => (p + 1) % promotionalBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, promotionalBanners.length]);

  const handleFavoriteToggle = (tourId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(tourId) ? next.delete(tourId) : next.add(tourId);
      return next;
    });
  };
  const nextTourSlide = () =>
    setCurrentTourSlide((p) =>
      Math.min(p + 1, Math.max(0, featuredTours.length - 3))
    );
  const prevTourSlide = () => setCurrentTourSlide((p) => Math.max(p - 1, 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
      {/* Featured tours */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Các hoạt động nổi bật
              </h2>
              <p className="text-lg text-gray-600">
                Khám phá những trải nghiệm tuyệt vời nhất
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={prevTourSlide}
                disabled={currentTourSlide === 0}
                className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>

              <button
                onClick={nextTourSlide}
                disabled={currentTourSlide >= Math.max(0, featuredTours.length - 3)}
                className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div
              className="flex space-x-6 transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentTourSlide * 33.33}%)` }}
            >
              {featuredTours.map((tour) => (
                <div key={tour._id} className="flex-shrink-0">
                  <TourCard
                    to={`/tours/${tour._id}`}
                    image={tour.imageItems?.[0]?.imageUrl}
                    title={tour.name || tour.title}
                    location={tour.location || tour.locations?.[0]?.name || "Địa điểm"}
                    tags={tour.tags || []}
                    rating={tour.rating || 4.5}
                    reviews={tour.reviews || 0}
                    bookedText={`${tour.booked || 0} Đã được đặt`}
                    priceFrom={(tour.price || tour.basePrice || 0).toString()}
                    onFav={() => handleFavoriteToggle(tour._id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TourPromotions;
