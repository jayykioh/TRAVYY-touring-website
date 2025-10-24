import React, { useState } from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";

export default function AdminLayout({ children, activePage = "dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed at top */}
      <AdminHeader toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />

      {/* Sidebar - Fixed position với offset từ header */}
      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        activePage={activePage}
      />

      {/* Main Content - Với margin để tránh sidebar */}
      <div
        className={`transition-all duration-300 pt-16 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-0"
        }`}
      >
        {/* Page Content */}
        <main className="min-h-[calc(100vh-64px-60px)] p-4 md:p-6">
          {children}
        </main>

        {/* Footer */}
        <AdminFooter />
      </div>
    </div>
  );
}
