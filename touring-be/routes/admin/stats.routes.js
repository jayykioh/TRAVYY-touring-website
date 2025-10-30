// routes/admin/stats.routes.js
const express = require("express");
const router = express.Router();
const authJwt = require("../../middlewares/authJwt");
const {
  getRevenueStats,
  getDashboardStats,
  getCategoryStats,
  getUserMetrics,
  getBookingTrends,
  getToursByRegion,
  getAgeDistribution,
  getTopTravelers,
} = require("../../controller/admin/admin.stats.controller");

/**
 * @route   GET /api/admin/revenue-stats?year=2025
 * @desc    Get monthly revenue statistics
 * @access  Private (Admin only)
 */
router.get("/revenue-stats", authJwt, getRevenueStats);

/**
 * @route   GET /api/admin/dashboard-stats
 * @desc    Get dashboard summary statistics
 * @access  Private (Admin only)
 */
router.get("/dashboard-stats", authJwt, getDashboardStats);

/**
 * @route   GET /api/admin/category-stats
 * @desc    Get tour category distribution for pie chart
 * @access  Private (Admin only)
 */
router.get("/category-stats", authJwt, getCategoryStats);

/**
 * @route   GET /api/admin/user-metrics
 * @desc    Get detailed user metrics for dashboard
 * @access  Private (Admin only)
 */
router.get("/user-metrics", authJwt, getUserMetrics);

/**
 * @route   GET /api/admin/booking-trends
 * @desc    Get booking trends by week (last 6 weeks)
 * @access  Private (Admin only)
 */
router.get("/booking-trends", authJwt, getBookingTrends);

/**
 * @route   GET /api/admin/tours-by-region
 * @desc    Get tours count by region
 * @access  Private (Admin only)
 */
router.get("/tours-by-region", authJwt, getToursByRegion);

/**
 * @route   GET /api/admin/age-distribution
 * @desc    Get customer age distribution (children vs adults)
 * @access  Private (Admin only)
 */
router.get("/age-distribution", authJwt, getAgeDistribution);

/**
 * @route   GET /api/admin/top-travelers
 * @desc    Get top 5 travelers by bookings this month
 * @access  Private (Admin only)
 */
router.get("/top-travelers", authJwt, getTopTravelers);

module.exports = router;
