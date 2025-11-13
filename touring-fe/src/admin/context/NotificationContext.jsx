// context/NotificationContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import toast, { Toaster } from "react-hot-toast";

const NotificationContext = createContext();

// Notification types with icons and colors
const NOTIFICATION_TYPES = {
  booking: { icon: "📅", color: "#007980", bgColor: "#e6f7f7" },
  tour: { icon: "🏖️", color: "#10b981", bgColor: "#d1fae5" },
  guide: { icon: "👤", color: "#f59e0b", bgColor: "#fef3c7" },
  review: { icon: "⭐", color: "#8b5cf6", bgColor: "#ede9fe" },
  payment: { icon: "💳", color: "#3b82f6", bgColor: "#dbeafe" },
  promotion: { icon: "🎁", color: "#ec4899", bgColor: "#fce7f3" },
  user: { icon: "👥", color: "#6366f1", bgColor: "#e0e7ff" },
  system: { icon: "⚙️", color: "#64748b", bgColor: "#f1f5f9" },
  success: { icon: "✅", color: "#22c55e", bgColor: "#dcfce7" },
  error: { icon: "❌", color: "#ef4444", bgColor: "#fee2e2" },
  warning: { icon: "⚠️", color: "#f59e0b", bgColor: "#fef3c7" },
  info: { icon: "ℹ️", color: "#3b82f6", bgColor: "#dbeafe" },
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    {
      id: Date.now() + 1,
      type: "info",
      title: "Chào mừng quay trở lại!",
      message: "Hệ thống đang hoạt động bình thường",
      time: new Date().toISOString(),
      read: true,
    },
  ]);

  // Add new notification
  const addNotification = useCallback((notification) => {
    const newNotif = {
      id: Date.now(),
      time: new Date().toISOString(),
      read: false,
      ...notification,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Show toast for real-time feedback
    const type =
      NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.info;

    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white shadow-xl rounded-xl pointer-events-auto flex ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl`}
          style={{
            borderLeft: `4px solid ${type.color}`,
          }}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-sm"
                style={{ backgroundColor: type.bgColor }}
              >
                {type.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {notification.title}
                </p>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  {new Date().toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: "top-right",
      }
    );

    return newNotif.id;
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  }, []);

  // Delete notification
  const deleteNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Notification shortcuts for common actions
  const notify = {
    success: (title, message) =>
      addNotification({ type: "success", title, message }),
    error: (title, message) =>
      addNotification({ type: "error", title, message }),
    warning: (title, message) =>
      addNotification({ type: "warning", title, message }),
    info: (title, message) => addNotification({ type: "info", title, message }),
    booking: (title, message) =>
      addNotification({ type: "booking", title, message }),
    tour: (title, message) => addNotification({ type: "tour", title, message }),
    guide: (title, message) =>
      addNotification({ type: "guide", title, message }),
    review: (title, message) =>
      addNotification({ type: "review", title, message }),
    payment: (title, message) =>
      addNotification({ type: "payment", title, message }),
    promotion: (title, message) =>
      addNotification({ type: "promotion", title, message }),
    user: (title, message) => addNotification({ type: "user", title, message }),
    system: (title, message) =>
      addNotification({ type: "system", title, message }),
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    notify,
    NOTIFICATION_TYPES,
  };

  return (
    <NotificationContext.Provider value={value}>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "shadow-2xl",
          style: {
            padding: 0,
            background: "transparent",
            boxShadow: "none",
          },
        }}
      />
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};

export default NotificationContext;
