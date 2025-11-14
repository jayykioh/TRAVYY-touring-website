// src/pages/components/common/RequestCard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RequestCard = ({ request, highlightNew, onActionClick }) => {
  const navigate = useNavigate();
  const [isHighlighted, setIsHighlighted] = useState(!!highlightNew);

  useEffect(() => {
    if (!highlightNew) return;

    setIsHighlighted(true);
    const timer = setTimeout(() => {
      setIsHighlighted(false); // tắt highlight sau 1.5s
    }, 1500);

    return () => clearTimeout(timer);
  }, [highlightNew]);

  if (!request) return null;

  const {
    id,
    customerName,
    numberOfGuests,
    location,
    tourName,
    totalPrice,
    departureDate,
  } = request;

  const handleCardClick = () => {
    // Điều hướng sang trang chi tiết – chỉnh path nếu route khác
    navigate(`/guide/requests/${id}`);
  };

  const handleAccept = (e) => {
    e.stopPropagation();
    onActionClick?.(id, "accept");
  };

  const handleReject = (e) => {
    e.stopPropagation();
    onActionClick?.(id, "reject");
  };

  return (
    <div
      onClick={handleCardClick}
      className={[
        "cursor-pointer rounded-3xl bg-[#f9f5ee]",
        "shadow-lg transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-2xl",
        isHighlighted ? "ring-2 ring-[#02A0AA]/60" : "",
      ].join(" ")}
    >
      {/* Ảnh header full chiều ngang */}
      <div className="overflow-hidden rounded-t-3xl">
        <img
          src={
            request.coverImage ||
            "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg"
          }
          alt={location || tourName || "Request"}
          className="h-48 w-full object-cover"
        />
      </div>

      {/* Nội dung */}
      <div className="p-4 space-y-2">
        {/* Khách + số lượng khách */}
        <div className="flex items-center text-sm font-medium text-[#02A0AA]">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#02A0AA]" />
          <span className="truncate">
            {customerName || "Khách hàng"} •{" "}
            {numberOfGuests ? `${numberOfGuests} khách` : "1 khách"}
          </span>
        </div>

        {/* Tiêu đề: location (fallback tourName) */}
        <h3 className="text-lg font-semibold text-neutral-900">
          {location || tourName || "Yêu cầu hành trình"}
        </h3>

        {/* Ngày khởi hành */}
        {departureDate && (
          <p className="text-xs text-neutral-500">
            Khởi hành:{" "}
            {new Date(departureDate).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        )}

        {/* Giá + nút hành động */}
        <div className="mt-4 flex items-center justify-between rounded-full bg-[#02A0AA] px-4 py-2 text-white">
          <div className="flex items-baseline gap-1">
            <div className="text-lg font-extrabold">Phản hồi</div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReject}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20"
            >
              Từ chối
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#02A0AA] hover:bg-neutral-100"
            >
              Chấp nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
