import React from "react";
import { useLocation } from "react-router-dom";
import { mockTours } from "../mockdata/tour";

export default function SearchResults() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("q")?.toLowerCase() || "";

  // Lọc dữ liệu theo query
  const filteredTours = mockTours.filter(
  (tour) =>
    tour.title.toLowerCase().includes(query.toLowerCase()) ||
    tour.location.toLowerCase().includes(query.toLowerCase())
);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Kết quả tìm kiếm cho: <span className="text-blue-600">"{query}"</span>
      </h2>

      {filteredTours.length === 0 ? (
        <p className="text-gray-500">Không tìm thấy kết quả nào.</p>
      ) : (
        <div className="grid gap-4">
          {filteredTours.map((tour, i) => (
            <div
              key={i}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg text-blue-600">
                {tour.title}
              </h3>
              <p className="text-sm text-gray-600">{tour.location}</p>
              <p className="text-sm mt-1">{tour.description}</p>
              <button className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                Đặt tour
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
