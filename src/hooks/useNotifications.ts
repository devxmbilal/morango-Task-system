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

  const markOneRead = async (id: number) => {
    // Optimistic local update so the UI updates instantly
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await api.put(`/notifications/${id}/read`);
      return { ok: true };
    } catch (e: any) {
      console.error('Error marking notification as read:', e);
      return { ok: false };
    }
  };

  return {
    notifications,
    fetchNotifications,
    markNotificationsRead,
    markOneRead,
  };
}
