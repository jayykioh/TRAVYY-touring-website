import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import ScrollToTop from "../common/ScrollToTop";

const MainLayout = ({ title = "", subtitle = "" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Cuộn lên đầu khi đổi trang */}
      <ScrollToTop />

      {/* Header nằm trên cùng full width */}
      <Header title={title} subtitle={subtitle} onMenuClick={toggleSidebar} />

      {/* Main container */}
      <div className="flex flex-1 pt-20 lg:pt-24 pb-20 lg:pb-6">
        {/* Sidebar - Ẩn trên mobile */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="fixed top-24 left-8 w-64 h-[calc(100vh-7rem)] overflow-y-auto">
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 px-4 lg:px-8 lg:ml-8">
          <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-4 lg:p-6 min-h-[calc(100vh-12rem)]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer - Ẩn trên mobile */}
      <div className="hidden lg:block">
        <Footer />
      </div>

      {/* Bottom Navigation - Chỉ hiện trên mobile */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;
