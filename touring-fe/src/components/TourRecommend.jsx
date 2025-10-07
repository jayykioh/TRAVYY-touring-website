import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import TourCard from "./TourCard";
import { useAuth } from "../auth/context";
import { toast, Toaster } from "sonner";
const TourPromotions = () => {
  const { user } = useAuth(); // 👈 lấy user.token
  const [currentTourSlide, setCurrentTourSlide] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
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

  // 👉 Lấy wishlist từ server
  useEffect(() => {
    if (!user?.token) return;
    fetch("/api/wishlist", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
    .then((res) => res.json())
    .then((res) => {
  if (res.success) {
    setFavorites(new Set(res.data.map((item) => String(item.tourId._id))));
  }
})
      .catch((err) => console.error("Error fetching wishlist:", err));
  }, [user]);

  // 👉 Toggle wishlist trên server
  const handleFavoriteToggle = async (tourId) => {
    if (!user?.token) {
     toast.error("Bạn cần đăng nhập để dùng wishlist");
      return;
    }
    try {
      const res = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ tourId }),
      });
      const data = await res.json();
      setFavorites((prev) => {
        const newSet = new Set(prev);
        data.isFav ? newSet.add(tourId) : newSet.delete(tourId);
        return newSet;
      });
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  const nextTourSlide = () => {
    setCurrentTourSlide((prev) => Math.min(prev + 1, featuredTours.length - 3));
  };

  const prevTourSlide = () => {
    setCurrentTourSlide((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#007980] mb-2">
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
              style={{
                transform: `translateX(-${currentTourSlide * 33.33}%)`,
              }}
            >
              {featuredTours.map((tour) => (
                <div key={tour._id} className="flex-shrink-0">
                  <TourCard
                    id={tour._id}
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
       <Toaster richColors closeButton />
    </section>
  );
};

export default TourPromotions;
