import React, { useEffect, useState } from "react";
import NotificationList from "../components/notifications/NotificationList";
import { useAuth } from "../../auth/context";

const NotificationsPage = () => {
  const { withAuth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true);
        setError(null);
  const data = await withAuth("/api/notify/my");
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        } else {
          setError(data.message || "Không thể lấy thông báo");
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, [withAuth]);

  const handleNotificationClick = (notification) => {
    // TODO: Đánh dấu đã đọc, điều hướng chi tiết nếu cần
    console.log("Clicked notification:", notification);
  };

  if (loading) return <div className="p-6">Đang tải thông báo...</div>;
  if (error) return <div className="p-6 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông báo</h1>
        <p className="text-gray-500">
          {unreadCount > 0
            ? `Bạn có ${unreadCount} thông báo chưa đọc`
            : "Không còn thông báo mới"}
        </p>
      </div>
      <NotificationList
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  );
};

export default NotificationsPage;
