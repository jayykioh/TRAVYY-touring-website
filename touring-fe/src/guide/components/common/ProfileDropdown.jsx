import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/context";
import { getGuideProfile } from "../../data/guideAPI";
import { User, Calendar, LogOut, Award } from "lucide-react";
import logger from '@/utils/logger';

const ProfileDropdown = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [guideProfile, setGuideProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const dropdownRef = useRef(null);

  // Fetch guide profile when dropdown opens
  useEffect(() => {
    if (showProfile && !guideProfile && !loading) {
      fetchGuideProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showProfile]);

  const fetchGuideProfile = async () => {
    try {
      setLoading(true);
      const data = await getGuideProfile();
      logger.debug("🔍 [ProfileDropdown] Fetched guide profile:", data);

      // Backend returns { success: true, ...guide } not { success: true, guide: {...} }
      if (data.success !== false) {
        setGuideProfile(data);
      }
    } catch (error) {
      logger.error("Failed to fetch guide profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý click ngoài dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Display data priority: guideProfile > user
  // const displayName = guideProfile?.name || user?.name || "Guide";
  // const displayAvatar =
  //   guideProfile?.avatar ||
  //   user?.avatar?.url ||
  //   user?.avatar ||
  //   "/default-avatar.png";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút User */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setShowProfile(!showProfile);
        }}
        className="p-3 bg-white rounded-full text-gray-700 hover:text-black hover:bg-gray-100 shadow transition-colors flex items-center justify-center"
      >
        <User size={25} />
      </a>

      {/* Dropdown Menu */}
      {showProfile && (
        <div className="absolute right-0 mt-2 w-50 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          {/* Các nút điều hướng */}
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
          </div>

          {/* Đăng xuất */}
          <div className="p-2 border-t border-gray-200">
            <button
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              onClick={async () => {
                await logout();
                setShowProfile(false);
                navigate("/login");
              }}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
