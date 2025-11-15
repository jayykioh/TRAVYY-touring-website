import PropTypes from "prop-types";

const RefundCard = ({
  refund,
  onViewDetails,
  onCancel,
  isCancelling,
  onProvideBankInfo,
}) => {
  // 🔍 Debug: Log refund data to check structure
  console.log("RefundCard - refund data:", {
    orderRef: refund.orderRef,
    bookingId: refund.bookingId,
    bookingIdType: typeof refund.bookingId,
    bookingIdOrderRef: refund.bookingId?.orderRef,
  });

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

  // Check if bank info is needed
  const needsBankInfo =
    refund.status === "approved" && !refund.bankInfo?.accountNumber;

  return (
    <div
      className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
        refund.status === "rejected" ? "border-red-300 bg-red-50/30" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-mono text-sm font-semibold text-[#007980]">
            {refund.refundReference}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Booking:{" "}
            {(() => {
              // Try orderRef first (direct or from populated booking)
              if (refund.orderRef) return refund.orderRef;
              if (refund.bookingId?.orderRef) return refund.bookingId.orderRef;

              // Fallback to payment orderId
              if (refund.bookingId?.payment?.orderId)
                return refund.bookingId.payment.orderId;

              // Fallback to ID (last 8 chars)
              if (typeof refund.bookingId === "string") {
                return refund.bookingId.slice(-8);
              }
              if (
                refund.bookingId?._id &&
                typeof refund.bookingId._id === "string"
              ) {
                return refund.bookingId._id.slice(-8);
              }

              return "N/A";
            })()}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            refund.status
          )}`}
        >
          {refund.status.replace("_", " ").toUpperCase()}
        </span>
      </div>

      {/* Bank Info Required Alert */}
      {needsBankInfo && (
        <div className="mb-3 bg-orange-100 border border-orange-300 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-800 mb-1">
                ⚠️ Cần cung cấp thông tin ngân hàng
              </p>
              <p className="text-xs text-orange-700 mb-2">
                Yêu cầu hoàn tiền đã được chấp nhận! Vui lòng cung cấp thông tin
                tài khoản ngân hàng để nhận tiền.
              </p>
              <button
                onClick={() => onProvideBankInfo?.(refund._id)}
                className="text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition-colors"
              >
                📝 Cung Cấp Thông Tin Ngân Hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Alert */}
      {refund.status === "rejected" && refund.reviewNote && (
        <div className="mb-3 bg-red-100 border border-red-300 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"
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
              <p className="text-xs font-semibold text-red-800 mb-1">
                ❌ Yêu cầu hoàn tiền bị từ chối
              </p>
              <p className="text-xs text-red-700 mb-1">
                Lý do: {refund.reviewNote}
              </p>
              <p className="text-xs font-medium text-red-900 bg-red-50 px-2 py-1 rounded mt-2 inline-block">
                ✅ Tour vẫn sẽ diễn ra bình thường theo lịch trình
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Alert - No note */}
      {refund.status === "rejected" && !refund.reviewNote && (
        <div className="mb-3 bg-red-100 border border-red-300 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"
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
              <p className="text-xs font-semibold text-red-800 mb-1">
                ❌ Yêu cầu hoàn tiền bị từ chối
              </p>
              <p className="text-xs font-medium text-red-900 bg-red-50 px-2 py-1 rounded mt-2 inline-block">
                ✅ Tour vẫn sẽ diễn ra bình thường theo lịch trình
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Approval/Completed Alert - Tour Cancelled */}
      {["approved", "processing", "completed"].includes(refund.status) && (
        <div className="mb-3 bg-green-100 border border-green-300 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"
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
              <p className="text-xs font-semibold text-green-800 mb-1">
                ✅ Yêu cầu hoàn tiền đã được chấp nhận
              </p>
              {refund.reviewNote && (
                <p className="text-xs text-green-700 mb-1">
                  Ghi chú: {refund.reviewNote}
                </p>
              )}
              <p className="text-xs font-medium text-orange-900 bg-orange-50 px-2 py-1 rounded mt-2 inline-block border border-orange-200">
                ⚠️ Tour đã bị hủy và sẽ KHÔNG khởi hành
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-600">Loại</p>
          <p className="font-medium text-sm">
            {refund.refundType === "pre_trip_cancellation"
              ? "Hủy Trước Chuyến Đi"
              : "Vấn Đề Sau Chuyến Đi"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Số Tiền Hoàn</p>
          <p className="font-semibold text-green-600">
            {refund.finalRefundAmount?.toLocaleString()} VND
          </p>
          <p className="text-xs text-gray-500">
            {refund.refundPercentage}% của tổng tiền
          </p>
        </div>
      </div>

      {refund.cancellationDetails && (
        <div className="mb-3">
          <p className="text-xs text-gray-600">Chính Sách Hủy</p>
          <p className="text-sm">
            {refund.cancellationDetails.cancellationPolicy}
          </p>
        </div>
      )}

      {refund.issueDetails && (
        <div className="mb-3">
          <p className="text-xs text-gray-600">Vấn Đề</p>
          <p className="text-sm font-medium capitalize">
            {refund.issueDetails.issueCategory?.replace("_", " ")} -{" "}
            <span className="text-red-600">{refund.issueDetails.severity}</span>
          </p>
        </div>
      )}

      <div className="flex justify-between items-center pt-3 border-t">
        <p className="text-xs text-gray-500">
          Yêu cầu: {new Date(refund.createdAt).toLocaleDateString("vi-VN")}
        </p>
        <div className="space-x-2">
          <button
            onClick={() => onViewDetails(refund._id)}
            className="text-[#007980] hover:underline text-sm font-medium"
          >
            Xem Chi Tiết
          </button>
          {refund.status === "pending" && onCancel && (
            <button
              onClick={() => onCancel(refund._id)}
              disabled={isCancelling}
              className="text-red-600 hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCancelling ? "Đang hủy..." : "Hủy Yêu Cầu"}
            </button>
          )}
        </div>
      </div>

      {/* Timeline Preview */}
      {refund.timeline && refund.timeline.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Cập Nhật Gần Nhất
          </p>
          <div className="space-y-2">
            {refund.timeline.slice(-3).map((entry, index) => (
              <div key={index} className="flex gap-2 text-xs">
                <span className="text-gray-500">
                  {new Date(entry.timestamp).toLocaleString("vi-VN")}
                </span>
                <span className="text-gray-700">-</span>
                <span className="font-medium capitalize">
                  {entry.status.replace("_", " ")}
                </span>
                {entry.note && (
                  <span className="text-gray-600 truncate">: {entry.note}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

RefundCard.propTypes = {
  refund: PropTypes.object.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  isCancelling: PropTypes.bool,
  onProvideBankInfo: PropTypes.func,
};

export default RefundCard;
