// ============================================================
// touring-fe/src/admin/utils/apiHelper.js
// ============================================================

import { API_CONFIG, STORAGE_KEYS } from '../config/apiConfig';

/**
 * API Helper - Xử lý tất cả API requests
 */
class ApiHelper {
  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN_API_PATH}`;
  }

  /**
   * Get authorization header
   */
  getAuthHeader() {
    const token = sessionStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Make API request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
    };

    try {
      console.log(`📡 API Request: ${options.method || 'GET'} ${endpoint}`);
      
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 401) {
          // Token expired or invalid
          this.handleUnauthorized();
        }
        
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      console.log(`✅ API Response: ${endpoint}`, data);
      return { success: true, data };
      
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error);
      
      // Network error
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        return {
          success: false,
          message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
        };
      }
      
      return {
        success: false,
        message: error.message || 'Đã có lỗi xảy ra'
      };
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Upload file
   */
  async upload(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...this.getAuthHeader(),
        },
        body: formData, // Don't set Content-Type for FormData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return { success: true, data };
      
    } catch (error) {
      console.error('Upload Error:', error);
      return {
        success: false,
        message: error.message || 'Upload failed'
      };
    }
  }

  /**
   * Handle unauthorized (401)
   */
  handleUnauthorized() {
    console.warn('🔐 Unauthorized - Clearing session');
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    
    // Redirect to login
    if (window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login';
    }
  }
}

// Export singleton instance
const apiHelper = new ApiHelper();
export default apiHelper;