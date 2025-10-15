// ============================================================
// touring-fe/src/admin/services/adminAuthService.js
// ============================================================

const STORAGE_KEYS = {
  ADMIN_TOKEN: 'admin_token',
  ADMIN_USER: 'admin_user',
};

// Mock admin data
const MOCK_ADMINS = [
  {
    id: 1,
    email: 'admin@travyy.com',
    password: 'Admin@123',
    name: 'Melissa Peters',
    role: 'Super Admin',
    avatar: 'https://ui-avatars.com/api/?name=Melissa+Peters&background=3B82F6&color=fff',
    permissions: ['all']
  },
  {
    id: 2,
    email: 'manager@travyy.com',
    password: 'Manager@123',
    name: 'John Doe',
    role: 'Manager',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=10B981&color=fff',
    permissions: ['tours', 'guides', 'customers']
  },
  {
    id: 3,
    email: 'staff@travyy.com',
    password: 'Staff@123',
    name: 'Jane Smith',
    role: 'Staff',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=F59E0B&color=fff',
    permissions: ['customers', 'reports']
  }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================
// MOCK SERVICE (Đang sử dụng)
// ============================================================
const mockService = {
  login: async (email, password) => {
    await delay(800);
    
    const admin = MOCK_ADMINS.find(
      a => a.email === email && a.password === password
    );

    if (!admin) {
      return {
        success: false,
        message: 'Email hoặc mật khẩu không chính xác'
      };
    }

    const token = `mock_token_${admin.id}_${Date.now()}`;
    const adminData = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      avatar: admin.avatar,
      permissions: admin.permissions
    };
    
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(adminData));

    return { success: true, admin: adminData, token };
  },

  getProfile: async () => {
    await delay(300);
    const adminStr = sessionStorage.getItem(STORAGE_KEYS.ADMIN_USER);
    if (!adminStr) return { success: false, message: 'Not authenticated' };
    return { success: true, admin: JSON.parse(adminStr) };
  },

  updateProfile: async (updatedData) => {
    await delay(500);
    const adminStr = sessionStorage.getItem(STORAGE_KEYS.ADMIN_USER);
    if (!adminStr) return { success: false, message: 'Not authenticated' };
    
    const admin = JSON.parse(adminStr);
    const updatedAdmin = { ...admin, ...updatedData };
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(updatedAdmin));
    
    return { success: true, admin: updatedAdmin };
  },

  changePassword: async () => {
    await delay(500);
    return { success: true, message: 'Mật khẩu đã được thay đổi' };
  }
};

/* ============================================================
   REAL API SERVICE (Comment lại - Uncomment khi có backend)
   ============================================================

import { API_CONFIG, API_ENDPOINTS } from '../config/apiConfig';
import apiHelper from '../utils/apiHelper';

const apiService = {
  login: async (email, password) => {
    const result = await apiHelper.post(API_ENDPOINTS.LOGIN, { email, password });
    
    if (result.success) {
      const { token, admin } = result.data;
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(admin));
      return { success: true, admin, token };
    }
    
    return result;
  },

  getProfile: async () => {
    const result = await apiHelper.get(API_ENDPOINTS.PROFILE);
    
    if (result.success) {
      const { admin } = result.data;
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(admin));
      return { success: true, admin };
    }
    
    return result;
  },

  updateProfile: async (updatedData) => {
    const result = await apiHelper.put(API_ENDPOINTS.PROFILE, updatedData);
    
    if (result.success) {
      const { admin } = result.data;
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(admin));
      return { success: true, admin };
    }
    
    return result;
  },

  changePassword: async (oldPassword, newPassword) => {
    return await apiHelper.post(API_ENDPOINTS.CHANGE_PASSWORD, {
      oldPassword,
      newPassword
    });
  }
};

============================================================ */

// ============================================================
// MAIN SERVICE
// ============================================================
const adminAuthService = {
  login: async (email, password) => {
    console.log('🔐 Login (MOCK mode):', email);
    return await mockService.login(email, password);
    
    // Khi có API, uncomment dòng dưới và comment dòng trên:
    // return await apiService.login(email, password);
  },

  logout: () => {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    console.log('✅ Logout');
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
      console.error('Error getting admin:', error);
      return null;
    }
  },

  getToken: () => sessionStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN),

  getProfile: async () => {
    return await mockService.getProfile();
    // Khi có API: return await apiService.getProfile();
  },

  updateProfile: async (updatedData) => {
    return await mockService.updateProfile(updatedData);
    // Khi có API: return await apiService.updateProfile(updatedData);
  },

  changePassword: async (oldPassword, newPassword) => {
    return await mockService.changePassword(oldPassword, newPassword);
    // Khi có API: return await apiService.changePassword(oldPassword, newPassword);
  }
};

export default adminAuthService;