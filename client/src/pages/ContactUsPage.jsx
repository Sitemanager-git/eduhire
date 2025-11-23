import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Row, Col, Space } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, LinkedinOutlined, TwitterOutlined, FacebookOutlined, InstagramOutlined } from '@ant-design/icons';
import axios from 'axios';
import useSEO from '../hooks/useSEO';
import '../styles/contact.css';

const ContactUsPage = () => {
  useSEO({
    title: 'Contact Us',
    description: 'Get in touch with Eduhire. We\'re here to help with questions, feedback, or support requests.',
    keywords: 'contact us, support, feedback, help, customer service',
    canonicalUrl: 'https://eduhire.com/contact'
  });

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Send to backend
      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/support/contact`,
        {
          name: values.name,
          email: values.email,
          phone: values.phone,
          subject: values.subject,
          message: values.message,
          category: values.category
        }
      );
      message.success('Thank you! We received your message and will get back to you soon.');
      form.resetFields();
    } catch (error) {
      message.error('Failed to send message. Please try again.');
      console.error('Contact form error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* Header */}
        <div className="contact-header">
          <h1>Get In Touch</h1>
          <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>

        <Row gutter={[40, 40]} className="contact-content">
          {/* Contact Form */}
          <Col xs={24} md={12}>
            <Card className="contact-form-card" bordered={false}>
              <h2>Send us a Message</h2>
              <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
                requiredMark={false}
              >
                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                >
                  <Input placeholder="Your Name" size="large" />
                </Form.Item>

                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input placeholder="your@email.com" size="large" />
                </Form.Item>

                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[{ required: false }]}
                >
                  <Input placeholder="+91 XXXXXXXXXX" size="large" />
                </Form.Item>

                <Form.Item
                  label="Category"
                  name="category"
                  rules={[{ required: true, message: 'Please select a category' }]}
                >
                  <Input.Group>
                    <select style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9', fontSize: '14px' }}>
                      <option value="">Select a category...</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership</option>
                      <option value="bug">Report a Bug</option>
                    </select>
                  </Input.Group>
                </Form.Item>

                <Form.Item
                  label="Subject"
                  name="subject"
                  rules={[{ required: true, message: 'Please enter a subject' }]}
                >
                  <Input placeholder="What is this about?" size="large" />
                </Form.Item>

                <Form.Item
                  label="Message"
                  name="message"
                  rules={[{ required: true, message: 'Please enter your message' }]}
                >
                  <Input.TextArea
                    placeholder="Your message here..."
                    rows={5}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                >
                  Send Message
                </Button>
              </Form>
            </Card>
          </Col>

          {/* Contact Information */}
          <Col xs={24} md={12}>
            <div className="contact-info">
              <Card className="info-card" bordered={false}>
                <h2>Contact Information</h2>

                <div className="info-item">
                  <MailOutlined className="info-icon" />
                  <div className="info-text">
                    <h4>Email</h4>
                    <p><a href="mailto:support@eduhire.com">support@eduhire.com</a></p>
                    <p><a href="mailto:info@eduhire.com">info@eduhire.com</a></p>
                  </div>
                </div>

                <div className="info-item">
                  <PhoneOutlined className="info-icon" />
                  <div className="info-text">
                    <h4>Phone</h4>
                    <p><a href="tel:+919876543210">+91 9876 543 210</a></p>
                    <p>Monday - Friday, 9AM - 6PM IST</p>
                  </div>
                </div>

                <div className="info-item">
                  <EnvironmentOutlined className="info-icon" />
                  <div className="info-text">
                    <h4>Address</h4>
                    <p>Eduhire India<br />
                      123 Education Street<br />
                      Bangalore, India 560001</p>
                  </div>
                </div>
              </Card>

              <Card className="social-card" bordered={false}>
                <h3>Follow Us</h3>
                <Space size="large" wrap>
                  <a href="https://linkedin.com/company/eduhire" target="_blank" rel="noopener noreferrer" className="social-link">
                    <LinkedinOutlined /> LinkedIn
                  </a>
                  <a href="https://twitter.com/eduhire" target="_blank" rel="noopener noreferrer" className="social-link">
                    <TwitterOutlined /> Twitter
                  </a>
                  <a href="https://facebook.com/eduhire" target="_blank" rel="noopener noreferrer" className="social-link">
                    <FacebookOutlined /> Facebook
                  </a>
                  <a href="https://instagram.com/eduhire" target="_blank" rel="noopener noreferrer" className="social-link">
                    <InstagramOutlined /> Instagram
                  </a>
                </Space>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ContactUsPage;
