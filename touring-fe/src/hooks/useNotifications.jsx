// hooks/useNotifications.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/context';
import { toast } from 'sonner';
import { useSocket } from '../context/SocketContext';
import logger from '@/utils/logger';

export function useNotifications() {
  const { user, withAuth } = useAuth() || {};
  const token = user?.token;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const { joinRoom, leaveRoom, on } = useSocket() || {};

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await withAuth('/api/notifications', {
        method: 'GET',
      });

      setNotifications(response?.notifications || []);
      setUnreadCount(response?.unreadCount || 0);
    } catch (error) {
      logger.error('[Notifications] Fetch error:', error);
      if (error?.status !== 401) {
        toast.error('Không thể tải thông báo');
      }
    } finally {
      setLoading(false);
    }
  }, [token, withAuth]);

  // Mark specific notifications as read
  const markAsRead = useCallback(async (notificationIds) => {
    if (!token || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return;
    }

    try {
      await withAuth('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notificationIds.includes(notif._id)
            ? { ...notif, status: 'read', readAt: new Date() }
            : notif
        )
      );

      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (error) {
      logger.error('[Notifications] Mark as read error:', error);
      toast.error('Không thể đánh dấu đã đọc');
    }
  }, [token, withAuth]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      await withAuth('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, status: 'read', readAt: new Date() }))
      );

      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      logger.error('[Notifications] Mark all as read error:', error);
      toast.error('Không thể đánh dấu tất cả đã đọc');
    }
  }, [token, withAuth]);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!token || !notificationId) return;

    try {
      await withAuth(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      // Update local state
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));

      // Update unread count if deleted notification was unread
      const deletedNotif = notifications.find(n => n._id === notificationId);
      if (deletedNotif?.status !== 'read') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      toast.success('Đã xóa thông báo');
    } catch (error) {
      logger.error('[Notifications] Delete error:', error);
      toast.error('Không thể xóa thông báo');
    }
  }, [token, withAuth, notifications]);

  // Fetch notifications on mount and when token changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Listen for realtime notifications via socket, fallback to polling
  useEffect(() => {
    if (!token) return;

    let offCreate, offUpdate, offDelete;
    let pollInterval;

    if (joinRoom && on) {
      try {
        // join user room to receive notifications
        joinRoom(`user-${user?.id}`);

        offCreate = on('notificationCreated', (notif) => {
          // prepend new notification and increase unread
          setNotifications(prev => [notif, ...prev]);
          setUnreadCount(prev => prev + 1);
        });

        offUpdate = on('notificationUpdated', (updated) => {
          setNotifications(prev => prev.map(n => (n._id === updated._id ? updated : n)));
        });

        offDelete = on('notificationDeleted', ({ notificationId }) => {
          setNotifications(prev => prev.filter(n => n._id !== notificationId));
        });
      } catch (e) {
        logger.warn('[Notifications] socket handlers failed, falling back to polling', e?.message);
        pollInterval = setInterval(() => fetchNotifications(), 30000);
      }
    } else {
      // fallback polling
      pollInterval = setInterval(() => fetchNotifications(), 30000);
    }

    return () => {
      if (offCreate) offCreate();
      if (offUpdate) offUpdate();
      if (offDelete) offDelete();
      if (leaveRoom) leaveRoom(`user-${user?.id}`);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [token, joinRoom, on, fetchNotifications, leaveRoom, user?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications,
  };
}

export default useNotifications;
