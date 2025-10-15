// ============================================================
// touring-fe/src/admin/config/apiConfig.js
// ============================================================

// 🔧 DEVELOPMENT CONFIG
export const API_CONFIG = {
  // Đổi thành false khi có backend
  USE_MOCK: true,
  
  // API Base URLs
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  ADMIN_API_PATH: '/api/admin',
  
  // Request timeout (milliseconds)
  TIMEOUT: 30000,
  
  // Mock delay (milliseconds) - chỉ dùng khi USE_MOCK = true
  MOCK_DELAY: 800,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
  CHANGE_PASSWORD: '/auth/change-password',
  REFRESH_TOKEN: '/auth/refresh',
  
  // Tours
  TOURS: '/tours',
  TOUR_DETAIL: (id) => `/tours/${id}`,
  CREATE_TOUR: '/tours',
  UPDATE_TOUR: (id) => `/tours/${id}`,
  DELETE_TOUR: (id) => `/tours/${id}`,
  
  // Guides
  GUIDES: '/guides',
  GUIDE_DETAIL: (id) => `/guides/${id}`,
  GUIDE_COMPATIBILITY: '/guides/compatibility',
  
  // Customers
  CUSTOMER_REQUESTS: '/customers/requests',
  
  // Dashboard
  DASHBOARD_STATS: '/dashboard/stats',
  
  // Reports
  REPORTS: '/reports',
};

// Storage keys
export const STORAGE_KEYS = {
  ADMIN_TOKEN: 'admin_token',
  ADMIN_USER: 'admin_user',
  REMEMBER_ME: 'admin_remember_email',
};

// Mock data for development
export const MOCK_ADMINS = [
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

export default API_CONFIG;