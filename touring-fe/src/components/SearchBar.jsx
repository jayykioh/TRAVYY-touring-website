import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, MapPin, TrendingUp, X } from "lucide-react";

const SearchBar = ({
  onSearch,
  initialQuery = "",
  showSuggestions = true,
  bookingData,
  setBookingData,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [history, setHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  const popularDestinations = [
    "Hạ Long",
    "Đà Nẵng",
    "Sapa",
    "Phú Quốc",
    "Hội An",
    "Nha Trang",
  ];

  const trendingSearches = [
    "Tour Hạ Long 3N2Đ",
    "Combo Đà Nẵng",
    "Du lịch Sapa mùa đông",
    "Resort Phú Quốc 5 sao",
    "Tour miền Tây 2N1Đ",
  ];

  useEffect(() => {
    const savedHistory = JSON.parse(
      localStorage.getItem("searchHistory") || "[]"
    );
    setHistory(savedHistory);
  }, []);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const newHistory = [
      query,
      ...history.filter((item) => item !== query),
    ].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    setIsOpen(false);

    const params = new URLSearchParams({
      destination: query,
      checkIn: bookingData?.checkIn || "",
      checkOut: bookingData?.checkOut || "",
      guests: bookingData?.guests?.toString() || "1",
    });

    navigate(`/search-filter-results?${params.toString()}`);
    setQuery("");
  };

  const handleSuggestionClick = (suggestion) => {
    // Normalize input: support both string and object suggestions
    const val =
      typeof suggestion === "string"
        ? suggestion
        : suggestion?.name || suggestion?.label || suggestion?.title;
    if (!val) return;

    // Update history (do not close UI before navigate to avoid race)
    const newHistory = [val, ...history.filter((h) => h !== val)].slice(0, 10);
    setHistory(newHistory);
    try {
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    } catch (e) {}

    if (setBookingData) setBookingData((p) => ({ ...p, destination: val }));

    // Navigate first (ensure route receives param), then close UI after microtask
    navigate(`/search-filter-results?destination=${encodeURIComponent(val)}`);

    // close dropdown and clear query after short delay to avoid interrupting navigation
    setTimeout(() => {
      setIsOpen(false);
      setQuery("");
    }, 0);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    // Stop propagation so parent/global listeners don't intercept Space
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(e);
    }
    // allow Space and other keys normally
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

  //Suggest Tour
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/locations");
        const data = await res.json();
        setSuggestions(data); // [{ name: "Hội An" }, { name: "Đà Nẵng" }, ...]
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    fetchSuggestions();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredSuggestions([]);
      return;
    }

    const normalizeText = (str) =>
      (str || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");

    const normalizedQuery = normalizeText(query);

    // Build a combined list: backend suggestions + hardcoded popular destinations
    const seen = new Set();
    const combined = [];

    (suggestions || []).forEach((s) => {
      const name = (s && (s.name || s.label || s.title)) || "";
      if (!name) return;
      const key = normalizeText(name);
      if (!seen.has(key)) {
        seen.add(key);
        combined.push({ name, _source: "api" });
      }
    });

    (popularDestinations || []).forEach((p) => {
      const key = normalizeText(p);
      if (!seen.has(key)) {
        seen.add(key);
        combined.push({ name: p, _source: "popular" });
      }
    });

    const filtered = combined.filter((item) =>
      normalizeText(item.name).includes(normalizedQuery)
    );
    setFilteredSuggestions(filtered);
    setIsOpen(true);
  }, [query, suggestions]);

  return (
    <div className="relative w-full max-w-lg" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text" // ✅ không dùng search nữa
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="off"
          placeholder="Tìm tour, địa điểm..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => showSuggestions && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-full border-2 border-[#03B3BE] bg-white/80 px-4 py-2 pr-12 text-sm outline-none tracking-wide focus:ring-2 focus:ring-[#03B3BE]/50 focus:border-[#03B3BE]"
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
                <h4 className="text-sm font-semibold text-gray-600">
                  Lịch sử tìm kiếm
                </h4>
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
                    <span className="text-gray-700 group-hover:text-[#03B3BE] flex-1 truncate text-sm">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Dynamic suggestions */}
            {filteredSuggestions.length > 0 && (
              <div className="px-4 py-2">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">
                  Kết quả phù hợp
                </h4>
                <ul>
                  {filteredSuggestions.map((item, i) => (
                    <li
                      key={i}
                      onClick={() => handleSuggestionClick(item.name)}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-[#03B3BE]/10 px-3 py-2 rounded-lg"
                    >
                      <MapPin className="w-4 h-4 text-[#03B3BE]" />
                      <span className="text-sm text-gray-800">{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Popular destinations */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">
                Địa điểm nổi bật
              </h4>
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
              <h4 className="text-sm font-semibold text-gray-600 mb-3">
                Xu hướng tìm kiếm
              </h4>
              <ul className="space-y-2">
                {trendingSearches.map((item, i) => (
                  <li
                    key={i}
                    onClick={() => handleSuggestionClick(item)}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-[#03B3BE]/10 px-3 py-2.5 rounded-lg transition-colors group border border-transparent hover:border-[#03B3BE]"
                  >
                    <TrendingUp className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                      {item}
                    </span>
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
