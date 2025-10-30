// touring-fe/src/admin/context/AdminAuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import adminAuthService from "../services/adminAuthService";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      try {
        const authenticated = adminAuthService.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const currentAdmin = adminAuthService.getCurrentAdmin();
          const storedToken = sessionStorage.getItem("admin_token");
          setAdmin(currentAdmin);
          setToken(storedToken);
        } else {
          setAdmin(null);
          setToken(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsAuthenticated(false);
        setAdmin(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    // Initialize auth on mount
    initAuth();

    // Also check auth state when window regains focus
    // (in case user opens another tab, logs out, then returns to this tab)
    const handleFocus = () => {
      const authenticated = adminAuthService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated && !admin) {
        const currentAdmin = adminAuthService.getCurrentAdmin();
        const storedToken = sessionStorage.getItem("admin_token");
        setAdmin(currentAdmin);
        setToken(storedToken);
      } else if (!authenticated && admin) {
        setAdmin(null);
        setToken(null);
      }
    };

    // Check auth state when page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const result = await adminAuthService.login(email, password);
    if (result.success) {
      setAdmin(result.admin);
      setToken(result.token);
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = () => {
    adminAuthService.logout();
    setAdmin(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const updateAdmin = (updatedAdmin) => {
    setAdmin(updatedAdmin);
    sessionStorage.setItem("admin_user", JSON.stringify(updatedAdmin));
  };

  const value = {
    admin,
    token,
    loading,
    login,
    logout,
    updateAdmin,
    isAuthenticated,
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
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};

export default AdminAuthContext;
