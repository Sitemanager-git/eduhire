/**
 * Enhanced Register Page
 * Features: User type selection, validation, password strength meter
 */

import React, { useState } from 'react';
import { Form, Input, Button, Card, Radio, message, Progress } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState('teacher');
    const [passwordStrength, setPasswordStrength] = useState(0);

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 6) strength += 25;
        if (password.length >= 10) strength += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
        if (/\d/.test(password)) strength += 25;
        return strength;
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        const strength = calculatePasswordStrength(password);
        setPasswordStrength(strength);
    };

    const getStrengthColor = () => {
        if (passwordStrength <= 25) return '#ff4d4f';
        if (passwordStrength <= 50) return '#faad14';
        if (passwordStrength <= 75) return '#1890ff';
        return '#52c41a';
    };

    const handleSubmit = async (values) => {
        setLoading(true);

        try {
            const response = await authAPI.register({
                email: values.email,
                password: values.password,
                userType: userType,
            });

            message.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'Registration failed. Please try again.';
            if (error.response && error.response.status === 400) {
                const err = error.response.data?.error || error.response.data?.message || '';
                if (err.includes('Email already registered')) {
                    errorMessage = 'This email is already associated with an account.';
                } else if (err.includes('Invalid email format')) {
                    errorMessage = 'Please enter a valid email address.';
                } else if (err.includes('Password must be at least 6 characters')) {
                    errorMessage = 'Password must be at least 6 characters long.';
                } else if (err.includes('User type must be either teacher or institution')) {
                    errorMessage = 'Please select a valid user type.';
                } else if (err.includes('Email, password, and user type are required')) {
                    errorMessage = 'All fields are required.';
                } else {
                    errorMessage = err || errorMessage;
                }
            }
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <Card className="register-card">
                <div className="register-header">
                    <h1>Join Eduhire</h1>
                    <p>Create your account to get started</p>
                </div>

                <Form
                    name="register"
                    onFinish={handleSubmit}
                    size="large"
                    initialValues={{ userType: 'teacher' }}
                >
                    <Form.Item name="userType" label="I am a:">
                        <Radio.Group
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                            buttonStyle="solid"
                            size="large"
                        >
                            <Radio.Button value="teacher">Teacher</Radio.Button>
                            <Radio.Button value="institution">Institution</Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
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
                            onChange={handlePasswordChange}
                            autoComplete="new-password"
                        />
                    </Form.Item>

                    {passwordStrength > 0 && (
                        <Form.Item>
                            <Progress
                                percent={passwordStrength}
                                strokeColor={getStrengthColor()}
                                showInfo={false}
                                size="small"
                            />
                            <small style={{ color: getStrengthColor() }}>
                                Password strength: {
                                    passwordStrength <= 25 ? 'Weak' :
                                        passwordStrength <= 50 ? 'Fair' :
                                            passwordStrength <= 75 ? 'Good' : 'Strong'
                                }
                            </small>
                        </Form.Item>
                    )}

                    <Form.Item
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Passwords do not match'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Confirm Password"
                            autoComplete="new-password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            size="large"
                        >
                            {loading ? 'Creating account...' : 'Register'}
                        </Button>
                    </Form.Item>

                    <div className="login-link">
                        Already have an account? <Link to="/login">Login here</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Register;