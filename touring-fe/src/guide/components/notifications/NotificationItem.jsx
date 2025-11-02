import React from "react";
import Badge from "../common/Badge";

const NotificationItem = ({ notification, onClick }) => {
  const priorityColors = {
    high: "danger",
    medium: "warning",
    low: "default",
  };

  return (
    <div
      onClick={() => onClick && onClick(notification)}
      className={`flex gap-4 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
        !notification.read
          ? "bg-emerald-50 border-emerald-200"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex-shrink-0 text-3xl">{notification.icon}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-sm">
            {notification.title}
          </h3>
          <Badge variant={priorityColors[notification.priority]} size="sm">
            {notification.priority}
          </Badge>
        </div>

        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {notification.message}
        </p>

        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-400">
            {new Date(notification.timestamp).toLocaleString("vi-VN")}
          </p>
          {!notification.read && (
            <Badge variant="success" size="sm">
              New
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
