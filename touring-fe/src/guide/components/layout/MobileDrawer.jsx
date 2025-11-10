import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, Home, Calendar, DollarSign, User, X } from "lucide-react";
import { useAuth } from "../../../auth/context";

const MobileDrawer = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  const menuItems = [
    { path: "/guide", label: "Home", Icon: Home },
    { path: "/guide/requests", label: "Requests", Icon: Inbox },
    { path: "/guide/tours", label: "My Tours", Icon: Calendar },
    { path: "/guide/earnings", label: "Earnings", Icon: DollarSign },
    { path: "/guide/profile", label: "Profile", Icon: User },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex md:hidden"
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-72 max-w-full bg-white h-full shadow-2xl p-4 overflow-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={
                    user?.avatar?.url || user?.avatar || "/default-avatar.png"
                  }
                  alt={user?.name || "Guide"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {user?.name || "Guide"}
                  </div>
                  <div className="text-xs text-gray-500">Tour Guide</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-2">
              {menuItems.map((m) => (
                <NavLink
                  to={m.path}
                  key={m.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors ${
                      isActive
                        ? "bg-[#f0fdfd] text-[#02A0AA] font-medium"
                        : "text-gray-700"
                    }`
                  }
                >
                  <m.Icon className="w-5 h-5" />
                  <span className="text-sm">{m.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <NavLink
                to="/guide/profile"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">Hồ sơ</span>
              </NavLink>
            </div>
          </motion.div>

          <div className="flex-1" onClick={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
