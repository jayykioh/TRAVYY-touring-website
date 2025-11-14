import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import BottomNav from "../common/BottomNav";
import ScrollToTop from "../common/ScrollToTop";

const MainLayout = ({ title = "", subtitle = "" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      {/* Tự động cuộn lên đầu khi đổi trang */}
      <ScrollToTop />

      {/* Header cố định trên cùng */}
      <Header title={title} subtitle={subtitle} onMenuClick={toggleSidebar} />

      {/* Khu vực nội dung chính */}
      <div className="flex-1 pt-20 lg:pt-24 pb-20 lg:pb-2 px-4 lg:px-8">
        <main className="max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Footer - chỉ hiện trên desktop */}
      <div className="hidden lg:block">
        <Footer />
      </div>

      {/* Thanh điều hướng dưới - chỉ hiện trên mobile */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;
