import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import BottomNav from "../common/BottomNav";
import ScrollToTop from "../common/ScrollToTop";

import FloatingChatButton from "../chat/FloatingChatButton";
import ChatPopup from "../chat/ChatPopup";

const MainLayout = ({ title = "", subtitle = "" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      {/* Scroll to top on page change */}
      <ScrollToTop />

      {/* Header fixed */}
      <Header title={title} subtitle={subtitle} onMenuClick={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 pt-20 lg:pt-24 pb-20 lg:pb-2 px-4 lg:px-8">
        <main className="max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Desktop Footer */}
      <div className="hidden lg:block">
        <Footer />
      </div>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />

      {/* Floating Chat Button (Mobile + Desktop) */}
      <FloatingChatButton onClick={() => setChatOpen(true)} />

      {/* Chat Popup Window */}
      <ChatPopup isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default MainLayout;
