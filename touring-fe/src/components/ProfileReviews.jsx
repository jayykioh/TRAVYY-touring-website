import { useState, useEffect, useCallback } from "react";
import { X, Star, MessageCircle, ThumbsUp, Calendar, User, ChevronDown, ChevronUp, Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../auth/context";
import { useNavigate } from "react-router-dom";
// =============== ReviewModal Component ===============
function ReviewModal({ 
  isOpen, 
  onClose, 
  tourId, 
  tourTitle,
  bookingId,
  onReviewSubmitted 
}) {
  const { user, withAuth } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  if (!isOpen) return null;

  // Handle image upload
  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    const newImages = [];
    
    try {
      for (const file of files) {
        // Validate file type and size
        if (!file.type.startsWith('image/')) {
          toast.error('Chỉ chấp nhận file hình ảnh');
          continue;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast.error('Kích thước file không được vượt quá 5MB');
          continue;
        }

        // Convert to base64 for preview (in production, you might upload to cloud storage)
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
        
        newImages.push({
          id: Date.now() + Math.random(),
          url: base64,
          file: file,
          name: file.name
        });
      }
      
      setImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
      
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Có lỗi khi tải hình ảnh');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.token) {
      toast.error("Vui lòng đăng nhập để đánh giá");
      return;
    }

    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Vui lòng viết ít nhất 10 ký tự cho đánh giá");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting review with data:", {
        tourId,
        bookingId,
        rating,
        title: `Đánh giá ${rating} sao`,
        content: comment.trim()
      });
      
      // Ensure IDs are primitive strings when sending to the API
      const payload = {
        tourId: typeof tourId === 'object' ? (tourId._id || tourId.toString()) : tourId,
        bookingId: typeof bookingId === 'object' ? (bookingId._id || bookingId.toString()) : bookingId,
        rating,
        title: `Đánh giá ${rating} sao`,
        content: comment.trim(),
        images: images.map(img => ({ url: img.url, name: img.name }))
      };

      const data = await withAuth('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      toast.success("Cảm ơn bạn đã đánh giá!");
      onReviewSubmitted?.(data.review);
      onClose();
      // Reset form
      setRating(0);
      setComment("");
      setImages([]);
    } catch (error) {
      console.error("Error submitting review:", error);
      // If server returned JSON body with message, show it
      const serverMsg = error?.body?.message || error?.message;
      if (serverMsg) toast.error(serverMsg);
      else toast.error("Không thể kết nối đến server. Vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-lg font-semibold text-gray-900">
            Đánh giá tour
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Tour Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-1">Bạn đang đánh giá:</p>
            <p className="font-medium text-gray-900">{tourTitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá sao *
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-110 transition-transform"
                    disabled={isSubmitting}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {rating === 1 && "Rất không hài lòng"}
                  {rating === 2 && "Không hài lòng"}
                  {rating === 3 && "Bình thường"}
                  {rating === 4 && "Hài lòng"}
                  {rating === 5 && "Rất hài lòng"}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chia sẻ trải nghiệm của bạn *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Hãy chia sẻ cảm nhận của bạn về tour này..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                disabled={isSubmitting}
                required
                minLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                Tối thiểu 10 ký tự ({comment.length}/10)
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thêm hình ảnh (tùy chọn)
              </label>
              
              {/* Upload Button */}
              <div className="flex items-center gap-3 mb-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4" />
                  {uploadingImages ? 'Đang tải...' : 'Chọn hình ảnh'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(Array.from(e.target.files))}
                    className="hidden"
                    disabled={isSubmitting || uploadingImages || images.length >= 5}
                  />
                </label>
                <span className="text-xs text-gray-500">
                  Tối đa 5 ảnh, mỗi ảnh ≤ 5MB
                </span>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi đánh giá'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// =============== ReviewCard Component ===============
function ReviewCard({ review }) {
  const [showFullContent, setShowFullContent] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-gray-900">
              {review.userId?.name || 'Ẩn danh'}
            </p>
            <div className="flex items-center gap-1">
              {renderStars(review.rating)}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(review.createdAt)}</span>
            {review.isVerified && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                Đã xác thực
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
        <div className="text-gray-700 text-sm">
          {showFullContent ? (
            <p>{review.content}</p>
          ) : (
            <p>{review.content?.slice(0, 150)}{review.content?.length > 150 ? '...' : ''}</p>
          )}
          {review.content?.length > 150 && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-blue-600 hover:text-blue-700 mt-1 inline-flex items-center gap-1 text-xs"
            >
              {showFullContent ? (
                <>Thu gọn <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>Xem thêm <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}
        </div>

        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="mt-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Review image ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    // Open image in modal (you can implement this later)
                    window.open(image.url, '_blank');
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
          <ThumbsUp className="w-4 h-4" />
          <span>Hữu ích ({review.likesCount || 0})</span>
        </button>
      </div>

      {/* Response */}
      {review.response && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-3 h-3 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Phản hồi từ nhà cung cấp</span>
          </div>
          <p className="text-sm text-gray-700">{review.response.content}</p>
        </div>
      )}
    </div>
  );
}

// =============== TourReviews Component ===============
function TourReviews({ tourId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews/tour/${tourId}?sort=${sortBy}`);
      const data = await response.json();
      
      if (response.ok) {
        setReviews(data.reviews || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [tourId, sortBy]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const renderRatingDistribution = () => {
    if (!stats?.ratingDistribution) return null;

    const total = stats.totalReviews || 1;
    
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating] || 0;
          const percentage = Math.round((count / total) * 100);
          
          return (
            <div key={rating} className="flex items-center gap-2 text-sm">
              <span className="w-8 text-right">{rating}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-gray-500 w-8 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="reviews">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Đánh giá từ du khách
        </h3>
        {stats && (
          <span className="text-sm text-gray-500">
            ({stats.totalReviews} đánh giá)
          </span>
        )}
      </div>

      {/* Statistics */}
      {stats && stats.totalReviews > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.averageRating?.toFixed(1) || '0.0'}
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(stats.averageRating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Dựa trên {stats.totalReviews} đánh giá
              </p>
            </div>
            <div>
              {renderRatingDistribution()}
            </div>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {reviews.length} đánh giá
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="highest">Điểm cao nhất</option>
            <option value="lowest">Điểm thấp nhất</option>
          </select>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có đánh giá nào cho tour này</p>
            <p className="text-sm">Hãy là người đầu tiên đánh giá!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))
        )}
      </div>
    </div>
  );
}

// =============== Main ProfileReviews Component ===============
export default function ProfileReviews() {
  const { user, withAuth } = useAuth();
  const navigate = useNavigate();
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);

  // Fetch user's reviews
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!user?.token) return;
      
      try {
        setLoading(true);
        const data = await withAuth('/api/reviews/my');
        setUserReviews(data.reviews || []);
      } catch (error) {
        console.error('Error fetching user reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [user?.token, withAuth]);

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Vui lòng đăng nhập để xem đánh giá của bạn</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Đánh giá của bạn</h1>
      
      {userReviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Bạn chưa có đánh giá nào</p>
          <p className="text-sm">Hãy đặt tour và chia sẻ trải nghiệm của bạn!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userReviews.map((review) => (
            <div key={review._id} className="border rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div>
                 <h3
                  onClick={() => {
                    if (review.tourId?._id) {
                      navigate(`/tours/${review.tourId._id}`);
                      // Scroll to reviews section after navigation
                      setTimeout(() => {
                        const reviewsSection = document.getElementById('reviews');
                        if (reviewsSection) {
                          reviewsSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }
                  }}
                  className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                >
                  {review.tourId?.title || "Tour đã bị xóa"}
                </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  review.status === 'approved' 
                    ? 'bg-green-100 text-green-700' 
                    : review.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {review.status === 'approved' && 'Đã duyệt'}
                  {review.status === 'pending' && 'Chờ duyệt'}
                  {review.status === 'rejected' && 'Từ chối'}
                </span>
              </div>
              
              <h4 className="font-medium mb-2">{review.title}</h4>
              <p className="text-gray-700 text-sm mb-3">{review.content}</p>
              
              {/* Review Images in Profile */}
              {review.images && review.images.length > 0 && (
                <div className="mb-3">
                  <div className="grid grid-cols-3 gap-2">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={`Review image ${index + 1}`}
                        className="w-full h-16 object-cover rounded border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {review.response && (
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Phản hồi từ nhà cung cấp
                    </span>
                  </div>
                  <p className="text-sm text-blue-800">{review.response.content}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {review.likesCount || 0} hữu ích
                  </span>
                  {review.tourId?._id && (
                    <button
                      onClick={() => {
                        navigate(`/tours/${review.tourId._id}`);
                        // Scroll to reviews section after navigation
                        setTimeout(() => {
                          const reviewsSection = document.getElementById('reviews');
                          if (reviewsSection) {
                            reviewsSection.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      }}
                      className="text-blue-600 hover:text-blue-700 transition-colors text-xs"
                    >
                      Xem trang tour →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal?.isOpen && (
        <ReviewModal
          isOpen={reviewModal.isOpen}
          onClose={() => setReviewModal(null)}
          tourId={reviewModal.tourId}
          tourTitle={reviewModal.tourTitle}
          bookingId={reviewModal.bookingId}
          onReviewSubmitted={() => {
            setReviewModal(null);
            // Refresh user reviews
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

// Export individual components for use elsewhere
export { ReviewModal, ReviewCard, TourReviews };
