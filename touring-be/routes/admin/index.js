// routes/admin/index.js
const express = require("express");
const router = express.Router();

// Import sub-routes
const authRoutes = require("./auth.routes");
const statsRoutes = require("./stats.routes");

// Mount routes
router.use("/", authRoutes); // /api/admin/login, /api/admin/logout
router.use("/", statsRoutes); // /api/admin/revenue-stats, /api/admin/dashboard-stats

// Future admin routes can be added here:
// const tourRoutes = require("./tours.routes");
// const bookingRoutes = require("./bookings.routes");
// const userRoutes = require("./users.routes");
// router.use("/tours", tourRoutes);
// router.use("/bookings", bookingRoutes);
// router.use("/users", userRoutes);

module.exports = router;
