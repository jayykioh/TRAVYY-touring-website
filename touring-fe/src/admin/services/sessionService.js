// touring-fe/src/admin/services/sessionService.js

const API_BASE_URL =
  import.meta.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

const sessionService = {
  /**
   * Get all active sessions for current admin
   */
  getSessions: async () => {
    try {
      const token = sessionStorage.getItem("admin_token");

      const response = await fetch(`${API_BASE_URL}/api/admin/sessions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch sessions");
      }

      return {
        success: true,
        sessions: data.sessions,
      };
    } catch (error) {
      console.error("getSessions error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Logout a specific session
   */
  logoutSession: async (sessionId) => {
    try {
      const token = sessionStorage.getItem("admin_token");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/sessions/${sessionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to logout session");
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error("logoutSession error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Logout all other sessions except current
   */
  logoutAllOtherSessions: async () => {
    try {
      const token = sessionStorage.getItem("admin_token");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/sessions/logout-all-others`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to logout all sessions");
      }

      return {
        success: true,
        message: data.message,
        deletedCount: data.deletedCount,
      };
    } catch (error) {
      console.error("logoutAllOtherSessions error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export default sessionService;
