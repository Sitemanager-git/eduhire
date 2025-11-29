/**
 * JobPostForm Component - Production Ready
 * Features: Multi-step job posting form with profile completion check
 * Version: 2.3 (November 12, 2025 - Profile check added back)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Row,
  Col,
  InputNumber,
  Checkbox,
  Space,
  message,
  Steps,
  Radio,
  Divider,
  Tag,
  Alert,
  Spin,
  Result
} from 'antd';
  import { Modal } from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { institutionAPI, paymentAPI, jobAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { TextArea } = Input;
const { Option } = Select;

/**
 * Check if user can post a job based on subscription limits
 */
const checkJobPostingLimit = async () => {
  const response = await paymentAPI.checkPostingLimit();
  return response.data;
};

/**
 * Increment job posting count after successful submission
 */
const incrementJobPostingCount = async () => {
  const response = await paymentAPI.incrementPostingCount();
  return response.data;
};

const JobPostForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [checkingLimit, setCheckingLimit] = useState(false);

  // Profile validation state
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  /**
   * Check institution profile status on component mount
   */
  useEffect(() => {
    const checkProfile = async () => {
      try {
        console.log('🔍 Checking institution profile...');

        if (!isAuthenticated || user?.userType !== 'institution') {
          setCheckingProfile(false);
          return;
        }

        // Call profile status endpoint
        const response = await institutionAPI.checkProfileStatus();
        console.log('Profile check result:', response.data);

        if (response.data.success) {
          if (response.data.isComplete) {
            console.log('✓ Institution profile is complete');
            setProfileError(null);
          } else {
            console.warn('⚠️  Institution profile incomplete');
            const missingFields = response.data.missingFields?.join(', ') || 'Unknown fields';
            setProfileError({
              message: 'Complete Your Institution Profile',
              description: 'You need to complete your institution profile before you can post teaching jobs.',
              details: `Missing fields: ${missingFields}`
            });
          }
        }
      } catch (error) {
        console.error('Profile check error:', error);
        
        // Handle 404 when profile doesn't exist
        if (error.response?.status === 404 || error.response?.data?.error === 'Institution profile not found') {
          setProfileError({
            message: 'Institution Profile Required',
            description: 'Please create and complete your institution profile to post jobs.',
            details: 'This helps employers verify your institution details.',
            isNew: true
          });
        } else if (error.response?.status === 403) {
          setProfileError({
            message: 'Access Denied',
            description: 'Only institutions can post jobs.',
            details: 'Please log in as an institution account.'
          });
        } else {
          setProfileError({
            message: 'Unable to Verify Profile',
            description: 'There was an error checking your profile. Please try again.',
            details: error.response?.data?.message || error.message
          });
        }
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfile();
  }, [isAuthenticated, user]);

  /**
   * Step 1: Basic Job Info (Title, Subject, Level, Experience)
   */
  const Step1BasicInfo = () => (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <FileTextOutlined />
          <span>Job Title & Subject</span>
        </div>
      }
      className="form-card"
    >
      <Alert
        message="Complete all required fields"
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        className="mb-4"
      />
      
      <Alert
        message="Your institution profile is complete ✓"
        type="success"
        showIcon
        className="mb-4"
        style={{ display: profileError ? 'none' : 'block' }}
      />

      <Form.Item
        label="Job Title"
        name="title"
        rules={[
          { required: true, message: 'Job title is required' },
          { max: 200, message: 'Title must be less than 200 characters' }
        ]}
      >
        <Input
          placeholder="e.g., Senior Mathematics Teacher"
          size="large"
          maxLength={200}
        />
      </Form.Item>

      <Form.Item
        label="Subject"
        name="subject"
        rules={[{ required: true, message: 'Subject is required' }]}
      >
        <Select placeholder="Select subject" size="large" showSearch>
          <Option value="Mathematics">Mathematics</Option>
          <Option value="Physics">Physics</Option>
          <Option value="Chemistry">Chemistry</Option>
          <Option value="Biology">Biology</Option>
          <Option value="English">English</Option>
          <Option value="Hindi">Hindi</Option>
          <Option value="Social Studies">Social Studies</Option>
          <Option value="Computer Science">Computer Science</Option>
          <Option value="Physical Education">Physical Education</Option>
          <Option value="History">History</Option>
          <Option value="Geography">Geography</Option>
          <Option value="Economics">Economics</Option>
          <Option value="Political Science">Political Science</Option>
          <Option value="Sanskrit">Sanskrit</Option>
          <Option value="Other">Other</Option>
        </Select>
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Teaching Level"
            name="level"
            rules={[{ required: true, message: 'Teaching level is required' }]}
          >
            <Select placeholder="Select level" size="large">
              <Option value="primary">Primary (Classes 1-5)</Option>
              <Option value="secondary">Secondary (Classes 6-10)</Option>
              <Option value="higher">Higher Education (11-12, UG, PG)</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Years of Experience Required"
            name="experience"
            rules={[
              { required: true, message: 'Experience is required' },
              { type: 'number', min: 0, max: 50, message: 'Enter 0-50 years' }
            ]}
          >
            <InputNumber
              placeholder="0"
              min={0}
              max={50}
              size="large"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  /**
   * Step 2: Location & Employment Type
   */
  const Step2LocationEmployment = () => (
    <Card
      title={
        <div className="flex items-center gap-2">
          <EnvironmentOutlined />
          <span>Location & Employment Type</span>
        </div>
      }
      className="form-card"
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: 'Location is required' }]}
          >
            <Input placeholder="City, State, Country" size="large" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Position Type"
            name="remote"
            valuePropName="checked"
          >
            <Checkbox>This is a remote/online position</Checkbox>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Employment Type"
        name="employmentType"
        rules={[{ required: true, message: 'Employment type is required' }]}
      >
        <Select placeholder="Select employment type" size="large">
          <Option value="full-time">Full-time</Option>
          <Option value="part-time">Part-time</Option>
          <Option value="contract">Contract</Option>
          <Option value="temporary">Temporary</Option>
          <Option value="substitute">Substitute</Option>
        </Select>
      </Form.Item>

      <Form.Item label="Benefits (Optional)" name="benefits">
        <Checkbox.Group style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Checkbox value="health_insurance">Health Insurance</Checkbox>
            </Col>
            <Col span={8}>
              <Checkbox value="pension">Pension</Checkbox>
            </Col>
            <Col span={8}>
              <Checkbox value="paid_leave">Paid Leave</Checkbox>
            </Col>
            <Col span={8}>
              <Checkbox value="housing">Housing Allowance</Checkbox>
            </Col>
            <Col span={8}>
              <Checkbox value="meal">Meal Allowance</Checkbox>
            </Col>
            <Col span={8}>
              <Checkbox value="transportation">Transportation</Checkbox>
            </Col>
          </Row>
        </Checkbox.Group>
      </Form.Item>
    </Card>
  );

  /**
   * Step 3: Salary Information
   */
  const Step3Salary = () => (
    <Card
      title={
        <div className="flex items-center gap-2">
          <DollarOutlined />
          <span>Salary Information</span>
        </div>
      }
      className="form-card"
    >
      <Alert
        message="Salary information helps attract qualified candidates"
        type="warning"
        showIcon
        className="mb-4"
      />

      <Row gutter={16}>
        <Col span={6}>
          <Form.Item label="Minimum Salary" name={['salary', 'min']}>
            <InputNumber
              placeholder="Min"
              size="large"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Maximum Salary" name={['salary', 'max']}>
            <InputNumber
              placeholder="Max"
              size="large"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Currency" name={['salary', 'currency']}>
            <Select size="large">
              <Option value="USD">USD ($)</Option>
              <Option value="EUR">EUR (€)</Option>
              <Option value="GBP">GBP (£)</Option>
              <Option value="INR">INR (₹)</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Period" name={['salary', 'period']}>
            <Select size="large">
              <Option value="hourly">Hourly</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="annual">Annual</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Salary Negotiable"
        name="salary_negotiable"
        valuePropName="checked"
      >
        <Checkbox>Salary is negotiable</Checkbox>
      </Form.Item>
    </Card>
  );

  /**
   * Step 4: Job Description & Requirements
   */
  const Step4JobDetails = () => (
    <Card
      title={
        <div className="flex items-center gap-2">
          <FileTextOutlined />
          <span>Job Description & Requirements</span>
        </div>
      }
      className="form-card"
    >
      <Form.Item
        label="Job Description"
        name="description"
        rules={[
          { required: true, message: 'Description is required' },
          { min: 50, message: 'Description must be at least 50 characters' }
        ]}
      >
        <TextArea
          rows={6}
          placeholder="Describe the role, responsibilities, and what you're looking for..."
          maxLength={5000}
          showCount
        />
      </Form.Item>

      <Divider>Required Qualifications & Skills</Divider>

      <Form.Item
        label="Requirements"
        name="requirements"
        rules={[
          { required: true, message: 'Requirements are required' },
          { min: 30, message: 'Requirements must be at least 30 characters' }
        ]}
      >
        <TextArea
          rows={4}
          placeholder="Bachelor's degree, 2+ years experience, Strong communication skills, etc."
          maxLength={3000}
          showCount
        />
      </Form.Item>

      <Divider>Desirable Qualifications (Optional)</Divider>

      <Form.Item label="Desirables" name="desirables">
        <TextArea
          rows={3}
          placeholder="M.Ed degree, Online teaching experience, Bilingual, etc."
          maxLength={2000}
          showCount
        />
      </Form.Item>
    </Card>
  );

  /**
   * Step 5: Expiry Settings
   */
  const Step5ExpirySettings = () => (
    <Card title="Post Expiry Settings" className="form-card">
      <Alert
        message="Your job posting will auto-expire after the selected period. You can reactivate it later."
        type="info"
        showIcon
        className="mb-4"
      />

      <Form.Item
        label="Expires In (Days)"
        name="expiryDays"
        rules={[
          { required: true, message: 'Expiry period is required' },
          { type: 'number', min: 1, max: 180, message: 'Select 1-180 days' }
        ]}
      >
        <InputNumber
          min={1}
          max={180}
          step={1}
          size="large"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <div className="mt-4">
        <Radio.Group
          onChange={(e) => {
            form.setFieldsValue({ expiryDays: e.target.value });
            setFormData(prev => ({ ...prev, expiryDays: e.target.value }));
          }}
          value={form.getFieldValue('expiryDays')}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Radio value={30}>30 days (Standard)</Radio>
            <Radio value={60}>60 days (Extended)</Radio>
            <Radio value={90}>90 days (Premium)</Radio>
            <Radio value={180}>180 days (Maximum)</Radio>
          </Space>
        </Radio.Group>
      </div>

      <div className="bg-blue-50 p-4 rounded mt-4">
        <p className="text-sm text-gray-700 font-semibold mb-2">Expiry Date:</p>
        <p className="text-lg text-blue-600">
          {formData.expiryDays
            ? dayjs().add(formData.expiryDays, 'days').format('DD MMM YYYY')
            : 'Select days'}
        </p>
      </div>
    </Card>
  );

  /**
   * Step 6: Review & Submit
   */
  const Step6Review = () => (
    <Card title="Review Your Job Posting" className="form-card">
      <Alert
        message="Review all details before submitting. You can edit after posting."
        type="info"
        showIcon
        className="mb-4"
      />

      <div className="space-y-4">
        {/* Position Summary */}
        <div className="border-l-4 border-blue-500 pl-4">
          <p className="text-xs text-gray-500 uppercase">Position</p>
          <p className="text-lg font-bold text-gray-800">{formData.title || 'N/A'}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Tag color="blue">{formData.subject || 'N/A'}</Tag>
            <Tag color="green">{formData.level || 'N/A'}</Tag>
            <Tag color="orange">{formData.employmentType || 'N/A'}</Tag>
            {formData.remote && <Tag color="purple">Remote</Tag>}
          </div>
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase">Location</p>
            <p className="font-semibold">{formData.location || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Experience Required</p>
            <p className="font-semibold">
              {formData.experience !== undefined ? `${formData.experience}+ years` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Salary Range */}
        {formData.salary?.min && formData.salary?.max && (
          <div>
            <p className="text-xs text-gray-500 uppercase">Salary Range</p>
            <p className="font-semibold">
              {formData.salary.currency} {formData.salary.min} - {formData.salary.max}{' '}
              {formData.salary.period}
            </p>
          </div>
        )}

        {/* Expiry */}
        <div>
          <p className="text-xs text-gray-500 uppercase">Expiry Date</p>
          <p className="font-semibold">
            {formData.expiryDays
              ? dayjs().add(formData.expiryDays, 'days').format('DD MMM YYYY')
              : 'N/A'}
          </p>
        </div>

        <Divider />

        {/* Description Preview */}
        <div>
          <p className="text-xs text-gray-500 uppercase mb-2">Description Preview</p>
          <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 max-h-40 overflow-y-auto">
            {formData.description || 'No description'}
          </div>
        </div>
      </div>
    </Card>
  );

  /**
   * Form Steps
   */
  const steps = [
    { title: 'Job Info', icon: <FileTextOutlined />, content: <Step1BasicInfo /> },
    { title: 'Location', icon: <EnvironmentOutlined />, content: <Step2LocationEmployment /> },
    { title: 'Salary', icon: <DollarOutlined />, content: <Step3Salary /> },
    { title: 'Details', icon: <FileTextOutlined />, content: <Step4JobDetails /> },
    { title: 'Expiry', icon: <CheckCircleOutlined />, content: <Step5ExpirySettings /> },
    { title: 'Review', icon: <CheckCircleOutlined />, content: <Step6Review /> }
  ];

  /**
   * Get required fields for current step
   */
  const getStepRequiredFields = () => {
    const fieldsByStep = {
      0: ['title', 'subject', 'level', 'experience'],
      1: ['location', 'employmentType'],
      2: [],
      3: ['description', 'requirements'],
      4: ['expiryDays'],
      5: []
    };
    return fieldsByStep[currentStep] || [];
  };

  /**
   * Handle next step
   */
  const handleNext = async () => {
    try {
      const requiredFields = getStepRequiredFields();
      await form.validateFields(requiredFields);
      const values = form.getFieldsValue();
      setFormData({ ...formData, ...values });
      setCurrentStep(currentStep + 1);
    } catch (error) {
      message.error('Please fill all required fields correctly');
    }
  };

  /**
   * Handle previous step
   */
  const handlePrev = () => {
    if (currentStep > 0) {
      const values = form.getFieldsValue();
      setFormData({ ...formData, ...values });
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const finalData = { ...formData, ...values };

      // Check token
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Please login first');
        navigate('/login');
        return;
      }

      // Check job posting limit
      setCheckingLimit(true);
      try {
        const limitCheck = await checkJobPostingLimit();
        setCheckingLimit(false);

        if (!limitCheck.canPost) {
          Modal.warning({
            title: 'Job Posting Limit Reached',
            content: `You've used all ${limitCheck.used} of your ${limitCheck.limit} job postings for this billing cycle. Upgrade your plan to post more jobs.`,
            okText: 'Upgrade Plan',
            onOk() {
              navigate('/subscriptions');
            },
          });
          setLoading(false);
          return;
        }
      } catch (limitError) {
        setCheckingLimit(false);
        console.error('Error checking posting limit:', limitError);
        message.error('Failed to verify posting limit. Please try again.');
        setLoading(false);
        return;
      }

      // Prepare job data
      const jobData = {
        title: finalData.title?.trim(),
        subject: finalData.subject?.trim(),
        level: finalData.level,
        location: finalData.location?.trim(),
        jobDescription: finalData.description?.trim(),
        requirements: finalData.requirements?.trim(),
        desirables: finalData.desirables?.trim() || '',
        salary: {
          min: parseInt(finalData.salary?.min) || 0,
          max: parseInt(finalData.salary?.max) || 0,
          currency: finalData.salary?.currency || 'INR',
          period: finalData.salary?.period || 'monthly'
        },
        experience: parseInt(finalData.experience) || 0,
        employmentType: finalData.employmentType || 'full-time',
        remote: finalData.remote || false,
        expiryDays: parseInt(finalData.expiryDays) || 30,
        benefits: finalData.benefits || []
      };

      console.log('📤 Submitting job data:', jobData);

      // Submit to backend
      const response = await jobAPI.create(jobData);

      console.log('✓ Job posted successfully:', response.data);

      // Increment job posting count
      try {
        await incrementJobPostingCount();
        console.log('✓ Posting count incremented');
      } catch (countError) {
        console.error('Error incrementing posting count:', countError);
        // Don't fail the whole operation if this fails
      }

      message.success(response.data.message || 'Job posted successfully!');

      // Reset form
      form.resetFields();
      setFormData({});
      setCurrentStep(0);

      // Redirect to my jobs
      setTimeout(() => {
        navigate('/my-jobs');
      }, 1500);

    } catch (error) {
      console.error('❌ Job posting error:', error);
      console.error('Error response:', error.response?.data);

      // Handle different error types
      if (error.response?.status === 422) {
        // Incomplete profile
        const data = error.response.data;
        message.error(data.message);
        setTimeout(() => {
          navigate('/create-institution-profile');
        }, 1500);
      } else if (error.response?.status === 401) {
        message.error('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 1500);
      } else if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else if (error.response?.data?.details) {
        const details = error.response.data.details;
        if (Array.isArray(details)) {
          details.forEach((d) => {
            message.error(`${d.field}: ${d.message || d.msg}`);
          });
        }
      } else {
        message.error(error.message || 'Failed to post job');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Show loading spinner while checking profile
   */
  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto text-center p-12">
          <Spin size="large" tip="Verifying your institution profile..." />
          <p className="text-gray-600 mt-4">This usually takes a few moments...</p>
        </Card>
      </div>
    );
  }

  /**
   * Show error if profile is incomplete
   */
  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <Card className="max-w-2xl mx-auto">
          <Result
            status="warning"
            icon={<ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 48 }} />}
            title={profileError.message}
            subTitle={profileError.description}
            extra={
              <div>
                <p className="text-sm text-gray-600 mb-4">{profileError.details}</p>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => {
                    // Navigate to institution profile creation/edit page
                    navigate('/create-institution-profile');
                  }}
                >
                  Complete Your Profile Now
                </Button>
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  /**
   * Main Form - Profile is complete
   */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Card className="max-w-4xl mx-auto shadow-lg">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Post a Teaching Job</h1>
          <p className="text-gray-600">Fill in the details to create your job posting</p>
        </div>

        {/* Steps */}
        <Steps
          current={currentStep}
          className="mb-8"
          items={steps.map((step, index) => ({
            title: step.title,
            icon: step.icon,
            status:
              index < currentStep ? 'finish' : index === currentStep ? 'process' : 'wait'
          }))}
        />

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            level: 'primary',
            employmentType: 'full-time',
            remote: false,
            expiryDays: 30,
            salary: { currency: 'INR', period: 'monthly' }
          }}
        >
          {/* Step Content */}
          <div className="mb-8">{steps[currentStep].content}</div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              size="large"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            <Space>
              {currentStep < steps.length - 1 && (
                <Button type="primary" size="large" onClick={handleNext}>
                  Next
                </Button>
              )}

              {currentStep === steps.length - 1 && (
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  loading={loading}
                  onClick={handleSubmit}
                >
                  {loading ? 'Posting...' : 'Post Job'}
                </Button>
              )}
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default JobPostForm;