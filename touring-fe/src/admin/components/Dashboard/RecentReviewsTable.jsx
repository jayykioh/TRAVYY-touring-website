import React, { useState } from "react";
import { Eye, MessageSquare, X } from "lucide-react";

const RecentReviewsTable = ({ data = [] }) => {
  const [selectedReview, setSelectedReview] = useState(null);

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? "text-yellow-400" : "text-gray-300"}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const getStatusBadge = (hasResponse) => {
    if (hasResponse) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Đã phản hồi
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        Chưa phản hồi
      </span>
    );
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Review mới nhất
        </h3>
        <div className="text-center py-8 text-gray-500">Chưa có review</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Review mới nhất
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#007980] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  KHÁCH HÀNG
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  TOUR
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold">
                  ĐÁNH GIÁ
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold">
                  TRẠNG THÁI
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((review) => (
                <tr
                  key={review._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Customer */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {review.customer.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.customer.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {review.timeAgo}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Tour */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900 line-clamp-2">
                      {review.tour.title}
                    </p>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-4 text-center">
                    {renderStars(review.rating)}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 text-center">
                    {getStatusBadge(review.hasResponse)}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#007980] text-white rounded-lg hover:bg-[#005f65] transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Xem & Phản hồi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <ReviewModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </>
  );
};

// Review Modal Component
const ReviewModal = ({ review, onClose }) => {
  const [response, setResponse] = useState(review.response?.content || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Call API to submit response
    console.log("Submitting response:", response);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Chi tiết Review</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
              {review.customer.name?.charAt(0) || "?"}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-lg">
                {review.customer.name}
              </h4>
              <p className="text-sm text-gray-500">{review.customer.email}</p>
              <p className="text-xs text-gray-400 mt-1">{review.timeAgo}</p>
            </div>
          </div>

          {/* Tour Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Tour được đánh giá:</p>
            <p className="font-semibold text-gray-900">{review.tour.title}</p>
          </div>

          {/* Rating */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Đánh giá:</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-2xl ${
                    star <= review.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ⭐
                </span>
              ))}
            </div>
          </div>

          {/* Review Content */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Nội dung review:</p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-gray-800">{review.content}</p>
            </div>
          </div>

          {/* Response Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phản hồi của bạn:
            </label>
            <form onSubmit={handleSubmit}>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Nhập phản hồi cho khách hàng..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007980] focus:border-transparent resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#007980] text-white rounded-lg hover:bg-[#005f65] transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Gửi phản hồi
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentReviewsTable;
