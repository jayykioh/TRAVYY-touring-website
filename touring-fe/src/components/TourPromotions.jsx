import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Star,
  Clock,
  MapPin,
  Users,
  Calendar,
  Percent,
  Gift,
  CreditCard,
  ChevronLeft,
  Heart,
  Sparkles,
  TrendingUp,
  Award,
  Eye,
} from "lucide-react";

// Mock TourCard component since it's imported
const TourCard = ({ 
  image, title, location, tags, rating, reviews, bookedText, 
  priceFrom, originalPrice, discount, isPopular, isFav, onFav 
}) => {
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2 w-80">
      <div className="relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Favorite Button */}
        <button
          onClick={onFav}
          className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isFav ? 'bg-red-500/90 text-white' : 'bg-white/90 text-gray-600 hover:bg-red-50'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Phổ biến
          </div>
        )}

        {/* Discount Badge */}
        {discount && (
          <div className="absolute bottom-4 left-4 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
            -{discount}%
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{location}</span>
        </div>
        
        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="font-semibold text-gray-900">{rating}</span>
            <span className="text-sm text-gray-500">({reviews})</span>
          </div>
          <span className="text-sm text-gray-600">{bookedText}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {originalPrice.toLocaleString()}₫
              </span>
            )}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Từ</span>
              <span className="font-bold text-xl text-gray-900">
                {parseInt(priceFrom).toLocaleString()}₫
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TourPromotions = () => {
  const [currentPromoSlide, setCurrentPromoSlide] = useState(0);
  const [currentTourSlide, setCurrentTourSlide] = useState(0);
  const [favorites, setFavorites] = useState(new Set([2, 4]));
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const promotionalBanners = [
    {
      id: 1,
      title: "MỚI GIẢM",
      discount: "50%",
      subtitle: "SĂN DEAL SIÊU HOT",
      description: "Tháng cuối năm",
      buttonText: "Săn Deal ngay",
      bgColor: "from-orange-500 via-pink-500 to-red-500",
      textColor: "text-white",
      icon: "🔥",
    },
    {
      id: 2,
      title: "Giảm tối đa",
      discount: "8%",
      subtitle: "mọi đơn hàng",
      description: "Khi thanh toán bằng VISA",
      buttonText: "Săn mã ngay!",
      bgColor: "from-blue-600 via-blue-700 to-indigo-800",
      textColor: "text-white",
      icon: "💳",
    },
    {
      id: 3,
      title: "Ưu đãi được yêu thích",
      discount: "12%",
      subtitle: "Khách sạn và Trải nghiệm",
      description: "Giảm từ 10% trở lên",
      buttonText: "Khám phá ngay",
      bgColor: "from-purple-500 via-indigo-600 to-blue-600",
      textColor: "text-white",
      icon: "🎁",
    },
  ];

  const featuredTours = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1744902505884-d8ccfb88e319?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Dịch vụ du lịch",
      location: "Đà Nẵng",
      title: "Dịch Vụ Đón Tiễn Ưu Tiên Tại Sân Bay Đà Nẵng (DAD)",
      rating: 4.5,
      reviews: 1820,
      booked: "35K+",
      originalPrice: 650000,
      currentPrice: 585000,
      tags: ["Đặt trước cho ngày mai", "Miễn phí hủy"],
      isPopular: false,
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Công viên & Khu vui chơi",
      location: "Đà Nẵng",
      title: "Vé Sun World Ba Na Hills & Cầu Vàng (kèm cáp treo)",
      rating: 4.7,
      reviews: 5347,
      booked: "70K+",
      originalPrice: 900000,
      currentPrice: 810000,
      discount: 10,
      tags: ["Đặt ngay hôm nay", "Miễn phí hủy"],
      isPopular: true,
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1701397955118-79059690ef50?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Tour",
      location: "Đà Nẵng / Quảng Nam - Hội An",
      title:
        "Ngũ Hành Sơn – Phố Cổ Hội An – Thuyền Sông Hoài (tour trong ngày)",
      rating: 4.5,
      reviews: 5273,
      booked: "30K+",
      originalPrice: 950000,
      currentPrice: 807500,
      discount: 15,
      tags: ["Đặt trước cho ngày mai", "Đón tại khách sạn"],
      isPopular: false,
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1506358517354-a0b210578f0d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Tour",
      location: "Quảng Nam - Hội An",
      title:
        "Bình Minh Thánh Địa Mỹ Sơn & Thuyền Thúng Rừng Dừa Bảy Mẫu (từ Đà Nẵng/Hội An)",
      rating: 4.8,
      reviews: 1312,
      booked: "9K+",
      originalPrice: 1200000,
      currentPrice: 960000,
      discount: 20,
      tags: ["Tour riêng", "Đón tại khách sạn"],
      isPopular: true,
    },
  ];

  const creativeExperiences = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1170&auto=format&fit=crop",
      title: "Trải nghiệm độc đáo",
      description: "Khám phá những hoạt động thú vị và độc đáo mà chỉ có tại Đà Nẵng với những trải nghiệm không thể quên.",
      buttonText: "Khám phá ngay",
      link: "/experiences/unique",
      gradientFrom: "amber-600",
      gradientTo: "orange-600",
      icon: <Sparkles className="w-6 h-6" />,
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1170&auto=format&fit=crop",
      title: "Thiết kế tour theo phong cách của bạn",
      description: "Tạo ra hành trình du lịch riêng biệt phù hợp với sở thích và ngân sách của bạn.",
      buttonText: "Tùy chỉnh tour",
      link: "/experiences/custom",
      gradientFrom: "blue-600",
      gradientTo: "indigo-600",
      icon: <Award className="w-6 h-6" />,
    },
  ];

  // Auto-play for promotional banners
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentPromoSlide((prev) => (prev + 1) % promotionalBanners.length);
    }, 4000);

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

  const nextPromoSlide = () => {
    setCurrentPromoSlide((prev) => (prev + 1) % promotionalBanners.length);
  };

  const prevPromoSlide = () => {
    setCurrentPromoSlide(
      (prev) => (prev - 1 + promotionalBanners.length) % promotionalBanners.length
    );
  };

  const nextTourSlide = () => {
    setCurrentTourSlide((prev) => Math.min(prev + 1, featuredTours.length - 3));
  };

  const prevTourSlide = () => {
    setCurrentTourSlide((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
      {/* Promotional Banners Section - HIỂN THỊ promotionalBanners DATA */}
      <section className="py-16">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
      Ưu đãi đặc biệt
    </h2>

    {/* Wrapper có padding để tránh overlay đè border */}
    <div
      className="relative rounded-3xl shadow-2xl border border-white/10 overflow-hidden bg-gradient-to-r from-blue-500/30 to-indigo-500/30"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slide Track */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentPromoSlide * 100}%)` }}
      >
        {promotionalBanners.map((banner) => (
          <div key={banner.id} className="w-full flex-shrink-0">
            <div
              className={`relative h-96 rounded-3xl overflow-hidden flex items-center justify-between px-8 py-8 bg-gradient-to-r ${banner.bgColor}`}
            >
              {/* Glass Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 backdrop-blur-[1px]" />

              {/* Content */}
              <div className="relative z-10 flex-1 max-w-2xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/20">
                  <span className="text-2xl">{banner.icon}</span>
                  <span className="text-sm font-semibold text-white uppercase tracking-wider">
                    {banner.title}
                  </span>
                </div>

                {/* Discount */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-8xl font-black text-white drop-shadow-2xl leading-none">
                      {banner.discount}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-base text-white/90 uppercase tracking-wide font-semibold">
                        GIẢM GIÁ
                      </span>
                      <span className="text-sm text-white/70">Lên đến</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-lg leading-tight">
                  {banner.subtitle}
                </h3>

                <p className="text-white/90 text-xl mb-10 drop-shadow leading-relaxed">
                  {banner.description}
                </p>

                <button className="group relative bg-white text-gray-900 px-12 py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 overflow-hidden">
                  <span className="relative z-10">{banner.buttonText}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>

              {/* Side Decoration */}
              <div className="hidden lg:flex flex-col items-center justify-center w-64 h-full relative z-10">
                <div className="relative">
                  <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <span className="text-5xl">{banner.icon}</span>
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 rounded-full animate-pulse" />
                  <div className="absolute -bottom-5 -left-5 w-8 h-8 bg-white/30 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls nằm ngoài card */}
      <button
        onClick={prevPromoSlide}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 sm:p-4 rounded-full transition-all duration-300 shadow-lg"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextPromoSlide}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 sm:p-4 rounded-full transition-all duration-300 shadow-lg"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicators nằm ngoài khung, tránh đè border */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {promotionalBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPromoSlide(index)}
            className={`transition-all duration-300 ${
              currentPromoSlide === index
                ? "w-8 h-3 bg-blue-600 rounded-full"
                : "w-3 h-3 bg-gray-300 hover:bg-gray-400 rounded-full"
            }`}
          />
        ))}
      </div>

      {/* Counter đặt góc ngoài */}
      <div className="absolute -top-6 right-0 bg-gray-900/70 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
        {currentPromoSlide + 1} / {promotionalBanners.length}
      </div>
    </div>
  </div>
</section>

      {/* Featured Tours Section - HIỂN THỊ featuredTours DATA */}
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
                <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
              
              <button
                onClick={nextTourSlide}
                disabled={currentTourSlide >= featuredTours.length - 3}
                className="group p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 border border-gray-100"
              >
                <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div
              className="flex space-x-6 transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentTourSlide * 33.33}%)` }}
            >
              {featuredTours.map((tour) => (
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
                    originalPrice={tour.originalPrice}
                    discount={tour.discount}
                    isPopular={tour.isPopular}
                    isFav={favorites.has(tour.id)}
                    onFav={() => handleFavoriteToggle(tour.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Creative Experiences Section */}
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
            {creativeExperiences.map((experience) => (
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
                  <div className={`absolute inset-0 bg-gradient-to-br from-${experience.gradientFrom}/80 via-${experience.gradientTo}/60 to-black/40 group-hover:from-${experience.gradientFrom}/70 group-hover:via-${experience.gradientTo}/50 transition-all duration-500`}></div>
                  
                  {/* Floating Icon */}
                  <div className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white group-hover:scale-110 transition-transform duration-300">
                    {experience.icon}
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

                {/* Hover Effect Overlay */}
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
};

export default TourPromotions;