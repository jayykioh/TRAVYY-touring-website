import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { Search, MapPin, Calendar, Users } from "lucide-react";

const QuickBooking = () => {
  const navigate = useNavigate(); // ✅ Khởi tạo navigate
  
  const [bookingData, setBookingData] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: 2
  });

  const [openDropdown, setOpenDropdown] = useState(null);

  const popularDestinations = [
    "Đà Nẵng", "Hội An", "Huế", "Nha Trang", "Phú Quốc", "Sapa"
  ];

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    console.log("Searching with:", bookingData);
    
    // ✅ Tạo URL parameters
    const params = new URLSearchParams({
      destination: bookingData.destination || "",
      checkIn: bookingData.checkIn || "",
      checkOut: bookingData.checkOut || "",
      guests: bookingData.guests.toString()
    });
    
    // ✅ Chuyển hướng đến trang SearchResults với parameters
    navigate(`/search-results?${params.toString()}`);
    
    setOpenDropdown(null);
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Search Bar */}
        <div className="relative bg-white rounded-full shadow-2xl border border-gray-200 p-2 flex items-stretch">
          
          {/* Destination */}
          <div className="relative flex-1 border-r border-gray-200">
            <button
              onClick={() => toggleDropdown('destination')}
              className="w-full h-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 rounded-l-full transition-all"
            >
              <MapPin className="w-5 h-5 text-gray-600" />
              <div className="text-left flex-1">
                <div className="text-xs font-medium text-gray-500">Điểm đến</div>
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {bookingData.destination || "Bạn muốn đến đâu?"}
                </div>
              </div>
            </button>

            {/* Dropdown */}
            {openDropdown === 'destination' && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50">
                <input
                  type="text"
                  placeholder="Tìm kiếm điểm đến..."
                  value={bookingData.destination}
                  onChange={(e) => handleInputChange("destination", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === ' ') {
                      e.stopPropagation();
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  autoFocus
                />
                <div className="mt-3">
                  <div className="text-xs font-semibold text-gray-500 mb-2 px-2">Địa điểm phổ biến</div>
                  <div className="space-y-1">
                    {popularDestinations.map((dest, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleInputChange("destination", dest);
                          setOpenDropdown(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 rounded-lg transition-all text-sm font-medium text-gray-700"
                      >
                        {dest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="relative flex-1 border-r border-gray-200">
            <button
              onClick={() => toggleDropdown('dates')}
              className="w-full h-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-all"
            >
              <Calendar className="w-5 h-5 text-gray-600" />
              <div className="text-left flex-1">
                <div className="text-xs font-medium text-gray-500">Ngày</div>
                <div className="text-sm font-semibold text-gray-900">
                  {bookingData.checkIn && bookingData.checkOut
                    ? `${bookingData.checkIn} - ${bookingData.checkOut}`
                    : "Chọn ngày"}
                </div>
              </div>
            </button>

            {/* Dropdown */}
            {openDropdown === 'dates' && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) => handleInputChange("checkIn", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Ngày kết thúc</label>
                    <input
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) => handleInputChange("checkOut", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => setOpenDropdown(null)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Guests */}
          <div className="relative flex-1">
            <button
              onClick={() => toggleDropdown('guests')}
              className="w-full h-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-all"
            >
              <Users className="w-5 h-5 text-gray-600" />
              <div className="text-left flex-1">
                <div className="text-xs font-medium text-gray-500">Số khách</div>
                <div className="text-sm font-semibold text-gray-900">
                  {bookingData.guests} người
                </div>
              </div>
            </button>

            {/* Dropdown */}
            {openDropdown === 'guests' && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-3">Số lượng khách</label>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleInputChange("guests", Math.max(1, bookingData.guests - 1))}
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-gray-700 transition-all"
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold text-gray-900">{bookingData.guests}</span>
                      <button
                        onClick={() => handleInputChange("guests", Math.min(20, bookingData.guests + 1))}
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-gray-700 transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenDropdown(null)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-full ml-2 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
          >
            <Search className="w-5 h-5" />
            <span>Tìm</span>
          </button>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdown(null)}
        ></div>
      )}
    </section>
  );
};

export default QuickBooking;