import React from 'react';
import { Row, Col, Space, Divider } from 'antd';
import { TwitterOutlined, LinkedinOutlined, FacebookOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="eduhire-footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <Row gutter={[40, 40]} className="footer-content">
          {/* About Us Section */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <h4 className="footer-title">About Us</h4>
              <ul className="footer-links">
                <li><Link to="/about">About EduHire</Link></li>
                <li><a href="/#blog">Blog</a></li>
                <li><a href="/#careers">Careers</a></li>
                <li><a href="/#press">Press</a></li>
              </ul>
            </div>
          </Col>

          {/* For Teachers Section */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <h4 className="footer-title">For Teachers</h4>
              <ul className="footer-links">
                <li><Link to="/jobs">Browse Jobs</Link></li>
                <li><a href="/#how-it-works">How It Works</a></li>
                <li><a href="/#tips">Tips & Resources</a></li>
              </ul>
            </div>
          </Col>

          {/* For Schools Section */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <h4 className="footer-title">For Schools</h4>
              <ul className="footer-links">
                <li><Link to="/post-job">Post a Job</Link></li>
                <li><Link to="/subscriptions">Pricing</Link></li>
                <li><a href="/#features">Features</a></li>
                <li><a href="/#support">Support</a></li>
              </ul>
            </div>
          </Col>

          {/* Support Section */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <h4 className="footer-title">Support</h4>
              <ul className="footer-links">
                <li><a href="/#help-center">Help Center</a></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service">Terms of Service</Link></li>
              </ul>
            </div>
          </Col>
        </Row>

        <Divider />

        {/* Bottom Footer */}
        <Row gutter={[20, 20]} align="middle" justify="space-between" className="footer-bottom">
          <Col xs={24} sm={12}>
            <p className="footer-copy">
              © {currentYear} EduHire. All rights reserved.
            </p>
          </Col>
          <Col xs={24} sm={12} className="social-links">
            <Space wrap>
              <a href="https://twitter.com/eduhire" target="_blank" rel="noopener noreferrer" title="Twitter">
                <TwitterOutlined /> Twitter
              </a>
              <span className="divider">•</span>
              <a href="https://linkedin.com/company/eduhire" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                <LinkedinOutlined /> LinkedIn
              </a>
              <span className="divider">•</span>
              <a href="https://facebook.com/eduhire" target="_blank" rel="noopener noreferrer" title="Facebook">
                <FacebookOutlined /> Facebook
              </a>
            </Space>
          </Col>
        </Row>
      </div>
    </footer>
  );
};

export default Footer;
