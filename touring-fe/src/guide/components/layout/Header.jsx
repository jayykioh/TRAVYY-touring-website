import React, { useState, useEffect } from "react";
import NotificationBell from "../notifications/NotificationBell";
import ProfileMenu from "./ProfileMenu";
import { Menu } from "lucide-react";

const Header = ({ title = "", subtitle = "", onMenuClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);

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

          {/* Profile Menu Component */}
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
