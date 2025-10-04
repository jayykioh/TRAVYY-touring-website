import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Users, Star, Clock, Heart, Filter, ChevronDown } from "lucide-react";
import { destinationList } from "../mockdata/destinationList";
import TourCard from "../components/TourCard";
const SearchfilterResults = () => {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ Thêm navigate
  const [searchParams, setSearchParams] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: 2
  });
  const [filteredTours, setFilteredTours] = useState([]);
  const [sortBy, setSortBy] = useState("popular");
  const [priceRange, setPriceRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [suggestedTours, setSuggestedTours] = useState([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const destination = urlParams.get('destination') || '';

    const params = {
      destination,
      checkIn: urlParams.get('checkIn') || '',
      checkOut: urlParams.get('checkOut') || '',
      guests: urlParams.get('guests') || '2'
    };

    setSearchParams(params);
    filterTours(destination);
  }, [location.search]);

  const cityMap = {
    danang: "danang",
    đanang: "danang",
    hoian: "hoian",
    nhatrang: "nhatrang",
    hanoi: "hanoi",
    tphcm: "tphcm",
    phuquoc: "phuquoc"
  };

  const filterTours = (destination) => {
    let tours = [];
    
    // Nếu có destination cụ thể
    if (destination) {
      const destKey = destination.toLowerCase().replace(/\s+/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const mappedKey = cityMap[destKey];

      // CHỈ lấy tour từ destination đó
      if (mappedKey && destinationList[mappedKey]) {
        tours = destinationList[mappedKey];
      }
      // Nếu không tìm thấy => tours = []
    } else {
      // Không có destination => hiển thị tất cả
      tours = Object.values(destinationList).flat();
    }

    tours = sortTours(tours, sortBy);
    tours = filterByPrice(tours, priceRange);

    setFilteredTours(tours);
    
    // Lấy tour gợi ý khi không có kết quả
    if (tours.length === 0) {
      const allTours = Object.values(destinationList).flat();
      const randomSuggestions = allTours
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);
      setSuggestedTours(randomSuggestions);
    } else {
      setSuggestedTours([]);
    }
  };

  const sortTours = (tours, sortType) => {
    const sorted = [...tours];
    switch(sortType) {
      case 'popular':
        return sorted.sort((a, b) => b.reviews - a.reviews);
      case 'price-low':
        return sorted.sort((a, b) => a.currentPrice - b.currentPrice);
      case 'price-high':
        return sorted.sort((a, b) => b.currentPrice - a.currentPrice);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  };

  const filterByPrice = (tours, range) => {
    switch(range) {
      case 'budget':
        return tours.filter(t => t.currentPrice < 1000000);
      case 'medium':
        return tours.filter(t => t.currentPrice >= 1000000 && t.currentPrice < 3000000);
      case 'luxury':
        return tours.filter(t => t.currentPrice >= 3000000);
      default:
        return tours;
    }
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    const sorted = sortTours(filteredTours, value);
    setFilteredTours(sorted);
  };

  const handlePriceFilter = (value) => {
    setPriceRange(value);
    filterTours(searchParams.destination);
  };

  const handleGoBack = () => {
    window.history.back();
  };

  // ✅ Thêm function navigate đến tour detail
  const handleTourClick = (tourId) => {
    navigate(`/tours/${tourId}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Quay lại</span>
            </button>
          </div>

          {/* Search Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {searchParams.destination && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">{searchParams.destination}</span>
              </div>
            )}
            {searchParams.checkIn && searchParams.checkOut && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(searchParams.checkIn)} - {formatDate(searchParams.checkOut)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{searchParams.guests} người</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-12 py-6">
        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-semibold">
                {filteredTours.length} tour tìm thấy
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="price-low">Giá thấp đến cao</option>
                <option value="price-high">Giá cao đến thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>

              {/* Price Filter */}
              <select
                value={priceRange}
                onChange={(e) => handlePriceFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">Tất cả mức giá</option>
                <option value="budget">Dưới 1 triệu</option>
                <option value="medium">1-3 triệu</option>
                <option value="luxury">Trên 3 triệu</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tours Grid - 4 COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTours.map((tour) => (
            <TourCard 
              key={tour.id} 
              tour={tour} 
              onClick={() => handleTourClick(tour.id)}
            />
          ))}
        </div>

        {/* Empty State with Suggested Tours */}
        {filteredTours.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MapPin className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Không tìm thấy tour phù hợp
            </h3>
            <p className="text-gray-600 mb-8">
              Vui lòng thử tìm kiếm với điểm đến khác hoặc thay đổi bộ lọc
            </p>

            {/* Suggested Tours */}
            {suggestedTours.length > 0 && (
              <div className="mt-8">
                <h4 className="text-2xl font-bold text-gray-900 mb-6 text-left">
                  🌟 Tour gợi ý cho bạn
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {suggestedTours.map((tour) => (
                    <TourCard 
                      key={tour.id} 
                      tour={tour} 
                      onClick={() => handleTourClick(tour.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchfilterResults;