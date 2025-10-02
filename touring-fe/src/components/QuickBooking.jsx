import React, { useState } from "react";
import { Search, MapPin, Calendar, Users, Filter, Sparkles, Plane } from "lucide-react";

const QuickBooking = () => {
  const [bookingData, setBookingData] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: 2,
    category: "all"
  });

  const [focusedField, setFocusedField] = useState(null);

  const popularDestinations = [
    "Đà Nẵng", "Hội An", "Huế", "Nha Trang", "Phú Quốc", "Sapa"
  ];

  const categories = [
    { value: "all", label: "Tất cả", emoji: "🌟" },
    { value: "culture", label: "Văn hóa", emoji: "🏛️" },
    { value: "adventure", label: "Phiêu lưu", emoji: "⛰️" },
    { value: "beach", label: "Biển", emoji: "🏖️" },
    { value: "mountain", label: "Núi", emoji: "🗻" },
    { value: "food", label: "Ẩm thực", emoji: "🍜" }
  ];

  const quickSuggestions = [
    { text: "Tour Đà Nẵng 3N2Đ", gradient: "from-blue-500 to-purple-600" },
    { text: "Hội An 1 ngày", gradient: "from-yellow-500 to-orange-600" },
    { text: "Ba Na Hills", gradient: "from-green-500 to-teal-600" },
    { text: "Huế cố đô", gradient: "from-purple-500 to-pink-600" }
  ];

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    console.log("Searching with:", bookingData);
    // Navigate to search results
  };

  return (
    <section className="relative bg-white shadow-2xl border-t-4 border-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-0">
        <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Plane className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tìm kiếm chuyến đi
            </h2>
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-gray-600 text-sm">Khám phá những điểm đến tuyệt vời nhất Việt Nam</p>
        </div>

        <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
            {/* Destination */}
            <div className="relative lg:col-span-2">
              <div className={`group flex items-center border-2 rounded-xl px-4 py-4 transition-all duration-300 ${
                focusedField === 'destination' 
                  ? 'border-blue-500 bg-blue-50/50 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}>
                <MapPin className={`w-5 h-5 mr-3 transition-colors ${
                  focusedField === 'destination' ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Điểm đến</label>
                  <input
                    type="text"
                    placeholder="Bạn muốn đi đâu?"
                    value={bookingData.destination}
                    onChange={(e) => handleInputChange("destination", e.target.value)}
                    onFocus={() => setFocusedField('destination')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full outline-none text-gray-900 placeholder-gray-400 bg-transparent font-medium"
                    list="destinations"
                  />
                  <datalist id="destinations">
                    {popularDestinations.map((dest, index) => (
                      <option key={index} value={dest} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* Check-in Date */}
            <div className="relative">
              <div className={`group flex items-center border-2 rounded-xl px-4 py-4 transition-all duration-300 ${
                focusedField === 'checkIn' 
                  ? 'border-green-500 bg-green-50/50 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-green-300 hover:shadow-md'
              }`}>
                <Calendar className={`w-5 h-5 mr-3 transition-colors ${
                  focusedField === 'checkIn' ? 'text-green-500' : 'text-gray-400'
                }`} />
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ngày đi</label>
                  <input
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => handleInputChange("checkIn", e.target.value)}
                    onFocus={() => setFocusedField('checkIn')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full outline-none text-gray-900 bg-transparent font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Check-out Date */}
            <div className="relative">
              <div className={`group flex items-center border-2 rounded-xl px-4 py-4 transition-all duration-300 ${
                focusedField === 'checkOut' 
                  ? 'border-orange-500 bg-orange-50/50 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
              }`}>
                <Calendar className={`w-5 h-5 mr-3 transition-colors ${
                  focusedField === 'checkOut' ? 'text-orange-500' : 'text-gray-400'
                }`} />
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ngày về</label>
                  <input
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => handleInputChange("checkOut", e.target.value)}
                    onFocus={() => setFocusedField('checkOut')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full outline-none text-gray-900 bg-transparent font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Guests */}
            <div className="relative">
              <div className={`group flex items-center border-2 rounded-xl px-4 py-4 transition-all duration-300 ${
                focusedField === 'guests' 
                  ? 'border-purple-500 bg-purple-50/50 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
              }`}>
                <Users className={`w-5 h-5 mr-3 transition-colors ${
                  focusedField === 'guests' ? 'text-purple-500' : 'text-gray-400'
                }`} />
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Số khách</label>
                  <select
                    value={bookingData.guests}
                    onChange={(e) => handleInputChange("guests", e.target.value)}
                    onFocus={() => setFocusedField('guests')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full outline-none text-gray-900 bg-transparent font-medium"
                  >
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <option key={num} value={num}>
                        {num} khách
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <div className={`group flex items-center border-2 rounded-xl px-4 py-4 transition-all duration-300 ${
                focusedField === 'category' 
                  ? 'border-pink-500 bg-pink-50/50 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
              }`}>
                <Filter className={`w-5 h-5 mr-3 transition-colors ${
                  focusedField === 'category' ? 'text-pink-500' : 'text-gray-400'
                }`} />
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Loại tour</label>
                  <select
                    value={bookingData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    onFocus={() => setFocusedField('category')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full outline-none text-gray-900 bg-transparent font-medium"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="lg:col-span-1">
              <button
                onClick={handleSearch}
                className="group relative w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <Search className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300" />
                <span className="hidden sm:inline relative z-10">Tìm kiếm</span>
                <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-10 transition-opacity duration-150"></div>
              </button>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="mt-6 lg:block">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Gợi ý phổ biến:</span>
              </div>
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleInputChange("destination", suggestion.text)}
                  className={`group relative text-sm font-medium text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg bg-gradient-to-r ${suggestion.gradient} overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <span className="relative z-10">{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickBooking;