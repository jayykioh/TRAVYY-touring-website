// components/TourTableRow.jsx
import React from 'react';
import {
  formatPrice,
  calculateBookingPercentage,
  isTourFull,
  getAvailableSeats,
  canEditTour,
  canDeleteTour
} from '../../utils/tourHelpers.js';
import StatusBadge from '../../components/Common/StatusBadge.jsx';

const TourTableRow = ({ tour, onEdit, onDelete }) => {
  const bookingPercentage = calculateBookingPercentage(tour.booked, tour.capacity);
  const availableSeats = getAvailableSeats(tour);
  const isFull = isTourFull(tour);
  const canEdit = canEditTour(tour);
  const canDelete = canDeleteTour(tour);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">{tour.title}</div>
        <div className="text-sm text-gray-500">{tour.location}</div>
        {tour.guide && (
          <div className="text-xs text-gray-400 mt-1">👤 {tour.guide}</div>
        )}
        {isFull && (
          <span className="inline-block mt-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
            Đã đầy
          </span>
        )}
      </td>
     
      <td className="px-6 py-4 text-gray-900">
        {formatPrice(tour.price)} VNĐ
      </td>
     
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {tour.booked}/{tour.capacity}
        </div>
        <div className="text-xs text-gray-500 mb-1">
          Còn {availableSeats} chỗ
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              isFull ? 'bg-red-600' : bookingPercentage > 75 ? 'bg-yellow-600' : 'bg-blue-600'
            }`}
            style={{ width: `${bookingPercentage}%` }}
          />
        </div>
      </td>
     
      <td className="px-6 py-4">
        <StatusBadge status={tour.status} />
      </td>
     
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(tour)}
            disabled={!canEdit}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              canEdit
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={!canEdit ? 'Không thể sửa tour đã hoàn thành' : 'Sửa tour'}
          >
            Sửa
          </button>
         
          <button
            onClick={() => onDelete(tour)}
            disabled={!canDelete}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              canDelete
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={!canDelete ? 'Không thể xóa tour đã có người đặt' : 'Xóa tour'}
          >
            Xóa
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TourTableRow;