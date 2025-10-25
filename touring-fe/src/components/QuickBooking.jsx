import React, { useState } from "react";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { Search, MapPin, Calendar, Users } from "lucide-react";

const QuickBooking = () => {
  const navigate = useNavigate(); // ✅ Khởi tạo navigate
  
=======
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { toast } from "sonner"; // ✅ dùng sonner cho đồng bộ

const QuickBooking = () => {
  const navigate = useNavigate();

>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
  const [bookingData, setBookingData] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
<<<<<<< HEAD
    guests: 2
=======
    guests: 2,
>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
  });

  const [openDropdown, setOpenDropdown] = useState(null);

  const popularDestinations = [
<<<<<<< HEAD
    "Đà Nẵng", "Hội An", "Huế", "Nha Trang", "Phú Quốc", "Sapa"
=======
    "Đà Nẵng",
    "Hội An",
    "Huế",
    "Nha Trang",
    "Phú Quốc",
    "Sapa",
>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
  ];

  const handleInputChange = (field, value) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

<<<<<<< HEAD
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
=======
  // ==========================
  // 🧭 Xử lý tìm kiếm tour
  // ==========================
  const handleSearch = async () => {
    console.log("🔍 Searching with:", bookingData);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInStr = bookingData.checkIn || "";
    const checkOutStr = bookingData.checkOut || "";

    const checkInDate = checkInStr ? new Date(`${checkInStr}T00:00:00`) : null;
    const checkOutDate = checkOutStr
      ? new Date(`${checkOutStr}T00:00:00`)
      : null;

    // 🧩 Kiểm tra hợp lệ
    if (!bookingData.destination.trim()) {
      toast.error("Vui lòng chọn điểm đến."); // ✅ toast của sonner
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast.error("Vui lòng chọn đầy đủ ngày khởi hành và ngày kết thúc.");
      return;
    }

    if (checkInDate < today) {
      toast.error("Ngày khởi hành không được ở quá khứ.");
      return;
    }

    if (checkOutDate < today) {
      toast.error("Ngày kết thúc không được ở quá khứ.");
      return;
    }

    if (checkOutDate < checkInDate) {
      toast.error("Ngày kết thúc phải sau ngày khởi hành.");
      return;
    }

    const selectedLenDays =
      Math.floor((checkOutDate - checkInDate) / (24 * 60 * 60 * 1000)) + 1;

    if (selectedLenDays > 14) {
      toast.error("Khoảng thời gian không được quá 14 ngày.");
      return;
    }

    // ✅ Chuẩn hóa ngày để so sánh đúng ISO (loại bỏ timezone)
    const normalizeDate = (val) => {
      if (!val) return "";
      const d = new Date(val);
      return d.toISOString().split("T")[0]; // → "2025-10-15"
    };

    const normalizedCheckIn = normalizeDate(checkInStr);

    try {
      let url = "http://localhost:4000/api/tours";
      const keyword = bookingData.destination.trim();
      if (keyword) url += `?search=${encodeURIComponent(keyword)}`;

      const res = await fetch(url);
      const data = await res.json();
      console.log("✅ Data nhận từ API:", data);

      const kw = keyword.toLowerCase();

      const matchedTours = data.filter((tour) => {
        const locationName =
          Array.isArray(tour.locations) && tour.locations.length > 0
            ? tour.locations[0].name?.toLowerCase()
            : "";

        const matchPlace =
          tour.title?.toLowerCase().includes(kw) ||
          tour.description?.toLowerCase().includes(kw) ||
          locationName.includes(kw);

        if (!matchPlace || !Array.isArray(tour.departures)) return false;

        const openDates = tour.departures
          .filter((dep) => dep.status === "open" && dep.date)
          .map((dep) => new Date(dep.date).toISOString().split("T")[0]);

        console.log("🎯 Tour:", tour.title);
        console.log("🔹 Các ngày open:", openDates);
        console.log("🔹 User chọn normalize:", normalizedCheckIn);

        const hasExactDeparture = openDates.some(
          (d) => d.trim() === normalizedCheckIn.trim()
        );

        return hasExactDeparture;
      });

      if (matchedTours.length === 0) {
        toast.error(
          "⚠️ Ngày khởi hành bạn chọn không có trong lịch trình tour hiện có."
        );
        return;
      }

      // ✅ Nếu có match → chuyển trang
      const params = new URLSearchParams({
        destination: bookingData.destination || "",
        checkIn: checkInStr,
        checkOut: checkOutStr,
        guests: bookingData.guests.toString(),
        len: selectedLenDays?.toString() || "",
        strict: "1",
      });

      navigate(`/search-filter-results?${params.toString()}`, {
        state: { matchedTours },
      });

      setOpenDropdown(null);
    } catch (error) {
      console.error("❌ Lỗi khi tìm tour:", error);
      toast.error("Đã xảy ra lỗi khi tìm kiếm tour.");
    }
>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
<<<<<<< HEAD
    <section className="relative bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Search Bar */}
        <div className="relative bg-white rounded-full shadow-2xl border border-gray-200 p-2 flex items-stretch">
          
          {/* Destination */}
          <div className="relative flex-1 border-r border-gray-200">
            <button
              onClick={() => toggleDropdown('destination')}
=======
    <section className="relative py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Search Bar */}
        <div className="relative bg-white rounded-full shadow-2xl border border-gray-200 p-2 flex items-stretch">
          {/* Destination */}
          <div className="relative flex-1 border-r border-gray-200">
            <button
              onClick={() => toggleDropdown("destination")}
>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
              className="w-full h-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 rounded-l-full transition-all"
            >
              <MapPin className="w-5 h-5 text-gray-600" />
              <div className="text-left flex-1">
<<<<<<< HEAD
                <div className="text-xs font-medium text-gray-500">Điểm đến</div>
=======
                <div className="text-xs font-medium text-gray-500">
                  Điểm đến
                </div>
>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {bookingData.destination || "Bạn muốn đến đâu?"}
                </div>
              </div>
            </button>

<<<<<<< HEAD
            {/* Dropdown */}
            {openDropdown === 'destination' && (
=======
            {/* Dropdown chọn địa điểm */}
            {openDropdown === "destination" && (
>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50">
                <input
                  type="text"
                  placeholder="Tìm kiếm điểm đến..."
                  value={bookingData.destination}
<<<<<<< HEAD
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
=======
                  onChange={(e) =>
                    handleInputChange("destination", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#02A0AA] focus:ring-[#02A0AA]/30 transition-all"
                  autoFocus
                />
                <div className="mt-3">
                  <div className="text-xs font-semibold text-gray-500 mb-2 px-2">
                    Địa điểm phổ biến
                  </div>
>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
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
<<<<<<< HEAD
              onClick={() => toggleDropdown('dates')}
=======
              onClick={() => toggleDropdown("dates")}
>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
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

<<<<<<< HEAD
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
=======
            {openDropdown === "dates" && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) =>
                        handleInputChange("checkIn", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#02A0AA] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) =>
                        handleInputChange("checkOut", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#02A0AA] transition-all"
>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
                    />
                  </div>
                  <button
                    onClick={() => setOpenDropdown(null)}
<<<<<<< HEAD
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
=======
                    className="w-full bg-[#02A0AA] hover:bg-[#028e98] text-white font-semibold py-3 rounded-xl transition-all"
>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
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
<<<<<<< HEAD
              onClick={() => toggleDropdown('guests')}
=======
              onClick={() => toggleDropdown("guests")}
>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
              className="w-full h-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-all"
            >
              <Users className="w-5 h-5 text-gray-600" />
              <div className="text-left flex-1">
<<<<<<< HEAD
                <div className="text-xs font-medium text-gray-500">Số khách</div>
=======
                <div className="text-xs font-medium text-gray-500">
                  Số khách
                </div>
>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
                <div className="text-sm font-semibold text-gray-900">
                  {bookingData.guests} người
                </div>
              </div>
            </button>

<<<<<<< HEAD
            {/* Dropdown */}
            {openDropdown === 'guests' && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-3">Số lượng khách</label>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleInputChange("guests", Math.max(1, bookingData.guests - 1))}
=======
            {openDropdown === "guests" && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-3">
                      Số lượng khách
                    </label>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() =>
                          handleInputChange(
                            "guests",
                            Math.max(1, bookingData.guests - 1)
                          )
                        }
>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-gray-700 transition-all"
                      >
                        -
                      </button>
<<<<<<< HEAD
                      <span className="text-2xl font-bold text-gray-900">{bookingData.guests}</span>
                      <button
                        onClick={() => handleInputChange("guests", Math.min(20, bookingData.guests + 1))}
=======
                      <span className="text-2xl font-bold text-gray-900">
                        {bookingData.guests}
                      </span>
                      <button
                        onClick={() =>
                          handleInputChange(
                            "guests",
                            Math.min(20, bookingData.guests + 1)
                          )
                        }
>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-gray-700 transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenDropdown(null)}
<<<<<<< HEAD
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
=======
                    className="w-full bg-[#02A0AA] hover:bg-[#028e98] text-white font-semibold py-3 rounded-xl transition-all"
>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
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
<<<<<<< HEAD
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-full ml-2 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
=======
            className="bg-[#02A0AA] hover:bg-[#028e98] text-white font-bold px-8 py-4 rounded-full ml-2 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
          >
            <Search className="w-5 h-5" />
            <span>Tìm</span>
          </button>
        </div>
      </div>

<<<<<<< HEAD
      {/* Click outside to close dropdown */}
=======
>>>>>>> 9da1cdbfecbf764bf6263f60e6a435e0aede22c2
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
