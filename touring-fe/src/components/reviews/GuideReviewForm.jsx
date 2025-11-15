import { useState } from 'react';
import { Star, X, Upload, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function GuideReviewForm({ reviewItem, onSuccess, onCancel }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [detailedRatings, setDetailedRatings] = useState({
    service: 0,
    guide: 0,
    valueForMoney: 0,
  });
  const [images] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }
    
    if (!title.trim() || !content.trim()) {
      setError('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const token = localStorage.getItem('token');
      
      const reviewData = {
        customTourRequestId: reviewItem.customTourRequestId,
        guideId: reviewItem.guideId,
        bookingId: reviewItem.bookingId,
        rating,
        title: title.trim(),
        content: content.trim(),
        detailedRatings,
        images,
        tourDate: reviewItem.tourDate
      };

      const response = await axios.post(
        `${API_URL}/api/reviews/guide`,
        reviewData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        onSuccess(response.data.review);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating, onRate, onHover, hovered) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover && onHover(star)}
            onMouseLeave={() => onHover && onHover(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hovered || currentRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderDetailedStars = (field, value) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setDetailedRatings({ ...detailedRatings, [field]: star })}
            className="focus:outline-none"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Đánh giá hướng dẫn viên</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guide Info */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xl">
              {reviewItem.guideName?.charAt(0)?.toUpperCase() || 'G'}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{reviewItem.guideName}</h3>
              <p className="text-sm text-gray-600">
                {reviewItem.guideRating ? `⭐ ${reviewItem.guideRating}/5` : 'Chưa có đánh giá'}
              </p>
              <p className="text-xs text-gray-500">
                Booking: {reviewItem.bookingCode}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Đánh giá tổng thể <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              {renderStars(rating, setRating, setHoverRating, hoverRating)}
              <span className="text-2xl font-bold text-gray-700">
                {hoverRating || rating || 0}/5
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tóm tắt trải nghiệm của bạn"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/200</p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nội dung đánh giá <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ chi tiết về trải nghiệm của bạn với hướng dẫn viên..."
              rows={6}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/2000</p>
          </div>

          {/* Detailed Ratings */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Đánh giá chi tiết
            </label>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm">Chất lượng dịch vụ</span>
                {renderDetailedStars('service', detailedRatings.service)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Hướng dẫn viên</span>
                {renderDetailedStars('guide', detailedRatings.guide)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Giá trị tiền bạc</span>
                {renderDetailedStars('valueForMoney', detailedRatings.valueForMoney)}
              </div>
            </div>
          </div>

          {/* Images Upload (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Hình ảnh (Tùy chọn)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Kéo thả hình ảnh vào đây hoặc click để chọn
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tối đa 5 ảnh, mỗi ảnh không quá 5MB
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0 || !title.trim() || !content.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Gửi đánh giá'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
