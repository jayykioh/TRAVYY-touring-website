import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  UserCheck, 
  MessageSquare, 
  FileCheck, 
  Database, 
  FileText, 
  Settings, 
  Menu, 
  X,
  ChevronDown,
  ChevronRight,
  Users,
  LogOut
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
        { id: 'all-guides', label: 'All guide', path: '/admin/guides' },
        { id: 'check-compatibility', label: 'Check Compatibility', path: '/admin/guides/compatibility' }
      ]
    },
    { 
      id: 'customers', 
      label: 'Customer Requests', 
      icon: MessageSquare, 
      path: '/admin/customers' 
    },
    { 
      id: 'certification', 
      label: 'Certification', 
      icon: FileCheck, 
      path: '/admin/certification' 
    },
    { 
      id: 'api', 
      label: 'Agency API Data', 
      icon: Database, 
      path: '/admin/api' 
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
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
      navigate('/admin/login');
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen
        bg-white border-r border-gray-200
        transition-all duration-300 z-50
        ${isOpen ? 'w-64' : 'w-0 lg:w-20'}
        flex flex-col
      `}>
        {/* Logo & Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {isOpen && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Travyy</span>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                      if (!isOpen) setIsOpen(true);
                    } else {
                      handleNavigate(item.path);
                    }
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  title={!isOpen ? item.label : ''}
                >
                  <div className="flex items-center min-w-0">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    {isOpen && (
                      <span className={`ml-3 text-sm font-medium truncate ${isActive ? 'text-blue-600' : ''}`}>
                        {item.label}
                      </span>
                    )}
                  </div>
                  {isOpen && hasSubItems && (
                    isExpanded ? (
                      <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 flex-shrink-0 ml-2" />
                    )
                  )}
                </button>

                {/* Sub Items */}
                {isOpen && hasSubItems && isExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleNavigate(subItem.path)}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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