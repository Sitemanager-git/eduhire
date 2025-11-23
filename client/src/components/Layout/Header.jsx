// Header.jsx - Complete working header component
import React, { useState } from 'react';
import { Layout, Menu, Space, Button, Drawer } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  HomeOutlined,
  ShopOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../Notifications/NotificationBell';
import UserAccountMenu from './UserAccountMenu';
import './Header.css';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case 'home':
        navigate('/');
        break;
      case 'jobs':
        navigate('/jobs');
        break;
      case 'my-applications':
        navigate('/my-applications');
        break;
      case 'saved-jobs':
        navigate('/saved-jobs');
        break;
      case 'post-job':
        navigate('/post-job');
        break;
      case 'my-jobs':
        navigate('/my-jobs');
        break;
      case 'dashboard':
        if (user?.userType === 'teacher') {
          navigate('/teacher-dashboard');
        } else if (user?.userType === 'institution') {
          navigate('/institution-dashboard');
        } else {
          navigate('/dashboard');
        }
        break;
      case 'profile':
        navigate(`/${user?.userType}-profile/${user?._id}`);
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'logout':
        logout();
        navigate('/login');
        setMobileDrawerVisible(false);
        break;
      default:
        break;
    }
  };

  const desktopMenu = (
    <Menu mode="horizontal" onClick={handleMenuClick} className="header-menu">
      <Menu.Item key="home" icon={<HomeOutlined />}>
        Home
      </Menu.Item>
      <Menu.Item key="jobs" icon={<ShopOutlined />}>
        Browse Jobs
      </Menu.Item>
      {user?.userType === 'teacher' && (
        <>
          <Menu.Item key="my-applications">
            My Applications
          </Menu.Item>
          <Menu.Item key="saved-jobs">
            Saved Jobs
          </Menu.Item>
        </>
      )}
      {user?.userType === 'institution' && (
        <>
          <Menu.Item key="post-job">
            Post Job
          </Menu.Item>
          <Menu.Item key="my-jobs">
            My Jobs
          </Menu.Item>
        </>
      )}
      {user && (
        <Menu.Item key="dashboard">
          Dashboard
        </Menu.Item>
      )}
    </Menu>
  );

  const mobileMenu = (
    <Menu onClick={(e) => {
        handleMenuClick(e);
        setMobileDrawerVisible(false);
      }}>
      <Menu.Item key="home" icon={<HomeOutlined />}>
        Home
      </Menu.Item>
      <Menu.Item key="jobs" icon={<ShopOutlined />}>
        Browse Jobs
      </Menu.Item>
      {user?.userType === 'teacher' && (
        <>
          <Menu.Item key="my-applications">
            My Applications
          </Menu.Item>
          <Menu.Item key="saved-jobs">
            Saved Jobs
          </Menu.Item>
        </>
      )}
      {user?.userType === 'institution' && (
        <>
          <Menu.Item key="post-job">
            Post Job
          </Menu.Item>
          <Menu.Item key="my-jobs">
            My Jobs
          </Menu.Item>
        </>
      )}
      {user && (
        <Menu.Item key="dashboard">
          Dashboard
        </Menu.Item>
      )}
      <Menu.Divider />
      {user ? (
        <>
          <Menu.Item key="profile" icon={<UserOutlined />}>
            My Profile
          </Menu.Item>
          <Menu.Item key="settings" icon={<SettingOutlined />}>
            Settings
          </Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
            Logout
          </Menu.Item>
        </>
      ) : (
        <>
          <Menu.Item onClick={() => navigate('/login')}>
            Login
          </Menu.Item>
          <Menu.Item onClick={() => navigate('/register')}>
            Register
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  return (
    <AntHeader className="site-header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" onClick={() => navigate('/')}>
          <h2>📚 EduHire</h2>
        </div>

        {/* Desktop Navigation Menu */}
        <div className="header-menu-wrapper">
          {desktopMenu}
        </div>

        {/* Right Side - Notifications & User Menu */}
        <div className="header-actions">
          <Space size="large">
            {/* NOTIFICATION BELL */}
            {user && <NotificationBell />}

            {/* User Account Menu Component */}
            <UserAccountMenu />
          </Space>
        </div>

        {/* Mobile Menu Toggle */}
        <Button 
          type="text" 
          size="large"
          icon={mobileDrawerVisible ? <CloseOutlined /> : <MenuOutlined />}
          className="mobile-menu-toggle"
          onClick={() => setMobileDrawerVisible(!mobileDrawerVisible)}
        />
      </div>

      {/* Mobile Drawer Menu */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        bodyStyle={{ padding: 0 }}
      >
        {mobileMenu}
      </Drawer>
    </AntHeader>
  );
};

export default Header;
