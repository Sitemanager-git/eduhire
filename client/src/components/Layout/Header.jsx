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

  // Desktop menu items configuration
  const getDesktopMenuItems = () => {
    const items = [
      {
        key: 'home',
        icon: <HomeOutlined />,
        label: 'Home'
      },
      {
        key: 'jobs',
        icon: <ShopOutlined />,
        label: 'Browse Jobs'
      }
    ];

    if (user?.userType === 'teacher') {
      items.push(
        {
          key: 'my-applications',
          label: 'My Applications'
        },
        {
          key: 'saved-jobs',
          label: 'Saved Jobs'
        }
      );
    }

    if (user?.userType === 'institution') {
      items.push(
        {
          key: 'post-job',
          label: 'Post Job'
        },
        {
          key: 'my-jobs',
          label: 'My Jobs'
        }
      );
    }

    if (user) {
      items.push({
        key: 'dashboard',
        label: 'Dashboard'
      });
    }

    return items;
  };

  // Mobile menu items configuration
  const getMobileMenuItems = () => {
    const items = [
      {
        key: 'home',
        icon: <HomeOutlined />,
        label: 'Home'
      },
      {
        key: 'jobs',
        icon: <ShopOutlined />,
        label: 'Browse Jobs'
      }
    ];

    if (user?.userType === 'teacher') {
      items.push(
        {
          key: 'my-applications',
          label: 'My Applications'
        },
        {
          key: 'saved-jobs',
          label: 'Saved Jobs'
        }
      );
    }

    if (user?.userType === 'institution') {
      items.push(
        {
          key: 'post-job',
          label: 'Post Job'
        },
        {
          key: 'my-jobs',
          label: 'My Jobs'
        }
      );
    }

    if (user) {
      items.push({
        key: 'dashboard',
        label: 'Dashboard'
      });
    }

    items.push({ type: 'divider' });

    if (user) {
      items.push(
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'My Profile'
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: 'Settings'
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Logout',
          danger: true
        }
      );
    } else {
      items.push(
        {
          key: 'login',
          label: 'Login',
          onClick: () => navigate('/login')
        },
        {
          key: 'register',
          label: 'Register',
          onClick: () => navigate('/register')
        }
      );
    }

    return items;
  };

  return (
    <AntHeader className="site-header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" onClick={() => navigate('/')}>
          <h2>📚 EduHire</h2>
        </div>

        {/* Desktop Navigation Menu */}
        <div className="header-menu-wrapper">
          <Menu 
            mode="horizontal" 
            onClick={handleMenuClick} 
            className="header-menu"
            items={getDesktopMenuItems()}
          />
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
        <Menu 
          onClick={(e) => {
            handleMenuClick(e);
            setMobileDrawerVisible(false);
          }}
          items={getMobileMenuItems()}
        />
      </Drawer>
    </AntHeader>
  );
};

export default Header;
