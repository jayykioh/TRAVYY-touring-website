import { useState, useEffect } from 'react';
import { Star, ThumbsUp, Calendar, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function GuideReviewSection({ guideId }) {
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterRating, setFilterRating] = useState(null);

  useEffect(() => {
    fetchGuideReviews();
  }, [guideId, currentPage, filterRating]);

  const fetchGuideReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(filterRating && { rating: filterRating })
      });

      const response = await axios.get(
        `${API_URL}/api/reviews/guide/${guideId}?${params}`
      );

      if (response.data.success) {
        setReviews(response.data.reviews);
        setRatingStats(response.data.ratingStats);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching guide reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Đang tải đánh giá...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {ratingStats && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {ratingStats.averageRating?.toFixed(1) || '0.0'}
              </div>
              <div className="flex justify-center md:justify-start mb-2">
                {renderStars(Math.round(ratingStats.averageRating || 0))}
              </div>
              <p className="text-gray-600">
                {ratingStats.totalReviews} đánh giá
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingStats.ratingCounts?.[star] || 0;
                const percentage = ratingStats.totalReviews 
                  ? (count / ratingStats.totalReviews) * 100 
                  : 0;

                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm w-8">{star}⭐</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter by Rating */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant={filterRating === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRating(null)}
            >
              Tất cả
            </Button>
            {[5, 4, 3, 2, 1].map((star) => (
              <Button
                key={star}
                variant={filterRating === star ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRating(star)}
              >
                {star}⭐
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <p className="text-gray-600">
              Hướng dẫn viên chưa có đánh giá nào
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {/* User Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {review.userId?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>

                  {/* User Info */}
                  <div>
                    <h4 className="font-semibold">
                      {review.isAnonymous 
                        ? 'Khách hàng ẩn danh' 
                        : review.userId?.name || 'Khách hàng'}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex flex-col items-end gap-1">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-600">
                    {review.rating}/5
                  </span>
                </div>
              </div>

              {/* Tour Info */}
              {review.customTourRequestId && (
                <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    Tour: {review.customTourRequestId.tourDetails?.zoneName || 
                           review.customTourRequestId.requestNumber}
                  </span>
                </div>
              )}

              {/* Review Title */}
              <h5 className="font-semibold text-lg mb-2">{review.title}</h5>

              {/* Review Content */}
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                {review.content}
              </p>

              {/* Detailed Ratings */}
              {review.detailedRatings && Object.keys(review.detailedRatings).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  {review.detailedRatings.service && (
                    <div className="text-sm">
                      <span className="text-gray-600">Dịch vụ: </span>
                      <span className="font-semibold">{review.detailedRatings.service}/5</span>
                    </div>
                  )}
                  {review.detailedRatings.guide && (
                    <div className="text-sm">
                      <span className="text-gray-600">HDV: </span>
                      <span className="font-semibold">{review.detailedRatings.guide}/5</span>
                    </div>
                  )}
                  {review.detailedRatings.valueForMoney && (
                    <div className="text-sm">
                      <span className="text-gray-600">Giá trị: </span>
                      <span className="font-semibold">{review.detailedRatings.valueForMoney}/5</span>
                    </div>
                  )}
                </div>
              )}

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={image.caption || `Review image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  ))}
                </div>
              )}

              {/* Review Footer */}
              <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-3">
                <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span>Hữu ích ({review.likes?.length || 0})</span>
                </button>
                
                {review.isVerified && (
                  <span className="flex items-center gap-1 text-green-600">
                    ✓ Đã xác nhận hoàn thành tour
                  </span>
                )}
              </div>

              {/* Guide Response */}
              {review.response && (
                <div className="mt-4 ml-12 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    Phản hồi từ hướng dẫn viên
                  </p>
                  <p className="text-sm text-gray-700">{review.response.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(review.response.respondedAt)}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Trước
          </Button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
