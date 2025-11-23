import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Button, Tag, Divider, Spin, message,
    Descriptions, Space, Modal, Input, Checkbox
    , Alert
} from 'antd';
import {
    HeartOutlined, HeartFilled, ShareAltOutlined,
    EnvironmentOutlined, CalendarOutlined, DollarOutlined,
    UserOutlined, BankOutlined, FileTextOutlined, 
    CheckCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import jobService from '../services/jobService';
import applicationService from '../services/applicationService';
import { bookmarkAPI } from '../services/api';
import './JobDetail.css';

const { TextArea } = Input;

const JobDetail = () => {
        // State for application modal and cover letter
        const [showApplicationModal, setShowApplicationModal] = useState(false);
        const [coverLetter, setCoverLetter] = useState('');
        const [applying, setApplying] = useState(false);
        const [resumeUploaded, setResumeUploaded] = useState(true); // Assume true by default
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, userType } = useAuth();
    
    const [job, setJob] = useState(null);
    const [similarJobs, setSimilarJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookmarked, setBookmarked] = useState(false);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (id) {
            fetchJobDetail();
            fetchSimilarJobs();
            if (isAuthenticated) {
                checkIfBookmarked();
            }
        }
    }, [id, isAuthenticated]);

    const fetchJobDetail = async (showError = true) => {
        try {
            setLoading(true);
            const response = await jobService.getJobDetails(id);
            // Response structure: { success: true, job: {...} } or just the job data
            const jobData = response.data?.job || response.job || response.data || response;
            setJob(jobData);
            // Check if user has uploaded resume (simulate or fetch from API/user context)
            // Replace with actual logic if available
            if (userType === 'teacher' && isAuthenticated) {
                // Example: check user.resume or fetch from API
                setResumeUploaded(!!(window.localStorage.getItem('resumeUploaded') === 'true'));
            }
        } catch (error) {
            if (showError) {
                const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to load job details';
                message.error(`Job details error: ${errorMsg}`);
                // Do not redirect, just show error
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchSimilarJobs = async () => {
        try {
            // This would fetch similar jobs from API if endpoint exists
            setSimilarJobs([]);
        } catch (error) {
            console.error('Failed to fetch similar jobs:', error);
        }
    };

    const checkIfBookmarked = async () => {
        try {
            const response = await bookmarkAPI.check(id);
            setBookmarked(response.data?.bookmarked || false);
        } catch (error) {
            console.error('Failed to check bookmark status:', error);
        }
    };

    
    const handleSaveJob = async () => {
        if (!isAuthenticated) {
            message.warning('Please login to save jobs');
            navigate('/login');
            return;
        }

        try {
            setBookmarkLoading(true);
            
            if (bookmarked) {
                // Remove bookmark
                await bookmarkAPI.remove(id);
                setBookmarked(false);
                message.success('Removed from saved jobs');
            } else {
                // Add bookmark
                await bookmarkAPI.create({ jobId: id });
                setBookmarked(true);
                message.success('Added to saved jobs');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to update bookmark';
            message.error(errorMsg);
        } finally {
            setBookmarkLoading(false);
        }
    };

    const handleShareJob = () => {
        const jobUrl = `${window.location.origin}/jobs/${id}`;
        const shareText = `Check out this job posting: ${job?.title}`;

        // Copy to clipboard
        navigator.clipboard.writeText(`${shareText}\n${jobUrl}`);
        message.success('Job link copied to clipboard!');
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <Spin size="large" tip="Loading job details..." />
            </div>
        );
    }

    if (!job) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Job not found</h2>
                <p style={{ color: '#666', marginBottom: '24px' }}>
                    The job posting you're looking for doesn't exist or has been removed.
                </p>
                <Button type="primary" size="large" onClick={() => navigate('/jobs')}>
                    Back to Jobs
                </Button>
            </div>
        );
    }

    const institution = job.institutionid || {};
    const salaryDisplay = job.salary?.min && job.salary?.max
        ? `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()} / ${job.salary.period || 'month'}`
        : job.salary || 'Negotiable';

    const isJobExpired = job.expiresAt ? new Date(job.expiresAt) < new Date() : false;
    const daysUntilExpire = job.expiresAt
        ? Math.ceil((new Date(job.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
        : 30;

    return (
        <div className="job-detail-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            <Row gutter={[24, 24]}>
                {/* Main Content */}
                <Col xs={24} lg={16}>
                    {/* Job Header Card */}
                    <Card className="job-header-card" style={{ marginBottom: '24px' }}>
                        <div className="job-header">
                            <div>
                                <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: 'bold' }}>
                                    {job.title || job.jobTitle || 'N/A'}
                                </h1>
                                <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                                    <BankOutlined /> {institution.institutionName || job.schoolName || 'Institution Name Not Available'}
                                </p>
                                <Space size="large" wrap>
                                    <span>
                                        <EnvironmentOutlined /> {job.location || 'N/A'}
                                    </span>
                                    <span>
                                        <ClockCircleOutlined /> {job.jobType || job.employmentType || 'Full-time'}
                                    </span>
                                    <span>
                                        <DollarOutlined /> {salaryDisplay}
                                    </span>
                                </Space>
                            </div>
                            <div className="job-header-actions" style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                                {/* Apply Now button for teachers */}
                                {isAuthenticated && userType === 'teacher' && !isJobExpired && (
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<FileTextOutlined />}
                                        block
                                        onClick={() => {
                                            if (!resumeUploaded) {
                                                Modal.warning({
                                                    title: 'Resume Required',
                                                    content: (
                                                        <div>
                                                            <p>You must upload your resume before applying for this job.</p>
                                                            <Button type="primary" style={{ marginTop: 16 }} onClick={() => {
                                                                // Redirect to resume upload page (adjust route as needed)
                                                                navigate('/profile?tab=resume');
                                                                Modal.destroyAll();
                                                            }}>
                                                                Go to Upload Resume
                                                            </Button>
                                                        </div>
                                                    ),
                                                    okText: 'Close',
                                                });
                                                return;
                                            }
                                            setShowApplicationModal(true);
                                        }}
                                    >
                                        Apply Now
                                    </Button>
                                )}
                                <Button
                                    size="large"
                                    onClick={handleSaveJob}
                                    loading={bookmarkLoading}
                                    icon={bookmarked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                                    block
                                >
                                    {bookmarked ? 'Saved' : 'Save Job'}
                                </Button>
                                <Button
                                    size="large"
                                    onClick={handleShareJob}
                                    icon={<ShareAltOutlined />}
                                    block
                                >
                                    Share
                                </Button>
                            </div>
                        </div>

                        <Divider />

                        {/* Expiry Warning */}
                        {isJobExpired ? (
                            <Tag color="red">This job posting has expired</Tag>
                        ) : daysUntilExpire <= 3 ? (
                            <Tag color="orange">⏰ Expires in {daysUntilExpire} day{daysUntilExpire > 1 ? 's' : ''}</Tag>
                        ) : null}

                        <div className="job-tags" style={{ marginTop: '12px' }}>
                            {job.subject && <Tag color="blue">{job.subject}</Tag>}
                            {job.level && <Tag color="green">{job.level}</Tag>}
                            {job.remote && <Tag color="orange">Remote</Tag>}
                            {job.benefits && Array.isArray(job.benefits) && job.benefits.map((benefit, idx) => (
                                <Tag key={idx}>{benefit}</Tag>
                            ))}
                            {job.applicationsCount !== undefined && (
                                <Tag color="geekblue" icon={<CheckCircleOutlined />}>
                                    {job.applicationsCount} applied
                                </Tag>
                            )}
                        </div>
                    </Card>

                    {/* Job Description Card */}
                    <Card title="Job Description" className="section-card" style={{ marginBottom: '24px' }}>
                        <div className="job-description">
                            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                                {job.jobDescription || job.description || 'No description provided'}
                            </p>
                        </div>
                    </Card>

                    {/* Requirements Card */}
                    {(job.requirements || job.desirables) && (
                        <Card title="Requirements & Qualifications" className="section-card" style={{ marginBottom: '24px' }}>
                            <div className="job-requirements">
                                {job.requirements && (
                                    <>
                                        <h4 style={{ marginBottom: '12px' }}>Required Qualifications:</h4>
                                        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', marginBottom: '20px' }}>
                                            {job.requirements}
                                        </p>
                                    </>
                                )}

                                {job.desirables && (
                                    <>
                                        <h4 style={{ marginBottom: '12px' }}>Desirable Qualifications:</h4>
                                        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                                            {job.desirables}
                                        </p>
                                    </>
                                )}

                                <Descriptions bordered column={1} size="small" style={{ marginTop: 20 }}>
                                    {job.experience && (
                                        <Descriptions.Item label="Experience Required">
                                            {job.experience} years
                                        </Descriptions.Item>
                                    )}
                                    {job.level && (
                                        <Descriptions.Item label="Education Level">
                                            {job.level}
                                        </Descriptions.Item>
                                    )}
                                    {job.subject && (
                                        <Descriptions.Item label="Subject Specialization">
                                            {job.subject}
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>
                            </div>
                        </Card>
                    )}

                    {/* Institution Info Card */}
                    <Card title="About the Institution" className="section-card" style={{ marginBottom: '24px' }}>
                        <div className="institution-info">
                            <Row gutter={16}>
                                <Col span={24}>
                                    <h3 style={{ marginBottom: '8px' }}>{institution.institutionName || job.schoolName || 'N/A'}</h3>
                                    <p className="institution-type">
                                        <Tag color="blue">{institution.type || 'Institution'}</Tag>
                                    </p>
                                    {institution.description && (
                                        <p style={{ marginTop: '12px' }}>{institution.description}</p>
                                    )}
                                    {institution.location && (
                                        <p><strong>Location:</strong> {
                                            typeof institution.location === 'string'
                                                ? institution.location
                                                : `${institution.location.state || ''} ${institution.location.district || ''} ${institution.location.pincode || ''}`.trim()
                                        }</p>
                                    )}
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </Col>

                {/* Sidebar */}
                <Col xs={24} lg={8}>
                    <Card className="job-sidebar">
                        <h3>Quick Info</h3>
                        <Descriptions column={1} size="small">
                            {job._id && (
                                <Descriptions.Item label="Job ID">
                                    {job._id}
                                </Descriptions.Item>
                            )}
                            {job.experience && (
                                <Descriptions.Item label="Experience">
                                    {job.experience} years
                                </Descriptions.Item>
                            )}
                            {job.level && (
                                <Descriptions.Item label="Qualification">
                                    {job.level}
                                </Descriptions.Item>
                            )}
                            {job.subject && (
                                <Descriptions.Item label="Category">
                                    {job.subject}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        {/* Skills */}
                        {job.skillsRequired && (
                            <>
                                <Divider />
                                <h3>Skills Required</h3>
                                <div>
                                    {Array.isArray(job.skillsRequired) ? (
                                        job.skillsRequired.map((skill, idx) => (
                                            <Tag key={idx} color="blue" style={{ marginBottom: '8px' }}>
                                                {skill}
                                            </Tag>
                                        ))
                                    ) : (
                                        <Tag color="blue">{job.skillsRequired}</Tag>
                                    )}
                                </div>
                            </>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Application Modal */}
            <Modal
                title="Submit Your Application"
                open={showApplicationModal}
                onCancel={() => setShowApplicationModal(false)}
                onOk={async () => {
                    if (!resumeUploaded) {
                        message.error('Resume is required to apply.');
                        return;
                    }
                    if (!coverLetter.trim()) {
                        message.error('Please write a cover letter');
                        return;
                    }
                    setApplying(true);
                    try {
                        await applicationService.submitApplication(id, coverLetter);
                        message.success('Application submitted successfully!');
                        setShowApplicationModal(false);
                        setCoverLetter('');
                    } catch (error) {
                        const errorMsg = error.response?.data?.error || error.message || 'Failed to submit application';
                        message.error(`Application failed: ${errorMsg}`);
                    } finally {
                        setApplying(false);
                    }
                }}
                confirmLoading={applying}
                width={600}
            >
                {!resumeUploaded && (
                    <Alert
                        message="Resume Required"
                        description="You must upload your resume before applying for this job."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}
                <div style={{ marginBottom: '16px' }}>
                    <label><strong>Cover Letter *</strong></label>
                    <TextArea
                        rows={6}
                        placeholder="Tell us why you're a great fit for this position..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        maxLength={500}
                    />
                    <p style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                        {coverLetter.length}/500
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default JobDetail;
