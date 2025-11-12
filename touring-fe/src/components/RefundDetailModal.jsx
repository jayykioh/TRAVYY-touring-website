import PropTypes from "prop-types";

const RefundDetailModal = ({ refund, isOpen, onClose, onCancel }) => {
  if (!isOpen || !refund) return null;

  const getStatusColor = (status) => {
    const colors = {
      pending: "text-yellow-600 bg-yellow-50",
      under_review: "text-blue-600 bg-blue-50",
      approved: "text-green-600 bg-green-50",
      processing: "text-purple-600 bg-purple-50",
      completed: "text-green-700 bg-green-100",
      rejected: "text-red-600 bg-red-50",
      cancelled: "text-gray-600 bg-gray-50",
    };
    return colors[status] || "text-gray-600 bg-gray-50";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-[#007980] to-[#005f65] text-white p-5 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">Chi Tiết Hoàn Tiền</h2>
              <p className="text-sm opacity-90">Mã: {refund.refundReference}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg
                className="w-6 h-6"
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
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Rejection Alert Banner - Show at top if rejected */}
          {refund.status === "rejected" && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <h4 className="font-bold text-red-800 mb-1">
                    Yêu Cầu Hoàn Tiền Đã Bị Từ Chối
                  </h4>
                  <p className="text-sm text-red-700">
                    Yêu cầu hoàn tiền của bạn đã được xem xét và không được chấp
                    thuận.
                  </p>
                  {refund.reviewNote && (
                    <div className="mt-3 bg-white rounded-lg p-3 border border-red-200">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Lý do từ chối:
                      </p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {refund.reviewNote}
                      </p>
                      {refund.reviewedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Thời gian:{" "}
                          {new Date(refund.reviewedAt).toLocaleString("vi-VN")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Approval Alert Banner - Show at top if approved/processing/completed */}
          {["approved", "processing", "completed"].includes(refund.status) &&
            refund.reviewNote && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-bold text-green-800 mb-1">
                      Yêu Cầu Đã Được Chấp Thuận
                    </h4>
                    <p className="text-sm text-green-700 mb-2">
                      Yêu cầu hoàn tiền của bạn đã được admin xem xét và chấp
                      thuận.
                    </p>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Ghi chú từ admin:
                      </p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {refund.reviewNote}
                      </p>
                      {refund.reviewedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Thời gian:{" "}
                          {new Date(refund.reviewedAt).toLocaleString("vi-VN")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Trạng Thái
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      refund.status
                    )}`}
                  >
                    {refund.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Booking Info */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4 text-[#007980]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Thông Tin Booking
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã Booking:</span>
                    <span className="font-semibold">
                      {refund.bookingId?.orderRef || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loại Hoàn Tiền:</span>
                    <span className="font-semibold">
                      {refund.refundType === "pre_trip_cancellation"
                        ? "Hủy Trước Chuyến Đi"
                        : "Vấn Đề Sau Chuyến Đi"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pre-trip Details */}
              {refund.cancellationDetails && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm">
                    Chi Tiết Hủy Tour
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Ngày khởi hành:</span>
                      <span className="font-semibold">
                        {new Date(
                          refund.cancellationDetails.tourStartDate
                        ).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Ngày hủy:</span>
                      <span className="font-semibold">
                        {new Date(
                          refund.cancellationDetails.cancellationDate
                        ).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Số ngày trước tour:</span>
                      <span className="font-semibold text-[#007980]">
                        {refund.cancellationDetails.daysBeforeTour} ngày
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-700 mb-1">Chính sách:</p>
                      <p className="font-medium bg-white p-2 rounded border border-blue-100 text-xs">
                        {refund.cancellationDetails.cancellationPolicy}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Post-trip Details */}
              {refund.issueDetails && (
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm">
                    Chi Tiết Vấn Đề
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Danh mục:</span>
                      <span className="font-semibold capitalize">
                        {refund.issueDetails.issueCategory?.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Mức độ:</span>
                      <span className="font-semibold capitalize text-red-600">
                        {refund.issueDetails.severity}
                      </span>
                    </div>
                    {refund.issueDetails.description && (
                      <div className="mt-2">
                        <p className="text-gray-700 mb-1">Mô tả:</p>
                        <p className="bg-white p-2 rounded border border-orange-100 text-xs whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {refund.issueDetails.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Request Note */}
              {refund.requestNote && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                    Ghi Chú
                  </h3>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">
                    {refund.requestNote}
                  </p>
                </div>
              )}

              {/* Review Note - Only show if not rejected/approved (to avoid duplication with banner) */}
              {refund.reviewNote &&
                !["rejected", "approved", "processing", "completed"].includes(
                  refund.status
                ) && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                      Ghi Chú Từ Admin
                    </h3>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap">
                      {refund.reviewNote}
                    </p>
                    {refund.reviewedAt && (
                      <p className="text-[10px] text-gray-500 mt-2">
                        {new Date(refund.reviewedAt).toLocaleString("vi-VN")}
                      </p>
                    )}
                  </div>
                )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Financial Details */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Chi Tiết Hoàn Tiền
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-700">Số tiền gốc:</span>
                    <span className="font-semibold">
                      {refund.originalAmount?.toLocaleString()} VND
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-700">Tỷ lệ hoàn:</span>
                    <span className="font-semibold text-[#007980]">
                      {refund.refundPercentage}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-700">Số tiền được hoàn:</span>
                    <span className="font-semibold">
                      {refund.refundableAmount?.toLocaleString()} VND
                    </span>
                  </div>
                  {refund.processingFee > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-700">Phí xử lý (2%):</span>
                      <span className="text-red-600 font-semibold">
                        -{refund.processingFee?.toLocaleString()} VND
                      </span>
                    </div>
                  )}
                  <div className="border-t-2 border-green-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800 text-sm">
                        Tổng tiền hoàn lại:
                      </span>
                      <span className="font-bold text-green-600 text-lg">
                        {refund.finalRefundAmount?.toLocaleString()} VND
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {refund.timeline && refund.timeline.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm">
                    Timeline
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {refund.timeline.map((entry, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#007980]"></div>
                          {index < refund.timeline.length - 1 && (
                            <div className="w-0.5 flex-1 bg-gray-300 mt-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <p className="font-semibold text-xs capitalize text-gray-800">
                            {entry.status.replace("_", " ")}
                          </p>
                          {entry.note && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              {entry.note}
                            </p>
                          )}
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {new Date(entry.timestamp).toLocaleString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Info */}
              {refund.refundPayment && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm">
                    Thông Tin Thanh Toán
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Mã giao dịch:</span>
                      <span className="font-mono font-semibold">
                        {refund.refundPayment.transactionId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Ngày xử lý:</span>
                      <span className="font-semibold">
                        {new Date(
                          refund.refundPayment.processedAt
                        ).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="bg-gray-50 p-4 rounded-b-xl flex gap-3 flex-shrink-0 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-gray-700 transition-colors text-sm"
          >
            Đóng
          </button>
          {refund.status === "pending" && onCancel && (
            <button
              onClick={() => {
                onClose();
                onCancel(refund._id);
              }}
              className="flex-1 px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors text-sm"
            >
              Hủy Yêu Cầu
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

RefundDetailModal.propTypes = {
  refund: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

export default RefundDetailModal;
