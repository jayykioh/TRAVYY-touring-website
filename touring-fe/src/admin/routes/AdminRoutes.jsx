import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "../context/AdminAuthContext";
import AdminProtectedRoute from "../components/Auth/AdminProtectedRoute";
import AdminLayout from "../components/Common/layout/AdminLayout";

// Pages
import AdminLogin from "../pages/AdminLogin";
import Dashboard from "../components/Dashboard/Dashboard";
import TourManagement from "../pages/TourManagement";
import TourDetailPage from "../components/Tours/TourDetailPage";
import GuideManagement from "../pages/GuideManagement";
import Settings from "../pages/Settings";
import PromotionManagement from "../pages/PromotionManagement";
import CustomerRequestManagement from "../pages/CustomerRequestManagement";

// Guide components - REMOVED: Only GuideManagement remains

// Customer components
import CustomerAccountsPage from "../components/Customers/CustomerAccountsPage";
import CustomerAccountDetailPage from "../components/Customers/CustomerAccountDetailPage";

// Customer Request components
import RequestDetailPage from "../components/CustomerRequest/RequestDetailPage";
import RequestUpdatePage from "../components/CustomerRequest/RequestUpdatePage";

// Placeholder components
const Certification = () => (
  <div className="p-6">Certification Page - Coming soon</div>
);

const AdminRoutes = () => {
  return (
    <AdminAuthProvider>
      <Routes>
        {/* Public route - Login */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Protected routes with layout */}
        <Route
          path="/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="dashboard">
                <Dashboard />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/tours"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="tours">
                <TourManagement />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/tours/:id"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="tours">
                <TourDetailPage />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/guides"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="guides">
                <GuideManagement />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        {/* Customer Management Routes */}
        <Route
          path="/customers/accounts"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="customers">
                <CustomerAccountsPage />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/customers/:id"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="customers">
                <CustomerAccountDetailPage />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        {/* Customer Requests Routes */}
        <Route
          path="/customer-requests"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="customer-requests">
                <CustomerRequestManagement />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/customer-requests/:id"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="customer-requests">
                <RequestDetailPage />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/customer-requests/:id/update"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="customer-requests">
                <RequestUpdatePage />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/certification"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="certification">
                <Certification />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="settings">
                <Settings />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/promotions"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="promotions">
                <PromotionManagement />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
};

export default AdminRoutes;
