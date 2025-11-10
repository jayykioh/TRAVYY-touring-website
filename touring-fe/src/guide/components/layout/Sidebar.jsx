import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Award, Home, Inbox, Calendar, DollarSign, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../../auth/context";
import GuideProfileModal from "./GuideProfileModal";

const Sidebar = () => {
  const location = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [unreadRequests, setUnreadRequests] = useState(0);
  const [requestIds, setRequestIds] = useState([]);
  const { user, withAuth } = useAuth();

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

  useEffect(() => {
    if (location.pathname === "/guide/requests") {
      localStorage.setItem("viewedGuideRequests", JSON.stringify(requestIds));
      setUnreadRequests(0);
    }
  }, [location.pathname, requestIds]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const updated = JSON.parse(
          localStorage.getItem("viewedGuideRequests") || "[]"
        );
        const unseen = requestIds.filter((id) => !updated.includes(id));
        setUnreadRequests(unseen.length);
      } catch {
        setUnreadRequests(0);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [requestIds]);

  const menuItems = [
    { path: "/guide", label: "Home", Icon: Home },
    {
      path: "/guide/requests",
      label: "Requests",
      Icon: Inbox,
      badge: unreadRequests > 0 ? unreadRequests : null,
    },
    { path: "/guide/tours", label: "My Tours", Icon: Calendar },
    { path: "/guide/earnings", label: "Earnings", Icon: DollarSign },
    { path: "/guide/profile", label: "Profile", Icon: User },
  ];

  const isActive = (path) => location.pathname === path;
  const MotionDiv = motion.div;

  return (
    <>
      {/* ✅ Ẩn thanh trượt ngang */}
      <aside className="hidden md:block w-64 overflow-x-hidden">
        <div className="sticky top-20 px-3">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex flex-col gap-4">
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-full text-left bg-white rounded-xl p-3 hover:shadow-lg transition-shadow flex items-center gap-3"
            >
              <div className="relative">
                <img
                  src={
                    user?.avatar?.url ||
                    user?.avatar ||
                    "https://i.pravatar.cc/150?img=12"
                  }
                  alt={user?.name || "Guide"}
                  className="w-14 h-14 rounded-full border-2 border-[#02A0AA] object-cover"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#02A0AA] rounded-full flex items-center justify-center border-2 border-white">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">
                  {user?.name || "Guide"}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <Award className="w-3 h-3 text-yellow-500" />{" "}
                  <span>Tour Guide</span>
                </div>
              </div>
            </button>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="px-1 py-2 rounded-lg bg-gray-50">
                <div className="text-sm font-semibold text-gray-900">
                  {user?.totalTours ?? "--"}
                </div>
                <div className="text-xs text-gray-500">Tours</div>
              </div>
              <div className="px-1 py-2 rounded-lg bg-gray-50">
                <div className="text-sm font-semibold text-gray-900">
                  {user?.rating ?? "--"}★
                </div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
              <div className="px-1 py-2 rounded-lg bg-gray-50">
                <div className="text-sm font-semibold text-gray-900">
                  {user?.experience ?? "--"}
                </div>
                <div className="text-xs text-gray-500">Exp</div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto mt-1">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.Icon;
                  return (
                    <li key={item.path}>
                      <NavLink to={item.path} className="block">
                        <motion.div
                          whileHover={{ scale: 1.0 }}
                          whileTap={{ scale: 0.98 }}
                          className={`origin-left flex items-center gap-3 px-3 py-2 rounded-lg transition-all border-l-3 ${
                            active
                              ? "border-[#02A0AA] bg-[#f0fdfd] text-[#02A0AA] font-medium shadow"
                              : "border-transparent text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {Icon && (
                            <Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          )}
                          <span className="text-sm">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto inline-flex items-center justify-center text-[11px] px-2 py-0.5 rounded-full bg-red-600 text-white shadow-sm">
                              {item.badge}
                            </span>
                          )}
                        </motion.div>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </aside>

      <GuideProfileModal
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profileData={user}
      />
    </>
  );
};

export default Sidebar;
