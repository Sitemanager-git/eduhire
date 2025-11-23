/**
 * Enhanced Login Page
 * Features: Form validation, error handling, remember me, auto-redirect
 */

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, userType } = useAuth();
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Auto-redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || getDefaultRoute(userType);
            console.log('Redirecting to:', from);
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, userType, navigate, location]);

    const getDefaultRoute = (type) => {
        switch (type) {
            case 'teacher':
                return '/jobs';
            case 'institution':
                return '/my-jobs';
            default:
                return '/dashboard';
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);

        try {
            const response = await authAPI.login({
                email: values.email,
                password: values.password,
            });

            const { token, user } = response.data;

            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('remember_email', values.email);
            } else {
                localStorage.removeItem('remember_email');
            }

            // Login via context
            login(token, user);

            message.success('Login successful!');

            // Redirect based on user type
            const redirectPath = getDefaultRoute(user.userType);
            navigate(redirectPath);
        } catch (error) {
            console.error('Login error:', error);

            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'Login failed. Please check your credentials.';

            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Load remembered email
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('remember_email');
        if (rememberedEmail) {
            setRememberMe(true);
        }
    }, []);

    return (
        <div className="login-container">
            <Card className="login-card">
                <div className="login-header">
                    <h1>Welcome Back!</h1>
                    <p>Login to your Eduhire account</p>
                </div>

                <Form
                    name="login"
                    onFinish={handleSubmit}
                    autoComplete="on"
                    size="large"
                    initialValues={{
                        email: localStorage.getItem('remember_email') || '',
                        remember: Boolean(localStorage.getItem('remember_email'))
                    }}
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Email"
                            autoComplete="email"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please enter your password' },
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Password"
                            autoComplete="current-password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <div className="form-extras">
                            <Checkbox
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            >
                                Remember me
                            </Checkbox>
                            <Link to="/forgot-password" className="forgot-password">
                                Forgot password?
                            </Link>
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            size="large"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </Form.Item>

                    <div className="register-link">
                        Don't have an account? <Link to="/register">Register now</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Login;