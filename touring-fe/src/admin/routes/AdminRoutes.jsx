import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import AdminProtectedRoute from '../components/Auth/AdminProtectedRoute';
import AdminLayout from '../components/Common/layout/AdminLayout';

// Pages
import AdminLogin from '../pages/AdminLogin';
import Dashboard from '../components/Dashboard/Dashboard';
import TourManagement from '../pages/TourManagement';
import GuideManagement from '../pages/GuideManagement';
import AgencyAPIData from '../pages/AgencyAPIData'; 
import Settings from '../pages/Settings';
import PromotionManagement from '../pages/PromotionManagement';

// Placeholder components
const CustomerRequests = () => <div className="p-6">Customer Requests Page - Coming soon</div>;
const Certification = () => <div className="p-6">Certification Page - Coming soon</div>;
const AgencyAPI = () => <div className="p-6">Agency API Data Page - Coming soon</div>;
const Reports = () => <div className="p-6">Reports Page - Coming soon</div>;

const AdminRoutes = () => {
  return (
    <AdminAuthProvider>
      <Routes>
        {/* Public route - Login */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Protected routes with layout */}
        <Route path="/dashboard" element={
          <AdminProtectedRoute>
            <AdminLayout activePage="dashboard">
              <Dashboard />
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        
        <Route path="/tours" element={
          <AdminProtectedRoute>
            <AdminLayout activePage="tours">
              <TourManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        
        <Route path="/guides" element={
          <AdminProtectedRoute>
            <AdminLayout activePage="guides">
              <GuideManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        
        <Route path="/guides/compatibility" element={
          <AdminProtectedRoute>
            <AdminLayout activePage="guides">
              <div className="p-6">Check Compatibility - Coming soon</div>
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        
        <Route path="/customers" element={
          <AdminProtectedRoute>
            <AdminLayout activePage="customers">
              <CustomerRequests />
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        
        <Route path="/certification" element={
          <AdminProtectedRoute>
            <AdminLayout activePage="certification">
              <Certification />
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        
        <Route path="/api" element={
          <AdminProtectedRoute>
            <AdminLayout activePage="api">
              <AgencyAPIData />
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <AdminProtectedRoute>
            <AdminLayout activePage="reports">
              <Reports />
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <AdminProtectedRoute>
            <AdminLayout activePage="settings">
              <Settings />
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        
        <Route path="/promotions" element={
          <AdminProtectedRoute>
            <AdminLayout activePage="promotions">
              <PromotionManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        } />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
};

export default AdminRoutes;