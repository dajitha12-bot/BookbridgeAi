'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getNotificationsAction,
  markNotificationReadAction,
  clearAllNotificationsAction,
} from '../actions/notificationActions';

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotificationsAction();
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.notifications.filter((n: any) => !n.isRead).length);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await markNotificationReadAction(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error('Error marking notification as read:', e);
    }
  };

  const clearAll = async () => {
    try {
      const res = await clearAllNotificationsAction();
      if (res.success) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (e) {
      console.error('Error clearing notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Auto-refresh notifications every 30s during presentation
    const timer = setInterval(fetchNotifications, 30000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    refetch: fetchNotifications,
    markAsRead,
    clearAll,
  };
}
