import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../../auth/context"; // ✅ thêm dòng này

const BottomNav = () => {
  const { withAuth } = useAuth(); // ✅ dùng để gọi API
  const [unreadRequests, setUnreadRequests] = useState(0);
  const [requestIds, setRequestIds] = useState([]);

  // ✅ Gọi API để lấy danh sách request và tính số chưa xem
  useEffect(() => {
    async function fetchRequests() {
      try {
        const data = await withAuth("/api/itinerary/guide/requests");
        if (data && data.success && Array.isArray(data.requests)) {
          const ids = data.requests.map((r) => r._id || r.id);
          setRequestIds(ids);

          const viewed = JSON.parse(
            localStorage.getItem("viewedGuideRequests") || "[]"
          );
          const unseen = ids.filter((id) => !viewed.includes(id));
          setUnreadRequests(unseen.length);
        } else {
          setRequestIds([]);
          setUnreadRequests(0);
        }
      } catch {
        setRequestIds([]);
        setUnreadRequests(0);
      }
    }

    fetchRequests();
  }, [withAuth]);

  // ✅ Lắng nghe sự thay đổi localStorage (đồng bộ khi người dùng xem Requests)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const viewed = JSON.parse(
          localStorage.getItem("viewedGuideRequests") || "[]"
        );
        const unseen = requestIds.filter((id) => !viewed.includes(id));
        setUnreadRequests(unseen.length);
      } catch {
        setUnreadRequests(0);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [requestIds]);

  const menuItems = [
    {
      path: "/guide",
      icon: (
        <svg
          className="w-6 h-6"
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
          className="w-6 h-6"
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
      badge: unreadRequests > 0 ? unreadRequests : null, // ✅ cập nhật từ API
    },
    {
      path: "/guide/tours",
      icon: (
        <svg
          className="w-6 h-6"
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
      label: "Tours",
    },
    {
      path: "/guide/earnings",
      icon: (
        <svg
          className="w-6 h-6"
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
          className="w-6 h-6"
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

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl z-50">
      <div className="flex items-center justify-around px-2 py-2 safe-bottom">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 bg-[#02A0AA]/10 rounded-xl"
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.6,
                    }}
                  />
                )}

                <div className="relative z-10">
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`${
                      isActive ? "text-[#02A0AA]" : "text-gray-500"
                    } transition-colors duration-200`}
                  >
                    {item.icon}
                  </motion.div>

                  {item.badge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </div>

                <span
                  className={`text-[10px] font-medium z-10 ${
                    isActive ? "text-[#02A0AA] font-semibold" : "text-gray-600"
                  } transition-colors duration-200`}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
