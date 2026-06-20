import { useState, useCallback } from 'react';
import type { AppNotification } from '../types';
import { api } from '../lib/api';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.get('/notifications');
      setNotifications(data || []);
    } catch (e: any) {
      console.error('Error fetching notifications:', e);
    }
  }, []);

  const markNotificationsRead = async () => {
    try {
      await api.post('/notifications/read');
      fetchNotifications();
      return { ok: true };
    } catch (e: any) {
      console.error('Error marking notifications as read:', e);
      return { ok: false };
    }
  };

  return {
    notifications,
    fetchNotifications,
    markNotificationsRead,
  };
}
