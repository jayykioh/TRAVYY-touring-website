// admin/services/customerRequestService.js
const API_URL = "http://localhost:4000/api";

/**
 * Helper: Fetch with authentication
 */
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("admin_token");

  if (!token) {
    window.location.href = "/admin/login";
    throw new Error("Chưa đăng nhập");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    window.location.href = "/admin/login";
    throw new Error("Phiên đăng nhập hết hạn");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Có lỗi xảy ra");
  }

  return response;
};

/**
 * Fetch all help feedback (customer requests)
 */
export const getCustomerRequests = async () => {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/help/feedback`);
    const data = await response.json();

    return {
      success: true,
      data: data.data || [],
    };
  } catch (error) {
    // Log with centralized logger
    try {
      const logger = await import("../../utils/logger");
      logger.default.error("❌ Get customer requests error:", error);
    } catch (e) {
      /* dynamic import fallback - do nothing */
    }
    return {
      success: false,
      error: error.message || "Không thể tải dữ liệu",
      data: [],
    };
  }
};

/**
 * Get single customer request by ID
 */
export const getCustomerRequestById = async (requestId) => {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/help/feedback/${requestId}`
    );
    const data = await response.json();

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    try {
      const logger = await import("../../utils/logger");
      logger.default.error("❌ Get customer request error:", error);
    } catch (e) {
      /* ignore */
    }
    return {
      success: false,
      error: error.message || "Không thể tải dữ liệu",
    };
  }
};

/**
 * Update customer request status
 */
export const updateRequestStatus = async (
  requestId,
  status,
  responseMessage
) => {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/help/feedback/${requestId}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ status, responseMessage }),
      }
    );
    const data = await response.json();

    return {
      success: true,
      data: data.data,
      message: data.message || "Cập nhật thành công",
    };
  } catch (error) {
    try {
      const logger = await import("../../utils/logger");
      logger.default.error("❌ Update request status error:", error);
    } catch (e) {
      /* ignore */
    }
    return {
      success: false,
      error: error.message || "Cập nhật thất bại",
    };
  }
};

/**
 * Get request statistics
 */
export const getRequestStats = (requests) => {
  const stats = {
    total: requests.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
    urgent: 0,
  };

  requests.forEach((req) => {
    // Count by status
    if (req.status === "pending") stats.pending++;
    else if (req.status === "in-progress") stats.inProgress++;
    else if (req.status === "completed" || req.status === "resolved")
      stats.completed++;

    // Count urgent (not helpful feedback)
    if (req.helpful === false) stats.urgent++;
  });

  return stats;
};

/**
 * Transform backend feedback to frontend request format
 */
export const transformFeedbackToRequest = (feedback) => {
  if (!feedback) return null;

  return {
    _id: feedback._id,
    requestId: `REQ-${feedback._id.slice(-8).toUpperCase()}`,
    customerName: feedback.userId?.name || "Anonymous",
    email: feedback.userId?.email || "N/A",
    phone: feedback.userId?.phone || "N/A",
    type: feedback.helpful ? "feedback" : "issue",
    priority: feedback.helpful ? "normal" : "high",
    status: feedback.status || "pending",
    subject: `Phản hồi về bài viết: ${feedback.articleId?.title || "Unknown"}`,
    message: feedback.comment || "",
    articleTitle: feedback.articleId?.title || "N/A",
    articleSlug: feedback.articleId?.slug || "",
    helpful: feedback.helpful,
    destination: null,
    numberOfPeople: null,
    createdAt: feedback.createdAt,
    updatedAt: feedback.updatedAt,
    ipAddress: feedback.ipAddress,
    userAgent: feedback.userAgent,
  };
};

export default {
  getCustomerRequests,
  getCustomerRequestById,
  updateRequestStatus,
  getRequestStats,
  transformFeedbackToRequest,
};
