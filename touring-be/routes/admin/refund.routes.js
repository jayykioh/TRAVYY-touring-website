const express = require("express");
const router = express.Router();
const refundController = require("../../controller/refundController");
const { verifyToken, isAdmin } = require("../../middlewares/authJwt");

/**
 * @route   GET /api/admin/refunds
 * @desc    Get all refund requests with filters
 * @access  Private (Admin)
 */
router.get("/", verifyToken, isAdmin, refundController.getAllRefunds);

/**
 * @route   GET /api/admin/refunds/stats
 * @desc    Get refund statistics
 * @access  Private (Admin)
 */
router.get("/stats", verifyToken, isAdmin, refundController.getRefundStats);

/**
 * @route   POST /api/admin/refunds/:id/review
 * @desc    Review refund request (approve/reject)
 * @access  Private (Admin)
 */
router.post("/:id/review", verifyToken, isAdmin, refundController.reviewRefund);

/**
 * @route   POST /api/admin/refunds/:id/process
 * @desc    Process approved refund payment
 * @access  Private (Admin)
 */
router.post(
  "/:id/process",
  verifyToken,
  isAdmin,
  refundController.processRefund
);

module.exports = router;
