// touring-fe/src/admin/components/Auth/AdminProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import adminAuthService from '../../services/adminAuthService';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  const [authVerified, setAuthVerified] = useState(false);

  useEffect(() => {
    // Double-check auth on route change (safety measure)
    const verified = adminAuthService.isAuthenticated();
    setAuthVerified(verified);
  }, []);

  // Show loading state
  if (loading || !authVerified) {
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
  if (!isAuthenticated || !authVerified) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;