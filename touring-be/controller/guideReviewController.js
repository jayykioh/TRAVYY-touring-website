// controller/guideReviewController.js
const GuideReview = require("../models/guide/GuideReview");
const Booking = require("../models/Bookings");
const Guide = require("../models/guide/Guide");
const User = require("../models/Users");
const mongoose = require("mongoose");

// 1. Tạo review cho guide (sau khi hoàn thành custom tour)
const createGuideReview = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const {
      guideId,
      bookingId,
      tourRequestId,
      rating,
      title,
      content,
      detailedRatings,
      images,
      isAnonymous,
      tourDate,
    } = req.body;

    // Validate required fields
    if (!guideId || !bookingId || !rating || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: guideId, bookingId, rating, title, content",
      });
    }

    // Kiểm tra booking có thuộc về user và đã completed
    const booking = await Booking.findOne({
      _id: bookingId,
      userId,
      status: "paid",
    }).populate('customTourRequest');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking hợp lệ hoặc booking chưa hoàn thành",
      });
    }

    // Kiểm tra guide có trong booking không
    const bookingGuideId = booking.customTourRequest?.guideId;
    if (!bookingGuideId || bookingGuideId.toString() !== guideId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Guide không có trong booking này",
        debug: {
          requestedGuideId: guideId,
          bookingGuideId: bookingGuideId?.toString(),
        }
      });
    }

    // Kiểm tra tour date đã qua chưa
    const tourDateObj = tourDate ? new Date(tourDate) : booking.createdAt;
    const now = new Date();

    if (tourDateObj > now) {
      return res.status(400).json({
        success: false,
        message: "Bạn chỉ có thể đánh giá sau khi đã hoàn thành tour",
        tourDate: tourDateObj,
        currentDate: now,
      });
    }

    // Kiểm tra đã review chưa
    const existingReview = await GuideReview.findOne({ 
      userId, 
      guideId,
      bookingId 
    });
    
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Bạn đã đánh giá guide này cho booking này rồi",
      });
    }

    // Tạo review
    const review = await GuideReview.create({
      userId,
      guideId,
      bookingId,
      tourRequestId: tourRequestId || booking.customTourRequest?._id,
      rating: parseInt(rating),
      title: title.trim(),
      content: content.trim(),
      detailedRatings,
      images: images || [],
      isAnonymous: isAnonymous || false,
      tourDate: tourDateObj,
      isVerified: true, // Auto verify vì đã có booking
      status: "pending", // Chờ admin duyệt
    });

    console.log("✅ Guide review created successfully:", {
      reviewId: review._id,
      userId,
      guideId,
      bookingId,
      rating: review.rating,
    });

    // Update guide rating and review count
    await updateGuideRating(guideId);

    const populatedReview = await GuideReview.findById(review._id)
      .populate("userId", "name avatar")
      .populate("guideId", "name avatar location specialties")
      .populate("bookingId", "bookingCode");

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
        message: "Bạn đã đánh giá guide này cho booking này rồi",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi tạo đánh giá guide",
    });
  }
};

// 2. Lấy reviews của một guide
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

    const reviews = await GuideReview.getGuideReviews(guideId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrderNum,
      rating: rating ? parseInt(rating) : null,
    });

    // Lấy thống kê rating
    const ratingStats = await GuideReview.getAverageRating(guideId);

    const totalReviews = await GuideReview.countDocuments({
      guideId,
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
      message: error.message || "Lỗi khi lấy đánh giá guide",
    });
  }
};

// 3. Lấy reviews của user (cho guide)
const getUserGuideReviews = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await GuideReview.getUserReviews(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    const totalReviews = await GuideReview.countDocuments({ userId });

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
    console.error("getUserGuideReviews error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy đánh giá guide của user",
    });
  }
};

// 4. Cập nhật review guide
const updateGuideReview = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const { reviewId } = req.params;
    const { rating, title, content, detailedRatings, images } = req.body;

    const review = await GuideReview.findById(reviewId);

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
        message: "Bạn không thể sửa đánh giá này (quá thời hạn hoặc đã được duyệt)",
      });
    }

    // Update fields
    if (rating) review.rating = parseInt(rating);
    if (title) review.title = title.trim();
    if (content) review.content = content.trim();
    if (detailedRatings) review.detailedRatings = detailedRatings;
    if (images) review.images = images;

    await review.save();

    // Update guide rating if rating changed
    if (rating) {
      await updateGuideRating(review.guideId);
    }

    const updatedReview = await GuideReview.findById(reviewId)
      .populate("userId", "name avatar")
      .populate("guideId", "name avatar location specialties");

    res.json({
      success: true,
      review: updatedReview,
      message: "Đánh giá đã được cập nhật",
    });
  } catch (error) {
    console.error("updateGuideReview error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật đánh giá",
    });
  }
};

// 5. Xóa review guide
const deleteGuideReview = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const { reviewId } = req.params;

    const review = await GuideReview.findById(reviewId);

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

    await GuideReview.findByIdAndDelete(reviewId);

    // Update guide rating after deletion
    await updateGuideRating(review.guideId);

    res.json({
      success: true,
      message: "Đánh giá đã được xóa",
    });
  } catch (error) {
    console.error("deleteGuideReview error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi xóa đánh giá",
    });
  }
};

// 6. Like/Unlike review
const toggleGuideReviewLike = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const { reviewId } = req.params;

    const review = await GuideReview.findById(reviewId);

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
    console.error("toggleGuideReviewLike error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi like đánh giá",
    });
  }
};

// 7. Guide phản hồi đánh giá
const guideResponseToReview = async (req, res) => {
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

    const review = await GuideReview.findById(reviewId).populate("guideId");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
      });
    }

    // Kiểm tra user có phải là guide được review không
    const guide = await Guide.findOne({ 
      _id: review.guideId._id,
      userId: userId 
    });

    if (!guide) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền phản hồi đánh giá này",
      });
    }

    await review.addResponse(content.trim(), guide._id);

    const updatedReview = await GuideReview.findById(reviewId)
      .populate("userId", "name avatar")
      .populate("guideId", "name avatar")
      .populate("response.respondedBy", "name");

    res.json({
      success: true,
      review: updatedReview,
      message: "Đã phản hồi đánh giá",
    });
  } catch (error) {
    console.error("guideResponseToReview error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi phản hồi đánh giá",
    });
  }
};

// 8. Lấy bookings có thể đánh giá guide
const getReviewableGuideBookings = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;

    // Lấy các booking custom tour đã hoàn thành
    const bookings = await Booking.find({
      userId,
      status: "paid",
      'customTourRequest': { $exists: true, $ne: null }
    })
    .populate('customTourRequest')
    .populate({
      path: 'customTourRequest',
      populate: {
        path: 'guideId',
        model: 'Guide',
        select: 'name avatar location specialties'
      }
    });

    // Lấy danh sách guideId + bookingId đã review
    const reviewedCombinations = await GuideReview.find({ userId })
      .select('guideId bookingId')
      .lean();

    const reviewedSet = new Set(
      reviewedCombinations.map(r => `${r.guideId}_${r.bookingId}`)
    );

    const now = new Date();

    // Lọc ra bookings chưa review
    const reviewableBookings = bookings
      .filter((booking) => {
        if (!booking.customTourRequest?.guideId) return false;
        
        const guideId = booking.customTourRequest.guideId._id || booking.customTourRequest.guideId;
        const combinationKey = `${guideId}_${booking._id}`;
        
        // Kiểm tra chưa review
        const notReviewedYet = !reviewedSet.has(combinationKey);
        
        // Kiểm tra tour date đã qua
        const hasTourPassed = booking.createdAt <= now;

        return notReviewedYet && hasTourPassed;
      })
      .map(booking => ({
        _id: booking._id,
        bookingCode: booking.bookingCode,
        totalPrice: booking.totalPrice,
        createdAt: booking.createdAt,
        guide: booking.customTourRequest?.guideId,
        tourRequest: {
          _id: booking.customTourRequest?._id,
          requestNumber: booking.customTourRequest?.requestNumber,
          tourDetails: booking.customTourRequest?.tourDetails
        }
      }));

    res.json({
      success: true,
      bookings: reviewableBookings,
      total: reviewableBookings.length,
    });
  } catch (error) {
    console.error("getReviewableGuideBookings error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách booking có thể đánh giá guide",
    });
  }
};

/**
 * Helper: Update guide rating and review count
 * Calculate average rating from all approved reviews
 */
async function updateGuideRating(guideId) {
  try {
    const reviews = await GuideReview.find({
      guideId,
      status: "approved",
    }).select("rating");

    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      // No reviews - reset to default
      await Guide.findByIdAndUpdate(guideId, {
        rating: 0,
        totalTours: 0, // Keep existing totalTours or reset based on your needs
      });
      console.log(`✅ Reset rating for guide ${guideId} (no reviews)`);
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / totalReviews) * 10) / 10; // Round to 1 decimal

    await Guide.findByIdAndUpdate(guideId, {
      rating: averageRating,
      totalTours: totalReviews, // Use review count as totalTours
    });

    console.log(
      `✅ Updated guide ${guideId}: rating=${averageRating}, reviews=${totalReviews}`
    );
  } catch (error) {
    console.error("❌ Error updating guide rating:", error);
    // Don't throw - review should succeed even if guide update fails
  }
}

// ===== ADMIN FUNCTIONS =====

// 9. Get all guide reviews (Admin)
const getAllGuideReviews = async (req, res) => {
  try {
    const {
      status = null,
      guideId = null,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (guideId) query.guideId = guideId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const reviews = await GuideReview.find(query)
      .populate("userId", "name email avatar")
      .populate("guideId", "name avatar location specialties")
      .populate("bookingId", "bookingCode")
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await GuideReview.countDocuments(query);

    // Get stats
    const stats = await GuideReview.aggregate([
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
    console.error("getAllGuideReviews error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách guide reviews",
    });
  }
};

// 10. Approve guide review (Admin)
const approveGuideReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await GuideReview.findById(reviewId);

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

    // Update guide rating
    await updateGuideRating(review.guideId);

    const updatedReview = await GuideReview.findById(reviewId)
      .populate("userId", "name email avatar")
      .populate("guideId", "name avatar");

    res.json({
      success: true,
      review: updatedReview,
      message: "Đã duyệt review guide thành công",
    });
  } catch (error) {
    console.error("approveGuideReview error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi duyệt review guide",
    });
  }
};

// 11. Reject guide review (Admin)
const rejectGuideReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await GuideReview.findById(reviewId);

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
      message: "Đã từ chối review guide",
    });
  } catch (error) {
    console.error("rejectGuideReview error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi từ chối review guide",
    });
  }
};

// 12. Delete guide review (Admin)
const adminDeleteGuideReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await GuideReview.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
      });
    }

    const guideId = review.guideId;
    await GuideReview.findByIdAndDelete(reviewId);

    // Update guide rating after deletion
    await updateGuideRating(guideId);

    res.json({
      success: true,
      message: "Đã xóa review guide thành công",
    });
  } catch (error) {
    console.error("adminDeleteGuideReview error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi xóa review guide",
    });
  }
};

module.exports = {
  createGuideReview,
  getGuideReviews,
  getUserGuideReviews,
  updateGuideReview,
  deleteGuideReview,
  toggleGuideReviewLike,
  guideResponseToReview,
  getReviewableGuideBookings,
  // Admin functions
  getAllGuideReviews,
  approveGuideReview,
  rejectGuideReview,
  adminDeleteGuideReview,
};
