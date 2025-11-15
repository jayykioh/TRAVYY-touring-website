// routes/admin/index.js
const express = require("express");
const router = express.Router();

// Import sub-routes
const authRoutes = require("./auth.routes");
const statsRoutes = require("./stats.routes");
const userRoutes = require("./user.routes");
const agencyRoutes = require("./agency.routes");
const helpRoutes = require("./help.routes");
const refundRoutes = require("./refund.routes");
const reviewController = require("../../controller/reviewController");
const { verifyToken, isAdmin } = require("../../middlewares/authJwt");

// Mount routes
router.use("/", authRoutes); // /api/admin/login, /api/admin/logout
router.use("/", statsRoutes); // /api/admin/revenue-stats, /api/admin/dashboard-stats
router.use("/users", userRoutes); // /api/admin/users
router.use("/agencies", agencyRoutes); // /api/admin/agencies
router.use("/help", helpRoutes); // /api/admin/help/feedback
router.use("/refunds", refundRoutes); // /api/admin/refunds

// Review admin routes (inline)
const reviewRouter = express.Router();
reviewRouter.use(verifyToken, isAdmin);
reviewRouter.get("/", reviewController.getAllReviews); // Get all reviews
reviewRouter.post("/:reviewId/approve", reviewController.approveReview); // Approve review
reviewRouter.post("/:reviewId/reject", reviewController.rejectReview); // Reject review
reviewRouter.delete("/:reviewId", reviewController.adminDeleteReview); // Delete review
router.use("/reviews", reviewRouter); // /api/admin/reviews

// Future admin routes can be added here:
// const tourRoutes = require("./tours.routes");
// const bookingRoutes = require("./bookings.routes");
// router.use("/tours", tourRoutes);
// router.use("/bookings", bookingRoutes);

module.exports = router;
