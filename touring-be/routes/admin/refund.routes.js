const express = require("express");
const router = express.Router();
const refundController = require("../../controller/refundController");
const { verifyToken, isAdmin } = require("../../middlewares/authJwt");

// Apply admin middleware to all routes
router.use(verifyToken, isAdmin);

// GET routes
router.get("/", refundController.getAllRefunds);
router.get("/stats", refundController.getRefundStats);

// POST routes - Review & Process
router.post("/:id/review", refundController.reviewRefund);
router.post("/:id/process", refundController.processRefund);

// POST routes - Manual Payment (MoMo)
router.post(
  "/:refundId/create-manual-payment",
  refundController.createManualRefundPayment
);
router.post(
  "/:refundId/check-payment",
  refundController.checkAndCompleteManualPayment
);

module.exports = router;
