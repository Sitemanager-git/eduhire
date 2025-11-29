import React, { useState, useEffect } from 'react';
import {
  Dropdown,
  Avatar,
  Space,
  Button,
  Badge,
  Tag,
  Spin,
  message
} from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  HeartOutlined,
  CrownOutlined,
  BellOutlined,
  DashboardOutlined,
  GiftOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { teacherAPI, institutionAPI, notificationAPI } from '../../services/api';
import './UserAccountMenu.css';

const UserAccountMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user) {
      fetchProfileData();
      fetchNotificationCount();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoadingProfile(true);
      let response;
      
      if (user?.userType === 'teacher') {
        response = await teacherAPI.get();
      } else if (user?.userType === 'institution') {
        response = await institutionAPI.get();
      }

      if (response?.data) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      // Handle different error scenarios gracefully
      if (error.response?.status === 404) {
        console.warn(`${user?.userType} profile not found - user may need to create one`);
      } else if (error.response?.status === 400) {
        console.warn('Profile validation error:', error.response?.data?.error);
      }
      // Don't throw - allow component to continue rendering
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response?.data?.count !== undefined) {
        setNotificationCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    message.success('Logged out successfully');
  };

  const handleMenuClick = ({ key }) => {
    const routes = {
      'profile': () => navigate('/profile'),
      'dashboard': () => navigate(user?.userType === 'teacher' ? '/teacher-dashboard' : '/institution-dashboard'),
      'settings': () => navigate('/settings'),
      'notifications': () => navigate('/notifications'),
      'subscriptions': () => navigate('/subscriptions'),
      'saved-items': () => navigate('/saved-jobs'),
      'referrals': () => navigate('/referrals'),
      'help': () => navigate('/help'),
      'logout': handleLogout
    };

    if (routes[key]) {
      routes[key]();
    }
  };

  if (!user) {
    return (
      <Space>
        <Button type="primary" onClick={() => navigate('/login')}>
          Login
        </Button>
        <Button onClick={() => navigate('/register')}>
          Register
        </Button>
      </Space>
    );
  }

  // Get profile picture or use initials
  const getAvatarContent = () => {
    if (profileData?.profilePicture) {
      return <Avatar src={profileData.profilePicture} size={40} />;
    }

    const name = user?.name || user?.email || 'User';
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <Avatar size={40} style={{ backgroundColor: '#1890ff' }}>
        {initials}
      </Avatar>
    );
  };

  // Determine subscription status
  const getSubscriptionStatus = () => {
    if (profileData?.subscription?.plan === 'premium') {
      return { status: 'Premium', color: 'gold', icon: <CrownOutlined /> };
    }
    return { status: 'Free', color: 'default', icon: null };
  };

  const subscriptionStatus = getSubscriptionStatus();

  // Build menu items array properly for Menu component
  const buildMenuItems = () => {
    const items = [];

    // Header section
    items.push({
      type: 'group',
      label: (
        <div className="user-menu-header">
          <div className="user-menu-avatar">
            {getAvatarContent()}
          </div>
          <div className="user-menu-info">
            <h4>{user?.name || 'User'}</h4>
            <p className="user-email">{user?.email}</p>
            <div className="user-subscription">
              <Tag color={subscriptionStatus.color} icon={subscriptionStatus.icon}>
                {subscriptionStatus.status}
              </Tag>
            </div>
          </div>
        </div>
      ),
      children: []
    });

    // Profile section
    items.push({ type: 'divider' });
    items.push({ key: 'profile', label: 'My Profile', icon: <UserOutlined /> });
    items.push({ key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> });

    if (user?.userType === 'teacher') {
      items.push({ key: 'saved-items', label: 'Saved Jobs', icon: <HeartOutlined /> });
    }

    items.push({
      key: 'notifications',
      label: (
        <div className="menu-item-with-badge">
          <span>Notifications</span>
          {notificationCount > 0 && (
            <Badge count={notificationCount} style={{ backgroundColor: '#ff4d4f' }} />
          )}
        </div>
      ),
      icon: <BellOutlined />
    });

    items.push({ key: 'subscriptions', label: 'Subscriptions', icon: <CrownOutlined /> });

    if (user?.userType === 'teacher') {
      items.push({ key: 'referrals', label: 'Referrals & Rewards', icon: <GiftOutlined /> });
    }

    // Settings section
    items.push({ type: 'divider' });
    items.push({ key: 'settings', label: 'Settings', icon: <SettingOutlined /> });
    items.push({ key: 'help', label: 'Help & Support', icon: <QuestionCircleOutlined /> });

    // Logout section
    items.push({ type: 'divider' });
    items.push({ key: 'logout', label: 'Logout', icon: <LogoutOutlined />, danger: true });

    return items;
  };

  return (
    <Badge
      count={notificationCount > 0 ? notificationCount : 0}
      style={{
        backgroundColor: '#ff4d4f',
        fontSize: '10px',
        height: '18px',
        lineHeight: '18px'
      }}
    >
      <Dropdown
        menu={{
          items: buildMenuItems(),
          onClick: handleMenuClick
        }}
        trigger={['click']}
        placement="bottomRight"
        className="user-account-menu"
      >
        <Space
          style={{
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '6px',
            transition: 'background-color 0.3s',
          }}
          className="user-account-button"
          title={`${user?.name || 'Account'}`}
        >
          {loadingProfile ? (
            <Spin size="small" />
          ) : (
            getAvatarContent()
          )}
          <span className="user-name-text">{user?.name || 'Account'}</span>
        </Space>
      </Dropdown>
    </Badge>
  );
};

export default UserAccountMenu;
