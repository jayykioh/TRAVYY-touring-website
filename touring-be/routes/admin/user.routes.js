// routes/admin/user.routes.js
const express = require("express");
const router = express.Router();
const { verifyAdminToken } = require("../../middlewares/authJwt");
const userController = require("../../controller/admin/admin.user.controller");

// Apply admin auth middleware to all routes
router.use(verifyAdminToken);

// User management
router.get("/", userController.getAllUsers);
router.get("/stats", userController.getUserStats);
router.get("/guides", userController.getTourGuides);
router.get("/:id", userController.getUserById);
router.put("/:id/status", userController.updateUserStatus);

module.exports = router;
