import React from "react";
import {
  formatPrice,
  calculateBookingPercentage,
  isTourFull,
  getAvailableSeats,
  canEditTour,
  canDeleteTour,
} from "../../utils/tourHelpers.js";
import StatusBadge from "../../components/Common/StatusBadge.jsx";

const TourTableRow = ({ tour, onEdit, onDelete }) => {
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

  const canEdit = true; // Implement your logic based on the actual data structure
  const canDelete = availableSeats === totalSeats; // Only delete if no bookings

  // Get next upcoming departure
  const upcomingDeparture = tour.departures
    ?.filter((dep) => new Date(dep.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  return (
    <tr className="hover:bg-gray-50 transition-colors">
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
            onClick={() => onEdit(tour)}
            disabled={!canEdit}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              canEdit
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            title={!canEdit ? "Không thể sửa tour đã hoàn thành" : "Sửa tour"}
          >
            Sửa
          </button>

          <button
            onClick={() => onDelete(tour)}
            disabled={!canDelete}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              canDelete
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            title={
              !canDelete ? "Không thể xóa tour đã có người đặt" : "Xóa tour"
            }
          >
            Xóa
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TourTableRow;
