import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getAccessToken } from '../services/authService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  // Load existing
  const fetchAll = useCallback(async () => {
    try {
      const res = await api.get('/api/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter(n => !n.read).length);
      }
    } catch (error) {
      // Ignore 401s silently since api.js already handles token refresh/logout
      // Ensure we don't re-throw here so the interceptor doesn't loop
      if (error?.response?.status !== 401) {
        console.error('Failed to fetch notifications:', error);
      }
    }
  }, []);

  // SSE live stream
  useEffect(() => {
    // Delay SSE connection slightly — let the page load first
    // This ensures the initial page render isn't blocked
    const connectTimer = setTimeout(() => {
      fetchAll();

      const activeToken = getAccessToken();
      if (!activeToken) return;

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      let url = `${baseUrl}/api/notifications/stream?token=${activeToken}`;

      let es = null;
      let retryTimeout = null;

      const connect = () => {
        es = new EventSource(url, {
          withCredentials: true,
        });

        es.onmessage = (e) => {
          // Ignore heartbeat
          if (e.data === ':heartbeat') return;

          try {
            const notification = JSON.parse(e.data);
            if (notification.event === 'notification.new') {
              setNotifications(prev => [notification, ...prev]);
              setUnreadCount(prev => prev + 1);
            }
          } catch (err) {
            // parsing error
          }
        };

        es.onerror = (err) => {
          es.close(); // Close on error to prevent auto-reconnect spam on 401
          // Implement custom backoff / reconnect
          retryTimeout = setTimeout(() => {
            // Only attempt to reconnect if token still exists
            if (getAccessToken()) {
              connect();
            }
          }, 5000); // 5 second backoff
        };
      };

      connect();
      window.__es = es;
      window.__retryTimeout = retryTimeout;
    }, 500); // ← 500ms delay — page loads first, SSE connects after

    return () => {
      clearTimeout(connectTimer);
      if (window.__es) window.__es.close();
      if (window.__retryTimeout) clearTimeout(window.__retryTimeout);
    };
  }, [fetchAll]);

  const markRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
       console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
       console.error('Failed to mark all notifications as read:', error);
    }
  };

  return { notifications, unreadCount, markRead, markAllRead, refetch: fetchAll };
};