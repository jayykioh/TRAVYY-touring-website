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
router.get("/guides/:id", userController.getGuideDetail);
router.put("/guides/:id/status", userController.updateGuideStatus);
router.get("/:id", userController.getUserById);
router.get("/:id/bookings", userController.getUserBookings);
router.put("/:id/status", userController.updateUserStatus);
router.delete("/:id", userController.deleteUser);

module.exports = router;
