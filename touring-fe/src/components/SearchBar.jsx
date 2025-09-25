import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, MapPin, TrendingUp, X } from "lucide-react";

const SearchBar = ({ onSearch, initialQuery = "", showSuggestions = true }) => {
  const [query, setQuery] = useState(initialQuery);
  const [history, setHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Mock data
  const popularDestinations = ["Hạ Long", "Đà Nẵng", "Sapa", "Phú Quốc", "Hội An", "Nha Trang"];
  const trendingSearches = [
    "Tour Hạ Long 3N2Đ", 
    "Combo Đà Nẵng", 
    "Du lịch Sapa mùa đông",
    "Resort Phú Quốc 5 sao",
    "Tour miền Tây 2N1Đ"
  ];

  // Load search history
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    setHistory(savedHistory);
  }, []);

  // Update query when initialQuery changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Handle search submission
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    // Save to history
    const newHistory = [query, ...history.filter(item => item !== query)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));

    // Close dropdown
    setIsOpen(false);

    // Handle search
    if (onSearch) {
      onSearch(query);
    } else {
      // Navigate to search results page
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setIsOpen(false);
    
    // Save to history
    const newHistory = [suggestion, ...history.filter(item => item !== suggestion)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));

    // Handle search
    if (onSearch) {
      onSearch(suggestion);
    } else {
      navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    }
  };

  // Clear search history
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("searchHistory");
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
  setQuery(value);

  // Gợi ý từ dữ liệu tour
  if (value.trim()) {
    import("../mockdata/tour").then(({ tours }) => {
      const filtered = tours.filter(t => 
        t.title.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    });
  } else {
    setSuggestions([]);
  }
    // Có thể thêm debounced suggestions ở đây
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-lg" ref={dropdownRef}>
      <div className="relative">
        <input
          type="search"
          placeholder="Tìm tour, địa điểm..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => showSuggestions && setIsOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
          className="w-full rounded-full border border-gray-300 bg-white/80 px-4 py-2 pr-12 text-sm outline-none transition focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 p-1.5 text-white transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-95"
          aria-label="Tìm kiếm"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Dropdown suggestions */}
      {isOpen && showSuggestions && (
        <div className="absolute top-12 left-0 w-full min-w-[400px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Search History */}
          {history.length > 0 && (
            <div className="border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
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
          
          <div className="px-4 py-2">
            {/* History items */}
            {history.length > 0 && (
              <ul className="mb-4">
                {history.map((item, i) => (
                  <li
                    key={i}
                    onClick={() => handleSuggestionClick(item)}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 px-2 py-2 rounded transition-colors group"
                  >
                    <Clock className="w-4 h-4 text-gray-400 group-hover:text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 group-hover:text-gray-900 flex-1 truncate text-sm">{item}</span>
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
                    className="flex items-center space-x-2 cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-emerald-100"
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
                    className="flex items-center space-x-3 cursor-pointer hover:bg-orange-50 px-3 py-2.5 rounded-lg transition-colors group border border-transparent hover:border-orange-100"
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