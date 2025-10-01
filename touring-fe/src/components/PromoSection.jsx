import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Heart } from "lucide-react";
import TourCard from "./TourCard";
import { Link } from "react-router-dom";

const TourPromotions = () => {
  const [currentTourSlide, setCurrentTourSlide] = useState(0);
  const [favorites, setFavorites] = useState(new Set([2, 4]));
  const [featuredTours, setFeaturedTours] = useState([]);

  useEffect(() => {
    fetch("/api/tours")
      .then((res) => res.json())
      .then((data) => {
        console.log("Tours from API:", data);
        setFeaturedTours(data);
      })
      .catch((err) => console.error("Error fetching tours:", err));
  }, []);

  const handleFavoriteToggle = (tourId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      newFavorites.has(tourId)
        ? newFavorites.delete(tourId)
        : newFavorites.add(tourId);
      return newFavorites;
    });
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
              className="flex gap-x-4 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentTourSlide * 33.33}%)` }}
            >
              {featuredTours.map((tour) => (
                <div key={tour._id} className="flex-shrink-0">
                  {/* discount={tour.discount}
                     
                      */}
                  <TourCard
                    to={`/tours/${tour._id}`}
                    image={tour.imageItems?.[0]?.imageUrl}
                    title={tour.description}
                    location={tour.locations?.[0]?.name || "Địa điểm"}
                    tags={tour.tags}
                    bookedText={`${tour.usageCount} Đã được đặt`}
                    rating={tour.isRating}
                    reviews={tour.isReview}
                    priceFrom={tour.basePrice.toString()}
                    originalPrice={tour.basePrice}
                    onFav={() => handleFavoriteToggle(tour._id)}
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
            <Link
              to={"/experiences"}
              className="relative rounded-lg overflow-hidden shadow-lg group cursor-pointer transform hover:scale-105 transition-all duration-500"
            >
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

            <Link
              to={"/customTour"}
              className="relative rounded-lg overflow-hidden shadow-lg group cursor-pointer transform hover:scale-105 transition-all duration-500"
            >
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
