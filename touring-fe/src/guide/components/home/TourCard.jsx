import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../common/Card";
import Badge from "../common/Badge";
import Button from "../common/Button";

const TourCard = ({ tour }) => {
  const navigate = useNavigate();

  const statusColors = {
    ongoing: "success",
    accepted: "info",
    completed: "default",
    canceled: "danger",
  };

  const statusLabels = {
    ongoing: "Đang diễn ra",
    accepted: "Sắp tới",
    completed: "Hoàn thành",
    canceled: "Đã hủy",
  };

  return (
    <Card
      hover
      className="relative overflow-hidden cursor-pointer"
      onClick={() => navigate(`/guide/tours/${tour.id}`)}
    >
      {/* Status Badge */}
      <div className="absolute top-3 right-3">
        <Badge variant={statusColors[tour.status]}>
          {statusLabels[tour.status]}
        </Badge>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={tour.customerAvatar}
          alt={tour.customerName}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
        />
        <div>
          <p className="font-semibold text-gray-900">{tour.customerName}</p>
          <p className="text-xs text-gray-500">{tour.numberOfGuests} khách</p>
        </div>
      </div>

      {/* Tour Name */}
      <h3 className="font-bold text-gray-900 mb-3 line-clamp-2">
        {tour.tourName}
      </h3>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>
            {new Date(tour.departureDate).toLocaleDateString("vi-VN")}
          </span>
          {tour.startTime && (
            <span className="text-[#02A0AA] font-medium ml-auto">
              {tour.startTime}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="line-clamp-1">{tour.location}</span>
        </div>
      </div>

      {/* Price & Action */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Tổng</p>
          <p className="text-lg font-bold text-[#02A0AA]">
            {tour.totalPrice.toLocaleString("vi-VN")}
          </p>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/guide/tours/${tour.id}`);
          }}
        >
          Xem chi tiết
        </Button>
      </div>
    </Card>
  );
};

export default TourCard;
