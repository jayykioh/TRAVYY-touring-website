import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../../context/AdminAuthContext";

export default function AdminHeader({ toggleSidebar, isSidebarOpen }) {
  const navigate = useNavigate();
  const { admin: user, logout } = useAdminAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
      navigate("/admin/login");
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full h-16 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200"
          : "bg-white border-b border-gray-100"
      }`}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left Section - Mobile Menu + Logo */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            {isSidebarOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-[#007980] to-[#005f65] rounded-xl flex items-center justify-center shadow-lg shadow-[#007980]/30">
              <span className="text-lg md:text-xl font-bold text-white">T</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base md:text-lg font-bold bg-gradient-to-r from-[#007980] to-[#005f65] bg-clip-text text-transparent">
                Travyy Admin
              </h1>
              <p className="text-xs text-gray-500 font-medium hidden md:block">
                Management Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Search + Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Desktop Search Bar */}
          <div className="relative hidden lg:block">
            <input
              type="text"
              placeholder="Search tours, guides, customers..."
              className="w-64 xl:w-96 pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007980] focus:border-transparent focus:bg-white text-sm transition-all placeholder:text-gray-400"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {/* Mobile Search Button */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Icons Group */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 md:p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
              >
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-[#007980] transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[18px] md:min-w-[20px] h-4 md:h-5 px-1 md:px-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] md:text-xs rounded-full flex items-center justify-center font-semibold shadow-lg shadow-red-500/30 animate-pulse">
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
                  <div className="absolute right-0 mt-2 w-[90vw] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="p-3 md:p-4 bg-gradient-to-r from-[#007980] to-[#005f65] flex justify-between items-center">
                      <h3 className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
                        <Bell className="w-4 h-4 md:w-5 md:h-5" />
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-[60vh] md:max-h-96 overflow-y-auto divide-y divide-gray-100">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 md:p-4 hover:bg-gradient-to-r hover:from-[#007980]/10 hover:to-[#005f65]/10 cursor-pointer transition-all duration-200 ${
                            !notif.read ? "bg-[#007980]/5" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2 md:gap-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-1.5 md:mt-2 ring-4 ${
                                !notif.read
                                  ? "bg-[#007980] ring-[#007980]/20"
                                  : "bg-gray-300 ring-gray-100"
                              }`}
                            ></div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-xs md:text-sm text-gray-900 mb-1">
                                {notif.title}
                              </h4>
                              <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">
                                {notif.message}
                              </p>
                              <span className="text-[10px] md:text-xs text-gray-500 font-medium">
                                {notif.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-200 text-center">
                      <button
                        className="text-sm text-[#007980] hover:text-[#005f65] font-medium"
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
                className="flex items-center gap-2 md:gap-3 p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <img
                  src={
                    user?.avatar ||
                    "https://ui-avatars.com/api/?name=Admin&background=3B82F6&color=fff"
                  }
                  alt="Profile"
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover ring-2 ring-gray-100"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.adminRole || user?.role || "admin"}
                  </p>
                </div>
                <ChevronDown className="hidden md:block w-4 h-4 text-gray-700" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-[90vw] sm:w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
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

      {/* Mobile Search Modal */}
      {showMobileSearch && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200">
          <div className="bg-white p-4 shadow-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tours, guides, customers..."
                autoFocus
                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007980] focus:border-transparent text-sm"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setShowMobileSearch(false)}
          />
        </div>
      )}
    </header>
  );
}
