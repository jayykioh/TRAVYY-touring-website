// services/adminAPI.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
// Toggle to use real backend vs mock data. Set to false to fetch real data from the API.
const USE_MOCK_DATA = false; // was true during development

// Import mock data
import { mockTours, mockBookings, mockGuides } from "../data/mockData";

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to refresh token
const refreshAdminToken = async () => {
  try {
    // ✅ Fix the refresh endpoint path
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include", // Send cookies
    });

    if (response.ok) {
      const data = await response.json();
      const newToken = data.accessToken;
      // ✅ Use localStorage instead of sessionStorage
      localStorage.setItem("admin_token", newToken);
      return newToken;
    }
    return null;
  } catch (error) {
    console.error("Failed to refresh admin token:", error);
    return null;
  }
};

// Helper function to make authenticated request with auto-refresh
const fetchWithAuth = async (url, options = {}) => {
  // ✅ Use localStorage instead of sessionStorage
  let token = localStorage.getItem("admin_token");

  // First attempt
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // If 401, try to refresh token and retry once
  if (response.status === 401) {
    console.log("Token expired, attempting to refresh...");
    const newToken = await refreshAdminToken();

    if (newToken) {
      console.log("Token refreshed successfully, retrying request...");
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    } else {
      console.error("Failed to refresh token, redirecting to login...");
      // ✅ Clear localStorage and redirect to login
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/admin/login";
      throw new Error("Authentication failed");
    }
  }

  return response;
};

export const adminAPI = {
  // ==================== TOURS ====================
  getTours: async () => {
    if (USE_MOCK_DATA) {
      await delay(300);
      return { success: true, data: mockTours };
    }
    const response = await fetch(`${API_BASE_URL}/admin/tours`);
    return response.json();
  },

  getTourById: async (id) => {
    if (USE_MOCK_DATA) {
      await delay(300);
      const tour = mockTours.find((t) => t.id === id);
      return { success: true, data: tour };
    }
    const response = await fetch(`${API_BASE_URL}/admin/tours/${id}`);
    return response.json();
  },

  createTour: async (tourData) => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return {
        success: true,
        message: "Tour created successfully",
        data: tourData,
      };
    }
    const response = await fetch(`${API_BASE_URL}/admin/tours`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tourData),
    });
    return response.json();
  },

  updateTour: async (id, tourData) => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return {
        success: true,
        message: "Tour updated successfully",
        data: tourData,
      };
    }
    const response = await fetch(`${API_BASE_URL}/admin/tours/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tourData),
    });
    return response.json();
  },

  deleteTour: async (id) => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return { success: true, message: "Tour deleted successfully" };
    }
    const response = await fetch(`${API_BASE_URL}/admin/tours/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  syncTour: async (id) => {
    if (USE_MOCK_DATA) {
      await delay(1000);
      return {
        success: true,
        message: "Tour synced successfully",
        syncTime: new Date().toISOString(),
      };
    }
    const response = await fetch(`${API_BASE_URL}/admin/tours/${id}/sync`, {
      method: "POST",
    });
    return response.json();
  },

  syncAllTours: async () => {
    if (USE_MOCK_DATA) {
      await delay(2000);
      return {
        success: true,
        message: "All tours synced successfully",
        count: mockTours.length,
      };
    }
    const response = await fetch(`${API_BASE_URL}/admin/tours/sync-all`, {
      method: "POST",
    });
    return response.json();
  },

  // ==================== BOOKINGS ====================
  getBookings: async () => {
    if (USE_MOCK_DATA) {
      await delay(300);
      return { success: true, data: mockBookings };
    }
    const response = await fetch(`${API_BASE_URL}/admin/bookings`);
    return response.json();
  },

  getBookingById: async (id) => {
    if (USE_MOCK_DATA) {
      await delay(300);
      const booking = mockBookings.find((b) => b.id === id);
      return { success: true, data: booking };
    }
    const response = await fetch(`${API_BASE_URL}/admin/bookings/${id}`);
    return response.json();
  },

  updateBookingStatus: async (id, status) => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return {
        success: true,
        message: "Booking status updated",
        data: { id, status },
      };
    }
    const response = await fetch(
      `${API_BASE_URL}/admin/bookings/${id}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );
    return response.json();
  },

  syncBooking: async (id) => {
    if (USE_MOCK_DATA) {
      await delay(1000);
      return { success: true, message: "Booking synced successfully" };
    }
    const response = await fetch(`${API_BASE_URL}/admin/bookings/${id}/sync`, {
      method: "POST",
    });
    return response.json();
  },

  syncAllBookings: async () => {
    if (USE_MOCK_DATA) {
      await delay(2000);
      return {
        success: true,
        message: "All bookings synced successfully",
        count: mockBookings.length,
      };
    }
    const response = await fetch(`${API_BASE_URL}/admin/bookings/sync-all`, {
      method: "POST",
    });
    return response.json();
  },

  // ==================== GUIDES ====================
  getGuides: async () => {
    if (USE_MOCK_DATA) {
      await delay(300);
      return { success: true, data: mockGuides };
    }
    const response = await fetch(`${API_BASE_URL}/admin/guides`);
    return response.json();
  },

  getGuideById: async (id) => {
    if (USE_MOCK_DATA) {
      await delay(300);
      const guide = mockGuides.find((g) => g.id === id);
      return { success: true, data: guide };
    }
    const response = await fetch(`${API_BASE_URL}/admin/guides/${id}`);
    return response.json();
  },

  updateGuideAvailability: async (id, availability) => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return {
        success: true,
        message: "Guide availability updated",
        data: { id, availability },
      };
    }
    const response = await fetch(
      `${API_BASE_URL}/admin/guides/${id}/availability`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      }
    );
    return response.json();
  },

  syncGuide: async (id) => {
    if (USE_MOCK_DATA) {
      await delay(1000);
      return { success: true, message: "Guide synced successfully" };
    }
    const response = await fetch(`${API_BASE_URL}/admin/guides/${id}/sync`, {
      method: "POST",
    });
    return response.json();
  },

  syncAllGuides: async () => {
    if (USE_MOCK_DATA) {
      await delay(2000);
      return {
        success: true,
        message: "All guides synced successfully",
        count: mockGuides.length,
      };
    }
    const response = await fetch(`${API_BASE_URL}/admin/guides/sync-all`, {
      method: "POST",
    });
    return response.json();
  },

  // ==================== BULK OPERATIONS ====================
  bulkSync: async (ids, type) => {
    if (USE_MOCK_DATA) {
      await delay(1500);
      return {
        success: true,
        message: `Synced ${ids.length} ${type} successfully`,
      };
    }
    const response = await fetch(`${API_BASE_URL}/admin/${type}/bulk-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    return response.json();
  },

  // ==================== EXPORT/IMPORT ====================
  exportData: async (type, format = "csv") => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return { success: true, message: "Data exported successfully" };
    }
    const response = await fetch(
      `${API_BASE_URL}/admin/export/${type}?format=${format}`
    );
    return response.blob();
  },

  importData: async (type, file) => {
    if (USE_MOCK_DATA) {
      await delay(1000);
      return {
        success: true,
        message: "Data imported successfully",
        imported: 10,
      };
    }
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE_URL}/admin/import/${type}`, {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  // ==================== DASHBOARD STATS ====================
  getRevenueStats: async (year) => {
    // Không dùng mock data cho stats, luôn fetch từ backend
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/admin/revenue-stats?year=${
        year || new Date().getFullYear()
      }`
    );
    return response.json();
  },

  getCategoryStats: async () => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/admin/category-stats`
    );
    return response.json();
  },

  getDashboardStats: async () => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/admin/dashboard-stats`
    );
    return response.json();
  },

  getUserMetrics: async () => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/admin/user-metrics`
    );
    return response.json();
  },

  // ==================== NEW DASHBOARD STATS ====================
  getBookingTrends: async () => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/admin/booking-trends`
    );
    return response.json();
  },

  getToursByRegion: async () => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/admin/tours-by-region`
    );
    return response.json();
  },

  getAgeDistribution: async () => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/admin/age-distribution`
    );
    return response.json();
  },

  getTopTravelers: async () => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/admin/top-travelers`
    );
    return response.json();
  },
};
