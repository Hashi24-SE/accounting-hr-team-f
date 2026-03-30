import React, { useState } from 'react';
import { Badge, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationDrawer from './NotificationDrawer';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 9, width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#6b7280',
        }}
      >
        <BellOutlined style={{ fontSize: '15px' }} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              style={{
                position: 'absolute', top: -4, right: -4,
                background: '#10b981', borderRadius: '50%',
                minWidth: 16, height: 16, padding: '0 4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 10, fontWeight: 700,
                boxShadow: '0 0 8px rgba(16,185,129,0.6)',
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <NotificationDrawer
        open={open}
        onClose={() => setOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
      />
    </>
  );
};

export default NotificationBell;