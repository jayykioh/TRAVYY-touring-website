import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/context";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const bellRef = useRef(null);

  // Kiểm tra xem user đã từng mở thông báo chưa
  const [hasViewed, setHasViewed] = useState(
    localStorage.getItem("hasViewedGuideNotifications") === "true"
  );

  const { withAuth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      try {
        const data = await withAuth("/api/notify/my");
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        } else if (Array.isArray(data)) {
          setNotifications(data);
        } else {
          setNotifications([]);
        }
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, [withAuth]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const showBadge = unreadCount > 0 && !hasViewed;
  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = () => {
    localStorage.setItem("hasViewedGuideNotifications", "true");
    setHasViewed(true);
    setIsOpen(false);
    navigate("/guide/notifications");
  };

  useEffect(() => {
    if (unreadCount > 0) {
      setHasViewed(false);
      localStorage.setItem("hasViewedGuideNotifications", "false");
    }
  }, [unreadCount]);

  // Xử lý click ngoài dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={bellRef}>
      {/* Nút chuông */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white rounded-full text-gray-700 hover:text-black hover:bg-gray-100 shadow transition-colors flex items-center justify-center"
      >
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {showBadge && (
          <>
            <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white animate-ping" />
            <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white" />
          </>
        )}
      </button>

      {/* Dropdown danh sách thông báo */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-20 max-h-[500px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Thông báo</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-[#02A0AA] font-medium">
                {unreadCount} mới
              </span>
            )}
          </div>

          {/* Danh sách thông báo */}
          <div className="overflow-y-auto flex-1">
            {recentNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notif.read ? "bg-[#f0fdfd]" : ""
                }`}
                onClick={handleNotificationClick}
              >
                <div className="flex gap-3">
                  <span className="text-2xl">{notif.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.timestamp).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 bg-[#02A0AA] rounded-full mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200">
            <button
              onClick={handleNotificationClick}
              className="w-full text-center text-sm font-medium text-[#02A0AA] hover:text-[#018f95]"
            >
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
