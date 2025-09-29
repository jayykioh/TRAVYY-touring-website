import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { destinationList } from "../mockdata/destinationList";
import TourCard from "./TourCard";

export default function RegionTours() {
  const { slug } = useParams();
  const [tours, setTours] = useState([]);

  useEffect(() => {
    if (slug && destinationList[slug]) {
      setTours(destinationList[slug]);
    }
  }, [slug]);

  if (!tours.length) {
    return (
      <div className="p-6 text-center text-xl">
        Không tìm thấy tour cho khu vực này.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold mb-6">
        Tour nổi bật tại {slug.replace("-", " ").toUpperCase()}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            isFav={false}
            onFav={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
