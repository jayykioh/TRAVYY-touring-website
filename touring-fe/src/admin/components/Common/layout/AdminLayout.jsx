import React, { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';

export default function AdminLayout({ children, activePage = 'dashboard' }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        activePage={activePage}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <AdminHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

        {/* Footer */}
        <AdminFooter />
      </div>
    </div>
  );
}