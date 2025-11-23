// TeacherDashboard.jsx - Teacher dashboard component (FIXED)
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Spin, 
  Empty,
  Button,
  Space,
  message,
  Alert
} from 'antd';
import { 
  SendOutlined, 
  EyeOutlined, 
  BookOutlined, 
  CheckCircleOutlined,
  ArrowRightOutlined,
  ExclamationOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Mock data for development/fallback
const getMockStats = () => ({
  totalApplications: 12,
  applicationsByStatus: {
    pending: 5,
    shortlisted: 4,
    rejected: 3
  },
  savedJobs: 28,
  profileViews: 87,
  applicationsOverTime: [
    { date: '2025-11-15', count: 2 },
    { date: '2025-11-16', count: 1 },
    { date: '2025-11-17', count: 3 },
    { date: '2025-11-18', count: 2 }
  ],
  applicationsBySubject: [
    { subject: 'Mathematics', count: 4 },
    { subject: 'English', count: 3 },
    { subject: 'Science', count: 2 },
    { subject: 'History', count: 2 },
    { subject: 'Computer Science', count: 1 }
  ],
  recentApplications: [
    {
      _id: '1',
      status: 'shortlisted',
      jobid: {
        title: 'Senior Mathematics Teacher',
        institutionid: { institutionName: 'Delhi Public School' }
      }
    },
    {
      _id: '2',
      status: 'pending',
      jobid: {
        title: 'English Language Teacher',
        institutionid: { institutionName: 'Aditya Birla School' }
      }
    },
    {
      _id: '3',
      status: 'rejected',
      jobid: {
        title: 'Science Teacher (Physics)',
        institutionid: { institutionName: 'KV Delhi' }
      }
    }
  ]
});

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      
      if (!API_BASE_URL) {
        console.warn('API base URL not configured, using mock data');
        setStats(getMockStats());
        setUseMockData(true);
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token, using mock data');
        setStats(getMockStats());
        setUseMockData(true);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/dashboard/teacher-stats`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });

      if (response.data.success && response.data.stats) {
        setStats(response.data.stats);
        setUseMockData(false);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // Fallback to mock data
      setStats(getMockStats());
      setUseMockData(true);
      
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load dashboard';
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      await fetchDashboardStats();
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <Empty 
        description="Unable to load dashboard" 
        style={{ margin: '60px 0' }}
      >
        <Button onClick={fetchDashboardStats}>Retry</Button>
      </Empty>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 className="page-title">Teacher Dashboard</h1>

      {useMockData && (
        <Alert
          message="Using Sample Data"
          description="You're viewing sample data. Please log in to see your actual dashboard statistics."
          type="info"
          icon={<ExclamationOutlined />}
          showIcon
          style={{ marginBottom: '24px' }}
          closable
        />
      )}

      {errorMessage && !useMockData && (
        <Alert
          message="Warning"
          description={errorMessage}
          type="warning"
          icon={<ExclamationOutlined />}
          showIcon
          style={{ marginBottom: '24px' }}
          closable
        />
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Applications Sent"
              value={stats.totalApplications || 0}
              prefix={<SendOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Profile Views"
              value={stats.profileViews || 0}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Saved Jobs"
              value={stats.savedJobs || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Shortlisted"
              value={stats.applicationsByStatus?.shortlisted || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Application Status Summary */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Application Status Breakdown">
            <div style={{ paddingTop: 12 }}>
              <div style={{ marginBottom: 12 }}>
                <p><strong>Pending:</strong> {stats.applicationsByStatus?.pending || 0}</p>
              </div>
              <div style={{ marginBottom: 12 }}>
                <p><strong>Shortlisted:</strong> {stats.applicationsByStatus?.shortlisted || 0}</p>
              </div>
              <div>
                <p><strong>Rejected:</strong> {stats.applicationsByStatus?.rejected || 0}</p>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Quick Actions">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                block 
                icon={<ArrowRightOutlined />}
                onClick={() => navigate('/jobs')}
              >
                Browse Jobs
              </Button>
              <Button 
                block 
                icon={<BookOutlined />}
                onClick={() => navigate('/saved-jobs')}
              >
                View Saved Jobs
              </Button>
              <Button 
                block 
                icon={<SendOutlined />}
                onClick={() => navigate('/my-applications')}
              >
                My Applications
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Applications */}
      {stats.recentApplications && stats.recentApplications.length > 0 && (
        <Card title="Recent Applications" style={{ marginTop: 24 }}>
          <div>
            {stats.recentApplications.map((app) => (
              <div 
                key={app._id} 
                style={{ 
                  padding: '12px', 
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>{app.jobId?.title}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                    {app.jobId?.institutionid?.institutionName}
                  </p>
                </div>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  backgroundColor: app.status === 'pending' ? '#e6f7ff' :
                                   app.status === 'shortlisted' ? '#f6ffed' : '#fff1f0',
                  color: app.status === 'pending' ? '#1890ff' :
                         app.status === 'shortlisted' ? '#52c41a' : '#ff4d4f',
                  fontSize: '12px'
                }}>
                  {app.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default TeacherDashboard;
