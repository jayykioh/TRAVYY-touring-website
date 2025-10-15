// ============================================================
// touring-fe/src/admin/hooks/useAdminAuth.js
// ============================================================

import { useState, useEffect } from 'react';
import adminAuthService from '../services/adminAuthService';

export const useAdminAuth = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (adminAuthService.isAuthenticated()) {
          const currentAdmin = adminAuthService.getCurrentAdmin();
          setAdmin(currentAdmin);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await adminAuthService.login(email, password);
      if (result.success) {
        setAdmin(result.admin);
        return { success: true };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = err.message || 'Đăng nhập thất bại';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    adminAuthService.logout();
    setAdmin(null);
  };

  const refreshProfile = async () => {
    setLoading(true);
    try {
      const result = await adminAuthService.getProfile();
      if (result.success) {
        setAdmin(result.admin);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    admin,
    loading,
    error,
    login,
    logout,
    refreshProfile,
    isAuthenticated: adminAuthService.isAuthenticated()
  };
};
