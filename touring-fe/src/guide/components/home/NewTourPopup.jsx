import React from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Badge from "../common/Badge";

const NewTourPopup = ({
  isOpen,
  onClose,
  tourRequest,
  onAccept,
  onDecline,
}) => {
  if (!tourRequest) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🎉 Yêu cầu tour mới!"
      size="md"
      closeOnOverlayClick={false}
    >
      <div className="p-6">
        {/* Tour Info */}
        <div className="bg-[#f0fdfd] border-2 border-[#02A0AA] rounded-xl p-5 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {tourRequest.tourName}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-xs text-gray-500">Ngày khởi hành</p>
                <p className="font-semibold text-gray-900">
                  {new Date(tourRequest.departureDate).toLocaleDateString(
                    "vi-VN"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <div>
                <p className="text-xs text-gray-500">Thời lượng</p>
                <p className="font-semibold text-gray-900">
                  {tourRequest.duration}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-xs text-gray-500">Địa điểm</p>
                <p className="font-semibold text-gray-900">
                  {tourRequest.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <div>
                <p className="text-xs text-gray-500">Số khách</p>
                <p className="font-semibold text-gray-900">
                  {tourRequest.numberOfGuests} người
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-xs text-gray-500">Tổng giá</p>
              <p className="text-2xl font-bold text-[#02A0AA]">
                {tourRequest.totalPrice.toLocaleString("vi-VN")} VND
              </p>
            </div>
          </div>

          {tourRequest.specialRequests && (
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Yêu cầu đặc biệt</p>
              <p className="text-sm text-gray-700">
                {tourRequest.specialRequests}
              </p>
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-500 mb-2">Khách hàng</p>
          <div className="flex items-center gap-3">
            <img
              src={tourRequest.customerAvatar}
              alt={tourRequest.customerName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900">
                {tourRequest.customerName}
              </p>
              <p className="text-xs text-gray-500">
                Yêu cầu lúc{" "}
                {new Date(tourRequest.requestedAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-yellow-800">
            ⚠️ Vui lòng phản hồi nhanh! Khách hàng đang chờ xác nhận của bạn.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="danger" onClick={onDecline} fullWidth icon="❌">
            Từ chối
          </Button>
          <Button variant="success" onClick={onAccept} fullWidth icon="✅">
            Chấp nhận
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NewTourPopup;
