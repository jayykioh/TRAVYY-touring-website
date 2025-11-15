import { API_CONFIG, API_ENDPOINTS } from "../config/apiConfig";
import apiHelper from "../utils/apiHelper";

const STORAGE_KEYS = {
  ADMIN_TOKEN: "admin_token",
  ADMIN_USER: "admin_user",
};

const adminAuthService = {
  login: async (email, password) => {
    const result = await apiHelper.post(API_ENDPOINTS.LOGIN, {
      email,
      password,
    });
    if (result.success) {
      const { accessToken, user } = result.data;

      // Store in localStorage for persistence across tabs/redirects
      localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(user));

      return { success: true, admin: user, token: accessToken };
    }
    return { success: false, message: result.message };
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
  },

  isAuthenticated: () => {
    return !!(
      localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN) &&
      localStorage.getItem(STORAGE_KEYS.ADMIN_USER)
    );
  },

  getCurrentAdmin: () => {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error getting admin:", error);
      return null;
    }
  },

  getToken: () => localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN),
};

export default adminAuthService;
