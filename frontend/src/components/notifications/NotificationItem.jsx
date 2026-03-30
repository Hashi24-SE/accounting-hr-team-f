import React from 'react';
import { Badge, List, Button, Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
const { Text } = Typography;

const NotificationItem = ({ notification, onMarkRead }) => {
  return (
    <List.Item
      style={{
        padding: '12px 16px',
        background: notification.read ? 'transparent' : 'rgba(16, 185, 129, 0.05)',
        borderLeft: notification.read ? '3px solid transparent' : '3px solid #10b981',
        transition: 'background 0.3s ease',
      }}
      actions={[
        !notification.read && (
          <Button
            key="read"
            type="text"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => onMarkRead(notification.id)}
            style={{ color: '#10b981' }}
          >
            Mark read
          </Button>
        ),
      ]}
    >
      <List.Item.Meta
        title={
          <Text strong={!notification.read} style={{ color: notification.read ? '#9ca3af' : '#e5e7eb' }}>
            {notification.title}
          </Text>
        }
        description={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Text style={{ color: '#9ca3af', fontSize: '13px' }}>{notification.body}</Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {dayjs(notification.created_at).fromNow()}
            </Text>
          </div>
        }
      />
    </List.Item>
  );
};

export default NotificationItem;