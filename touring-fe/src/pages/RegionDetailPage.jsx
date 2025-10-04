import React from "react";
import { useParams } from "react-router-dom";
import { destinationList } from "../mockdata/destinationList";
import TourCard from "../components/TourCard";

export default function RegionDetailPage() {
  const { slug } = useParams();

  // Tìm tên tỉnh từ slug
  const regionName = Object.keys(destinationList).find(
    (name) => name.toLowerCase() === slug.toLowerCase()
  );

  if (!regionName) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-red-500">
          Không tìm thấy tỉnh/thành này.
        </h1>
      </div>
    );
  }

  const tours = destinationList[regionName];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Tiêu đề */}
      <h1 className="text-4xl font-bold text-[#007980] mb-8">
        Các Tour tại {regionName}
      </h1>

      {/* Danh sách tour */}
      {tours.length === 0 ? (
        <p className="text-gray-500">Chưa có tour nào cho tỉnh này.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <TourCard
              key={tour.id}
              to={`/tours/${tour.id}`}
              image={tour.image}
              title={tour.title}
              location={tour.location}
              tags={tour.tags}
              rating={tour.rating}
              reviews={tour.reviews}
              bookedText={`${tour.booked} Đã được đặt`}
              priceFrom={tour.currentPrice.toString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
