import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import ScrollToTop from "../common/ScrollToTop";
import FloatingChatButton from "../chat/FloatingChatButton";
import ChatPopup from "../chat/ChatPopup";

const MainLayout = ({ title = "", subtitle = "" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  // Do not use location here to avoid triggering effects that reset chat state
  // on navigation. Keep chat stable across route changes.
  // const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Do not reset chat popup state on every route change — keep chat state
  // stable across navigation to avoid recreating Socket/Auth contexts.

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col gap-16">
      {/* Cuộn lên đầu khi đổi trang */}
      <ScrollToTop />

      <div className="relative z-10 flex flex-col min-h-screen mt-18">
        {/* Header nằm trên cùng full width */}
        <div>
          <Header
            title={title}
            subtitle={subtitle}
            onMenuClick={toggleSidebar}
          />
        </div>

        {/* Khu vực nội dung bên dưới header */}
        <div className="flex flex-1 mt-2 py-2 px-8 gap-2 ml-14">
          {/* Sidebar bên trái */}
          <div className="w-50">
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
          </div>

          {/* Main content bên phải */}
          <main className="flex-1 bg-white rounded-2xl shadow-sm p-6 overflow-auto mb-6">
            <Outlet />
          </main>
        </div>

        {/* Footer nằm dưới cùng */}
        <div>
          <Footer />
        </div>
      </div>

      {/* Bottom Navigation - chỉ hiện trên mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0">
        <BottomNav />
      </div>

      {/* Floating Chat Button */}
      <FloatingChatButton onClick={() => setChatOpen(true)} />

      {/* Chat Popup */}
      <ChatPopup isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default MainLayout;
