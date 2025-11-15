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
  getTopPopularTours,
  getRecentReviews,
  getAvailableGuides,
  getRefundStats,
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

/**
 * @route   GET /api/admin/top-popular-tours
 * @desc    Get top 5 most popular tours by booking count
 * @access  Private (Admin only)
 */
router.get("/top-popular-tours", authJwt, getTopPopularTours);

/**
 * @route   GET /api/admin/recent-reviews
 * @desc    Get 5 most recent reviews that need response
 * @access  Private (Admin only)
 */
router.get("/recent-reviews", authJwt, getRecentReviews);

/**
 * @route   GET /api/admin/available-guides
 * @desc    Get available tour guides (users with role TourGuide)
 * @access  Private (Admin only)
 */
router.get("/available-guides", authJwt, getAvailableGuides);

/**
 * @route   GET /api/admin/refund-stats
 * @desc    Get refund statistics (total, by status)
 * @access  Private (Admin only)
 */
router.get("/refund-stats", authJwt, getRefundStats);

module.exports = router;
