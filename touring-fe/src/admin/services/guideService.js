// admin/services/guideService.js
const API_URL = "http://localhost:4000/api";

// Helper to get auth token
const getAuthToken = () => {
  return sessionStorage.getItem("admin_token");
};

// Helper to make authenticated requests
const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired, redirect to login
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_user");
    window.location.href = "/admin/login";
    throw new Error("Authentication failed");
  }

  return response;
};

/**
 * Get all tour guides with stats
 */
export const getTourGuides = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.status && filters.status !== "all") {
      params.append("status", filters.status);
    }

    const queryString = params.toString();
    const url = `${API_URL}/admin/users/guides${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetchWithAuth(url);
    const data = await response.json();

    return {
      success: true,
      data: data.data || [],
    };
  } catch (error) {
    console.error("❌ Get tour guides error:", error);
    return {
      success: false,
      error: error.message || "Không thể tải dữ liệu",
      data: [],
    };
  }
};

/**
 * Get single guide by ID
 */
export const getGuideById = async (guideId) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/users/${guideId}`);
    const data = await response.json();

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("❌ Get guide error:", error);
    return {
      success: false,
      error: error.message || "Không thể tải dữ liệu",
    };
  }
};

/**
 * Update guide status (verify/suspend/activate)
 */
export const updateGuideStatus = async (guideId, status, reason = "") => {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/users/${guideId}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ status, reason }),
      }
    );
    const data = await response.json();

    return {
      success: true,
      data: data.data,
      message: data.message || "Cập nhật thành công",
    };
  } catch (error) {
    console.error("❌ Update guide status error:", error);
    return {
      success: false,
      error: error.message || "Cập nhật thất bại",
    };
  }
};

/**
 * Transform backend user to frontend guide format
 */
export const transformUserToGuide = (user) => {
  if (!user) return null;

  const stats = user.stats || {};

  // Format location from object to string
  let locationStr = "N/A";
  if (user.location) {
    if (typeof user.location === "string") {
      locationStr = user.location;
    } else if (typeof user.location === "object") {
      const parts = [];
      if (user.location.city) parts.push(user.location.city);
      if (user.location.province) parts.push(user.location.province);
      if (user.location.country) parts.push(user.location.country);
      locationStr = parts.length > 0 ? parts.join(", ") : "N/A";
    }
  }

  return {
    id: user._id,
    name: user.name || "N/A",
    email: user.email || "",
    phone: user.phone || "",
    avatar: user.avatar?.data
      ? `data:${user.avatar.contentType};base64,${user.avatar.data.toString(
          "base64"
        )}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.name || "User"
        )}&background=007980&color=fff`,
    location: locationStr,
    agencyName: user.agencyName || "Độc lập",
    rating: 4.5, // TODO: Calculate from reviews
    totalReviews: 0, // TODO: Get from reviews
    totalTours: stats.totalTours || 0,
    completedTours: stats.completedTours || 0,
    revenue: stats.totalRevenue || 0,
    languages: user.languages || ["Vietnamese", "English"],
    specialties: user.specialties || ["Cultural Tours", "Adventure"],
    experience: user.experienceYears ? `${user.experienceYears} năm` : "5 năm",
    verificationStatus:
      user.accountStatus === "banned" ? "suspended" : "verified",
    activityStatus:
      user.lastLogin &&
      new Date(user.lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ? "active"
        : "inactive",
    joinDate: user.createdAt,
    lastActive: user.lastLogin || user.updatedAt,
    accountStatus: user.accountStatus,
    statusReason: user.statusReason,
  };
};

/**
 * Calculate guide statistics
 */
export const calculateGuideStats = (guides) => {
  const stats = {
    total: guides.length,
    verified: 0,
    pending: 0,
    suspended: 0,
    active: 0,
    totalRevenue: 0,
    totalTours: 0,
    averageRating: 0,
  };

  let totalRating = 0;
  let ratingCount = 0;

  guides.forEach((guide) => {
    // Count by verification status
    if (guide.verificationStatus === "verified") stats.verified++;
    else if (guide.verificationStatus === "pending") stats.pending++;
    else if (guide.verificationStatus === "suspended") stats.suspended++;

    // Count active
    if (guide.activityStatus === "active") stats.active++;

    // Sum revenue and tours
    stats.totalRevenue += guide.revenue || 0;
    stats.totalTours += guide.totalTours || 0;

    // Average rating
    if (guide.rating) {
      totalRating += guide.rating;
      ratingCount++;
    }
  });

  stats.averageRating =
    ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;

  return stats;
};

export default {
  getTourGuides,
  getGuideById,
  updateGuideStatus,
  transformUserToGuide,
  calculateGuideStats,
};
