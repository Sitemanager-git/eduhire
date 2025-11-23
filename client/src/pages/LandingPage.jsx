// LandingPage.jsx - Complete Landing Page Component (UPGRADED)
import React, { useState } from 'react';
import { 
  Layout, 
  Button, 
  Card, 
  Row, 
  Col, 
  Input, 
  Space,
  Statistic,
  Divider,
  Modal,
  message
} from 'antd';
import {
  SearchOutlined,
  TeamOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  HeartOutlined,
  ZoomInOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const { Content } = Layout;

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [heroLoading, setHeroLoading] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/jobs');
    }
  };

  const handleGetStarted = (userType) => {
    const path = userType === 'teacher' ? '/register?type=teacher' : '/register?type=institution';
    navigate(path);
  };

  return (
    <Layout className="landing-page">
      <Content>
        {/* ============ HERO SECTION ============ */}
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Find Your Perfect Teaching Position</h1>
            <p className="hero-subtitle">
              Connect teachers with the best educational institutions across India
            </p>

            {/* Search Bar */}
            <div className="search-bar-wrapper">
              <Input.Group compact>
                <Input
                  size="large"
                  placeholder="Search by subject, location, or job title..."
                  prefix={<SearchOutlined />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onPressEnter={handleSearch}
                  className="search-input"
                />
                <Button 
                  type="primary" 
                  size="large"
                  onClick={handleSearch}
                  loading={heroLoading}
                >
                  Search
                </Button>
              </Input.Group>
            </div>

            {/* CTA Buttons */}
            <div className="hero-buttons">
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/jobs')}
                icon={<ShopOutlined />}
              >
                Browse All Jobs
              </Button>
              <Button 
                size="large"
                onClick={() => handleGetStarted('teacher')}
              >
                Join Now
              </Button>
            </div>
          </div>
        </div>

        {/* ============ STATS SECTION ============ */}
        <div className="stats-section">
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Active Jobs"
                value={1250}
                prefix={<ShopOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Teachers Registered"
                value={5000}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Institutions"
                value={500}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Success Rate"
                value={92}
                suffix="%"
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
        </div>

        <Divider />

        {/* ============ FEATURES SECTION ============ */}
        <div className="features-section">
          <h2 className="section-title">Why Choose EduHire?</h2>

          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="feature-card" hoverable>
                <div className="feature-icon">💼</div>
                <h3>Quality Jobs</h3>
                <p>Curated positions from verified educational institutions</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="feature-card" hoverable>
                <div className="feature-icon">🔍</div>
                <h3>Easy Search</h3>
                <p>Advanced filters to find jobs matching your preferences</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="feature-card" hoverable>
                <div className="feature-icon">⭐</div>
                <h3>Ratings & Reviews</h3>
                <p>Real feedback from teachers and institutions</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="feature-card" hoverable>
                <div className="feature-icon">📊</div>
                <h3>Analytics</h3>
                <p>Track your applications and job performance</p>
              </Card>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* ============ FOR TEACHERS SECTION ============ */}
        <div className="section">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={12}>
              <h2>For Teachers</h2>
              <ul className="features-list">
                <li>Search and apply to teaching positions</li>
                <li>Create professional profiles</li>
                <li>Save favorite jobs for later</li>
                <li>Track application status</li>
                <li>Receive notifications about new jobs</li>
                <li>View institution reviews and ratings</li>
              </ul>
              <Space size="middle" wrap>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate('/jobs')}
                >
                  Start Searching
                </Button>
                <Button 
                  size="large"
                  onClick={() => handleGetStarted('teacher')}
                >
                  Create Profile
                </Button>
              </Space>
            </Col>
            <Col xs={24} lg={12}>
              <div className="section-image-placeholder">
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>👨‍🏫</div>
                <p>Join thousands of teachers finding their perfect opportunity</p>
              </div>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* ============ FOR INSTITUTIONS SECTION ============ */}
        <div className="section">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={12}>
              <div className="section-image-placeholder">
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏫</div>
                <p>Recruit talented teachers for your institution</p>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <h2>For Institutions</h2>
              <ul className="features-list">
                <li>Post and manage teaching positions</li>
                <li>Review teacher profiles and credentials</li>
                <li>Manage applications efficiently</li>
                <li>Featured job listings for maximum visibility</li>
                <li>Detailed analytics and hiring insights</li>
                <li>Bulk hiring tools for large recruitment</li>
              </ul>
              <Space size="middle" wrap>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate('/post-job')}
                >
                  Post a Job
                </Button>
                <Button 
                  size="large"
                  onClick={() => handleGetStarted('institution')}
                >
                  Register Institution
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* ============ HOW IT WORKS SECTION ============ */}
        <div className="section" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
          <h2 className="section-title">How It Works</h2>
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="step-card">
                <div className="step-number">1</div>
                <h3>Sign Up</h3>
                <p>Create your profile in just a few minutes</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="step-card">
                <div className="step-number">2</div>
                <h3>Search & Apply</h3>
                <p>Browse thousands of job opportunities</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="step-card">
                <div className="step-number">3</div>
                <h3>Get Matched</h3>
                <p>Connect with perfect institutions</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="step-card">
                <div className="step-number">4</div>
                <h3>Succeed</h3>
                <p>Land your dream teaching job</p>
              </Card>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* ============ TESTIMONIALS SECTION ============ */}
        <div className="section">
          <h2 className="section-title">What Our Users Say</h2>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={8}>
              <Card className="testimonial-card">
                <p className="testimonial-text">
                  "EduHire made finding my dream job so easy. The platform is user-friendly and the support team is amazing!"
                </p>
                <p className="testimonial-author">- Priya Kumar, Teacher</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="testimonial-card">
                <p className="testimonial-text">
                  "We found excellent teachers through EduHire. The verification process gives us confidence in candidates."
                </p>
                <p className="testimonial-author">- Rajesh Singh, Principal</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="testimonial-card">
                <p className="testimonial-text">
                  "The saved jobs feature is incredibly useful. I can shortlist positions and apply when ready."
                </p>
                <p className="testimonial-author">- Anjali Patel, Teacher</p>
              </Card>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* ============ CTA SECTION ============ */}
        <div className="cta-section">
          <h2>Ready to Transform Your Teaching Career?</h2>
          <p>Join thousands of teachers and institutions on EduHire</p>
          <Space size="large">
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/jobs')}
            >
              Browse Jobs
            </Button>
            <Button 
              size="large"
              onClick={() => handleGetStarted('teacher')}
            >
              Get Started
            </Button>
          </Space>
        </div>
      </Content>
    </Layout>
  );
};

export default LandingPage;
