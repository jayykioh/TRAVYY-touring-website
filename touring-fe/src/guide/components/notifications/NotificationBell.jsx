import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockNotifications } from "../../data/mockNotifications";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [showBadge, setShowBadge] = useState(() => {
    return localStorage.getItem("hasViewedGuideNotifications") !== "true";
  });

  const unreadCount = mockNotifications.filter((n) => !n.read).length;
  const recentNotifications = mockNotifications.slice(0, 5);

  const handleNotificationClick = () => {
    setIsOpen(false);
    localStorage.setItem("hasViewedGuideNotifications", "true");
    setShowBadge(false);
    navigate("/guide/notifications");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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

        {showBadge && unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
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

            {/* Notifications List */}
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
        </>
      )}
    </div>
  );
};

export default NotificationBell;
