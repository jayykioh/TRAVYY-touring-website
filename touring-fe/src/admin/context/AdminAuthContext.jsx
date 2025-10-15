// touring-fe/src/admin/context/AdminAuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import adminAuthService from '../services/adminAuthService';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        if (adminAuthService.isAuthenticated()) {
          const currentAdmin = adminAuthService.getCurrentAdmin();
          setAdmin(currentAdmin);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const result = await adminAuthService.login(email, password);
    if (result.success) {
      setAdmin(result.admin);
    }
    return result;
  };

  const logout = () => {
    adminAuthService.logout();
    setAdmin(null);
  };

  const updateAdmin = (updatedAdmin) => {
    setAdmin(updatedAdmin);
    sessionStorage.setItem('admin_user', JSON.stringify(updatedAdmin));
  };

  const value = {
    admin,
    loading,
    login,
    logout,
    updateAdmin,
    isAuthenticated: adminAuthService.isAuthenticated()
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;