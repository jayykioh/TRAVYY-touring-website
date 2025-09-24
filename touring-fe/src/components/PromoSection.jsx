import React, { useState } from "react";
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
} from "lucide-react";
import TourCard from "./TourCard";
import { Link } from "react-router-dom";
const TourPromotions = () => {
  const [currentPromoSlide, setCurrentPromoSlide] = useState(0);
  const [currentTourSlide, setCurrentTourSlide] = useState(0);
  const [favorites, setFavorites] = useState(new Set([2, 4])); 

  const promotionalBanners = [
    {
      id: 1,
      title: "MỚI GIẢM",
      discount: "50%",
      subtitle: "SĂN DEAL SIÊU HOT",
      description: "Tháng cuối năm",
      buttonText: "Săn Deal ngay",
      bgColor: "from-orange-500 to-pink-500",
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
      bgColor: "from-blue-600 to-blue-800",
      textColor: "text-white",
      icon: "💳",
    },
    {
      id: 3,
      title: "Ưu đại được yêu thích",
      discount: "12%",
      subtitle: "Khách sạn và Trải nghiệm",
      description: "Giảm từ 10% trở lên",
      buttonText: "Khám phá ngay",
      bgColor: "from-purple-500 to-indigo-600",
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
      (prev) =>
        (prev - 1 + promotionalBanners.length) % promotionalBanners.length
    );
  };

  const nextTourSlide = () => {
    setCurrentTourSlide((prev) => Math.min(prev + 1, featuredTours.length - 3));
  };

  const prevTourSlide = () => {
    setCurrentTourSlide((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Các hoạt động nổi bật
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={prevTourSlide}
                disabled={currentTourSlide === 0}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={nextTourSlide}
                disabled={currentTourSlide >= featuredTours.length - 3}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div
              className="flex space-x-4 transition-transform duration-500 ease-in-out"
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

        {/* Creative sections */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-8">Sáng tạo theo lối riêng</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1 */}

            <Link to={"/experiences"} className="relative rounded-lg overflow-hidden shadow-lg group cursor-pointer transform hover:scale-105 transition-all duration-500">
              <img
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1170&auto=format&fit=crop"
                alt="Trải nghiệm độc đáo"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-700/70 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <h3 className="text-xl font-bold">Trải nghiệm độc đáo</h3>
                <p className="mt-2 text-sm">
                  Khám phá những hoạt động chỉ có tại điểm đến, mang lại kỷ niệm
                  khó quên và cảm giác mới mẻ trong từng hành trình.
                </p>
                <button className="mt-4 bg-white text-gray-900 px-4 py-2 rounded self-start font-medium hover:bg-gray-200 transition active:scale-95">
                  Khám phá ngay
                </button>
              </div>
            </Link>


            <Link to={"/customTour"} className="relative rounded-lg overflow-hidden shadow-lg group cursor-pointer transform hover:scale-105 transition-all duration-500">
              <img
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1170&auto=format&fit=crop"
                alt="Thiết kế tour theo phong cách"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-700/70 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <h3 className="text-xl font-bold">
                  Thiết kế tour theo phong cách của bạn
                </h3>
                <p className="mt-2 text-sm">
                  Tự do lựa chọn lịch trình, dịch vụ và trải nghiệm theo sở
                  thích cá nhân để chuyến đi thực sự mang dấu ấn riêng.
                </p>
                <button className="mt-4 bg-white text-gray-900 px-4 py-2 rounded self-start font-medium hover:bg-gray-200 transition active:scale-95">
                  Khám phá ngay
                </button>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourPromotions;
