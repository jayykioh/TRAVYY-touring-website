// src/components/NotificationList.jsx
import React from "react";
import NotificationItem from "./NotificationItem";

const NotificationList = ({ notifications, onNotificationClick }) => {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3zM12 4c4.418 0 8 3.582 8 8 0 3.99-2.68 7.396-6.438 8.34A5.995 5.995 0 0112 18a5.995 5.995 0 01-3.562-1.66C6.68 19.396 4 15.99 4 12c0-4.418 3.582-8 8-8z"
            />
          </svg>
          <p className="text-gray-500 mb-2">No notifications</p>
          <p className="text-sm text-gray-400">You're all caught up!</p>
        </div>
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
