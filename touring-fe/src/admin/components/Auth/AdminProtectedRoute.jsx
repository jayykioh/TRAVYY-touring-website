// touring-fe/src/admin/components/Auth/AdminProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  console.log("[AdminProtectedRoute] Auth state:", {
    isAuthenticated,
    loading,
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
    console.log(
      "[AdminProtectedRoute] Not authenticated, redirecting to login"
    );
    return <Navigate to="/admin/login" replace />;
  }

  console.log("[AdminProtectedRoute] Authenticated, rendering children");
  return children;
};

export default AdminProtectedRoute;
