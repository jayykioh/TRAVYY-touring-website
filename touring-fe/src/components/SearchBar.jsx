import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, MapPin, TrendingUp, X } from "lucide-react";

const SearchBar = ({ onSearch, initialQuery = "", showSuggestions = true, bookingData, setBookingData }) => {
  const [query, setQuery] = useState(initialQuery);
  const [history, setHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const popularDestinations = [
    "Hạ Long", "Đà Nẵng", "Sapa", "Phú Quốc", "Hội An", "Nha Trang"
  ];

  const trendingSearches = [
    "Tour Hạ Long 3N2Đ",
    "Combo Đà Nẵng",
    "Du lịch Sapa mùa đông",
    "Resort Phú Quốc 5 sao",
    "Tour miền Tây 2N1Đ"
  ];

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    setHistory(savedHistory);
  }, []);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const newHistory = [query, ...history.filter(item => item !== query)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    setIsOpen(false);

    const params = new URLSearchParams({
      destination: query,
      checkIn: bookingData?.checkIn || "",
      checkOut: bookingData?.checkOut || "",
      guests: bookingData?.guests?.toString() || "1"
    });

    navigate(`/search-results?${params.toString()}`);
    setQuery("");
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery("");
    setIsOpen(false);

    const newHistory = [suggestion, ...history.filter(item => item !== suggestion)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));

    if (setBookingData) {
      setBookingData(prev => ({ ...prev, destination: suggestion }));
    }

    if (onSearch) {
      onSearch(suggestion);
    } else {
      navigate(`/search-results?destination=${encodeURIComponent(suggestion)}`);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-lg" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="search"
          placeholder="Tìm tour, địa điểm..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => showSuggestions && setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(e);
            }
          }}
          className="w-full rounded-full border-2 border-[#03B3BE] bg-white/80 px-4 py-2 pr-12 text-sm outline-none transition focus:ring-2 focus:ring-[#03B3BE]/50 focus:border-[#03B3BE]"
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#03B3BE] p-1.5 text-white transition-all duration-200 hover:bg-[#02a0aa] hover:shadow-lg active:scale-95"
          aria-label="Tìm kiếm"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {isOpen && showSuggestions && (
        <div className="absolute top-12 left-0 w-full min-w-[400px] bg-white border-2 border-[#03B3BE]/20 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Search History */}
          {history.length > 0 && (
            <div className="border-b border-[#03B3BE]/10 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between px-4 py-3 bg-[#03B3BE]/5">
                <h4 className="text-sm font-semibold text-gray-600">Lịch sử tìm kiếm</h4>
                <button
                  onClick={clearHistory}
                  className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>
          )}

          {/* History items */}
          <div className="px-4 py-2">
            {history.length > 0 && (
              <ul className="mb-4">
                {history.map((item, i) => (
                  <li
                    key={i}
                    onClick={() => handleSuggestionClick(item)}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-[#03B3BE]/5 px-2 py-2 rounded transition-colors group"
                  >
                    <Clock className="w-4 h-4 text-[#03B3BE]/60 group-hover:text-[#03B3BE] flex-shrink-0" />
                    <span className="text-gray-700 group-hover:text-[#03B3BE] flex-1 truncate text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Popular destinations */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">Địa điểm nổi bật</h4>
              <div className="grid grid-cols-3 gap-2">
                {popularDestinations.map((place, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(place)}
                    className="flex items-center space-x-2 cursor-pointer bg-[#03B3BE]/10 hover:bg-[#03B3BE]/20 text-[#03B3BE] px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-[#03B3BE]/20 hover:border-[#03B3BE]/40"
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{place}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trending searches */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-3">Xu hướng tìm kiếm</h4>
              <ul className="space-y-2">
                {trendingSearches.map((item, i) => (
                  <li
                    key={i}
                    onClick={() => handleSuggestionClick(item)}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-[#03B3BE]/10 px-3 py-2.5 rounded-lg transition-colors group border border-transparent hover:border-[#03B3BE]"

                  >
                    <TrendingUp className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;