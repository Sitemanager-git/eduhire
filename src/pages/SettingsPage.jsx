import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Switch, Button, Row, Col, Collapse, message, Spin, Divider, Space, Modal } from 'antd';
import { LockOutlined, BellOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import { settingsAPI } from '../services/api';
import './SettingsPage.css';

const SettingsPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});
  const [passwordForm] = Form.useForm();
  const [passwordLoading, setPasswordLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettings();
      
      const settingsData = response.data || response;
      setSettings(settingsData);
      form.setFieldsValue(settingsData);
      
      console.log('✓ Settings loaded');
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
      const errorMsg = error.response?.data?.message || 'Failed to load settings';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (values) => {
    try {
      setLoading(true);
      const response = await settingsAPI.updateSettings(values);
      
      message.success('✓ Settings updated successfully');
      const updatedSettings = response.data || response;
      setSettings(updatedSettings);
    } catch (error) {
      console.error('❌ Failed to update settings:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update settings';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      setPasswordLoading(true);
      await settingsAPI.changePassword(values.currentPassword, values.newPassword, values.confirmPassword);
      
      message.success('✓ Password changed successfully');
      passwordForm.resetFields();
    } catch (error) {
      console.error('❌ Failed to change password:', error);
      const errorMsg = error.response?.data?.message || 'Failed to change password';
      message.error(errorMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDataExport = async () => {
    try {
      const response = await settingsAPI.exportData();

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user-data-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      message.success('✓ Data exported successfully');
    } catch (error) {
      console.error('❌ Failed to export data:', error);
      const errorMsg = error.response?.data?.message || 'Failed to export data';
      message.error(errorMsg);
    }
  };

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: 'Delete Account',
      content: 'Are you sure you want to delete your account? This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await settingsAPI.deleteAccount();
          message.success('Account deleted successfully');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        } catch (error) {
          console.error('❌ Failed to delete account:', error);
          const errorMsg = error.response?.data?.message || 'Failed to delete account';
          message.error(errorMsg);
        }
      },
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin /></div>;
  }

  const items = [
    {
      key: '1',
      label: (
        <Space>
          <BellOutlined />
          Notification Preferences
        </Space>
      ),
      children: (
        <Form layout="vertical" form={form} onFinish={handleSettingsUpdate}>
          <Form.Item
            name={['notifications', 'email']}
            label="Email Notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name={['notifications', 'jobAlerts']}
            label="Job Alerts"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name={['notifications', 'applicationUpdates']}
            label="Application Status Updates"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name={['notifications', 'reviews']}
            label="New Reviews & Ratings"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name={['notifications', 'messages']}
            label="Direct Messages"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading}>
            Save Preferences
          </Button>
        </Form>
      ),
    },
    {
      key: '2',
      label: (
        <Space>
          <EyeOutlined />
          Privacy Settings
        </Space>
      ),
      children: (
        <Form layout="vertical">
          <Form.Item
            label="Make Profile Public"
            valuePropName="checked"
            initialValue={settings?.privacy?.profilePublic}
          >
            <Switch
              onChange={(checked) => {
                const updatedSettings = {
                  ...settings,
                  privacy: { ...settings.privacy, profilePublic: checked },
                };
                handleSettingsUpdate(updatedSettings);
              }}
            />
          </Form.Item>

          <Form.Item
            label="Show Reviews on Profile"
            valuePropName="checked"
            initialValue={settings?.privacy?.showReviews}
          >
            <Switch
              onChange={(checked) => {
                const updatedSettings = {
                  ...settings,
                  privacy: { ...settings.privacy, showReviews: checked },
                };
                handleSettingsUpdate(updatedSettings);
              }}
            />
          </Form.Item>

          <Form.Item
            label="Allow Search Engines to Index Profile"
            valuePropName="checked"
            initialValue={settings?.privacy?.searchEngineIndex}
          >
            <Switch
              onChange={(checked) => {
                const updatedSettings = {
                  ...settings,
                  privacy: { ...settings.privacy, searchEngineIndex: checked },
                };
                handleSettingsUpdate(updatedSettings);
              }}
            />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: '3',
      label: (
        <Space>
          <LockOutlined />
          Security Settings
        </Space>
      ),
      children: (
        <div>
          <h4>Change Password</h4>
          <Form
            layout="vertical"
            form={passwordForm}
            onFinish={handlePasswordChange}
            style={{ maxWidth: '400px' }}
          >
            <Form.Item
              label="Current Password"
              name="currentPassword"
              rules={[{ required: true, message: 'Please enter current password' }]}
            >
              <Input.Password placeholder="Enter current password" />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: 'Please enter new password' },
                { min: 8, message: 'Password must be at least 8 characters' },
              ]}
            >
              <Input.Password placeholder="Enter new password" />
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirmPassword"
              rules={[
                { required: true, message: 'Please confirm password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm new password" />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={passwordLoading}>
              Change Password
            </Button>
          </Form>

          <Divider />

          <h4>Two-Factor Authentication</h4>
          <p style={{ color: '#666' }}>Coming soon - Add extra security to your account</p>
        </div>
      ),
    },
    {
      key: '4',
      label: (
        <Space>
          <FileTextOutlined />
          Data & Privacy
        </Space>
      ),
      children: (
        <div>
          <h4>Export Your Data</h4>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            Download a copy of all your personal data in JSON format.
          </p>
          <Button type="primary" onClick={handleDataExport}>
            Export Data
          </Button>

          <Divider />

          <h4>Delete Account</h4>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button danger onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card title="Account Settings" bordered={false}>
        <Collapse items={items} />
      </Card>
    </div>
  );
};

export default SettingsPage;
