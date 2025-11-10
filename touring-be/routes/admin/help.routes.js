// routes/admin/help.routes.js
const express = require("express");
const router = express.Router();
const { verifyAdminToken } = require("../../middlewares/authJwt");
const helpController = require("../../controller/helpController");

/**
 * Admin Help/Feedback Routes
 * Base: /api/admin/help
 * All routes protected by verifyAdminToken middleware
 */

// Apply admin auth middleware to all routes
router.use(verifyAdminToken);

// GET /api/admin/help/feedback - Get all feedback
router.get("/feedback", helpController.getAllFeedback);

// GET /api/admin/help/feedback/:id - Get single feedback
router.get("/feedback/:id", helpController.getFeedbackById);

// PUT /api/admin/help/feedback/:id/status - Update feedback status
router.put("/feedback/:id/status", helpController.updateFeedbackStatus);

module.exports = router;
