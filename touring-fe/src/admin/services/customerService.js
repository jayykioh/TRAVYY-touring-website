// admin/services/customerService.js
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
 * Get all customers (Travelers)
 */
export const getCustomers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append("role", "Traveler");

    if (filters.search) params.append("search", filters.search);
    if (filters.status && filters.status !== "all") {
      params.append("status", filters.status);
    }

    const queryString = params.toString();
    const url = `${API_URL}/admin/users${queryString ? `?${queryString}` : ""}`;

    const response = await fetchWithAuth(url);
    const data = await response.json();

    return {
      success: true,
      data: data.data || [],
    };
  } catch (error) {
    console.error("❌ Get customers error:", error);
    return {
      success: false,
      error: error.message || "Không thể tải dữ liệu",
      data: [],
    };
  }
};

/**
 * Get single customer by ID
 */
export const getCustomerById = async (customerId) => {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/users/${customerId}`
    );
    const data = await response.json();

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("❌ Get customer error:", error);
    return {
      success: false,
      error: error.message || "Không thể tải dữ liệu",
    };
  }
};

/**
 * Update customer status
 */
export const updateCustomerStatus = async (customerId, status, reason = "") => {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/users/${customerId}/status`,
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
    console.error("❌ Update customer status error:", error);
    return {
      success: false,
      error: error.message || "Cập nhật thất bại",
    };
  }
};

/**
 * Get customer statistics
 */
export const getCustomerStats = async () => {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/users/stats`);
    const data = await response.json();

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("❌ Get customer stats error:", error);
    return {
      success: false,
      error: error.message || "Không thể tải dữ liệu",
    };
  }
};

/**
 * Transform backend user to frontend customer format
 */
export const transformUserToCustomer = (user) => {
  if (!user) return null;

  const stats = user.stats || {};

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
    location: user.location || {},
    totalBookings: stats.totalBookings || 0,
    completedBookings: stats.completedBookings || 0,
    totalSpent: stats.totalSpent || 0,
    accountStatus: user.accountStatus || "active",
    statusReason: user.statusReason,
    joinDate: user.createdAt,
    lastActive: user.lastLogin || user.updatedAt,
    isActive:
      user.lastLogin &&
      new Date(user.lastLogin) >
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    twoFactorEnabled: user.twoFactorEnabled || false,
    emailVerificationEnabled: user.emailVerificationEnabled || false,
  };
};

/**
 * Calculate customer statistics from list
 */
export const calculateCustomerStats = (customers) => {
  const stats = {
    total: customers.length,
    active: 0,
    inactive: 0,
    banned: 0,
    totalSpent: 0,
    totalBookings: 0,
    averageSpent: 0,
  };

  customers.forEach((customer) => {
    // Count by status
    if (customer.accountStatus === "banned") {
      stats.banned++;
    } else if (customer.isActive) {
      stats.active++;
    } else {
      stats.inactive++;
    }

    // Sum totals
    stats.totalSpent += customer.totalSpent || 0;
    stats.totalBookings += customer.totalBookings || 0;
  });

  stats.averageSpent =
    stats.total > 0 ? Math.round(stats.totalSpent / stats.total) : 0;

  return stats;
};

export default {
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
  getCustomerStats,
  transformUserToCustomer,
  calculateCustomerStats,
};
