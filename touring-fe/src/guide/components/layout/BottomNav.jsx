import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../../lib/utils";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/guide", icon: "🏠", label: "Home", exact: true },
    { path: "/guide/requests", icon: "📬", label: "Requests", badge: 4 },
    { path: "/guide/tours", icon: "📆", label: "Tours" },
    { path: "/guide/earnings", icon: "💰", label: "Earnings" },
    { path: "/guide/profile", icon: "👤", label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 md:hidden z-40">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg min-w-[60px] relative",
                isActive ? "text-emerald-600" : "text-gray-500"
              )}
            >
              <span className="text-2xl relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive && "font-bold"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-600 rounded-full" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
