import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Settings,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../../../auth/AuthContext";

export default function AdminHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll effect
  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const notifications = [
    {
      id: 1,
      type: 'booking',
      title: 'Booking mới',
      message: 'Tour Đà Nẵng - Hội An có booking mới',
      time: '5 phút trước',
      read: false
    },
    {
      id: 2,
      type: 'guide',
      title: 'HDV mới đăng ký',
      message: 'Trần Thị B đã đăng ký làm hướng dẫn viên',
      time: '15 phút trước',
      read: false
    },
    {
      id: 3,
      type: 'review',
      title: 'Đánh giá mới',
      message: 'Tour Sapa nhận được đánh giá 5 sao',
      time: '1 giờ trước',
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className={`h-16 flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-300 ${
      isScrolled
        ? "bg-white/15 backdrop-blur-xl border-b border-white/20 shadow-lg"
        : "bg-white border-b border-gray-200"
    }`}>
      <div className="flex items-center flex-1 gap-6">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-bold text-teal-500">Travyy</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm tours, hướng dẫn viên, khách hàng..."
              className="w-full pl-4 pr-10 py-2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
            />
            <button className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-teal-400 hover:bg-teal-500 rounded-full flex items-center justify-center transition-colors">
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4 ml-6">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-white/20 rounded-lg transition"
          >
            <Bell className="w-5 h-5 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Thông báo</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-blue-600 font-medium">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                        !notif.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                          !notif.read ? 'bg-blue-600' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Xem tất cả thông báo
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-white/40"></div>

        {/* Admin Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 hover:bg-white/20 rounded-lg p-2 transition"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || 'Melissa Peters'}
              </p>
              <p className="text-xs text-gray-600">
                {user?.adminRole || user?.role || 'admin'}
              </p>
            </div>
            <img
              src={user?.avatar || 'https://ui-avatars.com/api/?name=Melissa+Peters&background=3B82F6&color=fff'}
              alt="Admin"
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            />
            <ChevronDown className="w-4 h-4 text-gray-700" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowProfileMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.email || 'admin@travyy.com'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {user?.id || '1'}
                  </p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/admin/settings');
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Thông tin cá nhân
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/admin/settings');
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Cài đặt
                  </button>
                </div>
                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}