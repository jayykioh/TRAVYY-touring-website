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

// Get refunds
router.get("/my-refunds", refundController.getUserRefunds); // Get user's refund list
router.get("/:id", refundController.getRefundDetails); // Get single refund details

// Manage refunds
router.post("/:id/cancel", refundController.cancelRefundRequest); // Cancel refund request
router.post("/:id/bank-info", refundController.submitBankInfo); // Submit bank info for approved refund

module.exports = router;
