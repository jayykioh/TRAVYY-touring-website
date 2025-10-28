// routes/admin/index.js
const express = require("express");
const router = express.Router();

// Import sub-routes
const authRoutes = require("./auth.routes");
const statsRoutes = require("./stats.routes");
const userRoutes = require("./user.routes");
const agencyRoutes = require("./agency.routes");
const helpRoutes = require("./help.routes");

// Mount routes
router.use("/", authRoutes); // /api/admin/login, /api/admin/logout
router.use("/", statsRoutes); // /api/admin/revenue-stats, /api/admin/dashboard-stats
router.use("/users", userRoutes); // /api/admin/users
router.use("/agencies", agencyRoutes); // /api/admin/agencies
router.use("/help", helpRoutes); // /api/admin/help/feedback

// Future admin routes can be added here:
// const tourRoutes = require("./tours.routes");
// const bookingRoutes = require("./bookings.routes");
// router.use("/tours", tourRoutes);
// router.use("/bookings", bookingRoutes);

module.exports = router;
