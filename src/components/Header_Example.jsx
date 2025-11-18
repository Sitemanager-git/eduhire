// Header.jsx - Complete example with NotificationBell
import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Badge } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  HomeOutlined,
  BriefcaseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../Notifications/NotificationBell';
import './Header.css';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case 'profile':
        navigate(`/${user?.userType}-profile/${user?._id}`);
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'logout':
        logout();
        navigate('/login');
        break;
      default:
        break;
    }
  };

  const userMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        My Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <AntHeader className="site-header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" onClick={() => navigate('/')}>
          <h2>EduHire</h2>
        </div>

        {/* Navigation Menu */}
        <Menu mode="horizontal" className="header-menu">
          <Menu.Item key="home" icon={<HomeOutlined />} onClick={() => navigate('/')}>
            Home
          </Menu.Item>
          <Menu.Item key="jobs" icon={<BriefcaseOutlined />} onClick={() => navigate('/jobs')}>
            Jobs
          </Menu.Item>
          {user?.userType === 'teacher' && (
            <Menu.Item key="applications" onClick={() => navigate('/my-applications')}>
              My Applications
            </Menu.Item>
          )}
          {user?.userType === 'institution' && (
            <Menu.Item key="post-job" onClick={() => navigate('/post-job')}>
              Post Job
            </Menu.Item>
          )}
        </Menu>

        {/* Right Side - Notifications & User Menu */}
        <div className="header-actions">
          <Space size="large">
            {/* NOTIFICATION BELL - ADD HERE */}
            {user && <NotificationBell />}

            {/* User Dropdown */}
            {user ? (
              <Dropdown overlay={userMenu} trigger={['click']}>
                <Space className="user-dropdown">
                  <Avatar icon={<UserOutlined />} src={user?.photo} />
                  <span className="username">{user?.name}</span>
                </Space>
              </Dropdown>
            ) : (
              <Space>
                <a onClick={() => navigate('/login')}>Login</a>
                <a onClick={() => navigate('/register')}>Register</a>
              </Space>
            )}
          </Space>
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;
