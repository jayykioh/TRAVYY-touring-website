// hooks/useNotifications.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/context';
import { toast } from 'sonner';

export function useNotifications() {
  const { user, withAuth } = useAuth() || {};
  const token = user?.token;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

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
      console.error('[Notifications] Fetch error:', error);
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
      console.error('[Notifications] Mark as read error:', error);
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
      console.error('[Notifications] Mark all as read error:', error);
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
      console.error('[Notifications] Delete error:', error);
      toast.error('Không thể xóa thông báo');
    }
  }, [token, withAuth, notifications]);

  // Fetch notifications on mount and when token changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Optional: Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [token, fetchNotifications]);

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
