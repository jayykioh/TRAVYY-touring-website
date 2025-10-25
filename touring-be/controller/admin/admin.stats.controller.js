// controller/admin/admin.stats.controller.js
const Booking = require("../../models/Bookings");
const Tour = require("../../models/agency/Tours");
const User = require("../../models/Users");

/**
 * Get Revenue Statistics by Month
 * GET /api/admin/revenue-stats?year=2025
 */
exports.getRevenueStats = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    // Exchange rate fallback (VND per 1 USD). Can be configured via env.
    const USD_TO_VND = parseInt(process.env.USD_TO_VND, 10) || 24000;

    // Aggregate revenue by month.
    // - Accept bookings where payment info may be stored under different fields
    // - If totalVND missing, fallback to totalUSD * USD_TO_VND
    const revenueData = await Booking.aggregate([
      {
        $match: {
          $and: [
            {
              createdAt: {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`),
              },
            },
            {
              $or: [
                { status: "paid" },
                {
                  "payment.status": {
                    $in: ["paid", "Paid", "PAID", "COMPLETED", "Completed"],
                  },
                },
                { "payment.raw.status": { $in: ["paid", "Paid", "PAID"] } },
              ],
            },
          ],
        },
      },
      // Compute amount in VND per document, falling back from totalVND -> totalUSD*rate -> 0
      {
        $project: {
          amountVND: {
            $ifNull: [
              "$totalVND",
              { $multiply: [{ $ifNull: ["$totalUSD", 0] }, USD_TO_VND] },
            ],
          },
          createdAt: 1,
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$amountVND" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Map to month names
    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];

    // CHỈ trả về các tháng có data thực tế
    const monthlyRevenue = revenueData.map((item) => {
      const revenue = item.revenue / 1000000; // Convert to triệu đồng
      const profit = revenue * 0.15; // Giả sử lợi nhuận 15%

      return {
        month: monthNames[item._id - 1],
        revenue: Math.round(revenue * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        bookings: item.count,
      };
    });

    return res.json({
      success: true,
      data: monthlyRevenue,
      year: parseInt(year),
      totalMonths: monthlyRevenue.length,
    });
  } catch (err) {
    console.error("GET_REVENUE_STATS_ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get Dashboard Summary Stats
 * GET /api/admin/dashboard-stats
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Parallel queries for better performance
    const [totalUsers, totalTours, totalBookings, recentBookings] =
      await Promise.all([
        User.countDocuments({ role: { $ne: "Admin" } }),
        Tour.countDocuments(),
        Booking.countDocuments({ status: "paid" }),
        Booking.find({ status: "paid" })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("userId", "name email")
          .lean(),
      ]);

    // Calculate total revenue
    const revenueResult = await Booking.aggregate([
      {
        $match: {
          $or: [
            { status: "paid" },
            {
              "payment.status": { $in: ["paid", "Paid", "PAID", "COMPLETED"] },
            },
          ],
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $ifNull: [
                "$totalVND",
                { $multiply: [{ $ifNull: ["$totalUSD", 0] }, 24000] },
              ],
            },
          },
        },
      },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalTours,
        totalBookings,
        totalRevenue: Math.round(totalRevenue),
        recentBookings,
      },
    });
  } catch (err) {
    console.error("GET_DASHBOARD_STATS_ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get Tour Category Distribution (Pie Chart Data)
 * GET /api/admin/category-stats
 */
exports.getCategoryStats = async (req, res) => {
  try {
    // Aggregate tours by tags
    const categoryData = await Tour.aggregate([
      {
        $unwind: "$tags", // Tách mảng tags thành documents riêng
      },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Calculate total for percentage
    const total = categoryData.reduce((sum, item) => sum + item.count, 0);

    // Map colors for categories
    const colorMap = {
      Nature: "#10B981", // green
      Relaxation: "#3B82F6", // blue
      Culture: "#F59E0B", // cyan
      Adventure: "#EF4444", // red
      City: "#06B6D4", // purple
      History: "#6366F1", // indigo
    };

    // Format data for pie chart
    const formattedData = categoryData.map((item) => ({
      name: item._id,
      value: Math.round((item.count / total) * 100), // Percentage
      count: item.count,
      color: colorMap[item._id] || "#94A3B8", // Default gray if not mapped
    }));

    return res.json({
      success: true,
      data: formattedData,
      total,
    });
  } catch (err) {
    console.error("GET_CATEGORY_STATS_ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get Booking Trends by Week
 * GET /api/admin/booking-trends
 */
exports.getBookingTrends = async (req, res) => {
  try {
    const now = new Date();
    const sixWeeksAgo = new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000);

    const bookingData = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixWeeksAgo },
          status: { $in: ["paid", "confirmed"] },
        },
      },
      {
        $project: {
          week: { $week: "$createdAt" },
          year: { $year: "$createdAt" },
        },
      },
      {
        $group: {
          _id: { week: "$week", year: "$year" },
          bookings: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.week": 1 },
      },
    ]);

    const weeklyData = bookingData.map((item, index) => ({
      week: `W${index + 1}`,
      bookings: item.bookings,
    }));

    return res.json({
      success: true,
      data: weeklyData,
    });
  } catch (err) {
    console.error("GET_BOOKING_TRENDS_ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get Tours by Region (Bắc - Trung - Nam)
 * GET /api/admin/tours-by-region
 */
exports.getToursByRegion = async (req, res) => {
  try {
    // Populate locations để lấy region
    const tours = await Tour.find()
      .populate({
        path: "locations",
        select: "region name",
      })
      .lean();

    // Count tours by region
    const regionCounts = {
      Bắc: 0,
      Trung: 0,
      Nam: 0,
    };

    tours.forEach((tour) => {
      if (tour.locations && tour.locations.length > 0) {
        // Lấy region từ location đầu tiên
        const location = Array.isArray(tour.locations)
          ? tour.locations[0]
          : tour.locations;

        const region = location?.region || "";

        // Map region names
        if (region.includes("Bắc") || region.toLowerCase().includes("north")) {
          regionCounts["Bắc"]++;
        } else if (
          region.includes("Trung") ||
          region.toLowerCase().includes("central")
        ) {
          regionCounts["Trung"]++;
        } else if (
          region.includes("Nam") ||
          region.toLowerCase().includes("south")
        ) {
          regionCounts["Nam"]++;
        }
      }
    });

    // Format response
    const formattedData = Object.entries(regionCounts).map(
      ([region, tours]) => ({
        region,
        tours,
      })
    );

    return res.json({
      success: true,
      data: formattedData,
    });
  } catch (err) {
    console.error("GET_TOURS_BY_REGION_ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get Customer Age Distribution (Children vs Adults)
 * GET /api/admin/age-distribution
 */
exports.getAgeDistribution = async (req, res) => {
  try {
    // Lấy data từ bookings - sử dụng items[].adults và items[].children
    const bookingData = await Booking.aggregate([
      {
        $match: {
          status: { $in: ["paid", "confirmed"] },
        },
      },
      {
        $unwind: "$items", // Tách items array thành documents riêng
      },
      {
        $group: {
          _id: null,
          totalAdults: { $sum: { $ifNull: ["$items.adults", 0] } },
          totalChildren: { $sum: { $ifNull: ["$items.children", 0] } },
        },
      },
    ]);

    if (!bookingData || bookingData.length === 0) {
      // Trả về data mặc định nếu chưa có bookings
      return res.json({
        success: true,
        data: [
          {
            name: "Người lớn",
            value: 0,
            percentage: 0,
            description: "Khách người lớn",
          },
          {
            name: "Trẻ em",
            value: 0,
            percentage: 0,
            description: "Khách trẻ em",
          },
        ],
        total: 0,
      });
    }

    const { totalAdults, totalChildren } = bookingData[0];
    const total = totalAdults + totalChildren;

    const formattedData = [
      {
        name: "Người lớn",
        value: totalAdults,
        percentage: total > 0 ? Math.round((totalAdults / total) * 100) : 0,
        description: "Khách người lớn",
      },
      {
        name: "Trẻ em",
        value: totalChildren,
        percentage: total > 0 ? Math.round((totalChildren / total) * 100) : 0,
        description: "Khách trẻ em",
      },
    ];

    return res.json({
      success: true,
      data: formattedData,
      total,
    });
  } catch (err) {
    console.error("GET_AGE_DISTRIBUTION_ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get Top Travelers by Bookings This Month
 * GET /api/admin/top-travelers
 */
exports.getTopTravelers = async (req, res) => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const topTravelers = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: thisMonthStart },
          status: { $in: ["paid", "confirmed"] },
        },
      },
      {
        $group: {
          _id: "$userId",
          bookings: { $sum: 1 },
          totalSpent: {
            $sum: {
              $ifNull: [
                "$totalVND",
                { $multiply: [{ $ifNull: ["$totalUSD", 0] }, 24000] },
              ],
            },
          },
        },
      },
      {
        $sort: { bookings: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          name: "$user.name",
          email: "$user.email",
          bookings: 1,
          totalSpent: 1,
          avatar: "$user.avatar",
        },
      },
    ]);

    return res.json({
      success: true,
      data: topTravelers,
    });
  } catch (err) {
    console.error("GET_TOP_TRAVELERS_ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get Detailed User Metrics
 * GET /api/admin/user-metrics
 */
exports.getUserMetrics = async (req, res) => {
  try {
    // Get date ranges
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Total travelers (non-Admin users)
    const totalUsers = await User.countDocuments({
      role: { $in: ["Traveler", "TourGuide", "TravelAgency"] },
    });

    // 2. New travelers this month
    const newUsersThisMonth = await User.countDocuments({
      role: { $in: ["Traveler", "TourGuide", "TravelAgency"] },
      createdAt: { $gte: thisMonthStart },
    });

    // Previous month for comparison
    const newUsersLastMonth = await User.countDocuments({
      role: { $in: ["Traveler", "TourGuide", "TravelAgency"] },
      createdAt: { $gte: lastMonth, $lt: thisMonthStart },
    });

    // 3. Users who have booked at least 1 tour
    const usersWithBookings = await Booking.distinct("userId", {
      status: "paid",
    });
    const usersWithBookingsCount = usersWithBookings.length;

    // Previous month
    const usersWithBookingsLastMonth = await Booking.distinct("userId", {
      status: "paid",
      createdAt: { $gte: lastMonth, $lt: thisMonthStart },
    });

    // 4. Retention rate (users with multiple bookings / total users with bookings)
    const repeatCustomers = await Booking.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: "$userId", bookingCount: { $sum: 1 } } },
      { $match: { bookingCount: { $gt: 1 } } },
      { $count: "total" },
    ]);
    const repeatCustomersCount = repeatCustomers[0]?.total || 0;
    const retentionRate =
      usersWithBookingsCount > 0
        ? ((repeatCustomersCount / usersWithBookingsCount) * 100).toFixed(1)
        : 0;

    // Previous month retention
    const repeatCustomersLastMonth = await Booking.aggregate([
      {
        $match: {
          status: "paid",
          createdAt: { $gte: lastMonth, $lt: thisMonthStart },
        },
      },
      { $group: { _id: "$userId", bookingCount: { $sum: 1 } } },
      { $match: { bookingCount: { $gt: 1 } } },
      { $count: "total" },
    ]);
    const prevRetentionRate =
      usersWithBookingsLastMonth.length > 0
        ? (
            ((repeatCustomersLastMonth[0]?.total || 0) /
              usersWithBookingsLastMonth.length) *
            100
          ).toFixed(1)
        : 0;

    // 5. Average reviews per user (NOTE: Chưa có Review model, dùng placeholder)
    // TODO: Implement when Review model is created
    const avgReviewsPerUser = "4.2"; // Placeholder

    // 6. Blocked/banned users
    const blockedUsers = await User.countDocuments({
      status: "blocked", // NOTE: Cần thêm field 'status' vào User model nếu chưa có
    });

    // Calculate percentage changes
    const newUsersChange =
      newUsersLastMonth > 0
        ? (
            ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) *
            100
          ).toFixed(1)
        : 0;

    const usersWithBookingsChange =
      usersWithBookingsLastMonth.length > 0
        ? (
            ((usersWithBookingsCount - usersWithBookingsLastMonth.length) /
              usersWithBookingsLastMonth.length) *
            100
          ).toFixed(1)
        : 0;

    const retentionChange =
      prevRetentionRate > 0
        ? (
            ((retentionRate - prevRetentionRate) / prevRetentionRate) *
            100
          ).toFixed(1)
        : 0;

    const conversionRate =
      totalUsers > 0
        ? ((usersWithBookingsCount / totalUsers) * 100).toFixed(1)
        : 0;

    return res.json({
      success: true,
      data: {
        totalUsers: {
          value: totalUsers,
          change: "+8.2%", // NOTE: Cần thêm logic so sánh với tháng trước
          trend: "up",
        },
        newUsersThisMonth: {
          value: newUsersThisMonth,
          change: `${newUsersChange >= 0 ? "+" : ""}${newUsersChange}%`,
          trend: newUsersChange >= 0 ? "up" : "down",
          previousValue: newUsersLastMonth,
        },
        usersWithBookings: {
          value: usersWithBookingsCount,
          change: `${
            usersWithBookingsChange >= 0 ? "+" : ""
          }${usersWithBookingsChange}%`,
          trend: usersWithBookingsChange >= 0 ? "up" : "down",
          percentage: conversionRate + "%",
          previousValue: usersWithBookingsLastMonth.length,
        },
        retentionRate: {
          value: retentionRate + "%",
          change: `${retentionChange >= 0 ? "+" : ""}${retentionChange}%`,
          trend: retentionChange >= 0 ? "up" : "down",
          previousValue: prevRetentionRate + "%",
        },
        avgReviewsPerUser: {
          value: avgReviewsPerUser,
          change: "+0.3",
          trend: "up",
          rating: "★★★★☆",
          // NOTE: Chưa có Review model, dùng placeholder
        },
        blockedUsers: {
          value: blockedUsers,
          change: "-18.2%",
          trend: "down",
          // NOTE: Cần thêm field 'status' vào User model
        },
      },
    });
  } catch (err) {
    console.error("GET_USER_METRICS_ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
