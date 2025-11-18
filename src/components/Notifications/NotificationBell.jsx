import React, { useState, useEffect } from 'react';
import { 
  Badge, 
  Dropdown, 
  Button, 
  List, 
  Empty, 
  Spin,
  Typography,
  Space,
  Divider
} from 'antd';
import { 
  BellOutlined, 
  CheckOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './NotificationBell.css';

const { Text } = Typography;

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${API_BASE_URL}/notifications?limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId 
            ? { ...n, isRead: true } 
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_BASE_URL}/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${API_BASE_URL}/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications(prev => 
        prev.filter(n => n._id !== notificationId)
      );
      
      // Update unread count if notification was unread
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Navigate if action URL exists
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setDropdownVisible(false);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      application_received: '📩',
      application_status: '📝',
      job_match: '💼',
      profile_view: '👁️',
      job_expiring: '⏰',
      system: 'ℹ️'
    };
    return iconMap[type] || '🔔';
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const notificationMenu = (
    <div className="notification-dropdown" style={{ width: 400, maxHeight: 600, overflow: 'auto' }}>
      <div className="notification-header" style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <div className="flex justify-between items-center">
          <Text strong style={{ fontSize: 16 }}>Notifications</Text>
          {unreadCount > 0 && (
            <Button 
              type="link" 
              size="small"
              onClick={markAllAsRead}
              loading={loading}
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <List
        dataSource={notifications}
        locale={{ emptyText: <Empty description="No notifications" /> }}
        renderItem={(item) => (
          <List.Item
            className={`notification-item ${!item.isRead ? 'unread' : ''}`}
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              backgroundColor: item.isRead ? 'white' : '#f0f7ff'
            }}
            actions={[
              !item.isRead && (
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(item._id);
                  }}
                />
              ),
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(item._id);
                }}
              />
            ]}
            onClick={() => handleNotificationClick(item)}
          >
            <List.Item.Meta
              avatar={
                <span style={{ fontSize: 24 }}>
                  {getNotificationIcon(item.type)}
                </span>
              }
              title={
                <Space>
                  <Text strong={!item.isRead}>{item.title}</Text>
                  {!item.isRead && (
                    <Badge status="processing" />
                  )}
                </Space>
              }
              description={
                <>
                  <Text type="secondary">{item.message}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatTime(item.createdAt)}
                  </Text>
                </>
              }
            />
          </List.Item>
        )}
      />

      {notifications.length > 0 && (
        <>
          <Divider style={{ margin: 0 }} />
          <div style={{ padding: '12px', textAlign: 'center' }}>
            <Button 
              type="link"
              onClick={() => {
                navigate('/notifications');
                setDropdownVisible(false);
              }}
            >
              View all notifications
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dropdown
      overlay={notificationMenu}
      trigger={['click']}
      placement="bottomRight"
      visible={dropdownVisible}
      onVisibleChange={setDropdownVisible}
    >
      <Badge count={unreadCount} overflowCount={99}>
        <Button 
          type="text" 
          icon={<BellOutlined style={{ fontSize: 20 }} />}
          style={{ height: 40 }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
