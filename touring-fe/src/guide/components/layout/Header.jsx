import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../notifications/NotificationBell";
import { mockGuide } from "../../data/mockGuide";
import { Menu, User, Settings, LogOut, Calendar } from "lucide-react";

const Header = ({ title = "", subtitle = "", onMenuClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/70 backdrop-blur-xl shadow-lg border-b border-gray-200/30"
          : "bg-white/40 backdrop-blur-md"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-1">
        {/* Left Section */}
        <div className="flex items-center gap-4 px-10">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          )}

          <div className="flex items-center gap-2">
            {title ? (
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                )}
              </div>
            ) : (
              <>
                <div className="w-14 h-14 overflow-hidden flex items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="object-contain w-full h-full"
                  />
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500 font-semibold tracking-wide">
                    Local Guide
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 px-10">
          {/* Notification Bell */}
          <NotificationBell />

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img
                src={mockGuide.avatar}
                alt={mockGuide.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {mockGuide.name}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-yellow-500">⭐</span>
                  <span className="text-xs text-gray-600">
                    {mockGuide.rating}
                  </span>
                </div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfile(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                    <img
                      src={mockGuide.avatar}
                      alt={mockGuide.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {mockGuide.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-yellow-500">⭐</span>
                        <span className="text-xs font-medium text-gray-600">
                          {mockGuide.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate("/guide/profile");
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">Hồ sơ của tôi</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate("/guide/tours");
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Tour của tôi</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate("/guide/profile");
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Cài đặt</span>
                    </button>
                  </div>
                  <div className="p-2 border-t border-gray-200">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
    </header>
  );
};

export default Header;
