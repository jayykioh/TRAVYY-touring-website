import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const QuickBooking = () => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: 2,
  });

  const [openDropdown, setOpenDropdown] = useState(null);

  const popularDestinations = [
    "Đà Nẵng",
    "Hội An",
    "Huế",
    "Nha Trang",
    "Phú Quốc",
    "Sapa",
  ];

  const handleInputChange = (field, value) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    const { destination, checkIn, checkOut, guests } = bookingData;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = checkIn ? new Date(`${checkIn}T00:00:00`) : null;
    const checkOutDate = checkOut ? new Date(`${checkOut}T00:00:00`) : null;

    if (!destination.trim()) return toast.error("Vui lòng chọn điểm đến.");
    if (!checkInDate || !checkOutDate)
      return toast.error("Vui lòng chọn đầy đủ ngày khởi hành và ngày kết thúc.");
    if (checkInDate < today)
      return toast.error("Ngày khởi hành không được ở quá khứ.");
    if (checkOutDate < today)
      return toast.error("Ngày kết thúc không được ở quá khứ.");
    if (checkOutDate < checkInDate)
      return toast.error("Ngày kết thúc phải sau ngày khởi hành.");

    const selectedLenDays =
      Math.floor((checkOutDate - checkInDate) / (24 * 60 * 60 * 1000)) + 1;
    if (selectedLenDays > 14)
      return toast.error("Khoảng thời gian không được quá 14 ngày.");

    const normalizeDate = (val) => (val ? new Date(val).toISOString().split("T")[0] : "");
    const normalizedCheckIn = normalizeDate(checkIn);

    try {
      let url = "http://localhost:4000/api/tours";
      const keyword = destination.trim();
      if (keyword) url += `?search=${encodeURIComponent(keyword)}`;

      const res = await fetch(url);
      const data = await res.json();

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
        return openDates.some((d) => d.trim() === normalizedCheckIn.trim());
      });

      if (matchedTours.length === 0)
        return toast.error("⚠️ Ngày khởi hành bạn chọn không có trong lịch trình tour hiện có.");

      const params = new URLSearchParams({
        destination: destination || "",
        checkIn,
        checkOut,
        guests: String(guests),
        len: String(selectedLenDays),
        strict: "1",
      });

      navigate(`/search-filter-results?${params.toString()}`, { state: { matchedTours } });
      setOpenDropdown(null);
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi khi tìm kiếm tour.");
    }
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  return (
    <section className="relative py-12">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 10px 25px rgba(0, 121, 128, 0.15)",
          },
          success: {
            iconTheme: {
              primary: "#007980",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <div className="max-w-6xl mx-auto px-4">
        {/* Search Bar */}
        <div className="relative bg-white rounded-full shadow-2xl border border-gray-200 p-2 flex items-stretch">
          {/* Destination */}
          <div className="relative flex-1 border-r border-gray-200">
            <button
              onClick={() => toggleDropdown("destination")}
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

            {openDropdown === "destination" && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50">
                <input
                  type="text"
                  placeholder="Tìm kiếm điểm đến..."
                  value={bookingData.destination}
                  onChange={(e) => handleInputChange("destination", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#02A0AA] focus:ring-[#02A0AA]/30 transition-all"
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
              onClick={() => toggleDropdown("dates")}
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

            {openDropdown === "dates" && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) => handleInputChange("checkIn", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#02A0AA] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Ngày kết thúc</label>
                    <input
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) => handleInputChange("checkOut", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#02A0AA] transition-all"
                    />
                  </div>
                  <button
                    onClick={() => setOpenDropdown(null)}
                    className="w-full bg-[#02A0AA] hover:bg-[#028e98] text-white font-semibold py-3 rounded-xl transition-all"
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
              onClick={() => toggleDropdown("guests")}
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

            {openDropdown === "guests" && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-3">Số lượng khách</label>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() =>
                          handleInputChange(
                            "guests",
                            Math.max(1, bookingData.guests - 1)
                          )
                        }
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-gray-700 transition-all"
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold text-gray-900">{bookingData.guests}</span>
                      <button
                        onClick={() =>
                          handleInputChange(
                            "guests",
                            Math.min(20, bookingData.guests + 1)
                          )
                        }
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-gray-700 transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenDropdown(null)}
                    className="w-full bg-[#02A0AA] hover:bg-[#028e98] text-white font-semibold py-3 rounded-xl transition-all"
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
            className="bg-[#02A0AA] hover:bg-[#028e98] text-white font-bold px-8 py-4 rounded-full ml-2 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
          >
            <Search className="w-5 h-5" />
            <span>Tìm</span>
          </button>
        </div>
      </div>

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
