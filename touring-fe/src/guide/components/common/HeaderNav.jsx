// src/components/guide/HeaderNav.jsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../auth/context";

const navItems = [
  { path: "/guide", label: "Home" },
  { path: "/guide/requests", label: "Requests", showBadge: true },
  { path: "/guide/tours", label: "My Tours" },
  { path: "/guide/earnings", label: "Earnings" },
  { path: "/guide/profile", label: "Profile" },
];

// Hàm factory trả className theo path + isActive
const getNavLinkClass =
  (path) =>
  ({ isActive }) => {
    const base = "text-sm font-medium pb-1";

    // HOME (/guide)
    if (path === "/guide") {
      if (isActive) {
        return `${base} text-black border-b-2 border-black`;
      }
      // Không active: vẫn chữ đen, không gạch dưới
      return `${base} text-black`;
    }

    // Các tab còn lại
    if (isActive) {
      return `${base} text-black border-b-2 border-black`;
    }

    return `${base} text-gray-600 hover:text-black`;
  };

const HeaderNav = () => {
  const { withAuth } = useAuth();
  const [unreadRequests, setUnreadRequests] = useState(0);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const data = await withAuth("/api/itinerary/guide/requests");
        if (data && data.success && Array.isArray(data.requests)) {
          const ids = data.requests.map((r) => r._id || r.id);
          const viewed = JSON.parse(
            localStorage.getItem("viewedGuideRequests") || "[]"
          );
          const unseen = ids.filter((id) => !viewed.includes(id));
          setUnreadRequests(unseen.length);
        }
      } catch {
        setUnreadRequests(0);
      }
    }

    fetchRequests();

    // Listen for storage changes
    const handleStorageChange = () => {
      fetchRequests();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [withAuth]);

  return (
    // Bọc pill + ẩn trên mobile tương tự như trước
    <div className="hidden lg:flex bg-white rounded-full shadow-xs border border-gray-100 px-15 px-6 py-3 my-3">
      <nav className="flex items-center gap-15 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/guide"} // Home chỉ active đúng /guide
            className={getNavLinkClass(item.path)}
          >
            <span className="relative">
              {item.label}
              {item.showBadge && unreadRequests > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                  !
                </span>
              )}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default HeaderNav;
