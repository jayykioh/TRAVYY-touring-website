import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Users } from "lucide-react";
import { destinationList } from "../mockdata/destinationList";
import TourCard from "../components/TourCard";

const allTours = Object.values(destinationList).flat();

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: 2
  });
  const [filteredTours, setFilteredTours] = useState([]);
  const [sortBy, setSortBy] = useState("popular");
  const [priceRange, setPriceRange] = useState("all");
  const [suggestedTours, setSuggestedTours] = useState([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const destination = urlParams.get("destination") || "";

    setSearchParams({
      destination,
      checkIn: urlParams.get("checkIn") || "",
      checkOut: urlParams.get("checkOut") || "",
      guests: urlParams.get("guests") || "2"
    });

    filterTours(destination);
  }, [location.search]);

  useEffect(() => {
    filterTours(searchParams.destination);
  }, [priceRange, sortBy, searchParams.destination]);

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

    if (destination) {
      const destKey = destination
        .toLowerCase()
        .replace(/\s+/g, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const mappedKey = cityMap[destKey];
      if (mappedKey && destinationList[mappedKey]) {
        tours = destinationList[mappedKey];
      }
    } else {
      tours = allTours;
    }

    tours = sortTours(tours, sortBy);
    tours = filterByPrice(tours, priceRange);

    setFilteredTours(tours);

    if (tours.length === 0) {
      let allTours = Object.values(destinationList).flat();
      allTours = filterByPrice(allTours, priceRange);
      const randomSuggestions = allTours
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);

      if (randomSuggestions.length > 0) {
        setSuggestedTours(randomSuggestions);
      } else {
        setSuggestedTours([]);
      }
    } else {
      setSuggestedTours([]);
    }
  };

  const sortTours = (tours, sortType) => {
    const sorted = [...tours];
    switch (sortType) {
      case "popular":
        return sorted.sort((a, b) => b.reviews - a.reviews);
      case "price-low":
        return sorted.sort((a, b) => a.currentPrice - b.currentPrice);
      case "price-high":
        return sorted.sort((a, b) => b.currentPrice - a.currentPrice);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  };

  const filterByPrice = (tours, range) => {
    switch (range) {
      case "budget":
        return tours.filter((t) => t.currentPrice < 1000000);
      case "medium":
        return tours.filter(
          (t) => t.currentPrice >= 1000000 && t.currentPrice < 3000000
        );
      case "luxury":
        return tours.filter((t) => t.currentPrice >= 3000000);
      default:
        return tours;
    }
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handlePriceFilter = (value) => {
    setPriceRange(value);
  };

  const handleGoBack = () => window.history.back();

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
              className="flex items-center gap-2 text-gray-600 transition-all"
              style={{ color: 'gray' }}
              onMouseEnter={e => e.currentTarget.style.color = '#02A0AA'}
              onMouseLeave={e => e.currentTarget.style.color = 'gray'}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Quay lại</span>
            </button>
          </div>
          
          {/* Search Info - Responsive cho mobile */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
            {searchParams.destination && (
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full" style={{ backgroundColor: "#02A0AA20" }}>
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "#02A0AA" }} />
                <span className="font-medium text-gray-700">{searchParams.destination}</span>
              </div>
            )}
            {searchParams.checkIn && searchParams.checkOut && (
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full" style={{ backgroundColor: "#02A0AA20" }}>
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "#02A0AA" }} />
                <span className="text-gray-700 text-xs sm:text-sm">
                  {formatDate(searchParams.checkIn)} - {formatDate(searchParams.checkOut)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters - Responsive cho mobile */}
      <div className="max-w-5xl mx-auto px-4 sm:px-12 py-4 sm:py-3">
        <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 mb-3">
  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
    <span className="pl-2 text-xs sm:text-sm text-gray-700 font-medium">
      {filteredTours.length} tour tìm thấy
    </span>

    <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
      <select
        value={sortBy}
        onChange={(e) => handleSortChange(e.target.value)}
        className="w-full sm:w-auto px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:border-[#02A0AA] focus:ring-1 focus:ring-[#02A0AA20] transition-all"
      >
        <option value="popular">Phổ biến nhất</option>
        <option value="price-low">Giá thấp đến cao</option>
        <option value="price-high">Giá cao đến thấp</option>
        <option value="rating">Đánh giá cao nhất</option>
      </select>

      <select
        value={priceRange}
        onChange={(e) => handlePriceFilter(e.target.value)}
        className="w-full sm:w-auto px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:border-[#02A0AA] focus:ring-1 focus:ring-[#02A0AA20] transition-all"
      >
        <option value="all">Tất cả mức giá</option>
        <option value="budget">Dưới 1 triệu</option>
        <option value="medium">1-3 triệu</option>
        <option value="luxury">Trên 3 triệu</option>
      </select>
    </div>
  </div>
</div>


        {/* Tour Grid - Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredTours.map((tour) => (
            <TourCard
              key={tour.id}
              id={tour.id}
              to={`/tours/${tour.id}`}
              image={tour.image}
              title={tour.title}
              location={tour.location}
              tags={tour.tags}
              rating={tour.rating}
              reviews={tour.reviews}
              bookedText={tour.booked}
              priceFrom={tour.currentPrice}
              onFav={(id) => console.log("Yêu thích:", id)}
              isFav={false}
            />
          ))}
        </div>

        {/* Empty State */}
        {((filteredTours.length === 0 && suggestedTours.length > 0) || (filteredTours.length === 0 && suggestedTours.length === 0)) && (
          <div className="text-center py-8 sm:py-12">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              Không tìm thấy tour phù hợp
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-4">
              Vui lòng thử tìm kiếm với điểm đến khác hoặc thay đổi bộ lọc
            </p>

            {/* Suggested Tours - Responsive */}
            {suggestedTours.length > 0 && (
              <div className="mt-6 sm:mt-8">
                <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-left">
                  🌟 Tour gợi ý cho bạn
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {suggestedTours.map((tour) => (
                    <TourCard
                      key={tour.id}
                      id={tour.id}
                      to={`/tours/${tour.id}`}
                      image={tour.image}
                      title={tour.title}
                      location={tour.location}
                      tags={tour.tags}
                      rating={tour.rating}
                      reviews={tour.reviews}
                      bookedText={tour.booked}
                      priceFrom={tour.currentPrice}
                      onFav={(id) => console.log("Yêu thích:", id)}
                      isFav={false}
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

export default SearchResults;