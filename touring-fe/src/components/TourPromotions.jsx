import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { featuredTours } from "../mockdata/featuredTours";
import { destinationList } from "../mockdata/destinationList";
import TourCard from "./TourCard";

export default function TourPromotions() {
  const navigate = useNavigate();
  const [currentPromoSlide, setCurrentPromoSlide] = useState(0);
  const [currentTourSlide, setCurrentTourSlide] = useState(0);
  const [favorites, setFavorites] = useState(new Set([2, 4]));
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const allTours = Object.values(destinationList).flat();
  const daNangTours = Object.values(destinationList)
  .flat()
  .filter(tour => tour.location.includes("Đà Nẵng"));
  // Enhanced promotional banners matching the design
  const promotionalBanners = [
    {
      id: 1,
      title: "MÃ GIẢM",
      discount: "50%",
      subtitle: "SĂN DEAL",
      description: "SIÊU HOT",
      buttonText: "Săn Deal ngay",
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
      navigateToDiscounts: true,
    },
    {
      id: 3,
      title: "Sale Sinh Nhật",
      discount: "Sale Sinh Nhật",
      subtitle: "Vé tham quan & Khách sạn",
      description: "Giảm đến 40%",
      buttonText: "Khám phá ngay",
      bgGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      navigateToDiscounts: true,
    },
  ];

  // Destinations data
  const destinations = [
    {
      id: 1,
      name: "Hà Nội",
      image: "https://images.unsplash.com/photo-1537190559482-2ae7d7b9bb0b?q=80&w=800&auto=format&fit=crop",
      slug: "hanoi"
    },
    {
      id: 2,
      name: "Nha Trang",
      image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&auto=format&fit=crop",
      slug: "nhatrang"
    },
    {
      id: 3,
      name: "Đà Nẵng",
      image: "https://images.unsplash.com/photo-1701397955118-79059690ef50?q=80&w=800&auto=format&fit=crop",
      slug: "danang"
    },
    {
      id: 4,
      name: "Thành phố Hồ Chí Minh",
      image: "https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?q=80&w=800&auto=format&fit=crop",
      slug: "tphcm"
    },
    {
      id: 5,
      name: "Phú Quốc",
      image: "https://images.unsplash.com/photo-1563492065421-1b7901ce8450?q=80&w=800&auto=format&fit=crop",
      slug: "phuquoc"
    },
    {
      id: 6,
      name: "Hội An",
      image: "https://images.unsplash.com/photo-1552632306-fca45d7af12b?q=80&w=800&auto=format&fit=crop",
      slug: "hoian"
    }
  ];

  const creativeExperiences = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1170&auto=format&fit=crop",
      title: "Trải nghiệm độc đáo",
      description: "Khám phá những hoạt động thú vị và độc đáo mà chỉ có tại Đà Nẵng với những trải nghiệm không thể quên.",
      buttonText: "Khám phá ngay",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1170&auto=format&fit=crop",
      title: "Thiết kế tour theo phong cách của bạn",
      description: "Tạo ra hành trình du lịch riêng biệt phù hợp với sở thích và ngân sách của bạn.",
      buttonText: "Tùy chỉnh tour",
    },
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentPromoSlide((prev) => (prev + 1) % promotionalBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, promotionalBanners.length]);

  const handleFavoriteToggle = (tourId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tourId)) {
        newFavorites.delete(tourId);
      } else {
        newFavorites.add(tourId);
      }
      return newFavorites;
    });
  };

  const handlePromoButtonClick = (banner) => {
    if (banner.navigateToDiscounts) {
      navigate('/discount-codes');
    }
  };

  const nextPromoSlide = () => {
    setCurrentPromoSlide((prev) => (prev + 1) % promotionalBanners.length);
  };

  const prevPromoSlide = () => {
    setCurrentPromoSlide(
      (prev) => (prev - 1 + promotionalBanners.length) % promotionalBanners.length
    );
  };

  const nextTourSlide = () => {
    setCurrentTourSlide((prev) => Math.min(prev + 1, allTours.length - 3));
  };

  const prevTourSlide = () => {
    setCurrentTourSlide((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
      {/* Enhanced Promotional Banners */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Ưu đãi cho bạn
          </h2>

          <div
            className="relative rounded-2xl overflow-hidden"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentPromoSlide * 100}%)` }}
            >
              {promotionalBanners.map((banner) => (
                <div key={banner.id} className="w-full flex-shrink-0">
                  <div
                    className="relative h-48 rounded-2xl overflow-hidden flex items-center justify-between px-8 py-6"
                    style={{ background: banner.bgGradient }}
                  >
                    {/* Background decorative elements */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 right-16 text-6xl animate-pulse">⭐</div>
                      <div className="absolute bottom-4 right-8 text-4xl animate-bounce">✨</div>
                      <div className="absolute top-8 right-32 text-5xl animate-ping">🎯</div>
                    </div>

                    <div className="relative z-10 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-semibold">
                          {banner.title}
                        </span>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-4xl font-black text-white mb-1">
                          {banner.discount}
                        </h3>
                        <p className="text-xl font-bold text-white/90">
                          {banner.subtitle}
                        </p>
                        <p className="text-lg text-white/80">
                          {banner.description}
                        </p>
                      </div>

                      <button 
                        onClick={() => handlePromoButtonClick(banner)}
                        className="bg-white text-gray-900 px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        {banner.buttonText}
                      </button>
                    </div>

                    {/* Decorative circles and shapes */}
                    <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                      <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation buttons */}
            <button
              onClick={prevPromoSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextPromoSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {promotionalBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPromoSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentPromoSlide === index ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Các hoạt động nổi bật
              </h2>
              <p className="text-lg text-gray-600">
                Khám phá những trải nghiệm tuyệt vời nhất tại Đà Nẵng
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={prevTourSlide}
                disabled={currentTourSlide === 0}
                className="group p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 border border-gray-100"
              >
                <svg className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={nextTourSlide}
                disabled={currentTourSlide >= allTours.length - 3}
                className="group p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 border border-gray-100"
              >
                <svg className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div
              className="flex space-x-6 transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentTourSlide * 33.33}%)` }}
            >
              {daNangTours.map((tour) => (
                <div key={tour.id} className="flex-shrink-0">
                  <TourCard
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Region List Section */}
<section className="py-16">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="mb-12">
      <h2 className="text-4xl font-bold text-gray-900 mb-2">
        Bạn muốn đi đâu chơi?
      </h2>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {destinations.map((region) => (
        <div
          key={region.id}
          className="group relative rounded-2xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-500 hover:shadow-2xl"
          onClick={() => navigate(`/region/${region.slug}`)} // Chuyển hướng
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            <img
              src={region.image}
              alt={region.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/50 transition-all duration-500"></div>

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-lg drop-shadow-lg group-hover:scale-105 transition-transform duration-300">
                {region.name}
              </h3>
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      ))}
    </div>

    <div className="text-center">
      <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
        Xem tất cả
      </button>
    </div>
  </div>
</section>


      {/* Creative experiences section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Sáng tạo theo lối riêng
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tạo ra những kỷ niệm độc đáo với các trải nghiệm được thiết kế riêng cho bạn
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {creativeExperiences.map((experience, index) => (
              <div
                key={experience.id}
                className="group relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-700 cursor-pointer"
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={experience.image}
                    alt={experience.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-600/80 via-orange-600/60 to-black/40 group-hover:from-amber-600/70 group-hover:via-orange-600/50 transition-all duration-500"></div>
                  
                  <div className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-lg">
                      {experience.title}
                    </h3>
                    <p className="text-white/90 text-lg mb-6 leading-relaxed drop-shadow">
                      {experience.description}
                    </p>
                    <button className="bg-white text-gray-900 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl">
                      {experience.buttonText}
                    </button>
                  </div>
                </div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}