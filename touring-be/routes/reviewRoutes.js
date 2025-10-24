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
  getReviewableBookings
} = require("../controller/reviewController");
const authJwt = require("../middlewares/authJwt");

const router = express.Router();

// Public routes
router.get("/tour/:tourId", getTourReviews); // Lấy reviews của tour (public)

// Protected routes (yêu cầu đăng nhập)
router.use(authJwt); // Apply middleware cho tất cả routes bên dưới

// User review management
router.post("/", createReview); // Tạo review mới
router.get("/my", getUserReviews); // Lấy reviews của user hiện tại
router.get("/reviewable-bookings", getReviewableBookings); // Lấy bookings có thể review

// Review interactions
router.put("/:reviewId", updateReview); // Cập nhật review
router.delete("/:reviewId", deleteReview); // Xóa review
router.post("/:reviewId/like", toggleReviewLike); // Like/unlike review
router.post("/:reviewId/response", responseToReview); // Phản hồi review (tour operator)

module.exports = router;