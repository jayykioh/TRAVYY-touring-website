const express = require("express");
const router = express.Router();
const refundController = require("../controller/refundController");
const { verifyToken } = require("../middlewares/authJwt");

// ===== USER ROUTES =====

/**
 * @route   POST /api/refunds/pre-trip
 * @desc    Request pre-trip cancellation refund
 * @access  Private (User)
 */
router.post("/pre-trip", verifyToken, refundController.requestPreTripRefund);

/**
 * @route   POST /api/refunds/post-trip
 * @desc    Request post-trip issue refund
 * @access  Private (User)
 */
router.post("/post-trip", verifyToken, refundController.requestPostTripRefund);

/**
 * @route   GET /api/refunds/my-refunds
 * @desc    Get user's refund requests
 * @access  Private (User)
 */
router.get("/my-refunds", verifyToken, refundController.getUserRefunds);

/**
 * @route   GET /api/refunds/:id
 * @desc    Get single refund details
 * @access  Private (User/Admin)
 */
router.get("/:id", verifyToken, refundController.getRefundDetails);

/**
 * @route   POST /api/refunds/:id/cancel
 * @desc    Cancel refund request (by user)
 * @access  Private (User)
 */
router.post("/:id/cancel", verifyToken, refundController.cancelRefundRequest);

/**
 * @route   POST /api/refunds/:id/bank-info
 * @desc    Submit bank account information for approved refund
 * @access  Private (User)
 */
router.post("/:id/bank-info", verifyToken, refundController.submitBankInfo);

module.exports = router;
