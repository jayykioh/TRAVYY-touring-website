// services/settingsService.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Helper: Get admin token
const getAdminToken = () => {
  return sessionStorage.getItem("admin_token");
};

// Helper: Fetch with auth
const authFetch = async (url, options = {}) => {
  const token = getAdminToken();
  if (!token) throw new Error("NO_TOKEN");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// ✅ Get current admin profile
export const getAdminProfile = async () => {
  return authFetch(`${API_URL}/api/profile`);
};

// ✅ Update admin profile
export const updateAdminProfile = async (data) => {
  return authFetch(`${API_URL}/api/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

// ✅ Upload avatar
export const uploadAvatar = async (file) => {
  const token = getAdminToken();
  if (!token) throw new Error("NO_TOKEN");

  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${API_URL}/api/profile/upload-avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Upload failed");
  }

  return response.json();
};

// ✅ Delete avatar
export const deleteAvatar = async () => {
  const token = getAdminToken();
  if (!token) throw new Error("NO_TOKEN");

  const response = await fetch(`${API_URL}/api/profile/avatar`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Delete failed");
  }

  return response.json();
};

// ✅ Get avatar URL
export const getAvatarUrl = (userId) => {
  return `${API_URL}/api/profile/avatar/${userId}`;
};

// ✅ Change password
export const changePassword = async (currentPassword, newPassword) => {
  const token = getAdminToken();
  if (!token) throw new Error("NO_TOKEN");

  const response = await fetch(`${API_URL}/api/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Change password failed");
  }

  return response.json();
};

// ✅ Update notification settings (lưu vào User model)
export const updateNotificationSettings = async (settings) => {
  return authFetch(`${API_URL}/api/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notificationSettings: settings,
    }),
  });
};

// ✅ Get active sessions (mock data - backend chưa có)
export const getActiveSessions = async () => {
  // TODO: Implement real session management when backend ready
  return [
    {
      id: 1,
      device: "Chrome on macOS",
      location: "Hà Nội, Việt Nam",
      ipAddress: "192.168.1.1",
      lastActive: new Date().toISOString(),
      isCurrent: true,
    },
  ];
};

// ✅ Logout specific session (mock)
export const logoutSession = async (sessionId) => {
  // TODO: Implement when backend ready
  return { success: true };
};

// ✅ Delete account
export const deleteAccount = async (email) => {
  const token = getAdminToken();
  if (!token) throw new Error("NO_TOKEN");

  const response = await fetch(`${API_URL}/api/profile`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Delete account failed");
  }

  return response.json();
};
