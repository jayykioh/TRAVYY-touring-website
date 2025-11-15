import React from "react";
import { useNavigate } from "react-router-dom";
import TourCard from "./TourCard";
import Button from "../common/Button";

const UpcomingTourList = ({ tours }) => {
  const navigate = useNavigate();

  if (!tours || tours.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-2">Không có tour nào sắp tới</p>
        <p className="text-sm text-gray-400">
          Chấp nhận các yêu cầu mới để bắt đầu
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 mr-1">
        <h3 className="text-3xl font-bold text-gray-900">Tour sắp tới</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/guide/tours?tab=accepted")}
        >
          Xem tất cả →
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-7">
        {tours.slice(0, 4).map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </div>
  );
};

export default UpcomingTourList;
