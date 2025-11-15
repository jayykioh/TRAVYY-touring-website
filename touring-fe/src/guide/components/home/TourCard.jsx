// src/pages/guide/components/home/TourCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  accepted: { label: "Sắp tới", textColor: "#02A0AA" },
  inProgress: { label: "Đang diễn ra", textColor: "#2563eb" },
  completed: { label: "Hoàn thành", textColor: "#16a34a" },
};

const formatDuration = (totalMinutes) => {
  if (!totalMinutes || totalMinutes <= 0) return "";
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours && mins) return `${hours}h${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
};

const TourCard = ({ tour, status = "accepted" }) => {
  const navigate = useNavigate();
  if (!tour) return null;

  const {
    _id,
    id,
    zoneName,
    name,
    coverImage,
    imageUrl,
    imageItems,
    totalDuration,
    numberOfPeople,
  } = tour;

  const tourId = _id || id;
  const title = zoneName || name || "Tour";
  const durationText = formatDuration(totalDuration);
  const peopleText = numberOfPeople ? `${numberOfPeople} khách` : "";

  const hasInfo = durationText || peopleText;

  const statusInfo = statusConfig[status] || statusConfig.accepted;

  // Get image from backend - priority: imageItems > imageUrl > coverImage
  const tourImage = imageItems?.[0]?.imageUrl || imageUrl || coverImage;

  const handleClick = () => {
    if (!tourId) return;
    navigate(`/guide/tours/${tourId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer inline-flex flex-col gap-2"
    >
      {/* Ảnh + badge trạng thái */}
      <div className="relative w-full aspect-square overflow-hidden rounded-3xl bg-gray-200 shadow-md">
        {tourImage ? (
          <img
            src={tourImage}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <span className="text-gray-400 text-4xl">🗺️</span>
          </div>
        )}

        {/* Badge trạng thái ở góc trên phải (thay cho '20% off') */}
        <div className="absolute top-2 right-2 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold shadow">
          <span style={{ color: statusInfo.textColor }}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Nội dung bên dưới */}
      <div className="px-3">
        {/* Tiêu đề: zoneName */}
        <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>

        {/* “Địa điểm”: tổng thời lượng + số khách */}
        {hasInfo && (
          <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
            {/* chấm nhỏ giống location dot */}
            <span className="inline-block h-2 w-2 rounded-full bg-[#02A0AA]" />
            <span className="truncate">{peopleText}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourCard;
