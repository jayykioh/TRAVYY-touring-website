// controller/admin/admin.user.controller.js
const User = require("../../models/Users");
const Bookings = require("../../models/Bookings");
const TravelAgency = require("../../models/agency/TravelAgency");

/**
 * Get all users with filters
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;

    let filter = {};

    // Filter by role
    if (role && role !== "all") {
      filter.role = role;
    }

    // Filter by account status
    if (status && status !== "all") {
      filter.accountStatus = status;
    }

    // Search by name, email, phone
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password -twoFactorSecret")
      .sort({ createdAt: -1 });

    // Get booking stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const bookingStats = await Bookings.aggregate([
          { $match: { userId: user._id } },
          {
            $group: {
              _id: null,
              totalBookings: { $sum: 1 },
              totalSpent: { $sum: "$totalVND" }, // ✅ Sử dụng totalVND từ Bookings
              paidBookings: {
                $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] },
              },
              pendingBookings: {
                $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
              },
              cancelledBookings: {
                $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
              },
            },
          },
        ]);

        const stats = bookingStats[0] || {
          totalBookings: 0,
          totalSpent: 0,
          paidBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
        };

        return {
          ...user.toObject(),
          stats,
        };
      })
    );

    res.json({
      success: true,
      data: usersWithStats,
    });
  } catch (error) {
    console.error("❌ Get all users error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get user by ID with detailed info
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password -twoFactorSecret");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's bookings count and total spent
    const bookingStats = await Bookings.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: "$totalVND" }, // ✅ Sử dụng totalVND
          paidBookings: {
            $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] },
          },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
    ]);

    const stats = bookingStats[0] || {
      totalBookings: 0,
      totalSpent: 0,
      paidBookings: 0,
      pendingBookings: 0,
      cancelledBookings: 0,
    };

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        stats,
      },
    });
  } catch (error) {
    console.error("❌ Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all tour guides from TravelAgency employees
 * Tour guides are stored in TravelAgency.employees array
 * Each employee will have a corresponding User account (created later)
 */
exports.getTourGuides = async (req, res) => {
  try {
    const { status, search } = req.query;

    // Get all travel agencies with their employees
    const agencies = await TravelAgency.find({})
      .select("name employees")
      .lean();

    // Extract all employees from all agencies
    let allGuides = [];

    agencies.forEach((agency) => {
      if (agency.employees && agency.employees.length > 0) {
        const guidesFromAgency = agency.employees.map((employee) => ({
          // Employee info from TravelAgency
          _id: employee.employeeId || `temp-${agency._id}-${employee.name}`, // Temporary ID until User account created
          name: employee.name,
          email: employee.email || "",
          phone: employee.phone || "",
          avatar: employee.avatarUrl ? { url: employee.avatarUrl } : null,
          role: "TourGuide",

          // Location info
          location: {
            city: agency.name, // Use agency name as location for now
            province: "",
            country: "Vietnam",
          },

          // Agency info
          agencyId: agency._id,
          agencyName: agency.name,

          // Employee-specific data
          rating: employee.rating || 0,
          experienceYears: employee.experienceYears || 0,
          languages: employee.languages || ["Tiếng Việt"],
          specializations: employee.specializations || [],

          // Stats from employee
          stats: {
            totalTours: employee.stats?.tours || 0,
            completedTours: employee.stats?.completed || 0,
            totalRevenue: employee.stats?.revenue || 0,
          },

          // Status
          accountStatus: employee.status === "suspended" ? "banned" : "active",
          employeeStatus: employee.status || "active",

          // Timestamps
          createdAt: agency.createdAt,
          updatedAt: agency.updatedAt,
          lastLogin: null, // Will be updated when User account is created
        }));

        allGuides.push(...guidesFromAgency);
      }
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      allGuides = allGuides.filter(
        (guide) =>
          guide.name.toLowerCase().includes(searchLower) ||
          (guide.email && guide.email.toLowerCase().includes(searchLower)) ||
          (guide.agencyName &&
            guide.agencyName.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (status && status !== "all") {
      if (status === "active") {
        allGuides = allGuides.filter((g) => g.employeeStatus === "active");
      } else if (status === "inactive") {
        allGuides = allGuides.filter((g) => g.employeeStatus === "inactive");
      } else if (status === "suspended") {
        allGuides = allGuides.filter((g) => g.employeeStatus === "suspended");
      }
    }

    res.json({
      success: true,
      data: allGuides,
      count: allGuides.length,
      message: "Tour guides fetched from TravelAgency employees",
    });
  } catch (error) {
    console.error("❌ Get tour guides error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update user status (ban/unban)
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user status
    // Handle lock/unlock history
    const prevStatus = user.accountStatus;

    user.accountStatus = status;
    user.statusReason = reason;
    user.statusUpdatedAt = new Date();
    user.statusUpdatedBy = req.userId;

    // If banning/locking -> append a new lock entry
    if (status === "banned" && prevStatus !== "banned") {
      user.lockHistory = user.lockHistory || [];
      user.lockHistory.push({
        reason: reason || "",
        lockedAt: new Date(),
        lockedBy: req.userId,
      });
    }

    // If activating/unlocking -> mark the most recent lock entry as unlocked
    if (status === "active" && prevStatus === "banned") {
      if (user.lockHistory && user.lockHistory.length > 0) {
        // find last lock entry without unlockedAt
        for (let i = user.lockHistory.length - 1; i >= 0; i--) {
          const entry = user.lockHistory[i];
          if (!entry.unlockedAt) {
            entry.unlockedAt = new Date();
            entry.unlockedBy = req.userId;
            break;
          }
        }
      }
    }

    await user.save();

    res.json({
      success: true,
      message: `User ${
        status === "banned" ? "banned" : "activated"
      } successfully`,
      data: user,
    });
  } catch (error) {
    console.error("❌ Update user status error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get user statistics
 */
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const travelers = await User.countDocuments({ role: "Traveler" });
    const guides = await User.countDocuments({ role: "TourGuide" });
    const agencies = await User.countDocuments({ role: "TravelAgency" });

    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo },
    });

    // New users this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: firstDayOfMonth },
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        travelers,
        guides,
        agencies,
        activeUsers,
        newUsersThisMonth,
      },
    });
  } catch (error) {
    console.error("❌ Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get user bookings
 */
exports.getUserBookings = async (req, res) => {
  try {
    const { id } = req.params;

    const bookings = await Bookings.find({ userId: id })
      .populate("items.tourId", "title images location")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("❌ Get user bookings error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete user account
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Soft delete by setting account status to deleted
    // Or hard delete if needed
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete user error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
