import React, { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Calendar, Users, Star, Clock, Heart, Filter, ChevronDown } from "lucide-react";
import { destinationList } from "../mockdata/destinationList"; // ✅ Đường dẫn chính xác

const SearchfilterResults = () => {
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

  useEffect(() => {
    // Lấy dữ liệu từ URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const params = {
      destination: urlParams.get('destination') || '',
      checkIn: urlParams.get('checkIn') || '',
      checkOut: urlParams.get('checkOut') || '',
      guests: urlParams.get('guests') || '2'
    };
    setSearchParams(params);

    // Lọc tours dựa trên destination
    filterTours(params.destination);
  }, []);

  const filterTours = (destination) => {
    let tours = [];
    
    // Tìm tours theo destination
    const destKey = destination.toLowerCase().replace(/\s+/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Map các tên thành phố với key trong destinationList
    const cityMap = {
      'danang': 'danang',
      'đanang': 'danang',
      'hoian': 'hoian',
      'hộian': 'hoian',
      'nhatrang': 'nhatrang',
      'hanoi': 'hanoi',
      'hànội': 'hanoi',
      'hanội': 'hanoi',
      'tphcm': 'tphcm',
      'hochiminh': 'tphcm',
      'saigon': 'tphcm',
      'phuquoc': 'phuquoc',
      'phúquốc': 'phuquoc'
    };

    const mappedKey = cityMap[destKey];
    
    if (mappedKey && destinationList[mappedKey]) {
      tours = destinationList[mappedKey];
    } else {
      // Nếu không tìm thấy, hiển thị tất cả tours
      tours = Object.values(destinationList).flat();
    }

    // Sắp xếp
    tours = sortTours(tours, sortBy);
    
    // Lọc theo giá
    tours = filterByPrice(tours, priceRange);

    setFilteredTours(tours);
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
      <div className="max-w-7xl mx-auto px-4 py-6">
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

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={tour.image}
                  alt={tour.title}
                  className="w-full h-full object-cover"
                />
                {tour.isPopular && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Phổ biến
                  </div>
                )}
                {tour.discount && (
                  <div className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    -{tour.discount}%
                  </div>
                )}
                <button className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {tour.category}
                  </span>
                  <span className="text-xs text-gray-500">{tour.location}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {tour.title}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{tour.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">({tour.reviews} đánh giá)</span>
                  <span className="text-xs text-gray-400">• {tour.booked} đã đặt</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {tour.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-end justify-between pt-3 border-t border-gray-200">
                  <div>
                    {tour.originalPrice > tour.currentPrice && (
                      <div className="text-xs text-gray-400 line-through">
                        {formatPrice(tour.originalPrice)}
                      </div>
                    )}
                    <div className="text-xl font-bold text-blue-600">
                      {formatPrice(tour.currentPrice)}
                    </div>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all">
                    Đặt ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTours.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MapPin className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Không tìm thấy tour phù hợp
            </h3>
            <p className="text-gray-600">
              Vui lòng thử tìm kiếm với điểm đến khác hoặc thay đổi bộ lọc
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchfilterResults;