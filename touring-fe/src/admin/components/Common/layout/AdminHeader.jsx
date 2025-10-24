import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from "../../../context/AdminAuthContext";

export default function AdminHeader() {
  const navigate = useNavigate();
  const { admin: user, logout } = useAdminAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const notifications = [
    {
      id: 1,
      type: "booking",
      title: "Booking mới",
      message: "Tour Đà Nẵng - Hội An có booking mới",
      time: "5 phút trước",
      read: false,
    },
    {
      id: 2,
      type: "guide",
      title: "HDV mới đăng ký",
      message: "Trần Thị B đã đăng ký làm hướng dẫn viên",
      time: "15 phút trước",
      read: false,
    },
    {
      id: 3,
      type: "review",
      title: "Đánh giá mới",
      message: "Tour Sapa nhận được đánh giá 5 sao",
      time: "1 giờ trước",
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout();
      navigate('/admin/login');
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/70 backdrop-blur-xl shadow-lg border-b border-gray-200/30"
          : "bg-white/40 backdrop-blur-md"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-1">
        {/* Left Section (Logo) */}
        <div className="flex items-center gap-4 px-10">
          <div className="flex items-center gap-2">
            <div className="w-14 h-14 overflow-hidden flex items-center justify-center">
              <span className="text-2xl font-bold text-teal-500">Travyy</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-gray-500 font-semibold tracking-wide">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* Right Section (Search + Icons) */}
        <div className="flex items-center gap-6 px-10">
          
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Tìm kiếm tours, HDV..."
              className="w-64 lg:w-80 pl-4 pr-10 py-2 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm transition-all"
            />
            <button className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-teal-400 hover:bg-teal-500 rounded-full flex items-center justify-center transition-colors">
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Icons Group */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900">Thông báo</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full font-medium">
                          {unreadCount} mới
                        </span>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notif.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-1.5 ${
                                !notif.read ? "bg-blue-600" : "bg-gray-300"
                              }`}
                            ></div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-gray-900 mb-1">
                                {notif.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-1">
                                {notif.message}
                              </p>
                              <span className="text-xs text-gray-500">
                                {notif.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-200 text-center">
                      <button
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        onClick={() => {
                          setShowNotifications(false);
                          navigate("/admin/notifications");
                        }}
                      >
                        Xem tất cả thông báo
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <img
                  src={
                    user?.avatar ||
                    "https://ui-avatars.com/api/?name=Admin&background=3B82F6&color=fff"
                  }
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.adminRole || user?.role || "admin"}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-700" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                      <img
                        src={
                          user?.avatar ||
                          "https://ui-avatars.com/api/?name=Admin&background=3B82F6&color=fff"
                        }
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {user?.name || "Admin"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user?.email || "admin@travyy.com"}
                        </p>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate("/admin/settings");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">Thông tin cá nhân</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate("/admin/settings");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Cài đặt</span>
                      </button>
                    </div>
                    <div className="p-2 border-t border-gray-200">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}