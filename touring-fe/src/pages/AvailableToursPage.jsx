import * as React from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, Star, Filter, Search } from "lucide-react";
import tours, { categories } from "../mockdata/tours";
import TourCard from "../components/TourCard";

export default function ToursPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("Tất cả");
  const [filteredTours, setFilteredTours] = React.useState(tours);
  const categories = [
  "Tất cả",
  "Miền Bắc",
  "Miền Trung",
  "Miền Nam",
  "Nước ngoài",
];


  // Filter tours
  React.useEffect(() => {
    let result = tours;

    // Filter by category
    if (selectedCategory !== "Tất cả") {
      result = result.filter((tour) => tour.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter((tour) =>
        tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredTours(result);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-[url('https://exmouthresort.net.au/wp-content/uploads/119079-56.jpg')] from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🌏 Tour Có Sẵn
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Khám phá các tour du lịch chất lượng cao đã được thiết kế sẵn
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tour, địa điểm..."
                className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 text-lg focus:ring-4 focus:ring-white/50 outline-none transition shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Lọc theo vùng</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-[url('https://exmouthresort.net.au/wp-content/uploads/119079-56.jpg')] text-white shadow-lg scale-105"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-blue-500 hover:text-blue-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tours Grid */}
        {filteredTours.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Tìm thấy <span className="font-semibold text-gray-900">{filteredTours.length}</span> tour
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTours.map((tour) => (
                <TourCard
                  key={tour.id}
                  to={`/tours/${tour.id}`}
                  id={tour.id}
                  image={tour.image}
                  title={tour.name}
                  location={tour.destination || tour.departure}
                  tags={tour.highlights?.slice(0, 3)}
                  rating={tour.rating}
                  reviews={tour.reviews}
                  bookedText={`${Math.floor(Math.random() * 1000)} đã đặt`}
                  priceFrom={tour.price}
                  onFav={() => console.log('fav', tour.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Không tìm thấy tour nào
            </h3>
            <p className="text-gray-600">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-[url('https://exmouthresort.net.au/wp-content/uploads/119079-56.jpg')]  from-blue-600 to-purple-600 rounded-3xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Không tìm thấy tour phù hợp?</h2>
          <p className="text-lg text-blue-100 mb-6">
            Tự thiết kế hành trình độc đáo theo ý muốn của bạn
          </p>
          <Link
            to="/"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-4 rounded-full hover:bg-blue-50 transition-all hover:scale-105 shadow-xl"
          >
            🎨 Tạo tour ngay
          </Link>
        </div>
      </div>
    </div>
  );
}