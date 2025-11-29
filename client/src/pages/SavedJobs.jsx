// SavedJobs.jsx - Saved jobs page for teachers (FIXED v2)
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Empty, 
  Spin, 
  Space, 
  Tag,
  Tooltip,
  message,
  Tabs
} from 'antd';
import { 
  DeleteOutlined, 
  EyeOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { bookmarkAPI } from '../services/api';

const SavedJobs = () => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('interested');

  // Fetch saved jobs whenever filter category changes
  useEffect(() => {
    let isMounted = true;

    const loadSavedJobs = async () => {
      try {
        setLoading(true);

        const response = await bookmarkAPI.getAll();
        
        if (isMounted && response.data.success) {
          setSavedJobs(response.data.bookmarks);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch saved jobs:', error);
          message.error('Failed to load saved jobs');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSavedJobs();

    return () => {
      isMounted = false; // Prevent setState on unmounted component
    };
  }, [filterCategory]);

  const handleRemoveBookmark = async (jobId) => {
    try {
      await bookmarkAPI.remove(jobId);

      setSavedJobs(prev => prev.filter(job => job.jobId._id !== jobId));
      message.success('Bookmark removed');
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      message.error('Failed to remove bookmark');
    }
  };

  const formatSalary = (salary) => {
    if (!salary || !salary.min || !salary.max) return 'Not disclosed';
    return `₹${(salary.min/1000).toFixed(0)}k - ₹${(salary.max/1000).toFixed(0)}k`;
  };

  const JobCard = ({ job }) => (
    <Card
      hoverable
      className="saved-job-card"
      actions={[
        <Tooltip title="View Details">
          <Button 
            type="text" 
            icon={<EyeOutlined />}
            onClick={() => navigate(`/jobs/${job.jobId._id}`)}
          />
        </Tooltip>,
        <Tooltip title="Remove from Saved">
          <Button 
            type="text" 
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleRemoveBookmark(job.jobId._id)}
          />
        </Tooltip>
      ]}
    >
      <Card.Meta
        title={job.jobId.title}
        description={job.jobId.institutionid?.institutionName}
      />

      <div className="job-details" style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <strong>Subject:</strong> {job.jobId.subject}
          </div>
          <div>
            <strong>Level:</strong> {job.jobId.level}
          </div>
          <div>
            <strong>Location:</strong> {job.jobId.location}
          </div>
          <div>
            <strong>Salary:</strong> {formatSalary(job.jobId.salary)}
          </div>
          <div>
            <strong>Type:</strong> <Tag>{job.jobId.employmentType}</Tag>
          </div>
          {job.notes && (
            <div>
              <strong>Notes:</strong> {job.notes}
            </div>
          )}
          <div style={{ fontSize: '12px', color: '#999' }}>
            Saved: {new Date(job.createdAt).toLocaleDateString()}
          </div>
        </Space>
      </div>
    </Card>
  );

  return (
    <div className="saved-jobs-page" style={{ padding: '24px' }}>
      <h1 className="page-title">
        <HeartOutlined /> My Saved Jobs
      </h1>

      <Card style={{ marginBottom: 24 }}>
        <Tabs
          activeKey={filterCategory}
          onChange={setFilterCategory}
        >
          <Tabs.TabPane 
            tab={`Interested (${savedJobs.filter(j => j.category === 'interested').length})`} 
            key="interested" 
          />
          <Tabs.TabPane 
            tab={`Applied (${savedJobs.filter(j => j.category === 'applied').length})`} 
            key="applied" 
          />
          <Tabs.TabPane 
            tab={`Interview (${savedJobs.filter(j => j.category === 'interview').length})`} 
            key="interview" 
          />
          <Tabs.TabPane 
            tab={`Wishlist (${savedJobs.filter(j => j.category === 'wishlist').length})`} 
            key="wishlist" 
          />
        </Tabs>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Loading saved jobs..." />
        </div>
      ) : savedJobs.length === 0 ? (
        <Empty 
          description="No saved jobs"
          style={{ margin: '60px 0' }}
        >
          <Button 
            type="primary" 
            onClick={() => navigate('/jobs')}
          >
            Browse Jobs
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {savedJobs.map((job) => (
            <Col key={job._id} xs={24} sm={12} lg={8}>
              <JobCard job={job} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default SavedJobs;
