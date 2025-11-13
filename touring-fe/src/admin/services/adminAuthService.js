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

      // Always store in sessionStorage only
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, accessToken);
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(user));

      return { success: true, admin: user, token: accessToken };
    }
    return { success: false, message: result.message };
  },

  logout: () => {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
  },

  isAuthenticated: () => {
    return !!(
      sessionStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN) &&
      sessionStorage.getItem(STORAGE_KEYS.ADMIN_USER)
    );
  },

  getCurrentAdmin: () => {
    try {
      const userStr = sessionStorage.getItem(STORAGE_KEYS.ADMIN_USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error getting admin:", error);
      return null;
    }
  },

  getToken: () => sessionStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN),
};

export default adminAuthService;
