import React from "react";
import { AnimatePresence } from "framer-motion";
import Button from "../common/Button";

const NewRequestModal = ({
  show,
  newRequests = [],
  onClose,
  onViewDetails,
}) => {
  return (
    <AnimatePresence>
      {show && newRequests.length > 0 && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
          >
            {/* Nút đóng */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Nội dung modal */}
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Thông báo mới
                </h3>
                <p className="text-sm text-gray-500">Bạn có yêu cầu tour mới</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-gray-700 text-sm mb-2">
                Bạn có{" "}
                <strong className="text-[#02A0AA]">{newRequests.length}</strong>{" "}
                yêu cầu mới trong 24h. Khách hàng đang chờ phản hồi của bạn.
              </p>
              <p className="text-xs text-gray-500">
                Vui lòng xem và phản hồi sớm để đảm bảo dịch vụ tốt nhất!
              </p>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                onClose();
                onViewDetails();
              }}
            >
              Xem chi tiết
            </Button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewRequestModal;
