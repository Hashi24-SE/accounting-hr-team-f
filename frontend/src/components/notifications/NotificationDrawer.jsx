import React from 'react';
import { Drawer, List, Button, Typography, Empty, Space } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import NotificationItem from './NotificationItem';

const { Text } = Typography;

const NotificationDrawer = ({ open, onClose, notifications, unreadCount, onMarkRead, onMarkAllRead }) => {
  return (
    <Drawer
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <BellOutlined style={{ color: '#10b981' }} />
            <Text style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: 600 }}>Notifications</Text>
            {unreadCount > 0 && (
              <span style={{
                background: '#10b981',
                color: '#fff',
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: '12px',
                marginLeft: '8px'
              }}>
                {unreadCount} new
              </span>
            )}
          </Space>
          {unreadCount > 0 && (
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined />}
              onClick={onMarkAllRead}
              style={{ color: '#10b981' }}
            >
              Mark all read
            </Button>
          )}
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      size="large"
      styles={{
        header: {
          background: '#1f2937',
          borderBottom: '1px solid #374151',
        },
        body: {
          background: '#111827',
          padding: 0,
        },
        mask: {
          backdropFilter: 'blur(2px)',
        }
      }}
      closeIcon={<span style={{ color: '#9ca3af' }}>×</span>}
    >
      {notifications.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<Text style={{ color: '#9ca3af' }}>No notifications yet</Text>}
          style={{ marginTop: '64px' }}
        />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={onMarkRead}
            />
          )}
          style={{
            borderBottom: '1px solid #374151',
          }}
        />
      )}
    </Drawer>
  );
};

export default NotificationDrawer;