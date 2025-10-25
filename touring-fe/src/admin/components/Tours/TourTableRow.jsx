import React, { useState } from "react";
import {
  formatPrice,
  calculateBookingPercentage,
  isTourFull,
  getAvailableSeats,
  canEditTour,
  canDeleteTour,
} from "../../utils/tourHelpers.js";
import StatusBadge from "../../components/Common/StatusBadge.jsx";

// Confirmation Modal Component
const ConfirmModal = ({ isOpen, onClose, onConfirm, tour, isHiding }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 border-2 border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          {isHiding ? 'Xác nhận ẩn tour' : 'Xác nhận hiện tour'}
        </h3>
        <p className="text-gray-600 mb-6">
          {isHiding 
            ? `Bạn có chắc chắn muốn ẩn tour "${tour?.title}"? Tour sẽ không hiển thị với khách hàng.`
            : `Bạn có chắc chắn muốn hiện tour "${tour?.title}"? Tour sẽ hiển thị trở lại với khách hàng.`
          }
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-colors ${
              isHiding 
                ? 'bg-orange-400 hover:bg-orange-500' 
                : 'bg-green-400 hover:bg-green-500'
            }`}
          >
            {isHiding ? 'Ẩn tour' : 'Hiện tour'}
          </button>
        </div>
      </div>
    </div>
  );
};

const TourTableRow = ({ tour, onViewDetail, onToggleVisibility }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Calculate total seats and seats booked across all departures
  const totalSeats =
    tour.departures?.reduce((sum, dep) => sum + dep.seatsTotal, 0) || 0;
  const bookedSeats =
    tour.departures?.reduce(
      (sum, dep) => sum + (dep.seatsTotal - dep.seatsLeft),
      0
    ) || 0;

  const bookingPercentage =
    totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;
  const availableSeats =
    tour.departures?.reduce((sum, dep) => sum + dep.seatsLeft, 0) || 0;
  const isFull = availableSeats === 0 && totalSeats > 0;

  // Determine tour status based on departures
  const hasOpenDepartures = tour.departures?.some(
    (dep) => dep.status === "open"
  );
  const tourStatus = hasOpenDepartures ? "active" : "inactive";

  const canHide = true; // Luôn có thể ẩn/hiện tour
  const isHidden = tour.isHidden || false;

  // Get next upcoming departure
  const upcomingDeparture = tour.departures
    ?.filter((dep) => new Date(dep.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const handleToggleClick = () => {
    setShowConfirmModal(true);
  };

  const confirmToggle = () => {
    setShowConfirmModal(false);
    onToggleVisibility(tour);
  };

  return (
    <>
      <tr className={`hover:bg-gray-50 transition-colors ${isHidden ? 'opacity-40' : ''}`}>
        <td className="px-6 py-4">
          <div className="font-medium text-gray-900">{tour.title}</div>
          <div className="text-sm text-gray-500 line-clamp-2">
            {tour.description}
          </div>

          {tour.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {tour.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {tour.agencyId && (
            <span className="inline-block text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded mr-1">
              {tour.agencyId.name ||
                (tour.agencyId[0] && tour.agencyId[0].name) ||
                "Agency"}
            </span>
          )}

          {isFull && (
            <span className="inline-block mt-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
              Đã đầy
            </span>
          )}
          
          {isHidden && (
            <span className="inline-block mt-1 text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-0.5 rounded ml-1">
              Đã ẩn
            </span>
          )}
        </td>

        <td className="px-6 py-4 text-gray-900">
          {upcomingDeparture ? (
            <>
              <div>{formatPrice(upcomingDeparture.priceAdult)} VNĐ</div>
              <div className="text-xs text-gray-500">
                {new Date(upcomingDeparture.date).toLocaleDateString("vi-VN")}
              </div>
            </>
          ) : (
            <>{formatPrice(tour.basePrice)} VNĐ</>
          )}
        </td>

        <td className="px-6 py-4">
          <div className="text-sm font-medium text-gray-900">
            {bookedSeats}/{totalSeats}
          </div>
          <div className="text-xs text-gray-500 mb-1">
            Còn {availableSeats} chỗ
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                isFull
                  ? "bg-red-600"
                  : bookingPercentage > 75
                  ? "bg-yellow-600"
                  : "bg-blue-600"
              }`}
              style={{ width: `${bookingPercentage}%` }}
            />
          </div>
        </td>

        <td className="px-6 py-4">
          <StatusBadge status={tourStatus} />
          <div className="text-xs text-gray-500 mt-1">
            {tour.departures?.length || 0} lịch khởi hành
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="flex gap-2">
            <button
              onClick={() => onViewDetail(tour)}
              className="px-3 py-1 text-sm rounded-xl transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
              title="Xem chi tiết tour"
            >
              Chi tiết
            </button>

            <button
              onClick={handleToggleClick}
              disabled={!canHide}
              className={`px-3 py-1 text-sm rounded-xl transition-colors ${
                canHide
                  ? isHidden
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              title={
                !canHide ? "Không thể ẩn/hiện tour" : isHidden ? "Hiện tour" : "Ẩn tour"
              }
            >
              {isHidden ? "Hiện" : "Ẩn"}
            </button>
          </div>
        </td>
      </tr>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmToggle}
        tour={tour}
        isHiding={!isHidden}
      />
    </>
  );
};

export default TourTableRow;