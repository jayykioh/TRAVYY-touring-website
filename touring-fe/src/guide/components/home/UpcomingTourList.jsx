import React from "react";
import { useNavigate } from "react-router-dom";
import TourCard from "./TourCard";
import Button from "../common/Button";

const UpcomingTourList = ({ tours }) => {
  const navigate = useNavigate();

  if (!tours || tours.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-6xl mb-4">📅</p>
        <p className="text-gray-500 mb-2">No upcoming tours</p>
        <p className="text-sm text-gray-400">
          Accept new requests to get started
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Tour sắp tới</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/guide/tours?tab=upcoming")}
        >
          Xem tất cả →
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tours.slice(0, 3).map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </div>
  );
};

export default UpcomingTourList;
