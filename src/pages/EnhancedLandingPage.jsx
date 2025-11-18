// EnhancedLandingPage.jsx - Modern landing page with hero section, features, and testimonials
import React, { useState, useEffect } from 'react';
import {
  Layout,
  Button,
  Card,
  Row,
  Col,
  Input,
  Space,
  Statistic,
  Avatar,
  Rate,
  Divider,
  Badge,
  Modal
} from 'antd';
import {
  SearchOutlined,
  TeamOutlined,
  ShopOutlined,
  ArrowRightOutlined,
  HeartOutlined,
  RocketOutlined,
  SafetyOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  BankOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './EnhancedLandingPage.css';

const { Content } = Layout;

const EnhancedLandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  // Show login prompt if not logged in (on first load)
  useEffect(() => {
    if (!user) {
      setLoginModalVisible(true);
    }
  }, [user]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/jobs');
    }
  };

  const handleGetStarted = (userType) => {
    if (user) {
      navigate(userType === 'teacher' ? '/jobs' : '/post-job');
    } else {
      const path = userType === 'teacher' ? '/register?type=teacher' : '/register?type=institution';
      navigate(path);
    }
  };

  const features = [
    {
      icon: <SearchOutlined />,
      title: 'Advanced Search',
      description: 'Find jobs by subject, location, level, and more with advanced filters',
      color: '#1890ff'
    },
    {
      icon: <RocketOutlined />,
      title: 'Fast Hiring',
      description: 'Quick application process and instant notifications for opportunities',
      color: '#52c41a'
    },
    {
      icon: <SafetyOutlined />,
      title: 'Verified Institutions',
      description: 'All institutions are verified to ensure your safety and security',
      color: '#faad14'
    },
    {
      icon: <ThunderboltOutlined />,
      title: 'Instant Alerts',
      description: 'Get notified immediately when relevant jobs are posted',
      color: '#f5222d'
    },
    {
      icon: <HeartOutlined />,
      title: 'Save Favorites',
      description: 'Bookmark jobs and create profiles to apply faster',
      color: '#eb2f96'
    },
    {
      icon: <FileTextOutlined />,
      title: 'Easy Application',
      description: 'One-click application with pre-filled resume and information',
      color: '#722ed1'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Singh',
      role: 'Mathematics Teacher',
      institution: 'Delhi Public School',
      rating: 5,
      text: 'Found my dream job within 2 weeks. The platform is intuitive and the job listings are regularly updated.',
      avatar: 'PS'
    },
    {
      name: 'Rahul Patel',
      role: 'English Teacher',
      institution: 'Aditya Birla School',
      rating: 5,
      text: 'Great experience! The entire process from application to offer was smooth and professional.',
      avatar: 'RP'
    },
    {
      name: 'Neha Gupta',
      role: 'Science Teacher',
      institution: 'KV Delhi',
      rating: 4,
      text: 'Very helpful platform. Got multiple interview calls and selected in the first attempt.',
      avatar: 'NG'
    }
  ];

  const stats = [
    { title: 'Active Jobs', value: 1250, prefix: <ShopOutlined />, color: '#1890ff' },
    { title: 'Teachers Hired', value: 3420, prefix: <TeamOutlined />, color: '#52c41a' },
    { title: 'Institutions', value: 500, prefix: <BankOutlined />, color: '#faad14' },
    { title: 'Success Rate', value: 92, suffix: '%', color: '#722ed1' }
  ];

  return (
    <Layout className="enhanced-landing-page">
      {/* Login Prompt Modal */}
      <Modal
        title="Welcome to EduHire! 🎓"
        open={loginModalVisible}
        onCancel={() => setLoginModalVisible(false)}
        footer={null}
        centered
        width={500}
        className="login-prompt-modal"
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>
            Sign up to access exclusive teaching opportunities or browse as a guest.
          </p>
          
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Button
              type="primary"
              size="large"
              block
              onClick={() => {
                setLoginModalVisible(false);
                navigate('/register?type=teacher');
              }}
              icon={<RocketOutlined />}
            >
              Join as a Teacher
            </Button>
            
            <Button
              size="large"
              block
              onClick={() => {
                setLoginModalVisible(false);
                navigate('/register?type=institution');
              }}
              icon={<BankOutlined />}
            >
              Post Jobs as an Institution
            </Button>
            
            <Divider>or</Divider>
            
            <Button
              type="default"
              size="large"
              block
              onClick={() => setLoginModalVisible(false)}
            >
              Browse as Guest
            </Button>
            
            <div style={{ color: '#888', fontSize: '13px' }}>
              Already have an account?{' '}
              <a 
                onClick={() => {
                  setLoginModalVisible(false);
                  navigate('/login');
                }}
                style={{ color: '#1890ff', fontWeight: '500' }}
              >
                Login here
              </a>
            </div>
          </Space>
        </div>
      </Modal>

      <Content>
        {/* ============ HERO SECTION ============ */}
        <section className="hero-section">
          <div className="hero-background" />
          <div className="hero-content">
            <div className="hero-badge">
              <Badge status="processing" text="Trusted by 5,000+ Teachers" />
            </div>
            
            <h1 className="hero-title">
              Find Your Perfect <span className="highlight">Teaching Position</span>
            </h1>
            
            <p className="hero-subtitle">
              Connect with leading educational institutions. Explore opportunities, apply instantly, and build your career.
            </p>

            {/* Search Bar */}
            <div className="search-bar-container">
              <Input.Group compact className="search-group">
                <Input
                  size="large"
                  placeholder="Search by subject, school, or location..."
                  prefix={<SearchOutlined />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onPressEnter={handleSearch}
                  className="search-input"
                  allowClear
                />
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSearch}
                  loading={false}
                  className="search-button"
                  icon={<ArrowRightOutlined />}
                >
                  Search Jobs
                </Button>
              </Input.Group>
            </div>

            {/* CTA Buttons */}
            <div className="hero-cta">
              <Button
                type="primary"
                size="large"
                onClick={() => handleGetStarted('teacher')}
                className="cta-button primary-cta"
                icon={<RocketOutlined />}
              >
                {user ? 'Browse Jobs' : 'Get Started as Teacher'}
              </Button>
              
              <Button
                size="large"
                onClick={() => handleGetStarted('institution')}
                className="cta-button secondary-cta"
                icon={<BankOutlined />}
              >
                {user ? 'Post a Job' : 'Hire Now'}
              </Button>
            </div>
          </div>
        </section>

        {/* ============ STATS SECTION ============ */}
        <section className="stats-section">
          <Row gutter={[32, 32]} justify="center" align="middle">
            {stats.map((stat, index) => (
              <Col key={index} xs={12} sm={12} md={6}>
                <div className="stat-card">
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    valueStyle={{ color: stat.color, fontSize: '32px', fontWeight: '600' }}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </section>

        <Divider className="section-divider" />

        {/* ============ FEATURES SECTION ============ */}
        <section className="features-section">
          <div className="section-header">
            <h2 className="section-title">Why Teachers Love EduHire</h2>
            <p className="section-subtitle">
              Everything you need to find and secure your ideal teaching position
            </p>
          </div>

          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col key={index} xs={24} sm={12} lg={8}>
                <Card
                  className="feature-card"
                  hoverable
                  bordered={false}
                >
                  <div className="feature-icon" style={{ color: feature.color }}>
                    {React.cloneElement(feature.icon, { style: { fontSize: '32px' } })}
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <Divider className="section-divider" />

        {/* ============ HOW IT WORKS SECTION ============ */}
        <section className="how-it-works-section">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Get hired in 3 simple steps</p>
          </div>

          <Row gutter={[32, 32]} align="middle">
            {[
              {
                step: '1',
                title: 'Create Profile',
                description: 'Sign up and build your complete teacher profile with resume and qualifications'
              },
              {
                step: '2',
                title: 'Search & Apply',
                description: 'Browse jobs that match your criteria and apply with one click'
              },
              {
                step: '3',
                title: 'Get Hired',
                description: 'Interview with schools and accept the perfect opportunity'
              }
            ].map((item, index) => (
              <Col key={index} xs={24} md={8}>
                <div className="how-it-works-card">
                  <div className="step-number">{item.step}</div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="step-arrow">
                    <ArrowRightOutlined />
                  </div>
                )}
              </Col>
            ))}
          </Row>
        </section>

        <Divider className="section-divider" />

        {/* ============ TESTIMONIALS SECTION ============ */}
        <section className="testimonials-section">
          <div className="section-header">
            <h2 className="section-title">What Teachers Say</h2>
            <p className="section-subtitle">Real success stories from our community</p>
          </div>

          <Row gutter={[24, 24]}>
            {testimonials.map((testimonial, index) => (
              <Col key={index} xs={24} md={8}>
                <Card className="testimonial-card" hoverable>
                  <div className="testimonial-rating">
                    <Rate disabled value={testimonial.rating} />
                  </div>
                  
                  <p className="testimonial-text">"{testimonial.text}"</p>
                  
                  <div className="testimonial-author">
                    <Avatar
                      size={40}
                      style={{ backgroundColor: '#1890ff' }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    <div className="author-info">
                      <p className="author-name">{testimonial.name}</p>
                      <p className="author-role">{testimonial.role}</p>
                      <p className="author-institution">{testimonial.institution}</p>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <Divider className="section-divider" />

        {/* ============ CTA SECTION ============ */}
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to Find Your Perfect Job?</h2>
            <p>Join thousands of teachers who have found success through EduHire</p>
            
            <div className="cta-buttons">
              <Button
                type="primary"
                size="large"
                onClick={() => handleGetStarted('teacher')}
              >
                {user ? 'Start Searching' : 'Join as Teacher'}
              </Button>
              
              <Button
                size="large"
                onClick={() => navigate('/jobs')}
              >
                Browse Jobs
              </Button>
            </div>
          </div>
        </section>

        {/* ============ FOOTER SECTION ============ */}
        <Divider className="section-divider" />
        
        <footer className="landing-footer">
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} md={6}>
              <h4>About EduHire</h4>
              <ul>
                <li><a href="/">About Us</a></li>
                <li><a href="/">Blog</a></li>
                <li><a href="/">Careers</a></li>
                <li><a href="/">Press</a></li>
              </ul>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <h4>For Teachers</h4>
              <ul>
                <li><a href="/jobs">Browse Jobs</a></li>
                <li><a href="/">How It Works</a></li>
                <li><a href="/">Tips & Resources</a></li>
              </ul>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <h4>For Schools</h4>
              <ul>
                <li><a href="/">Post a Job</a></li>
                <li><a href="/">Pricing</a></li>
                <li><a href="/">Features</a></li>
              </ul>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <h4>Support</h4>
              <ul>
                <li><a href="/">Help Center</a></li>
                <li><a href="/">Contact Us</a></li>
                <li><a href="/">Privacy Policy</a></li>
                <li><a href="/">Terms of Service</a></li>
              </ul>
            </Col>
          </Row>

          <Divider />

          <div className="footer-bottom">
            <p>&copy; 2025 EduHire. All rights reserved.</p>
            <Space>
              <a href="/">Twitter</a>
              <span>•</span>
              <a href="/">LinkedIn</a>
              <span>•</span>
              <a href="/">Facebook</a>
            </Space>
          </div>
        </footer>
      </Content>
    </Layout>
  );
};

export default EnhancedLandingPage;
