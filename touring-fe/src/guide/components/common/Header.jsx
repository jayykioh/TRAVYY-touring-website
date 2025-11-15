// src/components/guide/Header.jsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom"; // ⟵ THÊM DÒNG NÀY
import NotificationBell from "../notifications/NotificationBell";
import HeaderNav from "./HeaderNav";
import ProfileDropdown from "./ProfileDropdown";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 bg-[#f8f9fa] transition-all duration-300 ${
        isScrolled
          ? "bg-white/70 backdrop-blur-xl shadow-lg border-b border-gray-200/30"
          : "bg-white/40 backdrop-blur-md"
      }`}
    >
      <div className="flex items-center bg-[#f8f9fa] justify-between px-6 py-1">
        {/* Left Section (Logo) */}
        <div className="flex items-center gap-2 ml-5">
          <NavLink to="/guide" aria-label="Về trang Home" className="block">
            <div className="w-18 h-18 overflow-hidden flex items-center justify-center cursor-pointer">
              <img
                src="/logo.png"
                alt="Logo"
                className="object-contain w-full h-full"
              />
            </div>
          </NavLink>
          <div className="hidden sm:block">
            <p className="text-xs text-gray-500 font-semibold tracking-wide">
              Local Guide
            </p>
          </div>
        </div>

        {/* Middle Section */}
        <div>
          <HeaderNav />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 mr-5">
          <NotificationBell />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
