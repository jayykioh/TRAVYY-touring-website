import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import TourCard from "../components/TourCard";
import { useAuth } from "../auth/context";
import { toast } from "sonner";

const SearchFilterResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(new Set());
  const { user, withAuth } = useAuth();
  // ✅ matchedTours truyền từ QuickBooking.jsx
  const matchedToursFromState = location.state?.matchedTours || [];
  
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
  
  const handleFavoriteToggle = async (tourId) => {
    if (!user?.token) {
      toast.error("Bạn cần đăng nhập để dùng wishlist");
      return;
    }

    try {
      const data = await withAuth("/api/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourId }),
      });

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
        toast.error("Không thể cập nhật danh sách yêu thích!");
      }
    } catch (err) {
      console.error("❌ Wishlist toggle error:", err);
      
      // ❌ Revert lại state cũ khi có lỗi
      setFavorites((prev) => {
        const newSet = new Set(prev);
        wasInWishlist ? newSet.add(tourId) : newSet.delete(tourId);
        return newSet;
      });
      
      toast.error("Không thể cập nhật danh sách yêu thích!");
    }
  };

  const [searchParams, setSearchParams] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: 2,
  });

  const [filteredTours, setFilteredTours] = useState(matchedToursFromState);
  const [sortBy, setSortBy] = useState("popular");
  const [priceRange, setPriceRange] = useState("all");
  const [suggestedTours, setSuggestedTours] = useState([]);

  // ==========================
  //  Lấy query từ URL (để reload không mất)
  // ==========================
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const newDestination = urlParams.get("destination") || "";
    const newCheckIn = urlParams.get("checkIn") || "";
    const newCheckOut = urlParams.get("checkOut") || "";
    const newGuests = urlParams.get("guests") || "2";

    // 🧩 Chỉ set lại khi giá trị thực sự thay đổi
    setSearchParams((prev) => {
      if (
        prev.destination === newDestination.trim() &&
        prev.checkIn === newCheckIn &&
        prev.checkOut === newCheckOut &&
        prev.guests === newGuests
      ) {
        return prev; // không đổi => không render lại
      }
      return {
        destination: newDestination.trim(),
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        guests: newGuests,
      };
    });
  }, [location.search]);

  // ==========================
  //  Nếu reload trang mà không có state → fetch lại
  // ==========================
  useEffect(() => {
    if (matchedToursFromState.length > 0) {
      setFilteredTours(matchedToursFromState);
      return; // không cần fetch nữa
    }

    if (searchParams.destination.trim()) {
      fetchTours(searchParams.destination);
    }
  }, [searchParams.destination]);

  // ==========================
  //  Hàm fetch từ backend (fallback)
  // ==========================
  const fetchTours = async (destination = "") => {
    try {
      let url = "http://localhost:4000/api/tours";
      if (destination.trim()) {
        url += `?search=${encodeURIComponent(destination)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setFilteredTours(data);

      if (data.length === 0) {
        const resAll = await fetch("http://localhost:4000/api/tours");
        const all = await resAll.json();
        setSuggestedTours(all.slice(0, 8));
      }
    } catch (err) {
      console.error("❌ Lỗi khi fetch tour:", err);
    }
  };

  // ==========================
  //  Bộ lọc phụ (sort + price)
  // ==========================
  const sortedAndFilteredTours = React.useMemo(() => {
    let tours = [...filteredTours];

    // sort
    if (sortBy === "price-low") {
      tours.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
    } else if (sortBy === "price-high") {
      tours.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
    } else if (sortBy === "rating") {
      tours.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    // filter price range
    if (priceRange !== "all") {
      tours = tours.filter((t) => {
        const price = t.basePrice || 0;
        if (priceRange === "budget") return price < 1000000;
        if (priceRange === "medium") return price >= 1000000 && price < 3000000;
        if (priceRange === "luxury") return price >= 3000000;
        return true;
      });
    }

    return tours;
  }, [filteredTours, sortBy, priceRange]);

  // ==========================
  //  UI
  // ==========================
  const handleGoBack = () => navigate(-1);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-gray-600 hover:text-[#02A0AA]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Quay lại</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600">
            {searchParams.destination && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#02A0AA20]">
                <MapPin className="w-4 h-4 text-[#02A0AA]" />
                <span className="font-medium">{searchParams.destination}</span>
              </div>
            )}
            {searchParams.checkIn && searchParams.checkOut && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#02A0AA20]">
                <Calendar className="w-4 h-4 text-[#02A0AA]" />
                <span>
                  {formatDate(searchParams.checkIn)} -{" "}
                  {formatDate(searchParams.checkOut)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm text-gray-700 font-medium">
            {sortedAndFilteredTours.length} tour tìm thấy
          </span>

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-[#02A0AA]"
            >
              <option value="popular">Phổ biến nhất</option>
              <option value="price-low">Giá thấp đến cao</option>
              <option value="price-high">Giá cao đến thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>

            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-[#02A0AA]"
            >
              <option value="all">Tất cả mức giá</option>
              <option value="budget">Dưới 1 triệu</option>
              <option value="medium">1 - 3 triệu</option>
              <option value="luxury">Trên 3 triệu</option>
            </select>
          </div>
        </div>

        {/* Tour List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedAndFilteredTours.map((tour) => (
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
          ))}
        </div>

        {/* Suggested Tours */}
        {sortedAndFilteredTours.length === 0 && suggestedTours.length > 0 && (
          <div className="mt-10">
            <h4 className="text-xl font-semibold mb-4 text-gray-800">
              🌟 Tour gợi ý cho bạn
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestedTours.map((tour) => (
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilterResults;
