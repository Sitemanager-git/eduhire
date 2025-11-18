import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, message, Spin, Empty, Tooltip } from 'antd';
import { BellOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { notificationAPI } from '../services/api';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll();
      
      // Contract: returns array directly with { _id, userId, message, type, read, createdAt }
      const notificationList = Array.isArray(response) ? response : (response.data || []);
      setNotifications(notificationList);
      
      console.log('✓ Notifications loaded:', notificationList.length);
    } catch (error) {
      console.error('❌ Failed to load notifications:', error);
      const errorMsg = error.response?.data?.message || 'Failed to load notifications';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      
      // Update local state
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      
      message.success('✓ Marked as read');
    } catch (error) {
      console.error('❌ Failed to update notification:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update notification';
      message.error(errorMsg);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationAPI.delete(notificationId);
      
      // Update local state
      setNotifications(notifications.filter(n => n._id !== notificationId));
      
      message.success('✓ Notification deleted');
    } catch (error) {
      console.error('❌ Failed to delete notification:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete notification';
      message.error(errorMsg);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin /></div>;
  }

  if (notifications.length === 0) {
    return (
      <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        <Card>
          <Empty 
            description="No notifications yet"
            style={{ marginTop: '50px', marginBottom: '50px' }}
          />
        </Card>
      </div>
    );
  }

  const columns = [
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (text, record) => (
        <span style={{ fontWeight: record.read ? 'normal' : '600' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colors = {
          application: 'blue',
          review: 'orange',
          message: 'green',
          system: 'red'
        };
        return <Tag color={colors[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'read',
      key: 'read',
      render: (read) => (
        <Tag color={read ? 'default' : 'processing'}>
          {read ? 'Read' : 'Unread'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {!record.read && (
            <Tooltip title="Mark as read">
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleMarkAsRead(record._id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Card title="Notifications" bordered={false}>
        <Table
          columns={columns}
          dataSource={notifications}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default NotificationsPage;
