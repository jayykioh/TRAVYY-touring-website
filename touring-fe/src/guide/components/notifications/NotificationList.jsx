import React from "react";
import NotificationItem from "./NotificationItem";

const NotificationList = ({ notifications, onNotificationClick }) => {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-6xl mb-4">🔔</p>
        <p className="text-gray-500 mb-2">No notifications</p>
        <p className="text-sm text-gray-400">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={onNotificationClick}
        />
      ))}
    </div>
  );
};

export default NotificationList;
