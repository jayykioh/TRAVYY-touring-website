import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Heart } from "lucide-react";
import TourCard from "./TourCard";
import { Link } from "react-router-dom";

const TourPromotions = () => {
  const [currentTourSlide, setCurrentTourSlide] = useState(0);

  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem("FAVORITES");
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(arr);
    } catch {
      return new Set();
    }
  });
  const [featuredTours, setFeaturedTours] = useState([]);

  useEffect(() => {
<<<<<<< HEAD:touring-fe/src/components/PromoSection.jsx
    fetch("http://localhost:5000/api/tours")
=======
    fetch("/api/tours")
>>>>>>> origin/main:touring-fe/src/components/TourRecommend.jsx
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
                    isFav={favorites.has(tour._id)}
                    onFav={() => handleFavoriteToggle(tour._id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourPromotions;
