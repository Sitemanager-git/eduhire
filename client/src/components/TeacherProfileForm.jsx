import { Modal } from 'antd';

import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Steps,
  message,
  Upload,
  Checkbox,
  InputNumber,
  Select,
  Card,
  Row,
  Col,
  Space
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { teacherAPI, locationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SUBJECT_OPTIONS } from '../constants/formData';
import './TeacherProfileForm.css';

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const TeacherProfileForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [form] = Form.useForm();

  // Fetch states on mount
  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await locationAPI.getStates();
      setStates(response.data.states);
    } catch (error) {
      message.error('Failed to load states');
    }
  };

  const fetchDistricts = async (state) => {
    try {
      const response = await locationAPI.getDistricts(state);
      setDistricts(response.data.districts || []);
    } catch (error) {
      console.error('Failed to load districts:', error);
      setDistricts([]);
      message.error('Failed to load districts');
    }
  };

  const handleStateChange = (state) => {
    form.setFieldsValue({ district: undefined });
    // Fetch districts and ensure state is updated before component re-renders
    fetchDistricts(state);
  };

  // Step 1: Personal Information
  const Step1PersonalInfo = () => (
    <Card title="Personal Information" className="form-card">
      <Form.Item
        label="Full Name"
        name="fullName"
        rules={[{ required: true, message: 'Please enter your full name' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Enter your full name" size="large" />
      </Form.Item>

      <Form.Item
        label="Email Address"
        name="email"
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' }
        ]}
      >
        <Input placeholder="your.email@example.com" size="large" />
      </Form.Item>

      <Form.Item
        label="Phone Number"
        name="phone"
        rules={[
          { required: true, message: 'Please enter your phone number' },
          { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
        ]}
      >
        <Input placeholder="10-digit mobile number" maxLength={10} size="large" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="State"
            name="state"
            rules={[{ required: true, message: 'Please select state' }]}
          >
            <Select
              placeholder="Select state"
              size="large"
              showSearch
              onChange={handleStateChange}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {states.map((state) => (
                <Option key={state} value={state}>
                  {state}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="District"
            name="district"
            rules={[{ required: true, message: 'Please select district' }]}
          >
            <Select
              placeholder="Select district"
              size="large"
              showSearch
              disabled={!districts.length}
            >
              {districts.map((district) => (
                <Option key={district} value={district}>
                  {district}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="PIN Code"
            name="pincode"
            rules={[
              { required: true, message: 'Please enter PIN code' },
              { pattern: /^[0-9]{6}$/, message: 'Please enter a valid 6-digit PIN code' }
            ]}
          >
            <Input placeholder="6-digit PIN" maxLength={6} size="large" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  // Step 2: Education & Experience
  const Step2Education = () => (
    <Card title="Education & Experience" className="form-card">
      <Form.Item
        label="Highest Education Qualification"
        name="education"
        rules={[{ required: true, message: 'Please enter your education qualification' }]}
      >
        <Input
          prefix={<BookOutlined />}
          placeholder="e.g., B.Ed, M.Ed, PhD in Education"
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="Years of Teaching Experience"
        name="experience"
        rules={[{ required: true, message: 'Please enter your experience' }]}
      >
        <InputNumber
          min={0}
          max={50}
          placeholder="Years"
          size="large"
          style={{ width: '100%' }}
        />
      </Form.Item>
    </Card>
  );

  // Step 3: Subject Selection
  const Step3Subjects = () => (
    <Card title="Subject Specialization" className="form-card">
      <Form.Item
        label="Select Subjects You Teach"
        name="subjects"
        rules={[{ required: true, message: 'Please select at least one subject' }]}
      >
        <Checkbox.Group style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            {SUBJECT_OPTIONS.map((subject) => (
              <Col span={8} key={subject}>
                <Checkbox value={subject}>{subject}</Checkbox>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </Form.Item>

      <Form.Item
        label="Other Subjects (if not listed above)"
        name="otherSubjects"
      >
        <TextArea
          rows={3}
          placeholder="Enter other subjects separated by commas"
        />
      </Form.Item>
    </Card>
  );

  // Step 4: Resume Upload
  const Step4Upload = () => {
    const resumeProps = {
      name: 'resume',
      multiple: false,
      accept: '.pdf,.doc,.docx',
      beforeUpload: (file) => {
        console.log('📁 [TeacherProfileForm] Resume file selected:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        
        const isPDF = file.type === 'application/pdf';
        const isDoc =
          file.type === 'application/msword' ||
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        if (!isPDF && !isDoc) {
          console.error('❌ Invalid file type:', file.type);
          message.error('You can only upload PDF or DOC files!');
          return Upload.LIST_IGNORE;
        }

        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
          console.error('❌ File too large:', file.size / 1024 / 1024, 'MB');
          message.error('File must be smaller than 5MB!');
          return Upload.LIST_IGNORE;
        }

        console.log('✅ Resume file validation passed');
        setResumeFile(file);
        return false;
      },
      onRemove: () => {
        console.log('🗑️ Resume file removed');
        setResumeFile(null);
      },
      fileList: resumeFile ? [resumeFile] : []
    };

    const photoProps = {
      name: 'photo',
      multiple: false,
      accept: 'image/*',
      beforeUpload: (file) => {
        console.log('📁 [TeacherProfileForm] Photo file selected:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
          console.error('❌ Invalid image type:', file.type);
          message.error('You can only upload image files!');
          return Upload.LIST_IGNORE;
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          console.error('❌ Image too large:', file.size / 1024 / 1024, 'MB');
          message.error('Image must be smaller than 2MB!');
          return Upload.LIST_IGNORE;
        }

        console.log('✅ Photo file validation passed');
        setPhotoFile(file);
        return false;
      },
      onRemove: () => {
        console.log('🗑️ Photo file removed');
        setPhotoFile(null);
      },
      fileList: photoFile ? [photoFile] : []
    };

    return (
      <Card title="Upload Documents" className="form-card">
        <Form.Item label="Upload Resume (PDF/DOC)" required>
          <Dragger {...resumeProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag resume to upload</p>
            <p className="ant-upload-hint">
              Support for PDF or DOC files (max 5MB)
            </p>
          </Dragger>
        </Form.Item>

        <Form.Item label="Upload Profile Photo (Optional)">
          <Dragger {...photoProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag photo to upload</p>
            <p className="ant-upload-hint">
              Support for image files (max 2MB)
            </p>
          </Dragger>
        </Form.Item>
      </Card>
    );
  };

  // Handle step navigation
  const next = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      setFormData({ ...formData, ...values });
      setCurrentStep(currentStep + 1);
    } catch (error) {
      message.error('Please fill all required fields');
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  // Final submission
  const handleSubmit = async () => {
      try {
          setLoading(true);
          console.log('🚀 [TeacherProfileForm] Submit button clicked');

          // IMPORTANT: Validate all form fields first
          try {
              await form.validateFields();
          } catch (validationError) {
              console.error('❌ Form validation failed');
              message.error('Please fill all required fields correctly');
              setLoading(false);
              return;
          }

          // Check if resume is uploaded (required)
          if (!resumeFile) {
              console.error('Resume not uploaded');
              message.error('Please upload your resume before submitting');
              setLoading(false);
              return;
          }

          const values = form.getFieldsValue();
          
          const finalData = new FormData();

          // Append text fields
          finalData.append('fullName', values.fullName);
          finalData.append('email', values.email);
          finalData.append('phone', values.phone);
          finalData.append('education', values.education);
          finalData.append('experience', values.experience);
          finalData.append('subjects', JSON.stringify(values.subjects));
          finalData.append('otherSubjects', values.otherSubjects || '');

          // Append location as JSON
          finalData.append('location', JSON.stringify({
              state: values.state,
              district: values.district,
              pincode: values.pincode
          }));

          // Append files
          if (resumeFile) {
              finalData.append('resume', resumeFile);
          }
          if (photoFile) {
              finalData.append('photo', photoFile);
          }

          // Show loading message
          message.loading({
              content: 'Creating your profile...',
              duration: 0,
              key: 'submitLoading'
          });

          const response = await teacherAPI.create(finalData);

          // Dismiss loading message
          message.destroy('submitLoading');

          // Update user context with profile data from response
          if (user && response.data?.profile) {
              const profileData = response.data.profile;
              const updatedUser = {
                  ...user,
                  profileComplete: true,
                  profileCompleted: true,
                  fullName: profileData.name || profileData.fullName,
                  subject: profileData.subject,
                  qualifications: profileData.qualifications,
                  experience: profileData.experience,
                  resume: profileData.resume || 'uploaded',
                  profilePicture: profileData.profilePicture
              };
              updateUser(updatedUser);
              console.log('✓ User context updated with profile data:', updatedUser);
          } else if (user) {
              const updatedUser = {
                  ...user,
                  profileComplete: true,
                  profileCompleted: true
              };
              updateUser(updatedUser);
              console.log('✓ User context updated with completion flags:', updatedUser);
          }

          // Show success message
          message.success({
              content: ' Profile created successfully!',
              duration: 2
          });

          // Verify localStorage was updated
          const storedUser = localStorage.getItem('user');
          console.log('📦 localStorage after updateUser:', storedUser ? JSON.parse(storedUser) : 'NOT SET');

          // Show success modal
          Modal.success({
              title: 'Profile Created!',
              content: (
                  <div>
                      <p>Your teacher profile has been created successfully.</p>
                      <p>You can now browse and apply for teaching positions!</p>
                  </div>
              ),
              okText: 'Browse Jobs',
              onOk() {
                  navigate('/jobs');
              }
          });

      } catch (error) {
          console.error('❌ Submission error:', error.message);
          message.destroy('submitLoading');
          
          // Provide specific error messages based on status code
          let errorMessage = 'Failed to create profile';
          if (error.response?.status === 400) {
            errorMessage = error.response?.data?.error || 'Invalid profile data. Please check your entries and ensure all required fields are filled.';
          } else if (error.response?.status === 404) {
            errorMessage = 'Server endpoint not found. Please contact support.';
          } else if (error.response?.status === 422) {
            errorMessage = error.response?.data?.message || 'Profile validation error. Please complete all required fields.';
          } else if (error.response?.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
          
          message.error(errorMessage);
      } finally {
          setLoading(false);
      }
  };

  const steps = [
    {
      title: 'Personal Info',
      icon: <UserOutlined />,
      content: <Step1PersonalInfo />
    },
    {
      title: 'Education',
      icon: <BookOutlined />,
      content: <Step2Education />
    },
    {
      title: 'Subjects',
      icon: <FileTextOutlined />,
      content: <Step3Subjects />
    },
    {
      title: 'Documents',
      icon: <UploadOutlined />,
      content: <Step4Upload />
    }
  ];

  return (
    <div className="teacher-profile-form-container">
      <Card className="main-card">
        <h1 className="form-title">Create Teacher Profile</h1>
        
        <Steps current={currentStep} className="steps-container">
          {steps.map((item, index) => (
            <Step key={index} title={item.title} icon={item.icon} />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          className="form-content"
          initialValues={formData}
        >
          <div className="step-content">{steps[currentStep].content}</div>

          <div className="steps-action">
            <Space>
              {currentStep > 0 && (
                <Button size="large" onClick={prev}>
                  Previous
                </Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button type="primary" size="large" onClick={next}>
                  Next
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={handleSubmit}
                  loading={loading}
                >
                  Submit Profile
                </Button>
              )}
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default TeacherProfileForm;
