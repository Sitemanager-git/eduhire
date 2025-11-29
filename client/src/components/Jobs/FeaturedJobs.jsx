import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Button, Spin, Empty } from 'antd';
import { 
  EnvironmentOutlined, 
  DollarOutlined, 
  FireOutlined,
  ThunderboltOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';

const FeaturedJobs = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.search({ limit: 6, featured: true });
      
      if (response.data.success) {
        setFeaturedJobs(response.data.jobs);
      }
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badgeType) => {
    switch(badgeType) {
      case 'featured':
        return <StarOutlined style={{ color: '#faad14' }} />;
      case 'hot':
        return <FireOutlined style={{ color: '#ff4d4f' }} />;
      case 'urgent':
        return <ThunderboltOutlined style={{ color: '#1890ff' }} />;
      default:
        return null;
    }
  };

  const formatSalary = (salary) => {
    if (!salary || !salary.min || !salary.max) return 'Not disclosed';
    return `₹${(salary.min/1000)}k - ₹${(salary.max/1000)}k/month`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" tip="Loading featured jobs..." />
      </div>
    );
  }

  if (!featuredJobs.length) {
    return (
      <Empty 
        description="No featured jobs available at the moment"
        className="py-10"
      />
    );
  }

  return (
    <div className="featured-jobs-section py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">
          <StarOutlined className="mr-2" style={{ color: '#faad14' }} />
          Featured Teaching Opportunities
        </h2>
        <Button 
          type="link" 
          onClick={() => navigate('/jobs')}
        >
          View All Jobs →
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {featuredJobs.map((job) => (
          <Col xs={24} sm={12} lg={8} key={job._id}>
            <Card
              hoverable
              className="h-full relative border-2 border-yellow-400"
              onClick={() => navigate(`/jobs/${job._id}`)}
              style={{
                background: 'linear-gradient(135deg, #fff9e6 0%, #ffffff 100%)'
              }}
            >
              {/* Featured Badge */}
              <div className="absolute top-3 right-3">
                <Tag color="gold" icon={getBadgeIcon(job.badgetype)}>
                  {job.badgetype?.toUpperCase() || 'FEATURED'}
                </Tag>
              </div>

              {/* Job Title */}
              <h3 className="text-xl font-bold mb-2 pr-20">
                {job.title}
              </h3>

              {/* Institution Name */}
              <p className="text-gray-600 mb-4">
                {job.institutionid?.institutionName || 'Institution'}
              </p>

              {/* Job Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <EnvironmentOutlined className="mr-2" />
                  <span>{job.location}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <DollarOutlined className="mr-2" />
                  <span>{formatSalary(job.salary)}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <Tag color="blue">{job.subject}</Tag>
                <Tag color="green">{job.level}</Tag>
                <Tag>{job.employmentType}</Tag>
                {job.experience && (
                  <Tag color="purple">{job.experience}+ years</Tag>
                )}
              </div>

              {/* Priority Tier Indicator */}
              {job.priorityplacementtier === 1 && (
                <div className="absolute top-3 left-3">
                  <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    PREMIUM
                  </div>
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default FeaturedJobs;
