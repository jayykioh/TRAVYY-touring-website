// controller/reviewController.js
const Review = require("../models/Review");
const Booking = require("../models/Bookings");
const Tour = require("../models/agency/Tours");
const TourCustomRequest = require("../models/TourCustomRequest");
const Guide = require("../models/guide/Guide");
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
      tourDate,
    } = req.body;

    // Validate required fields
    if (!tourId || !bookingId || !rating || !title || !content) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu thông tin bắt buộc: tourId, bookingId, rating, title, content",
      });
    }

    // Kiểm tra booking có thuộc về user và đã completed
    const booking = await Booking.findOne({
      _id: bookingId,
      userId,
      status: "paid",
    });

    console.log(
      "Found booking:",
      booking
        ? {
            _id: booking._id,
            userId: booking.userId,
            status: booking.status,
            itemsCount: booking.items?.length || 0,
            items: booking.items?.map((item) => ({
              tourId: item.tourId?.toString(),
              name: item.name,
              date: item.date,
            })),
          }
        : null
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking hợp lệ hoặc booking chưa hoàn thành",
      });
    }

    // Kiểm tra tour có trong booking không
    console.log("Looking for tourId:", tourId);
    console.log(
      "Available tourIds in booking:",
      booking.items.map((item) => item.tourId?.toString())
    );

    const tourInBooking = booking.items.find(
      (item) => item.tourId?.toString() === tourId?.toString()
    );

    if (!tourInBooking) {
      console.log("❌ Tour NOT found in booking!");
      console.log("Comparison details:");
      booking.items.forEach((item, index) => {
        console.log(`Item ${index}:`, {
          tourId: item.tourId?.toString(),
          matches: item.tourId?.toString() === tourId?.toString(),
          name: item.name,
        });
      });

      return res.status(400).json({
        success: false,
        message: "Tour không có trong booking này",
        debug: {
          requestedTourId: tourId,
          availableTourIds: booking.items.map((item) =>
            item.tourId?.toString()
          ),
          bookingId: bookingId,
        },
      });
    }

    console.log("✅ Tour found in booking:", {
      tourId: tourInBooking.tourId?.toString(),
      name: tourInBooking.name,
    });

    // ✅ Kiểm tra tour date đã qua chưa (user phải đi tour rồi mới được review)
    const tourDateObj = new Date(tourInBooking.date);
    const now = new Date();

    if (tourDateObj > now) {
      return res.status(400).json({
        success: false,
        message: "Bạn chỉ có thể đánh giá sau khi đã hoàn thành tour",
        tourDate: tourDateObj,
        currentDate: now,
      });
    }

    console.log("✅ Tour date has passed, user can review:", {
      tourDate: tourDateObj,
      daysAgo: Math.floor((now - tourDateObj) / (1000 * 60 * 60 * 24)),
    });

    // Kiểm tra đã review chưa
    const existingReview = await Review.findOne({ userId, bookingId });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Bạn đã đánh giá booking này rồi",
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
      status: "pending", // Chờ admin duyệt
    });

    console.log("✅ Review created successfully:", {
      reviewId: review._id,
      userId,
      tourId,
      bookingId,
      rating: review.rating,
    });

    // ✅ Update tour rating and review count
    await updateTourRating(tourId);

    const populatedReview = await Review.findById(review._id)
      .populate("userId", "name avatar")
      .populate("tourId", "title imageItems")
      .populate("bookingId", "bookingCode");

    console.log("📤 Sending review response:", {
      reviewId: populatedReview._id,
      status: populatedReview.status,
    });

    res.status(201).json({
      success: true,
      review: populatedReview,
      message: "Đánh giá đã được tạo thành công",
    });
  } catch (error) {
    console.error("createReview error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Bạn đã đánh giá booking này rồi",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi tạo đánh giá",
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
      sortBy = "createdAt",
      sortOrder = "desc",
      rating = null,
    } = req.query;

    if (!mongoose.isValidObjectId(tourId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID",
      });
    }

    const sortOrderNum = sortOrder === "desc" ? -1 : 1;

    const reviews = await Review.getTourReviews(tourId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrderNum,
      rating: rating ? parseInt(rating) : null,
    });

    // Lấy thống kê rating
    const ratingStats = await Review.getAverageRating(tourId);

    const totalReviews = await Review.countDocuments({
      tourId,
      status: "approved",
    });

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalReviews,
        totalPages: Math.ceil(totalReviews / limit),
      },
      ratingStats: ratingStats[0] || null,
    });
  } catch (error) {
    console.error("getTourReviews error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy đánh giá tour",
    });
  }
};

// 3. Lấy reviews của user
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const { page = 1, limit = 10 } = req.query;

    console.log("🔍 Fetching reviews for user:", userId);

    const reviews = await Review.getUserReviews(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    const totalReviews = await Review.countDocuments({ userId });

    console.log("✅ Found reviews:", {
      count: reviews.length,
      total: totalReviews,
      reviewIds: reviews.map((r) => r._id.toString()),
    });

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalReviews,
        totalPages: Math.ceil(totalReviews / limit),
      },
    });
  } catch (error) {
    console.error("getUserReviews error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy đánh giá của user",
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
        message: "Không tìm thấy đánh giá",
      });
    }

    // Kiểm tra quyền sửa
    if (!review.canEdit(userId)) {
      return res.status(403).json({
        success: false,
        message:
          "Bạn không thể sửa đánh giá này (quá thời hạn hoặc đã được duyệt)",
      });
    }

    // Update fields
    if (rating) review.rating = parseInt(rating);
    if (title) review.title = title.trim();
    if (content) review.content = content.trim();
    if (detailedRatings) review.detailedRatings = detailedRatings;
    if (images) review.images = images;

    await review.save();

    // ✅ Update tour rating if rating changed
    if (rating) {
      await updateTourRating(review.tourId);
    }

    const updatedReview = await Review.findById(reviewId)
      .populate("userId", "name avatar")
      .populate("tourId", "title imageItems");

    res.json({
      success: true,
      review: updatedReview,
      message: "Đánh giá đã được cập nhật",
    });
  } catch (error) {
    console.error("updateReview error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật đánh giá",
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
        message: "Không tìm thấy đánh giá",
      });
    }

    // Kiểm tra quyền xóa
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa đánh giá này",
      });
    }

    await Review.findByIdAndDelete(reviewId);

    // ✅ Update tour rating and review count after deletion
    await updateTourRating(review.tourId);

    res.json({
      success: true,
      message: "Đánh giá đã được xóa",
    });
  } catch (error) {
    console.error("deleteReview error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi xóa đánh giá",
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
        message: "Không tìm thấy đánh giá",
      });
    }

    await review.addLike(userId);

    res.json({
      success: true,
      likesCount: review.likesCount,
      message: "Đã cập nhật like",
    });
  } catch (error) {
    console.error("toggleReviewLike error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi like đánh giá",
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
        message: "Nội dung phản hồi không được để trống",
      });
    }

    const review = await Review.findById(reviewId).populate("tourId");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
      });
    }

    // TODO: Kiểm tra user có quyền phản hồi không (là tour operator của tour này)

    await review.addResponse(content.trim(), userId);

    const updatedReview = await Review.findById(reviewId)
      .populate("userId", "name avatar")
      .populate("tourId", "title")
      .populate("response.respondedBy", "name");

    res.json({
      success: true,
      review: updatedReview,
      message: "Đã phản hồi đánh giá",
    });
  } catch (error) {
    console.error("responseToReview error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi phản hồi đánh giá",
    });
  }
};

// 8. Lấy bookings có thể đánh giá (bao gồm cả regular tours và custom tours)
const getReviewableBookings = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;

    // Lấy các booking đã hoàn thành (bao gồm cả regular tours và custom tours)
    const bookings = await Booking.find({
      userId,
      status: { $in: ["paid", "completed"] }, // Include both paid and completed
    })
      .populate("items.tourId", "title imageItems basePrice")
      .populate("customTourRequest.guideId", "name avatar rating location");

    // Lấy danh sách đã review
    const reviewedItems = await Review.find({ userId }).select("bookingId tourId customTourRequestId");

    const now = new Date();

    // Process bookings to separate regular tours and custom tours
    const reviewableItems = [];

    bookings.forEach((booking) => {
      // Check for regular tours
      if (booking.items && booking.items.length > 0) {
        booking.items.forEach((item) => {
          const tourDate = new Date(item.date);
          const hasTourPassed = tourDate <= now;
          
          // Check if already reviewed
          const alreadyReviewed = reviewedItems.some(
            (review) => 
              review.bookingId?.toString() === booking._id.toString() &&
              review.tourId?.toString() === item.tourId?._id?.toString()
          );

          if (hasTourPassed && !alreadyReviewed && item.tourId) {
            reviewableItems.push({
              type: 'regular_tour',
              bookingId: booking._id,
              bookingCode: booking.bookingCode,
              tourId: item.tourId._id,
              tourName: item.tourId.title,
              tourImage: item.tourId.imageItems?.[0],
              tourDate: item.date,
              price: item.price || item.tourId.basePrice
            });
          }
        });
      }

      // Check for custom tour
      if (booking.customTourRequest && booking.customTourRequest.requestId) {
        const tourDate = booking.customTourRequest.startDate 
          ? new Date(booking.customTourRequest.startDate) 
          : booking.createdAt;
        const hasTourPassed = new Date(tourDate) <= now;
        
        // Only show if booking is completed (guide marked as done)
        const isCompleted = booking.status === 'completed';
        
        // Check if already reviewed
        const alreadyReviewed = reviewedItems.some(
          (review) => 
            review.bookingId?.toString() === booking._id.toString() &&
            review.customTourRequestId?.toString() === booking.customTourRequest.requestId?.toString()
        );

        if (isCompleted && hasTourPassed && !alreadyReviewed && booking.customTourRequest.guideId) {
          reviewableItems.push({
            type: 'custom_tour',
            bookingId: booking._id,
            bookingCode: booking.bookingCode,
            customTourRequestId: booking.customTourRequest.requestId,
            guideId: booking.customTourRequest.guideId._id,
            guideName: booking.customTourRequest.guideId.name,
            guideAvatar: booking.customTourRequest.guideId.avatar,
            guideRating: booking.customTourRequest.guideId.rating,
            tourDate: tourDate,
            price: booking.payment?.amount || booking.customTourRequest.agreedPrice
          });
        }
      }
    });

    res.json({
      success: true,
      reviewableItems,
      total: reviewableItems.length,
    });
  } catch (error) {
    console.error("getReviewableBookings error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách có thể đánh giá",
    });
  }
};

/**
 * Helper: Update tour rating and review count
 * Calculate average rating from all approved reviews
 */
async function updateTourRating(tourId) {
  try {
    const reviews = await Review.find({
      tourId,
      status: "approved",
    }).select("rating");

    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      // No reviews - reset to 0
      await Tour.findByIdAndUpdate(tourId, {
        isRating: 0,
        isReview: 0,
      });
      console.log(`✅ Reset rating for tour ${tourId} (no reviews)`);
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / totalReviews) * 10) / 10; // Round to 1 decimal

    await Tour.findByIdAndUpdate(tourId, {
      isRating: averageRating,
      isReview: totalReviews,
    });

    console.log(
      `✅ Updated tour ${tourId}: rating=${averageRating}, reviews=${totalReviews}`
    );
  } catch (error) {
    console.error("❌ Error updating tour rating:", error);
    // Don't throw - review should succeed even if tour update fails
  }
}

/**
 * Helper: Update guide rating and review count
 * Calculate average rating from all approved guide reviews
 */
async function updateGuideRating(guideId) {
  try {
    const reviews = await Review.find({
      guideId,
      reviewType: 'custom_tour',
      status: "approved",
    }).select("rating");

    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      // No reviews - reset to 0
      await Guide.findByIdAndUpdate(guideId, {
        rating: 0,
        totalTours: 0,
      });
      console.log(`✅ Reset rating for guide ${guideId} (no reviews)`);
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / totalReviews) * 10) / 10; // Round to 1 decimal

    await Guide.findByIdAndUpdate(guideId, {
      rating: averageRating,
      totalTours: totalReviews,
    });

    console.log(
      `✅ Updated guide ${guideId}: rating=${averageRating}, reviews=${totalReviews}`
    );
  } catch (error) {
    console.error("❌ Error updating guide rating:", error);
    // Don't throw - review should succeed even if guide update fails
  }
}

// ===== GUIDE REVIEW FUNCTIONS =====

// Create guide review (for custom tour)
const createGuideReview = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const {
      customTourRequestId,
      guideId,
      bookingId,
      rating,
      title,
      content,
      detailedRatings,
      images,
      isAnonymous,
      tourDate,
    } = req.body;

    // Validate required fields
    if (!customTourRequestId || !guideId || !bookingId || !rating || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: customTourRequestId, guideId, bookingId, rating, title, content",
      });
    }

    // Kiểm tra booking có thuộc về user và đã completed
    const booking = await Booking.findOne({
      _id: bookingId,
      userId,
      status: "paid",
    });

    console.log("Found booking:", booking ? {
      _id: booking._id,
      userId: booking.userId,
      status: booking.status,
      customTourRequest: booking.customTourRequest
    } : null);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking hợp lệ hoặc booking chưa hoàn thành",
      });
    }

    // Kiểm tra custom tour request có trong booking không
    if (!booking.customTourRequest || 
        booking.customTourRequest.requestId?.toString() !== customTourRequestId?.toString()) {
      return res.status(400).json({
        success: false,
        message: "Custom tour request không có trong booking này",
        debug: {
          requestedId: customTourRequestId,
          bookingRequestId: booking.customTourRequest?.requestId?.toString()
        }
      });
    }

    // Verify guide ID matches
    const tourRequest = await TourCustomRequest.findById(customTourRequestId);
    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tour request",
      });
    }

    if (tourRequest.guideId?.toString() !== guideId?.toString()) {
      return res.status(400).json({
        success: false,
        message: "Guide ID không khớp với tour request",
      });
    }

    // Check if tour date has passed
    const tourDateObj = tourDate ? new Date(tourDate) : new Date(booking.createdAt);
    const now = new Date();

    if (tourDateObj > now) {
      return res.status(400).json({
        success: false,
        message: "Bạn chỉ có thể đánh giá sau khi đã hoàn thành tour",
        tourDate: tourDateObj,
        currentDate: now,
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ 
      userId, 
      customTourRequestId,
      bookingId 
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Bạn đã đánh giá tour này rồi",
      });
    }

    // Create guide review
    const review = await Review.create({
      userId,
      reviewType: 'custom_tour',
      customTourRequestId,
      guideId,
      bookingId,
      rating: parseInt(rating),
      title: title.trim(),
      content: content.trim(),
      detailedRatings,
      images: images || [],
      isAnonymous: isAnonymous || false,
      tourDate: tourDateObj,
      isVerified: true,
      status: "pending",
    });

    console.log("✅ Guide review created successfully:", {
      reviewId: review._id,
      userId,
      guideId,
      customTourRequestId,
      rating: review.rating,
    });

    // Update guide rating
    await updateGuideRating(guideId);

    const populatedReview = await Review.findById(review._id)
      .populate("userId", "name avatar")
      .populate("guideId", "name avatar rating location")
      .populate("customTourRequestId", "requestNumber tourDetails")
      .populate("bookingId", "bookingCode");

    console.log("📤 Sending guide review response:", {
      reviewId: populatedReview._id,
      status: populatedReview.status,
    });

    res.status(201).json({
      success: true,
      review: populatedReview,
      message: "Đánh giá hướng dẫn viên đã được tạo thành công",
    });
  } catch (error) {
    console.error("createGuideReview error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Bạn đã đánh giá guide này rồi",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi tạo đánh giá hướng dẫn viên",
    });
  }
};

// Get guide reviews
const getGuideReviews = async (req, res) => {
  try {
    const { guideId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      rating = null,
    } = req.query;

    if (!mongoose.isValidObjectId(guideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid guide ID",
      });
    }

    const sortOrderNum = sortOrder === "desc" ? -1 : 1;

    const reviews = await Review.getGuideReviews(guideId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrderNum,
      rating: rating ? parseInt(rating) : null,
    });

    // Get rating stats
    const ratingStats = await Review.getGuideAverageRating(guideId);

    const totalReviews = await Review.countDocuments({
      guideId,
      reviewType: 'custom_tour',
      status: "approved",
    });

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalReviews,
        totalPages: Math.ceil(totalReviews / limit),
      },
      ratingStats: ratingStats[0] || null,
    });
  } catch (error) {
    console.error("getGuideReviews error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy đánh giá hướng dẫn viên",
    });
  }
};

// ===== ADMIN FUNCTIONS =====

// 9. Get all reviews (Admin)
const getAllReviews = async (req, res) => {
  try {
    const {
      status = null,
      tourId = null,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (tourId) query.tourId = tourId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const reviews = await Review.find(query)
      .populate("userId", "fullName email avatar")
      .populate("tourId", "title imageItems")
      .populate("bookingId", "orderRef")
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    // Get stats
    const stats = await Review.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      stats,
    });
  } catch (error) {
    console.error("getAllReviews error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách reviews",
    });
  }
};

// 10. Approve review (Admin)
const approveReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
      });
    }

    if (review.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Review đã được duyệt rồi",
      });
    }

    review.status = "approved";
    await review.save();

    // Update tour rating
    await updateTourRating(review.tourId);

    const updatedReview = await Review.findById(reviewId)
      .populate("userId", "fullName email avatar")
      .populate("tourId", "title");

    res.json({
      success: true,
      review: updatedReview,
      message: "Đã duyệt review thành công",
    });
  } catch (error) {
    console.error("approveReview error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi duyệt review",
    });
  }
};

// 11. Reject review (Admin)
const rejectReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
      });
    }

    review.status = "rejected";
    if (reason) {
      review.adminNote = reason.trim();
    }
    await review.save();

    res.json({
      success: true,
      message: "Đã từ chối review",
    });
  } catch (error) {
    console.error("rejectReview error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi từ chối review",
    });
  }
};

// 12. Delete review (Admin)
const adminDeleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
      });
    }

    const tourId = review.tourId;
    await Review.findByIdAndDelete(reviewId);

    // Update tour rating after deletion
    await updateTourRating(tourId);

    res.json({
      success: true,
      message: "Đã xóa review thành công",
    });
  } catch (error) {
    console.error("adminDeleteReview error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi xóa review",
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
  getReviewableBookings,
  // Guide review functions
  createGuideReview,
  getGuideReviews,
  // Admin functions
  getAllReviews,
  approveReview,
  rejectReview,
  adminDeleteReview,
};
