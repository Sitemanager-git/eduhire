// InstitutionDashboard.jsx - Institution dashboard component (FIXED)
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
  message
} from 'antd';
import { 
  FileTextOutlined, 
  SendOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const InstitutionDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      // FIXED: Correct template literal syntax and Bearer token
      const response = await axios.get(`${API_BASE_URL}/dashboard/institution-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      message.error('Failed to load dashboard');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

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
      <h1 className="page-title">Institution Dashboard</h1>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Jobs Posted"
              value={stats.totalJobs || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Jobs"
              value={stats.activeJobs || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Applications"
              value={stats.totalApplications || 0}
              prefix={<SendOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Profile Views"
              value={stats.profileViews || 0}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#722ed1' }}
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
                onClick={() => navigate('/post-job')}
              >
                Post New Job
              </Button>
              <Button 
                block 
                icon={<FileTextOutlined />}
                onClick={() => navigate('/my-jobs')}
              >
                View My Jobs
              </Button>
              <Button 
                block 
                icon={<SendOutlined />}
                onClick={() => navigate('/applications-received')}
              >
                Review Applications
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
                  <p style={{ margin: 0, fontWeight: 500 }}>{app.teacherid?.fullName}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                    Applied for: {app.jobid?.title}
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

export default InstitutionDashboard;
