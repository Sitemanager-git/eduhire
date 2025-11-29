import { Modal } from 'antd';
import React, { useState, useEffect } from 'react';
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
    Upload,
    message,
    Steps
} from 'antd';
import {
    HomeOutlined,
    SolutionOutlined,
    BookOutlined,
    TeamOutlined,
    FileTextOutlined,
    UploadOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { institutionAPI, locationAPI } from '../services/api';
import {
    CURRICULUM_OPTIONS,
    INSTITUTION_TYPES,
    SCHOOL_TYPES,
    SECTIONS_OFFERED
} from '../constants/formData';
import './InstitutionProfileForm.css';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const InstitutionProfileForm = () => {
    // ========== STATE ==========
    const [currentStep, setCurrentStep] = useState(0);
    const [allFormData, setAllFormData] = useState({}); // Store ALL steps data here
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [jobFile, setJobFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form] = Form.useForm();
    const navigate = useNavigate();

    // ========== EFFECTS ==========
    useEffect(() => {
        fetchStates();
    }, []);

    // ========== API CALLS ==========
    const fetchStates = async () => {
        try {
            const response = await locationAPI.getStates();
            setStates(response.data.states);
        } catch {
            message.error('Could not load states');
        }
    };

    const fetchDistricts = async (state) => {
        try {
            const response = await locationAPI.getDistricts(state);
            setDistricts(response.data.districts || []);
            form.setFieldsValue({ district: undefined });
        } catch (error) {
            console.error('Could not load districts:', error);
            setDistricts([]);
            message.error('Could not load districts');
        }
    };

    // ========== FORM STEP COMPONENTS ==========
    const Step1BasicInfo = () => (
        <Card title="Institution Details" className="form-card">
            <Form.Item 
                label="Institution Name" 
                name="institutionName" 
                rules={[{ required: true, message: 'Enter Institution Name' }]}
            >
                <Input size="large" prefix={<HomeOutlined />} placeholder="Institution Name" />
            </Form.Item>
            
            <Form.Item 
                label="Type of Institution" 
                name="type" 
                rules={[{ required: true, message: 'Choose institution type' }]}
            >
                <Select size="large" placeholder="Type" showSearch>
                    {INSTITUTION_TYPES.map((type) => (
                        <Option key={type.value} value={type.value}>{type.label}</Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item 
                label="School Type / Category" 
                name="schoolType" 
                rules={[{ required: true, message: 'Select school type' }]}
            >
                <Select size="large" placeholder="Select School Type">
                    <Option value="government">Government</Option>
                    <Option value="private">Private</Option>
                    <Option value="aided">Aided</Option>
                    <Option value="international">International</Option>
                </Select>
            </Form.Item>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item 
                        label="State" 
                        name="state" 
                        rules={[{ required: true, message: 'Select State' }]}
                    >
                        <Select 
                            size="large" 
                            placeholder="State" 
                            showSearch 
                            onChange={fetchDistricts}
                            filterOption={(input, option) => 
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {states.map((state) => (
                                <Option key={state} value={state}>{state}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item 
                        label="District" 
                        name="district" 
                        rules={[{ required: true, message: 'Select District' }]}
                    >
                        <Select 
                            size="large" 
                            placeholder="District" 
                            showSearch 
                            disabled={!districts.length}
                        >
                            {districts.map((district) => (
                                <Option key={district} value={district}>{district}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item 
                        label="Full Address" 
                        name="address" 
                        rules={[{ required: true, message: 'Enter Address' }]}
                    >
                        <Input size="large" placeholder="Address" />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item 
                        label="PIN Code" 
                        name="pincode" 
                        rules={[
                            { required: true, message: 'Enter PIN' }, 
                            { pattern: /^[0-9]{6}$/, message: '6-digit PIN code' }
                        ]}
                    >
                        <Input size="large" placeholder="PIN" maxLength={6} />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    
                </Col>
            </Row>

            <Form.Item 
                label="School Website" 
                name="website" 
                rules={[{ type: 'url', message: 'Valid URL please' }]}
            >
                <Input size="large" placeholder="https://school.org" />
            </Form.Item>

            <Form.Item label="About Institution" name="description">
                <TextArea rows={3} placeholder="Short description..." />
            </Form.Item>
        </Card>
    );

    const Step2Curriculum = () => (
        <Card title="Curriculum & Sections" className="form-card">
            <Form.Item 
                label="Curriculum Offered" 
                name="curriculumOffered" 
                rules={[{ required: true, message: 'Select at least one curriculum' }]}
            >
                <Checkbox.Group>
                    <Row gutter={[16, 16]}>
                        {CURRICULUM_OPTIONS.map(option => (
                            <Col span={8} key={option}>
                                <Checkbox value={option}>{option}</Checkbox>
                            </Col>
                        ))}
                    </Row>
                </Checkbox.Group>
            </Form.Item>

            <Form.Item label="Other Curriculum (optional)" name="otherCurriculum">
                <Input placeholder="Other boards/curriculum" />
            </Form.Item>

            <Form.Item 
                label="Sections Offered" 
                name="sectionsOffered" 
                rules={[{ required: true, message: 'Select at least one section' }]}
            >
                <Checkbox.Group>
                    <Row gutter={[16, 16]}>
                        {SECTIONS_OFFERED.map(option => (
                            <Col span={8} key={option}>
                                <Checkbox value={option}>{option}</Checkbox>
                            </Col>
                        ))}
                    </Row>
                </Checkbox.Group>
            </Form.Item>

            <Form.Item 
                label="Number of Campuses" 
                name="numberOfCampuses" 
                rules={[{ required: true, message: 'Select campus count' }]}
            >
                <InputNumber min={1} max={25} size="large" style={{ width: '100%' }} />
            </Form.Item>
        </Card>
    );

    const Step3Stats = () => (
        <Card title="Institution Stats & Contacts" className="form-card">
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item 
                        label="Number of Students" 
                        name="numberOfStudents" 
                        rules={[{ required: true, message: 'Enter student count' }]}
                    >
                        <InputNumber min={0} max={100000} size="large" style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item 
                        label="Number of Teachers" 
                        name="numberOfTeachers" 
                        rules={[{ required: true, message: 'Enter teacher count' }]}
                    >
                        <InputNumber min={0} max={10000} size="large" style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item 
                        label="Average Class Size" 
                        name="avgClassSize" 
                        rules={[{ required: true, message: 'Enter average class size' }]}
                    >
                        <InputNumber min={1} max={100} size="large" style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item 
                        label="Institution Email" 
                        name="email" 
                        rules={[
                            { required: true, message: 'Enter email' }, 
                            { type: 'email', message: 'Enter valid email' }
                        ]}
                    >
                        <Input prefix={<SolutionOutlined />} size="large" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item 
                        label="HR Email (optional)" 
                        name="hrEmail" 
                        rules={[{ type: 'email', message: 'Enter valid HR Email' }]}
                    >
                        <Input size="large" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item 
                        label="Phone Number" 
                        name="phone" 
                        rules={[
                            { required: true, message: 'Enter phone' }, 
                            { pattern: /^[0-9]{10}$/, message: '10-digit mobile number' }
                        ]}
                    >
                        <Input size="large" maxLength={10} />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item label="School Socials (optional)" name="socialMedia">
                <TextArea rows={2} placeholder='JSON e.g. {"facebook":"fb.com/school"}' />
            </Form.Item>
        </Card>
    );

    const Step4JobDetails = () => {
        const jobProps = {
            name: 'jobDescriptionFile',
            multiple: false,
            accept: '.pdf,.doc,.docx,.txt',
            beforeUpload: (file) => {
                const isValid = file.type === 'application/pdf' || 
                               file.type === 'application/msword' ||
                               file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                               file.type === 'text/plain';

                if (!isValid) {
                    message.error('Upload PDF, DOC, or TXT!');
                    return Upload.LIST_IGNORE;
                }
                setJobFile(file);
                return false;
            },
            onRemove: () => setJobFile(null),
            fileList: jobFile ? [jobFile] : []
        };

        return (
            <Card title="Job Details/Description" className="form-card">
                <Form.Item label="Write Job Description" name="jobDescription">
                    <TextArea rows={6} placeholder="Enter job description or requirements..." />
                </Form.Item>
                <Form.Item label="Or Upload Description File">
                    <Dragger {...jobProps}>
                        <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                        <p className="ant-upload-text">Drag or click to upload PDF, DOC or TXT</p>
                        <p className="ant-upload-hint">Max file size 5MB</p>
                    </Dragger>
                </Form.Item>
            </Card>
        );
    };

    // ========== STEPS DEFINITION ==========
    const steps = [
        { title: 'Institution', icon: <HomeOutlined />, content: <Step1BasicInfo /> },
        { title: 'Curriculum', icon: <BookOutlined />, content: <Step2Curriculum /> },
        { title: 'Stats & Contacts', icon: <TeamOutlined />, content: <Step3Stats /> },
        { title: 'Job Details', icon: <FileTextOutlined />, content: <Step4JobDetails /> }
    ];

    // ========== HANDLERS ==========
    /**
     * Navigate to next step
     * Properly accumulates data from current step
     */
    const handleNext = async () => {
        try {
            // Validate current step fields
            await form.validateFields();

            // Get current step values (all form fields)
            const currentStepValues = form.getFieldsValue();

            // CRITICAL: Merge with existing data (don't overwrite!)
            const updatedData = { ...allFormData, ...currentStepValues };

            console.log(`✓ Step ${currentStep + 1} data saved:`, Object.keys(currentStepValues));
            console.log(`📊 Total accumulated fields: ${Object.keys(updatedData).length}`);

            // Update state with merged data
            setAllFormData(updatedData);

            // Move to next step
            setCurrentStep(currentStep + 1);
        } catch (error) {
            console.error('Validation error:', error);
            message.error('Please fill all required fields correctly');
        }
    };

    /**
     * Navigate to previous step
     * Preserves current data
     */
    const handlePrev = () => {
        if (currentStep > 0) {
            // Save current step data before going back
            const currentStepValues = form.getFieldsValue();
            const updatedData = { ...allFormData, ...currentStepValues };
            setAllFormData(updatedData);

            // Go back
            setCurrentStep(currentStep - 1);
        }
    };

    /**
     * Submit form
     * FIXED: Properly handles form submission with ALL accumulated data
     */
    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            // Merge form values with accumulated data
            const completeData = { ...allFormData, ...values };

            console.log('\n' + '='.repeat(80));
            console.log('📋 FINAL PROFILE DATA');
            console.log('='.repeat(80));
            console.log('Total fields:', Object.keys(completeData).length);
            console.log('Data:', completeData);
            console.log('='.repeat(80) + '\n');

            // Prepare data exactly as backend expects
            const profileData = {
                // Basic Information
                institutionName: completeData.institutionName?.trim(),
                type: completeData.type,
                schoolType: completeData.schoolType || 'private',

                // Location
                state: completeData.state,
                district: completeData.district,
                pincode: completeData.pincode,
                address: completeData.address?.trim(),

                location: {
                    state: completeData.state,
                    district: completeData.district,
                    pincode: completeData.pincode
                },

                // Contact
                email: completeData.email,
                phone: completeData.phone || '',
                hrEmail: completeData.hrEmail || '',

                // Educational
                curriculumOffered: completeData.curriculumOffered || [],
                otherCurriculum: completeData.otherCurriculum || '',
                sectionsOffered: completeData.sectionsOffered || [],
                numberOfCampuses: parseInt(completeData.numberOfCampuses) || 1,

                // Statistics
                numberOfStudents: completeData.numberOfStudents,
                numberOfTeachers: completeData.numberOfTeachers,
                avgClassSize: completeData.avgClassSize,

                // Additional
                website: completeData.website || '',
                description: completeData.description || '',
                jobDescription: completeData.jobDescription || '',
                socialMedia: completeData.socialMedia || ''
            };

            console.log('Sending to backend:', profileData);

            // Get token
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Please login first');
                navigate('/login');
                return;
            }

            // Send to backend using API service
            const response = await institutionAPI.create(profileData);

            console.log('✓ Success response:', response.data);

            if (response.data.success) {
                message.success(response.data.message || 'Profile saved successfully!');

                // Reset form
                form.resetFields();
                setAllFormData({});
                setCurrentStep(0);

                // Navigate to post job page
                setTimeout(() => {
                    navigate('/post-job');
                }, 1500);
            }
        } catch (error) {
            console.error('❌ PROFILE CREATION ERROR');
            console.error('Error Message:', error.message);
            console.error('Full Response:', error.response?.data);
            
            // Log detailed validation errors
            if (error.response?.data?.details) {
                console.error('Validation Details:');
                error.response.data.details.forEach((detail, idx) => {
                    console.error(`  [${idx}]`, detail);
                });
            }
            
            // Handle specific error responses
            if (error.response?.data?.missingFields) {
                const missing = error.response.data.missingFields.join(', ');
                message.error(`Missing required fields: ${missing}`);
            } else if (error.response?.data?.details && error.response.data.details.length > 0) {
                const details = error.response.data.details.map(d => d.message || d).join(', ');
                message.error(`Validation error: ${details}`);
            } else if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else if (error.response?.data?.error) {
                message.error(error.response.data.error);
            } else if (error.code === 'ECONNABORTED') {
                message.error('Request timeout - Server not responding');
            } else {
                message.error('Failed to save profile. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ========== RENDER ==========
    return (
        <div className="institution-profile-form-container">
            <Card className="main-card">
                <h1 className="form-title">Create Institution Profile</h1>
                <Steps current={currentStep} className="steps-container">
                    {steps.map((item, idx) => (
                        <Step key={idx} title={item.title} icon={item.icon} />
                    ))}
                </Steps>

                <Form 
                    form={form} 
                    layout="vertical" 
                    className="form-content" 
                    initialValues={allFormData}
                    onFinish={handleSubmit}  // ← FIXED: Use onFinish instead of onClick
                >
                    <div className="step-content">
                        {steps[currentStep].content}
                    </div>

                    <div className="steps-action">
                        <Space>
                            {currentStep > 0 && (
                                <Button 
                                    size="large" 
                                    onClick={handlePrev}
                                >
                                    ← Previous
                                </Button>
                            )}
                            {currentStep < steps.length - 1 && (
                                <Button 
                                    type="primary" 
                                    size="large" 
                                    onClick={handleNext}
                                >
                                    Next →
                                </Button>
                            )}
                            {currentStep === steps.length - 1 && (
                                <Button 
                                    type="primary" 
                                    size="large" 
                                    icon={<CheckCircleOutlined />}
                                    loading={loading} 
                                    disabled={loading}
                                    htmlType="submit"  // ← FIXED: Use htmlType="submit" instead of onClick
                                >
                                    {loading ? 'Submitting...' : 'Submit Profile'}
                                </Button>
                            )}
                        </Space>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default InstitutionProfileForm;
