import React from "react";
import NotificationList from "../components/notifications/NotificationList";
import { mockNotifications } from "../data/mockNotifications";

const NotificationsPage = () => {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification) => {
    console.log("Clicked notification:", notification);
    // Ứng dụng thật: đánh dấu đã đọc, điều hướng đến chi tiết
  };

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

      {/* Danh sách thông báo */}
      <NotificationList
        notifications={mockNotifications}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  );
};

export default NotificationsPage;
