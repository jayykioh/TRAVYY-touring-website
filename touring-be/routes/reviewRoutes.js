// routes/reviewRoutes.js
const express = require("express");
const {
  createReview,
  getTourReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  toggleReviewLike,
  responseToReview,
  getReviewableBookings,
} = require("../controller/reviewController");
const guideReviewController = require("../controller/guideReviewController");
const authJwt = require("../middlewares/authJwt");

const router = express.Router();

// Public routes
router.get("/tour/:tourId", getTourReviews); // Lấy reviews của tour (public)
router.get("/guide/:guideId", guideReviewController.getGuideReviews); // Lấy reviews của guide (public)

// Protected routes (yêu cầu đăng nhập)
router.use(authJwt); // Apply middleware cho tất cả routes bên dưới

// User review management
router.post("/", createReview); // Tạo review cho tour
router.post("/guide", guideReviewController.createGuideReview); // Tạo review cho guide (custom tour)
router.get("/my", (req, res, next) => {
  console.log('📨 GET /api/reviews/my called by user:', req.user?.sub || req.user?._id);
  next();
}, getUserReviews); // Lấy reviews của user hiện tại
router.get("/my-guide-reviews", guideReviewController.getUserGuideReviews); // Lấy guide reviews của user
router.get("/guide/:guideId/reviewable-bookings", guideReviewController.getReviewableGuideBookings); // Lấy bookings có thể review guide
router.get("/reviewable-bookings", getReviewableBookings); // Lấy bookings có thể review

// Review interactions
router.put("/:reviewId", updateReview); // Cập nhật review
router.delete("/:reviewId", deleteReview); // Xóa review
router.post("/:reviewId/like", toggleReviewLike); // Like/unlike review
router.post("/:reviewId/response", responseToReview); // Phản hồi review (tour operator)

// Guide review interactions
router.put("/:reviewId/guide", guideReviewController.updateGuideReview); // Cập nhật guide review
router.delete("/:reviewId/guide", guideReviewController.deleteGuideReview); // Xóa guide review
router.post("/:reviewId/guide/like", guideReviewController.toggleGuideReviewLike); // Like/unlike guide review
router.post("/:reviewId/guide/response", guideReviewController.guideResponseToReview); // Guide phản hồi review

module.exports = router;