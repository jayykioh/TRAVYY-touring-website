const express = require("express");
const router = express.Router();
const refundController = require("../controller/refundController");
const { verifyToken } = require("../middlewares/authJwt");

// ===== PUBLIC ROUTES =====
router.post("/momo-refund-ipn", refundController.handleMoMoRefundIPN); // MoMo IPN callback

// ===== USER ROUTES (Protected - require authentication) =====
router.use(verifyToken);

// Request refunds
router.post("/pre-trip", refundController.requestPreTripRefund); // Request pre-trip cancellation refund
router.post("/post-trip", refundController.requestPostTripRefund); // Request post-trip issue refund

// Custom tour refund requests
router.post(
  "/custom-tour/pre-trip",
  refundController.requestCustomTourPreTripRefund
); // Request pre-trip cancellation refund for custom tour
router.post(
  "/custom-tour/post-trip",
  refundController.requestCustomTourPostTripRefund
); // Request post-trip issue refund for custom tour

// Get refunds
router.get("/my-refunds", refundController.getUserRefunds); // Get user's refund list
router.get("/custom-tour/my-refunds", refundController.getMyCustomTourRefunds); // Get user's custom tour refunds
router.get("/:id", refundController.getRefundDetails); // Get single refund details

// Manage refunds
router.post("/:id/cancel", refundController.cancelRefundRequest); // Cancel refund request
router.post("/:id/bank-info", refundController.submitBankInfo); // Submit bank info for approved refund

module.exports = router;
