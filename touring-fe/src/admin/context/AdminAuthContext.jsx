// touring-fe/src/admin/context/AdminAuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import adminAuthService from "../services/adminAuthService";
import logger from "../../utils/logger";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      try {
        logger.info("[AdminAuthContext] Initializing auth...");
        const authenticated = adminAuthService.isAuthenticated();
        logger.info("[AdminAuthContext] isAuthenticated:", authenticated);

        if (authenticated) {
          const currentAdmin = adminAuthService.getCurrentAdmin();
          const storedToken = localStorage.getItem("admin_token");
          logger.info("[AdminAuthContext] Setting admin:", currentAdmin);
          logger.debug(
            "[AdminAuthContext] Setting token:",
            storedToken ? "exists" : "null"
          );

          // ✅ Validate admin role
          if (currentAdmin?.role !== "Admin") {
            logger.warn("[AdminAuthContext] User is not Admin, clearing auth");
            adminAuthService.logout();
            setIsAuthenticated(false);
            setAdmin(null);
            setToken(null);
          } else {
            setIsAuthenticated(true);
            setAdmin(currentAdmin);
            setToken(storedToken);
          }
        } else {
          setIsAuthenticated(false);
          setAdmin(null);
          setToken(null);
        }
      } catch (error) {
        logger.error("Auth initialization error:", error);
        setIsAuthenticated(false);
        setAdmin(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }; // Initialize auth on mount
    initAuth();

    // Also check auth state when window regains focus
    // (in case user opens another tab, logs out, then returns to this tab)
    const handleFocus = () => {
      const authenticated = adminAuthService.isAuthenticated();

      if (authenticated) {
        const currentAdmin = adminAuthService.getCurrentAdmin();
        // ✅ Validate admin role
        if (currentAdmin?.role !== "Admin") {
          logger.warn(
            "[AdminAuthContext] Non-admin detected on focus, clearing auth"
          );
          adminAuthService.logout();
          setIsAuthenticated(false);
          setAdmin(null);
          setToken(null);
        } else if (!admin) {
          const storedToken = localStorage.getItem("admin_token");
          setIsAuthenticated(true);
          setAdmin(currentAdmin);
          setToken(storedToken);
        }
      } else if (admin) {
        setIsAuthenticated(false);
        setAdmin(null);
        setToken(null);
      }
    };

    // Check auth state when page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleFocus();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    logger.info("[AdminAuthContext] Login attempt for:", email);
    const result = await adminAuthService.login(email, password);
    logger.debug("[AdminAuthContext] Login result:", result);
    if (result.success) {
      logger.info(
        "[AdminAuthContext] Setting admin state after successful login"
      );
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
    localStorage.setItem("admin_user", JSON.stringify(updatedAdmin));
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
