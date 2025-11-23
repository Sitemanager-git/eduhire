import React, { useState } from 'react';
import { Card, Form, Input, Button, Collapse, Row, Col, message, Select, Space } from 'antd';
import { SendOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { supportAPI } from '../services/api';
import './HelpSupportPage.css';

const HelpSupportPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const faqItems = [
    {
      key: '1',
      label: 'How do I apply for a job?',
      children: (
        <p>
          To apply for a job, browse through our job listings, select the job you're interested in,
          and click the "Apply" button. Fill in any additional information required and submit your application.
          Employers will review your profile and application.
        </p>
      ),
    },
    {
      key: '2',
      label: 'How can I upgrade my subscription?',
      children: (
        <p>
          Go to your Subscriptions page from the account menu, view all available plans, and click the
          "Upgrade" button on your desired plan. Complete the payment process to activate your new subscription.
        </p>
      ),
    },
    {
      key: '3',
      label: 'How do I post a job?',
      children: (
        <p>
          If you're an institution, go to your dashboard and click "Post Job". Fill in the job details,
          requirements, and benefits. Your job will be live immediately and visible to all job seekers.
        </p>
      ),
    },
    {
      key: '4',
      label: 'Can I edit my profile after posting?',
      children: (
        <p>
          Yes, you can edit your profile at any time from the Profile page. Changes are saved immediately
          and will be reflected in your public profile.
        </p>
      ),
    },
    {
      key: '5',
      label: 'How do I withdraw an application?',
      children: (
        <p>
          Go to your My Applications page, find the application you want to withdraw, and click the
          "Withdraw" button. This will notify the employer of your withdrawal.
        </p>
      ),
    },
    {
      key: '6',
      label: 'What payment methods do you accept?',
      children: (
        <p>
          We accept all major credit cards (Visa, MasterCard, American Express) and digital wallets.
          Payments are processed securely through our payment gateway.
        </p>
      ),
    },
    {
      key: '7',
      label: 'How long does it take to hear back from employers?',
      children: (
        <p>
          Response times vary depending on the employer. Most employers respond within 1-7 days.
          You can track the status of your applications in real-time on our platform.
        </p>
      ),
    },
    {
      key: '8',
      label: 'Can I cancel my subscription anytime?',
      children: (
        <p>
          Yes, you can cancel your subscription at any time from the Subscriptions page. Your subscription
          will remain active until the end of your billing cycle.
        </p>
      ),
    },
  ];

  const handleSubmitTicket = async (values) => {
    try {
      setLoading(true);
      await supportAPI.createTicket(values);
      message.success('✓ Support ticket created successfully. We will contact you soon.');
      form.resetFields();
    } catch (error) {
      console.error('❌ Failed to create ticket:', error);
      const errorMsg = error.response?.data?.message || 'Failed to create support ticket';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* FAQ Section */}
      <Card title="Frequently Asked Questions" bordered={false} style={{ marginBottom: '24px' }}>
        <Collapse items={faqItems} />
      </Card>

      {/* Contact Support Section */}
      <Card title="Contact Support" bordered={false} style={{ marginBottom: '24px' }}>
        <Row gutter={24}>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="contact-card">
              <div style={{ textAlign: 'center' }}>
                <MailOutlined style={{ fontSize: '32px', color: '#667eea', marginBottom: '16px' }} />
                <h4>Email Support</h4>
                <p>support@eduhire.com</p>
                <p style={{ fontSize: '12px', color: '#999' }}>Response within 24 hours</p>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="contact-card">
              <div style={{ textAlign: 'center' }}>
                <PhoneOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '16px' }} />
                <h4>Call Us</h4>
                <p>+91 1800 123 4567</p>
                <p style={{ fontSize: '12px', color: '#999' }}>Mon-Fri, 9AM-6PM IST</p>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="contact-card">
              <div style={{ textAlign: 'center' }}>
                <SendOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: '16px' }} />
                <h4>Live Chat</h4>
                <p>Chat with us instantly</p>
                <p style={{ fontSize: '12px', color: '#999' }}>Available 24/7</p>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Support Ticket Form */}
      <Card title="Create a Support Ticket" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitTicket}
          style={{ maxWidth: '600px' }}
        >
          <Form.Item
            label="Issue Category"
            name="category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select an issue category">
              <Select.Option value="technical">Technical Issue</Select.Option>
              <Select.Option value="payment">Payment Issue</Select.Option>
              <Select.Option value="account">Account Help</Select.Option>
              <Select.Option value="jobs">Job Posting Help</Select.Option>
              <Select.Option value="subscription">Subscription Help</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Subject"
            name="subject"
            rules={[
              { required: true, message: 'Please enter a subject' },
              { min: 5, message: 'Subject must be at least 5 characters' },
            ]}
          >
            <Input placeholder="Brief description of your issue" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: 'Please describe your issue' },
              { min: 20, message: 'Description must be at least 20 characters' },
            ]}
          >
            <Input.TextArea
              rows={6}
              placeholder="Please provide detailed information about your issue, including steps you've taken..."
            />
          </Form.Item>

          <Form.Item
            label="Priority"
            name="priority"
            initialValue="medium"
          >
            <Select>
              <Select.Option value="low">Low</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="high">High</Select.Option>
              <Select.Option value="urgent">Urgent</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Preferred Contact Method"
            name="contactMethod"
            initialValue="email"
          >
            <Select>
              <Select.Option value="email">Email</Select.Option>
              <Select.Option value="phone">Phone</Select.Option>
              <Select.Option value="chat">Chat</Select.Option>
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} icon={<SendOutlined />}>
            Submit Ticket
          </Button>
        </Form>
      </Card>

      {/* Quick Links Section */}
      <Card title="Helpful Resources" bordered={false} style={{ marginTop: '24px' }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <a href="#documentation" style={{ display: 'block', padding: '12px', border: '1px solid #f0f0f0', borderRadius: '4px', textAlign: 'center' }}>
              📚 Documentation
            </a>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <a href="#video-tutorials" style={{ display: 'block', padding: '12px', border: '1px solid #f0f0f0', borderRadius: '4px', textAlign: 'center' }}>
              🎥 Video Tutorials
            </a>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <a href="#blog" style={{ display: 'block', padding: '12px', border: '1px solid #f0f0f0', borderRadius: '4px', textAlign: 'center' }}>
              📰 Blog
            </a>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <a href="#community" style={{ display: 'block', padding: '12px', border: '1px solid #f0f0f0', borderRadius: '4px', textAlign: 'center' }}>
              👥 Community Forum
            </a>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default HelpSupportPage;
