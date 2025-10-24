import React, { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';

export default function AdminLayout({ children, activePage = 'dashboard' }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed at top */}
      <AdminHeader />

      {/* Sidebar - Fixed position với offset từ header */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        activePage={activePage}
      />

      {/* Main Content - Với margin để tránh sidebar */}
      <div 
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-[285px]' : 'lg:ml-[45px]'
        }`}
        style={{ marginTop: '64px' }} // Offset cho header
      >
        {/* Page Content */}
        <main className="min-h-[calc(100vh-64px-60px)] p-6">
          {children}
        </main>

        {/* Footer */}
        <AdminFooter />
      </div>
    </div>
  );
}