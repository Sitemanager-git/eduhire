import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAdminAuth } from '../../context/AdminAuthContext';
import '../Login.css';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (values) => {
    setError('');
    setLoading(true);

    try {
      await login({
        username: values.username,
        password: values.password
      });

      // Remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedUsername', values.username);
      }

      console.log('✓ Admin logged in');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('❌ Admin login error:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load remembered username
  React.useEffect(() => {
    const remembered = localStorage.getItem('rememberMe');
    const username = localStorage.getItem('rememberedUsername');
    if (remembered && username) {
      form.setFieldsValue({ username });
      setRememberMe(true);
    }
  }, [form]);

  return (
    <div className="login-container">
      {/* Background Blob */}
      <div className="blob-3"></div>

      {/* Login Card */}
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>

        {/* Header */}
        <div className="login-header">
          <h1>Eduhire Admin</h1>
          <p>Secure Administrator Portal</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="error-alert">
            <span className="error-alert-icon">⚠️</span>
            <div className="error-alert-text">{error}</div>
          </div>
        )}

        {/* Form */}
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          {/* Username Field */}
          <Form.Item
            name="username"
            label="Username or Email"
            rules={[
              { required: true, message: 'Please enter your username or email' },
              { min: 3, message: 'Username must be at least 3 characters' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="admin@eduhire.com"
              size="large"
            />
          </Form.Item>

          {/* Password Field */}
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              size="large"
            />
          </Form.Item>

          {/* Form Extras - Remember Me & Forgot Password */}
          <div className="form-extras">
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            >
              Remember me
            </Checkbox>
            <a href="/admin/forgot-password" className="forgot-password">
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        {/* Footer - Support Text */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
          🔒 Enterprise-grade security • Protected access only
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;