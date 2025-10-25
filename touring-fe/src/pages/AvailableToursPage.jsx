import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import TourCard from "../components/TourCard";
import { useAuth } from "../auth/context";
import { optimizeImage } from "@/utils/imageUrl";
import { toast } from "sonner";

export default function ToursPage() {
  const [allTours, setAllTours] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [filteredTours, setFilteredTours] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const { user } = useAuth();

  const categories = [
    "Tất cả",
    "Miền Bắc",
    "Miền Trung",
    "Miền Nam",
    "Nước ngoài",
  ];

  // ✅ Load wishlist từ server
  useEffect(() => {
    if (!user?.token) return;
    
    fetch('/api/wishlist', {
      headers: { Authorization: `Bearer ${user.token}` },
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFavorites(new Set(data.data.map(item => String(item.tourId._id))));
        }
      })
      .catch(err => console.error('Error fetching wishlist:', err));
  }, [user?.token]);

  // ✅ Toggle wishlist trên server với Optimistic Update
  const handleFavoriteToggle = async (tourId) => {
    if (!user?.token) {
      toast.error("Bạn cần đăng nhập để dùng wishlist");
      return;
    }
    
    // 🚀 OPTIMISTIC UPDATE: Update UI ngay lập tức
    const wasInWishlist = favorites.has(tourId);
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (wasInWishlist) {
        newSet.delete(tourId);
      } else {
        newSet.add(tourId);
      }
      return newSet;
    });
    
    try {
      const res = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ tourId }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // ✅ Confirm lại state từ server
        setFavorites((prev) => {
          const newSet = new Set(prev);
          data.isFav ? newSet.add(tourId) : newSet.delete(tourId);
          return newSet;
        });
        
      
      } else {
        // ❌ Nếu API fail, revert lại state cũ
        setFavorites((prev) => {
          const newSet = new Set(prev);
          wasInWishlist ? newSet.add(tourId) : newSet.delete(tourId);
          return newSet;
        });
        toast.error('Không thể cập nhật wishlist');
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
      
      // ❌ Revert lại state cũ khi có lỗi
      setFavorites((prev) => {
        const newSet = new Set(prev);
        wasInWishlist ? newSet.add(tourId) : newSet.delete(tourId);
        return newSet;
      });
      
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  useEffect(() => {
    fetch("api/tours")
      .then((res) => res.json())
      .then((data) => {
        console.log("Tours from API:", data);
        setAllTours(data);
        setFilteredTours(data);
      })
      .catch((err) => console.error("Error fetching tours:", err));
  }, []);

  function normalizeVietnamese(str = "") {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  }

  useEffect(() => {
    let result = [...allTours];

    // 🔹 Lọc theo vùng miền (region)
    if (selectedCategory !== "Tất cả") {
      result = result.filter((tour) =>
        tour?.locations?.some(
          (loc) => loc?.region?.toLowerCase() === selectedCategory.toLowerCase()
        )
      );
    }

    // 🔹 Lọc theo từ khóa (mô tả hoặc địa điểm)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const normalizedQuery = normalizeVietnamese(query);

      result = result.filter((tour) =>
        tour?.locations?.some((loc) =>
          normalizeVietnamese(loc?.name?.toLowerCase()).includes(
            normalizedQuery
          )
        )
      );
    }

    setFilteredTours(result);
  }, [searchQuery, selectedCategory, allTours]);

  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* 🌅 HERO */}
      <div
        className="relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${optimizeImage(
            "https://res.cloudinary.com/dodkc8iuu/image/upload/v1759907602/pexels-qhung999-2965773_ktp4cg.jpg",
            1920
          )})`,
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto text-center py-20 px-4 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow">
            Tour Có Sẵn
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Khám phá những hành trình du lịch độc đáo được chọn lọc dành riêng
            cho bạn.
          </p>

          {/* 🔍 Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tour, địa điểm..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 text-gray-800 focus:ring-2 focus:ring-[#02A0AA] focus:border-[#02A0AA] bg-white/95 shadow-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🌿 MAIN */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-[#02A0AA]" />
            <h2 className="text-lg font-semibold">Lọc theo vùng</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full font-medium transition-all border ${
                  selectedCategory === cat
                    ? "bg-[#02A0AA] text-white border-[#02A0AA]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#02A0AA] hover:text-[#02A0AA]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách tour */}
        {filteredTours.length > 0 ? (
          <>
            <p className="mb-6 text-gray-600">
              Tìm thấy{" "}
              <span className="font-semibold text-[#02A0AA]">
                {filteredTours.length}
              </span>{" "}
              tour phù hợp
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTours.map((tour) => (
                <TourCard
                  id={tour._id}
                  to={`/tours/${tour._id}`}
                  image={optimizeImage(tour.imageItems?.[0]?.imageUrl, 800)}
                  title={tour.description}
                  location={tour.locations?.[0]?.name || "Địa điểm"}
                  tags={tour.tags}
                  bookedText={`${tour.usageCount} Đã được đặt`}
                  rating={tour.isRating}
                  reviews={tour.isReview}
                  priceFrom={
                    tour.departures?.[0]?.priceAdult?.toString() || "N/A"
                  }
                  originalPrice={tour.basePrice}
                  isFav={favorites.has(tour._id)}
                  onFav={() => handleFavoriteToggle(tour._id)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Không tìm thấy tour nào
            </h3>
            <p className="text-gray-600">
              Thử thay đổi từ khóa hoặc chọn vùng khác nhé!
            </p>
          </div>
        )}
      </div>

      {/* 🌅 CTA SECTION */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative mt-6 mb-14 bg-cover bg-center bg-no-repeat rounded-xl overflow-hidden shadow-md"
          style={{
            backgroundImage: `url(${optimizeImage(
              "https://res.cloudinary.com/dodkc8iuu/image/upload/v1759911917/pexels-efrem-efre-2786187-33820235_buyrxw.jpg",
              1920
            )})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t to-transparent"></div>

          <div className="relative flex flex-col items-center justify-center text-center text-white py-14 px-6 sm:px-8 md:px-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 leading-snug">
              Hành trình của bạn bắt đầu từ đây
            </h2>

            <p className="text-base md:text-lg mb-6 max-w-xl text-white/95 leading-relaxed">
              Không tìm thấy tour phù hợp? Hãy tự tạo tour theo phong cách riêng
              của bạn – chọn điểm đến, thời gian và trải nghiệm mà bạn yêu
              thích.
            </p>

            <Link
              to="/"
              className="inline-block bg-white text-[#000] font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
            >
              Tạo tour ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
