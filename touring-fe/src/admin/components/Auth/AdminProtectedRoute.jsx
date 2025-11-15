// touring-fe/src/admin/components/Auth/AdminProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import logger from "../../../utils/logger";

const AdminProtectedRoute = ({ children }) => {
  const { admin, isAuthenticated, loading } = useAdminAuth();

  logger.debug("[AdminProtectedRoute] Auth state:", {
    isAuthenticated,
    loading,
    admin,
    role: admin?.role,
  });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    logger.info("[AdminProtectedRoute] Not authenticated, redirecting to login");
    return <Navigate to="/admin/login" replace />;
  }

  // ✅ CHECK ADMIN ROLE - Reject non-admin users
  if (admin?.role !== "Admin") {
    logger.warn(
      "[AdminProtectedRoute] User is not Admin (role:",
      admin?.role,
      "), redirecting to login"
    );
    return <Navigate to="/admin/login" replace />;
  }
  logger.debug(
    "[AdminProtectedRoute] Authenticated as Admin, rendering children"
  );
  return children;
};

export default AdminProtectedRoute;
