import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { mockGuide } from "../../data/mockGuide";
import { mockRequests } from "../../data/mockRequests";
import GuideProfileModal from "./GuideProfileModal";
import GuideInfoCard from "./GuideInfoCard";

const Sidebar = ({ className = "" }) => {
  const location = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);

  // 🟢 Số yêu cầu chưa xem
  const [unreadRequests, setUnreadRequests] = useState(0);

  // 🟢 Danh sách ID yêu cầu đã xem (lưu trong localStorage)
  const [viewedRequestIds, setViewedRequestIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("viewedGuideRequests") || "[]");
    } catch {
      return [];
    }
  });

  // 🟢 Khi mockRequests thay đổi, tính lại số lượng chưa xem
  useEffect(() => {
    const allRequestIds = mockRequests.map((r) => r.id);
    const unseen = allRequestIds.filter((id) => !viewedRequestIds.includes(id));
    setUnreadRequests(unseen.length);
  }, [mockRequests, viewedRequestIds]);

  // 🟢 Lắng nghe thay đổi khi user xem trang /guide/requests
  useEffect(() => {
    if (location.pathname === "/guide/requests") {
      // Khi mở trang Requests => đánh dấu tất cả là đã xem
      const allIds = mockRequests.map((r) => r.id);
      localStorage.setItem("viewedGuideRequests", JSON.stringify(allIds));
      setViewedRequestIds(allIds);
      setUnreadRequests(0);
    }
  }, [location.pathname]);

  // 🟢 Lắng nghe thay đổi từ tab khác (nếu có)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const updated = JSON.parse(
          localStorage.getItem("viewedGuideRequests") || "[]"
        );
        setViewedRequestIds(updated);
      } catch {
        setViewedRequestIds([]);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 🧭 Menu với SVG icons
  const menuItems = [
    {
      path: "/guide",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      label: "Home",
      exact: true,
    },
    {
      path: "/guide/requests",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      ),
      label: "Requests",
      badge: unreadRequests > 0 ? unreadRequests : null,
    },
    {
      path: "/guide/tours",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      label: "My Tours",
    },
    {
      path: "/guide/earnings",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      label: "Earnings",
    },
    {
      path: "/guide/profile",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      label: "Profile",
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside
        className={`fixed lg:relative top-0 left-0 bg-white shadow-sm border-r border-gray-200 z-40 transition-transform duration-300 rounded-lg lg:translate-x-0 w-60 flex flex-col`}
        style={{ position: "fixed", top: 88, left: 35 }}
      >
        {/* Guide Info Card */}
        <GuideInfoCard
          guideData={mockGuide}
          onClick={() => setShowProfileModal(true)}
        />

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-3">
          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-6 py-2 transition-all border-l-4 ${
                    active
                      ? "border-[#02A0AA] bg-[#f0fdfd] text-[#02A0AA] font-medium"
                      : "border-transparent text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  <span className="text-[13px]">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-red-600 text-white rounded-full px-2 animate-bounce">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Profile Modal */}
      <GuideProfileModal
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profileData={mockGuide}
      />
    </>
  );
};

export default Sidebar;
