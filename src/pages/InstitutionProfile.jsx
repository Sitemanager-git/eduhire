import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Tag, Descriptions, Button, Spin, message, Divider, Empty, Space } from 'antd';
import { 
  BankOutlined,
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  TeamOutlined,
  GlobalOutlined,
  StarOutlined,
  EditOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  InstagramOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ReviewList from '../components/ReviewList';
import WriteReview from '../components/WriteReview';
import './InstitutionProfile.css';

const InstitutionProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(0);



  const fetchInstitutionProfile = useCallback(async (isMounted) => {
    try {
      if (!isMounted) return;
      
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/institutions/${id}`);
      
      if (isMounted) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      if (isMounted) {
        console.error('Failed to fetch institution profile:', error);
        message.error('Failed to load institution profile');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    fetchInstitutionProfile(isMounted);

    return () => {
      isMounted = false; // Prevent setState on unmounted component
    };
  }, [fetchInstitutionProfile]);

  // Check if current user can write a review
  const canWriteReview = () => {
    if (!user) return false;
    
    // Teachers can review institutions
    if (user.userType === 'teacher' && profile?._id) {
      return true;
    }
    
    return false;
  };

  const handleReviewSuccess = () => {
    setRefreshReviews(prev => prev + 1);
    fetchInstitutionProfile(); // Refresh to get updated rating
  };

  const parseSocialMedia = (socialMediaString) => {
    try {
      return JSON.parse(socialMediaString || '{}');
    } catch {
      return {};
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Loading institution profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Empty description="Institution profile not found" />
        <Button type="primary" onClick={() => navigate('/jobs')}>
          Browse Jobs
        </Button>
      </div>
    );
  }

  const socialMedia = parseSocialMedia(profile.socialMedia);

  return (
    <div className="institution-profile-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        {/* Main Profile Content */}
        <Col xs={24} lg={16}>
          {/* Header Card */}
          <Card className="profile-header-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                backgroundColor: '#1890ff', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <BankOutlined style={{ fontSize: '60px', color: 'white' }} />
              </div>
              
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: 'bold' }}>
                  {profile.institutionName}
                </h1>
                
                <Tag color="blue" style={{ marginBottom: '12px' }}>
                  {profile.type?.toUpperCase()}
                </Tag>
                
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#666' }}>
                  <span><MailOutlined /> {profile.email}</span>
                  {profile.hrEmail && <span><MailOutlined /> HR: {profile.hrEmail}</span>}
                  <span><PhoneOutlined /> {profile.phone}</span>
                  <span>
                    <EnvironmentOutlined /> {profile.address}, {profile.location?.district}, {profile.location?.state} - {profile.location?.pincode}
                  </span>
                  {profile.website && (
                    <span>
                      <GlobalOutlined /> 
                      <a href={profile.website} target="_blank" rel="noopener noreferrer">
                        {profile.website}
                      </a>
                    </span>
                  )}
                </div>

                {/* Social Media Links */}
                {Object.keys(socialMedia).length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <Space>
                      {socialMedia.facebook && (
                        <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer">
                          <FacebookOutlined style={{ fontSize: '24px', color: '#1877f2' }} />
                        </a>
                      )}
                      {socialMedia.twitter && (
                        <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer">
                          <TwitterOutlined style={{ fontSize: '24px', color: '#1da1f2' }} />
                        </a>
                      )}
                      {socialMedia.linkedin && (
                        <a href={socialMedia.linkedin} target="_blank" rel="noopener noreferrer">
                          <LinkedinOutlined style={{ fontSize: '24px', color: '#0077b5' }} />
                        </a>
                      )}
                      {socialMedia.instagram && (
                        <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer">
                          <InstagramOutlined style={{ fontSize: '24px', color: '#e4405f' }} />
                        </a>
                      )}
                    </Space>
                  </div>
                )}

                {/* Edit Profile Button - Only for owner */}
                {user && user._id === profile._id && (
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />}
                    onClick={() => navigate('/create-institution-profile')}
                    style={{ marginTop: '16px' }}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* About Section */}
          {profile.description && (
            <Card title="About Institution" style={{ marginBottom: '24px' }}>
              <p style={{ lineHeight: '1.8', color: '#333' }}>
                {profile.description}
              </p>
            </Card>
          )}

          {/* Curriculum & Sections */}
          <Card title="Curriculum & Sections" style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '8px', color: '#666' }}>Curriculum Offered:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.curriculumOffered?.map((curriculum, idx) => (
                  <Tag key={idx} color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
                    {curriculum}
                  </Tag>
                ))}
                {profile.otherCurriculum && (
                  <Tag color="orange" style={{ fontSize: '14px', padding: '4px 12px' }}>
                    {profile.otherCurriculum}
                  </Tag>
                )}
              </div>
            </div>
            
            {profile.sectionsOffered?.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '8px', color: '#666' }}>Sections Offered:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profile.sectionsOffered.map((section, idx) => (
                    <Tag key={idx} color="purple" style={{ fontSize: '14px', padding: '4px 12px' }}>
                      {section}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Statistics */}
          <Card title="Institution Statistics" style={{ marginBottom: '24px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <TeamOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{profile.numberOfStudents}</div>
                  <div style={{ color: '#666' }}>Students</div>
                </div>
              </Col>
              <Col xs={12} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <TeamOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '8px' }} />
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{profile.numberOfTeachers}</div>
                  <div style={{ color: '#666' }}>Teachers</div>
                </div>
              </Col>
              <Col xs={12} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <BankOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: '8px' }} />
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{profile.numberOfCampuses}</div>
                  <div style={{ color: '#666' }}>Campuses</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Card title="Institution Details" style={{ marginBottom: '24px' }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Type">
                {profile.type}
              </Descriptions.Item>
              <Descriptions.Item label="School Type">
                {profile.schoolType}
              </Descriptions.Item>
              <Descriptions.Item label="Students">
                {profile.numberOfStudents}
              </Descriptions.Item>
              <Descriptions.Item label="Teachers">
                {profile.numberOfTeachers}
              </Descriptions.Item>
              <Descriptions.Item label="Avg Class Size">
                {profile.avgClassSize} students
              </Descriptions.Item>
              <Descriptions.Item label="Campuses">
                {profile.numberOfCampuses}
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
          entityType="Institution"
          entityId={profile._id || id}
          key={refreshReviews}
        />
      </div>

      {/* Write Review Modal */}
      <WriteReview
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        entityId={profile._id || id}
        entityType="Institution"
        entityName={profile.institutionName}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
};

export default InstitutionProfile;
