import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { mockRequests } from "../data/mockRequests";

const RequestsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [requests, setRequests] = useState(mockRequests);
  const [highlightNew, setHighlightNew] = useState(true);

  // tự động tắt highlight sau 3 giây
  useEffect(() => {
    const timer = setTimeout(() => setHighlightNew(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // tính yêu cầu mới (trong 48h)
  const isNewRequest = (requestedAt) => {
    try {
      return new Date() - new Date(requestedAt) < 48 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  };

  const filterOptions = [
    { value: "all", label: "Tất cả", count: requests.length },
    { value: "today", label: "Hôm nay", count: 2 },
    { value: "week", label: "Tuần này", count: 4 },
  ];

  const handleAccept = (requestId) => {
    console.log("Accepting request:", requestId);
    setRequests(requests.filter((r) => r.id !== requestId));
  };

  const handleDecline = (requestId) => {
    console.log("Declining request:", requestId);
    setRequests(requests.filter((r) => r.id !== requestId));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu tour</h1>
        <p className="text-gray-500">Xem và phản hồi các yêu cầu tour</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === option.value
                ? "bg-[#02A0AA] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {option.label} ({option.count})
          </button>
        ))}
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-6xl mb-4">📬</p>
          <p className="text-gray-500 mb-2">Không có yêu cầu</p>
          <p className="text-sm text-gray-400">
            Các yêu cầu tour mới sẽ hiển thị ở đây
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {requests.map((request) => {
            const isNew = isNewRequest(request.requestedAt);
            return (
              <Card
                key={request.id}
                hover
                className={`transition-all duration-300 ${
                  highlightNew && isNew
                    ? "ring-2 ring-[#02A0AA] shadow-xl animate-pulse"
                    : ""
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={request.customerAvatar}
                      alt={request.customerName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {request.customerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.requestedAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <Badge variant="warning">Mới</Badge>
                </div>

                {/* Tour Info */}
                <h3 className="font-bold text-gray-900 mb-3 line-clamp-2">
                  {request.tourName}
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span className="text-gray-600">
                      {new Date(request.departureDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span className="text-gray-600">
                      {request.numberOfGuests} khách
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span className="text-gray-600 line-clamp-1">
                      {request.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>⏱️</span>
                    <span className="text-gray-600">{request.duration}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-emerald-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tổng giá</span>
                    <span className="text-lg font-bold text-[#02A0AA]">
                      {request.totalPrice.toLocaleString("vi-VN")} VND
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => navigate(`/guide/requests/${request.id}`)}
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => handleDecline(request.id)}
                  >
                    ❌
                  </Button>
                  <Button
                    variant="success"
                    size="md"
                    onClick={() => handleAccept(request.id)}
                  >
                    ✅
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RequestsPage;
