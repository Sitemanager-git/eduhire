import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Upload, Avatar, Row, Col, message, Spin, Modal } from 'antd';
import { CameraOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { teacherAPI, institutionAPI } from '../services/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      let response;

      if (user?.userType === 'teacher') {
        response = await teacherAPI.get();
      } else {
        response = await institutionAPI.get();
      }

      // Response data is already contract-mapped from API service
      const profileInfo = response.data;

      if (profileInfo && Object.keys(profileInfo).length > 0) {
        setProfileData(profileInfo);
        
        // Map contract field names to form field names
        const formData = mapContractToForm(profileInfo, user?.userType);
        form.setFieldsValue(formData);
        
        console.log('✓ Profile loaded:', formData);
      } else {
        console.warn('⚠️ No profile data received');
        message.warning('Profile data not found - please complete your profile setup');
      }
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to load profile';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle profile picture upload
   */
  const handleProfilePictureUpload = async (file) => {
    try {
      setUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('profilePicture', file);

      let response;
      if (user?.userType === 'teacher') {
        response = await teacherAPI.update(formData);
      } else {
        response = await institutionAPI.update(formData);
      }

      if (response.data?.profilePicture) {
        setProfileData(prev => ({
          ...prev,
          profilePicture: response.data.profilePicture
        }));
        message.success('✓ Profile picture updated successfully');
      }
    } catch (error) {
      console.error('❌ Picture upload error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to upload picture';
      message.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle preview image
   */
  const handlePreviewImage = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPreviewImage(reader.result);
      setPreviewOpen(true);
    };
    return false;
  };

  /**
   * Map contract response fields to form field names
   * Teachers: name → name, subject → subject, experience → experience, qualifications → qualifications
   * Institutions: name → name, schoolName → schoolName, location → location, about → about
   */
  const mapContractToForm = (contractData, userType) => {
    if (userType === 'teacher') {
      return {
        name: contractData.name,
        email: contractData.email,
        subject: contractData.subject,
        experience: contractData.experience,
        qualifications: contractData.qualifications
      };
    } else {
      return {
        name: contractData.name,
        email: contractData.email,
        schoolName: contractData.schoolName,
        location: contractData.location,
        about: contractData.about
      };
    }
  };

  /**
   * Map form field names to contract field names for update
   */
  const mapFormToContract = (formData, userType) => {
    if (userType === 'teacher') {
      return {
        name: formData.name,
        subject: formData.subject,
        experience: formData.experience,
        qualifications: formData.qualifications
      };
    } else {
      return {
        name: formData.name,
        schoolName: formData.schoolName,
        location: formData.location,
        about: formData.about
      };
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Map form fields to contract fields
      const contractData = mapFormToContract(values, user?.userType);

      let response;
      if (user?.userType === 'teacher') {
        response = await teacherAPI.update(contractData);
      } else {
        response = await institutionAPI.update(contractData);
      }

      message.success('✓ Profile updated successfully');

      // Update state with response data (already contract-mapped)
      const updatedProfile = response.data;
      if (updatedProfile) {
        setProfileData(updatedProfile);
        const formData = mapContractToForm(updatedProfile, user?.userType);
        form.setFieldsValue(formData);
      }
    } catch (error) {
      console.error('❌ Profile update error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update profile';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin /></div>;
  }

  return (
    <div className="profile-page" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Card title="My Profile" bordered={false}>
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Avatar 
                size={120} 
                src={profileData?.profilePicture}
                icon={<CameraOutlined />}
                style={{ marginBottom: '16px' }}
              />
              <Upload
                maxCount={1}
                beforeUpload={(file) => {
                  // Validate file type
                  const isImage = file.type.startsWith('image/');
                  if (!isImage) {
                    message.error('Please upload an image file');
                    return false;
                  }
                  // Validate file size (max 5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    message.error('Image must be smaller than 5MB');
                    return false;
                  }
                  return true;
                }}
                onChange={(info) => {
                  if (info.file.status === 'done' || info.fileList.length > 0) {
                    const file = info.fileList[0]?.originFileObj;
                    if (file) {
                      handleProfilePictureUpload(file);
                    }
                  }
                }}
              >
                <Button icon={<CameraOutlined />} loading={uploading}>Change Picture</Button>
              </Upload>
            </div>
          </Col>

          <Col xs={24} md={16}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter your full name" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: 'email' }]}
              >
                <Input disabled />
              </Form.Item>

              {user?.userType === 'teacher' ? (
                <>
                  <Form.Item name="subject" label="Subject Expertise">
                    <Input placeholder="e.g., Mathematics, English" />
                  </Form.Item>
                  <Form.Item name="experience" label="Years of Experience">
                    <Input type="number" placeholder="Enter years" />
                  </Form.Item>
                  <Form.Item name="qualifications" label="Qualifications">
                    <Input.TextArea rows={3} placeholder="Enter your qualifications" />
                  </Form.Item>
                </>
              ) : (
                <>
                  <Form.Item name="schoolName" label="School Name">
                    <Input placeholder="Enter school name" />
                  </Form.Item>
                  <Form.Item name="location" label="Location">
                    <Input placeholder="Enter location" />
                  </Form.Item>
                  <Form.Item name="about" label="About School">
                    <Input.TextArea rows={3} placeholder="Tell us about your school" />
                  </Form.Item>
                </>
              )}

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Card>

      {/* Image Preview Modal */}
      <Modal 
        open={previewOpen} 
        title="Preview" 
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default ProfilePage;
