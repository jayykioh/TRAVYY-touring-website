export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
};

export const API_ENDPOINTS = {
  LOGIN: `${API_CONFIG.BASE_URL}/admin/login`,
};
