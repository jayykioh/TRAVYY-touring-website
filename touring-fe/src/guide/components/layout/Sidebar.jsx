import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Award } from "lucide-react";
import { mockGuide } from "../../data/mockGuide";
import { mockRequests } from "../../data/mockRequests";
import GuideProfileModal from "./GuideProfileModal";

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

  // 🧭 Menu
  const menuItems = [
    { path: "/guide", icon: "🏠", label: "Home", exact: true },
    {
      path: "/guide/requests",
      icon: "📬",
      label: "Requests",
      badge: unreadRequests > 0 ? unreadRequests : null,
    },
    { path: "/guide/tours", icon: "📆", label: "My Tours" },
    { path: "/guide/earnings", icon: "💰", label: "Earnings" },
    { path: "/guide/profile", icon: "👤", label: "Profile" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside
        className={`fixed lg:relative top-0 left-0 bg-white shadow-sm border-r border-gray-200 z-40 transition-transform duration-300 rounded-lg lg:translate-x-0 w-60 flex flex-col`}
        style={{ position: "fixed", top: 88, left: 35 }}
      >
        {/* Guide Info */}
        <div
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setShowProfileModal(true)}
        >
          <div className="flex justify-center mb-2">
            <div className="relative">
              <img
                src={mockGuide.avatar}
                alt={mockGuide.name}
                className="w-14 h-14 rounded-full border-2 border-[#02A0AA]"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#02A0AA] rounded-full flex items-center justify-center border-2 border-white">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="text-center mb-2">
            <h3 className="text-base font-semibold text-gray-900 mb-0.5">
              {mockGuide.name}
            </h3>
            <p className="text-xs text-gray-500 mb-2 flex items-center justify-center gap-1">
              <Award className="w-3 h-3" />
              Tour Guide
            </p>
          </div>

          <div className="grid grid-cols-3 gap-1 text-center">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {mockGuide.totalTours}
              </div>
              <div className="text-xs text-gray-500">Tours</div>
            </div>
            <div className="border-l border-r border-gray-200">
              <div className="text-sm font-semibold text-gray-900">
                {mockGuide.rating}★
              </div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {mockGuide.experience}
              </div>
              <div className="text-xs text-gray-500 leading-tight">Exp</div>
            </div>
          </div>
        </div>

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
                  <span className="text-lg">{item.icon}</span>
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
