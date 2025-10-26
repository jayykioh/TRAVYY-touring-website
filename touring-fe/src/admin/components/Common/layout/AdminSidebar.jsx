import React, { useState } from 'react';
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
  Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../../../auth/AuthContext";

export default function AdminSidebar({ isOpen, setIsOpen, activePage }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/admin/dashboard' 
    },
    { 
      id: 'tours', 
      label: 'Tour Management', 
      icon: MapPin, 
      path: '/admin/tours' 
    },
    { 
      id: 'guides', 
      label: 'Guide Management', 
      icon: UserCheck, 
      path: '/admin/guides',
      subItems: [
        { id: 'all-guides', label: 'All Guides', path: '/admin/guides' },
        { id: 'hidden-guides', label: 'Hidden Guides', path: '/admin/guides/hidden' },
        { id: 'sync-agency', label: 'Sync from Agency', path: '/admin/guides/sync' },
        { id: 'guide-accounts', label: 'Guide Accounts', path: '/admin/guides/accounts' }
      ]
    },
    { 
      id: 'customers', 
      label: 'Customer Management', 
      icon: Users, 
      path: '/admin/customers',
      subItems: [
        { id: 'customer-accounts', label: 'Customer Accounts', path: '/admin/customers/accounts' },
        { id: 'customer-requests', label: 'Customer Requests', path: '/admin/customer-requests' }
      ]
    },
    { 
      id: 'api', 
      label: 'Agency API Data', 
      icon: Database, 
      path: '/admin/api' 
    },
    { 
      id: 'promotions', 
      label: 'Promotions', 
      icon: Tag, 
      path: '/admin/promotions' 
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: FileText, 
      path: '/admin/reports' 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      path: '/admin/settings' 
    }
  ];

  const adminData = user || {
    name: 'Melissa Peters',
    email: 'admin@travyy.com',
    adminRole: 'Super Admin',
    avatar: 'https://ui-avatars.com/api/?name=Melissa+Peters&background=3B82F6&color=fff'
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
    navigate('/');
  };

  return (
    <>
      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-screen bg-white border-r border-gray-200 z-40 transition-transform duration-300 rounded-lg ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-60 flex flex-col`}
        style={{ position: "fixed", top: 88, left: 45 }}
      >
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedMenu === item.id;

              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      if (hasSubItems) {
                        toggleSubmenu(item.id);
                      } else {
                        handleNavigate(item.path);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-6 py-2 transition-all border-l-4 ${
                      isActive
                        ? 'border-teal-500 bg-teal-50 text-teal-600 font-medium'
                        : 'border-transparent text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-teal-600' : 'text-gray-500'
                        }`}
                      />
                      <span
                        className={`text-[13px] transition-transform duration-200 ${
                          isActive
                            ? 'text-teal-600 scale-105'
                            : 'group-hover:scale-105 group-hover:text-blue-500'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {hasSubItems && (
                      isExpanded ? (
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      )
                    )}
                  </button>

                  {/* Sub Items */}
                  {hasSubItems && isExpanded && (
                    <div className="ml-8 space-y-0.5">
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => handleNavigate(subItem.path)}
                          className="w-full text-left px-6 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                        >
                          {subItem.label}
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
        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <img
                src={adminData.avatar}
                alt={adminData.name}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              {isOpen && (
                <>
                  <div className="ml-3 flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{adminData.name}</p>
                    <p className="text-xs text-gray-500 truncate">{adminData.adminRole || adminData.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
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
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button 
                    onClick={() => {
                      setProfileOpen(false);
                      handleNavigate('/admin/settings');
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Profile
                  </button>
                  <button 
                    onClick={() => {
                      setProfileOpen(false);
                      handleNavigate('/admin/settings');
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </button>
                  <div className="border-t border-gray-200"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
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