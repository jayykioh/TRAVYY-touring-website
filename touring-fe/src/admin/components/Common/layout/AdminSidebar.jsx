import React, { useState } from "react";
import {
  LayoutDashboard,
  MapPin,
  UserCheck,
  Database,
  FileText,
  Settings,
  ChevronRight,
  ChevronDown,
  Tag,
  RefreshCw,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminSidebar({ isOpen, setIsOpen, activePage }) {
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState(null);

  // Auto-expand menu if a submenu item is active
  React.useEffect(() => {
    menuItems.forEach((item) => {
      if (item.subItems?.some((sub) => activePage === sub.id)) {
        setExpandedMenu(item.id);
      }
    });
  }, [activePage]);

  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      id: "tours",
      label: "Tour Management",
      icon: MapPin,
      path: "/admin/tours",
    },
    {
      id: "guides",
      label: "Guide Management",
      icon: UserCheck,
      path: "/admin/guides",
    },
    {
      id: "customers",
      label: "Customer Management",
      icon: Users,
      path: "/admin/customers/accounts",
      subItems: [
        {
          id: "customer-accounts",
          label: "Customer Accounts",
          path: "/admin/customers/accounts",
        },
        {
          id: "customer-requests",
          label: "Customer Requests",
          path: "/admin/customer-requests",
        },
      ],
    },
    {
      id: "promotions",
      label: "Promotions",
      icon: Tag,
      path: "/admin/promotions",
    },
    {
      id: "refunds",
      label: "Refund Management",
      icon: RefreshCw,
      path: "/admin/refunds",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  const toggleSubmenu = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  return (
    <>
      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 lg:top-16 left-0 h-screen lg:h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 to-white border-r border-gray-200/80 z-50 transition-all duration-300 shadow-xl lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } w-64 sm:w-72 lg:w-64 flex flex-col`}
      >
        {/* Mobile Header - Only visible on mobile */}
        <div className="lg:hidden p-4 border-b border-gray-200 bg-gradient-to-r from-[#007980] to-[#005f65]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">T</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Travyy Admin</h2>
              <p className="text-white/80 text-xs">Management Panel</p>
            </div>
          </div>
        </div>
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              // Check if this menu or any of its subitems is active
              const isActive =
                activePage === item.id ||
                (hasSubItems &&
                  item.subItems.some((sub) => activePage === sub.id));
              const isExpanded = expandedMenu === item.id;

              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => {
                      // Luôn navigate đến path khi click vào menu item
                      if (item.path) {
                        handleNavigation(item.path);
                      }
                      // Nếu có submenu, toggle expand/collapse
                      if (hasSubItems) {
                        toggleSubmenu(item.id);
                      }
                    }}
                    className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-[#007980] to-[#005f65] text-white shadow-lg shadow-[#007980]/30 scale-[1.02]"
                        : "text-gray-700 hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Icon
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isActive
                            ? "text-white scale-110"
                            : "text-gray-500 group-hover:text-[#007980] group-hover:scale-110"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "text-white"
                            : "text-gray-700 group-hover:text-gray-900"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {hasSubItems && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSubmenu(item.id);
                        }}
                        className="p-1"
                      >
                        {isExpanded ? (
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isActive ? "text-white" : "text-gray-400"
                            }`}
                          />
                        ) : (
                          <ChevronRight
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isActive ? "text-white" : "text-gray-400"
                            }`}
                          />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Sub Items */}
                  {hasSubItems && isExpanded && (
                    <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-200 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {item.subItems.map((subItem) => {
                        const isSubItemActive = activePage === subItem.id;
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => handleNavigation(subItem.path)}
                            className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-all duration-150 hover:translate-x-1 ${
                              isSubItemActive
                                ? "bg-[#007980]/10 text-[#007980] font-semibold"
                                : "text-gray-600 hover:text-[#007980] hover:bg-[#007980]/10"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSubItemActive
                                    ? "bg-[#007980]"
                                    : "bg-gray-400"
                                }`}
                              ></span>
                              {subItem.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
