import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Avatar, Tag, Descriptions, Button, Spin, message, Divider, Empty } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  BookOutlined,
  TrophyOutlined,
  FileTextOutlined,
  StarOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ReviewList from '../components/ReviewList';
import WriteReview from '../components/WriteReview';
import './TeacherProfile.css';

const TeacherProfile = () => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const id = paramId || (user && user._id);
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(0);

  const [idError, setIdError] = useState(false);

  const fetchTeacherProfile = useCallback(async () => {
    if (!id) {
      setIdError(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/teachers/${id}`);
      setProfile(response.data.profile);
    } catch (error) {
      console.error('Failed to fetch teacher profile:', error);
      message.error('Failed to load teacher profile');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTeacherProfile();
  }, [fetchTeacherProfile]);

  // Check if current user can write a review
  const canWriteReview = () => {
    if (!user) return false;
    
    // Institutions can review teachers (after hiring - checked in backend)
    if (user.userType === 'institution' && profile?.userId) {
      return true;
    }
    
    return false;
  };

  const handleReviewSuccess = () => {
    setRefreshReviews(prev => prev + 1);
    fetchTeacherProfile(); // Refresh to get updated rating
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Loading teacher profile..." />
      </div>
    );
  }

  if (idError) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Empty description="Invalid teacher ID. Please check the URL or try again from the jobs page." />
        <Button type="primary" onClick={() => navigate('/jobs')}>
          Browse Jobs
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Empty description="Teacher profile not found" />
        <Button type="primary" onClick={() => navigate('/jobs')}>
          Browse Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="teacher-profile-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        {/* Main Profile Content */}
        <Col xs={24} lg={16}>
          {/* Header Card */}
          <Card className="profile-header-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <Avatar 
                size={120} 
                src={profile.photo} 
                icon={<UserOutlined />}
                style={{ flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: 'bold' }}>
                  {profile.fullName}
                </h1>
                
                {/* Rating Display */}
                {profile.averageRating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <StarOutlined style={{ color: '#f59e0b', fontSize: '20px' }} />
                    <span style={{ fontSize: '18px', fontWeight: '600' }}>
                      {profile.averageRating.toFixed(1)}
                    </span>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      ({profile.totalReviews} {profile.totalReviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <Tag icon={<TrophyOutlined />} color="blue">
                    {profile.experience} years experience
                  </Tag>
                  <Tag icon={<BookOutlined />} color="green">
                    {profile.education}
                  </Tag>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#666' }}>
                  <span><MailOutlined /> {profile.email}</span>
                  <span><PhoneOutlined /> {profile.phone}</span>
                  <span>
                    <EnvironmentOutlined /> {profile.location?.district}, {profile.location?.state}
                  </span>
                </div>

                {/* Edit Profile & Resume Controls - Only for owner */}
                {user && user._id === profile.userId && (
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Button 
                      type="primary" 
                      icon={<EditOutlined />}
                      onClick={() => navigate('/create-teacher-profile')}
                    >
                      Edit Profile
                    </Button>
                    {profile.resume ? (
                      <>
                        <Button onClick={() => navigate('/profile?tab=resume')}>Modify Resume</Button>
                        <Button danger onClick={() => {
                          // Add actual delete logic here
                          message.info('Resume delete functionality not implemented.');
                        }}>Delete Resume</Button>
                      </>
                    ) : (
                      <Button type="dashed" onClick={() => navigate('/profile?tab=resume')}>Upload Resume</Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Subjects & Skills */}
          <Card title="Subjects & Specialization" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {profile.subjects?.map((subject, idx) => (
                <Tag key={idx} color="purple" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {subject}
                </Tag>
              ))}
              {profile.otherSubjects && (
                <Tag color="orange" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {profile.otherSubjects}
                </Tag>
              )}
            </div>
          </Card>

          {/* Documents */}
          {profile.resume && (
            <Card title="Documents" style={{ marginBottom: '24px' }}>
              <Button 
                type="primary" 
                icon={<FileTextOutlined />}
                href={profile.resume}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Resume
              </Button>
            </Card>
          )}
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Card title="Profile Details" style={{ marginBottom: '24px' }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Experience">
                {profile.experience} years
              </Descriptions.Item>
              <Descriptions.Item label="Education">
                {profile.education}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {profile.location?.district}, {profile.location?.state}
              </Descriptions.Item>
              <Descriptions.Item label="PIN Code">
                {profile.location?.pincode}
              </Descriptions.Item>
              <Descriptions.Item label="Profile Status">
                <Tag color={profile.profileCompleted ? 'success' : 'warning'}>
                  {profile.profileCompleted ? 'Complete' : 'Incomplete'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Reviews & Ratings Section */}
      <div className="reviews-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            Reviews & Ratings
          </h2>
          {canWriteReview() && (
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => setShowReviewModal(true)}
            >
              Write a Review
            </Button>
          )}
        </div>
        
        <ReviewList 
          entityType="Teacher"
          entityId={profile.userId || id}
          key={refreshReviews}
        />
      </div>

      {/* Write Review Modal */}
      <WriteReview
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        entityId={profile.userId || id}
        entityType="Teacher"
        entityName={profile.fullName}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
};

export default TeacherProfile;
