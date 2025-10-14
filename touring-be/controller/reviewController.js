// controller/reviewController.js
const Review = require("../models/Review");
const Booking = require("../models/Bookings");
const Tour = require("../models/Tours");
const User = require("../models/Users");
const mongoose = require("mongoose");

// 1. Tạo review mới
const createReview = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const {
      tourId,
      bookingId,
      rating,
      title,
      content,
      detailedRatings,
      images,
      isAnonymous,
      tourDate
    } = req.body;

    // Validate required fields
    if (!tourId || !bookingId || !rating || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: tourId, bookingId, rating, title, content"
      });
    }

    console.log("=== DEBUG REVIEW SUBMISSION ===");
    console.log("Received data:", { tourId, bookingId, userId });

    // Kiểm tra booking có thuộc về user và đã completed
    const booking = await Booking.findOne({
      _id: bookingId,
      userId,
      status: 'paid'
    });

    console.log("Found booking:", booking ? {
      _id: booking._id,
      userId: booking.userId,
      status: booking.status,
      itemsCount: booking.items?.length || 0,
      items: booking.items?.map(item => ({
        tourId: item.tourId?.toString(),
        name: item.name,
        date: item.date
      }))
    } : null);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking hợp lệ hoặc booking chưa hoàn thành"
      });
    }

    // Kiểm tra tour có trong booking không
    console.log("Looking for tourId:", tourId);
    console.log("Available tourIds in booking:", booking.items.map(item => item.tourId?.toString()));

    const tourInBooking = booking.items.find(
      item => item.tourId?.toString() === tourId?.toString()
    );

    if (!tourInBooking) {
      console.log("❌ Tour NOT found in booking!");
      console.log("Comparison details:");
      booking.items.forEach((item, index) => {
        console.log(`Item ${index}:`, {
          tourId: item.tourId?.toString(),
          matches: item.tourId?.toString() === tourId?.toString(),
          name: item.name
        });
      });
      
      return res.status(400).json({
        success: false,
        message: "Tour không có trong booking này",
        debug: {
          requestedTourId: tourId,
          availableTourIds: booking.items.map(item => item.tourId?.toString()),
          bookingId: bookingId
        }
      });
    }

    console.log("✅ Tour found in booking:", {
      tourId: tourInBooking.tourId?.toString(),
      name: tourInBooking.name
    });

    // Kiểm tra đã review chưa
    const existingReview = await Review.findOne({ userId, bookingId });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Bạn đã đánh giá booking này rồi"
      });
    }

    // Tạo review
    const review = await Review.create({
      userId,
      tourId,
      bookingId,
      rating: parseInt(rating),
      title: title.trim(),
      content: content.trim(),
      detailedRatings,
      images: images || [],
      isAnonymous: isAnonymous || false,
      tourDate: tourDate || tourInBooking.date,
      isVerified: true, // Auto verify vì đã có booking
      status: 'approved' // Auto approve vì đã verify booking
    });

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name avatar')
      .populate('tourId', 'title imageItems')
      .populate('bookingId', 'bookingCode');

    res.status(201).json({
      success: true,
      review: populatedReview,
      message: "Đánh giá đã được tạo thành công"
    });

  } catch (error) {
    console.error("createReview error:", error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Bạn đã đánh giá booking này rồi"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi tạo đánh giá"
    });
  }
};

// 2. Lấy reviews của một tour
const getTourReviews = async (req, res) => {
  try {
    const { tourId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      rating = null
    } = req.query;

    if (!mongoose.isValidObjectId(tourId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID"
      });
    }

    const sortOrderNum = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.getTourReviews(tourId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrderNum,
      rating: rating ? parseInt(rating) : null
    });

    // Lấy thống kê rating
    const ratingStats = await Review.getAverageRating(tourId);

    const totalReviews = await Review.countDocuments({
      tourId,
      status: 'approved'
    });

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalReviews,
        totalPages: Math.ceil(totalReviews / limit)
      },
      ratingStats: ratingStats[0] || null
    });

  } catch (error) {
    console.error("getTourReviews error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy đánh giá tour"
    });
  }
};

// 3. Lấy reviews của user
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.getUserReviews(userId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    const totalReviews = await Review.countDocuments({ userId });

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalReviews,
        totalPages: Math.ceil(totalReviews / limit)
      }
    });

  } catch (error) {
    console.error("getUserReviews error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy đánh giá của user"
    });
  }
};

// 4. Cập nhật review
const updateReview = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const { reviewId } = req.params;
    const { rating, title, content, detailedRatings, images } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá"
      });
    }

    // Kiểm tra quyền sửa
    if (!review.canEdit(userId)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không thể sửa đánh giá này (quá thời hạn hoặc đã được duyệt)"
      });
    }

    // Update fields
    if (rating) review.rating = parseInt(rating);
    if (title) review.title = title.trim();
    if (content) review.content = content.trim();
    if (detailedRatings) review.detailedRatings = detailedRatings;
    if (images) review.images = images;

    await review.save();

    const updatedReview = await Review.findById(reviewId)
      .populate('userId', 'name avatar')
      .populate('tourId', 'title imageItems');

    res.json({
      success: true,
      review: updatedReview,
      message: "Đánh giá đã được cập nhật"
    });

  } catch (error) {
    console.error("updateReview error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật đánh giá"
    });
  }
};

// 5. Xóa review
const deleteReview = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá"
      });
    }

    // Kiểm tra quyền xóa
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa đánh giá này"
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      message: "Đánh giá đã được xóa"
    });

  } catch (error) {
    console.error("deleteReview error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi xóa đánh giá"
    });
  }
};

// 6. Like/Unlike review
const toggleReviewLike = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá"
      });
    }

    await review.addLike(userId);

    res.json({
      success: true,
      likesCount: review.likesCount,
      message: "Đã cập nhật like"
    });

  } catch (error) {
    console.error("toggleReviewLike error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi like đánh giá"
    });
  }
};

// 7. Phản hồi đánh giá (cho tour operator)
const responseToReview = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const { reviewId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nội dung phản hồi không được để trống"
      });
    }

    const review = await Review.findById(reviewId).populate('tourId');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá"
      });
    }

    // TODO: Kiểm tra user có quyền phản hồi không (là tour operator của tour này)

    await review.addResponse(content.trim(), userId);

    const updatedReview = await Review.findById(reviewId)
      .populate('userId', 'name avatar')
      .populate('tourId', 'title')
      .populate('response.respondedBy', 'name');

    res.json({
      success: true,
      review: updatedReview,
      message: "Đã phản hồi đánh giá"
    });

  } catch (error) {
    console.error("responseToReview error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi phản hồi đánh giá"
    });
  }
};

// 8. Lấy bookings có thể đánh giá
const getReviewableBookings = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;

    // Lấy các booking đã hoàn thành nhưng chưa review
    const bookings = await Booking.find({
      userId,
      status: 'paid'
    }).populate('items.tourId', 'title imageItems basePrice');

    // Lấy danh sách bookingId đã review
    const reviewedBookingIds = await Review.distinct('bookingId', { userId });

    // Lọc ra bookings chưa review
    const reviewableBookings = bookings.filter(
      booking => !reviewedBookingIds.some(
        id => id.toString() === booking._id.toString()
      )
    );

    res.json({
      success: true,
      bookings: reviewableBookings,
      total: reviewableBookings.length
    });

  } catch (error) {
    console.error("getReviewableBookings error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách booking có thể đánh giá"
    });
  }
};

module.exports = {
  createReview,
  getTourReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  toggleReviewLike,
  responseToReview,
  getReviewableBookings
};