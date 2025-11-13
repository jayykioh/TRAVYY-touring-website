import React, { useState } from "react";
import {
  LayoutDashboard,
  MapPin,
  UserCheck,
  Database,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Users,
  LogOut,
  Tag,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../../context/AdminAuthContext";

export default function AdminSidebar({ isOpen, setIsOpen, activePage }) {
  const navigate = useNavigate();
  const { admin: user, logout } = useAdminAuth();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

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
      path: "/admin/customers",
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

  const adminData = user || {
    name: "Melissa Peters",
    email: "admin@travyy.com",
    adminRole: "Super Admin",
    avatar:
      "https://ui-avatars.com/api/?name=Melissa+Peters&background=3B82F6&color=fff",
  };

  const toggleSubmenu = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/");
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
              const isActive = activePage === item.id;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedMenu === item.id;

              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => {
                      if (hasSubItems) {
                        toggleSubmenu(item.id);
                      } else {
                        handleNavigate(item.path);
                      }
                    }}
                    className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-[#007980] to-[#005f65] text-white shadow-lg shadow-[#007980]/30 scale-[1.02]"
                        : "text-gray-700 hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
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
                    {hasSubItems &&
                      (isExpanded ? (
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
                      ))}
                  </button>

                  {/* Sub Items */}
                  {hasSubItems && isExpanded && (
                    <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-200 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => handleNavigate(subItem.path)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:text-[#007980] hover:bg-[#007980]/10 rounded-lg transition-all duration-150 hover:translate-x-1"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 group-hover:bg-[#007980]"></span>
                            {subItem.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-200/80 bg-white/50 backdrop-blur-sm">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-[#007980]/10 hover:to-[#005f65]/10 rounded-xl transition-all duration-200 group"
            >
              <div className="relative">
                <img
                  src={adminData.avatar}
                  alt={adminData.name}
                  className="w-11 h-11 rounded-full ring-2 ring-gray-200 group-hover:ring-[#007980] transition-all duration-200"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              {isOpen && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#007980] transition-colors">
                      {adminData.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#007980]"></span>
                      {adminData.adminRole || adminData.role}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </>
              )}
            </button>

            {/* Profile Dropdown */}
            {profileOpen && isOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                ></div>
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleNavigate("/admin/settings");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#007980]/10 hover:to-[#005f65]/10 hover:text-[#007980] transition-all duration-150"
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-medium">Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleNavigate("/admin/settings");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#007980]/10 hover:to-[#005f65]/10 hover:text-[#007980] transition-all duration-150"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="font-medium">Settings</span>
                  </button>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-150 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
