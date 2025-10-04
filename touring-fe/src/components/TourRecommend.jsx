import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import TourCard from "./TourCard";
import { useAuth } from "../auth/context";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
const TourPromotions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentTourSlide, setCurrentTourSlide] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  const [featuredTours, setFeaturedTours] = useState([]);

  // 👉 Lấy danh sách tour từ API
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
    setCurrentTourSlide((prev) =>
      Math.min(prev + 1, featuredTours.length - 3)
    );
  };

  const prevTourSlide = () => {
    setCurrentTourSlide((prev) => Math.max(prev - 1, 0));
  };

  // 👉 Region data (giữ nguyên từ file 2)
  const destinations = [
    {
      id: 1,
      name: "Hà Nội",
      image:
        "https://i.pinimg.com/1200x/77/4a/9e/774a9e7c90cb32bdb22d3debb0f6dd26.jpg",
      slug: "hanoi",
    },
    {
      id: 2,
      name: "Nha Trang",
      image:
        "https://i.pinimg.com/1200x/c4/77/ca/c477ca292c458a44840da32b3b0590aa.jpg",
      slug: "nhatrang",
    },
    {
      id: 3,
      name: "Đà Nẵng",
      image:
        "https://i.pinimg.com/1200x/1e/38/52/1e38526c4857a3ef291bc27bf9eaa169.jpg",
      slug: "danang",
    },
    {
      id: 4,
      name: "Thành phố Hồ Chí Minh",
      image:
        "https://i.pinimg.com/736x/0e/6b/ef/0e6bef1f6fa506927008dcedd1f69818.jpg",
      slug: "tphcm",
    },
    {
      id: 5,
      name: "Phú Quốc",
      image:
        "https://i.pinimg.com/1200x/93/bd/0f/93bd0f07eee43f72bcf100cf48b79bc1.jpg",
      slug: "phuquoc",
    },
    {
      id: 6,
      name: "Hội An",
      image:
        "https://i.pinimg.com/1200x/bd/d5/ff/bdd5ffaa1734779f8c434df958f125cc.jpg",
      slug: "hoian",
    },
  ];

  return (
    <div>
      {/* Tour promotions */}
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
      </section>

      {/* Region list */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-[#007980] mb-2">
              Bạn muốn đi đâu chơi?
            </h2>
            <p className="text-lg text-gray-600 ">
              Từ những thành phố sôi động đến những vùng núi non hùng vĩ, khám
              phá vẻ đẹp đa dạng của đất nước Việt Nam
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {destinations.map((region) => (
              <div
                key={region.id}
                className="group relative rounded-2xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-500 hover:shadow-2xl"
                onClick={() => navigate(`/region/${region.slug}`)}
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
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate("/region/all")}
              className="border border-[#03B3BE] text-[#03B3BE] px-8 py-3 rounded-xl font-medium hover:bg-[#03B3BE] hover:text-white transition-all duration-300"
            >
              Xem tất cả
            </button>
          </div>
        </div>
      </section>
      <Toaster richColors closeButton />
    </div>
  );
};

export default TourPromotions;