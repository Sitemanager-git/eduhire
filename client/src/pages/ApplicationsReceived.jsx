import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Tag,
    Button,
    Space,
    message,
    Empty,
    Modal,
    Select,
    Row,
    Col,
    Statistic,
    Descriptions,
    Avatar
} from 'antd';
import {
    UserOutlined,
    FileTextOutlined,
    DownloadOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import applicationService from '../services/applicationService';
import jobService from '../services/jobService';
import dayjs from 'dayjs';

const { Option } = Select;

const ApplicationsReceived = () => {
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        shortlisted: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchJobs();
        fetchApplications();
    }, [selectedJobId, selectedStatus]);

    const fetchJobs = async () => {
        try {
            const response = await jobService.getMyJobs();
            setJobs(response.data.jobs);
        } catch (error) {
            message.error('Failed to fetch jobs');
        }
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (selectedJobId) filters.jobId = selectedJobId;
            if (selectedStatus) filters.status = selectedStatus;

            const response = await applicationService.getAllReceivedApplications(filters);
            setApplications(response.applications);

            // Calculate stats
            const allResponse = await applicationService.getAllReceivedApplications({});
            const allApps = allResponse.applications;
            setStats({
                total: allApps.length,
                pending: allApps.filter(a => a.status === 'pending').length,
                shortlisted: allApps.filter(a => a.status === 'shortlisted').length,
                rejected: allApps.filter(a => a.status === 'rejected').length
            });
        } catch (error) {
            message.error('Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    };

    const handleShortlist = async (applicationId) => {
        try {
            await applicationService.shortlistApplication(applicationId);
            message.success('Application shortlisted');
            fetchApplications();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to shortlist');
        }
    };

    const handleReject = async (applicationId) => {
        try {
            await applicationService.rejectApplication(applicationId);
            message.success('Application rejected');
            fetchApplications();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to reject');
        }
    };

    const showTeacherProfile = (teacher, application) => {
        Modal.info({
            title: 'Teacher Profile',
            width: 800,
            content: (
                <div style={{ marginTop: 20 }}>
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Name">{teacher.fullName}</Descriptions.Item>
                        <Descriptions.Item label="Email">
                            <MailOutlined /> {teacher.email}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phone">
                            <PhoneOutlined /> {teacher.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Experience">
                            {teacher.experience} years
                        </Descriptions.Item>
                        <Descriptions.Item label="Education">
                            {teacher.education}
                        </Descriptions.Item>
                        <Descriptions.Item label="Subjects">
                            {teacher.subjects?.join(', ') || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Location">
                            {teacher.location?.district}, {teacher.location?.state}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cover Letter">
                            <div style={{ maxHeight: 200, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                                {application.coverLetter}
                            </div>
                        </Descriptions.Item>
                    </Descriptions>

                    {teacher.resume && (
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            href={teacher.resume}
                            target="_blank"
                            style={{ marginTop: 20 }}
                        >
                            Download Resume
                        </Button>
                    )}
                </div>
            )
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'orange',
            shortlisted: 'green',
            rejected: 'red'
        };
        return colors[status] || 'default';
    };

    const columns = [
        {
            title: 'Teacher',
            dataIndex: ['teacher_id', 'fullName'],
            key: 'teacher',
            render: (text, record) => (
                <div className="flex items-center gap-2">
                    <Avatar icon={<UserOutlined />} src={record.teacher_id?.photo} />
                    <div>
                        <p className="font-semibold">{text}</p>
                        <p className="text-xs text-gray-500">
                            {record.teacher_id?.experience} years exp.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: 'Job',
            dataIndex: ['job_id', 'title'],
            key: 'job',
            render: (text, record) => (
                <div>
                    <p className="font-semibold text-sm">{text}</p>
                    <p className="text-xs text-gray-500">
                        {record.job_id?.subject} • {record.job_id?.level}
                    </p>
                </div>
            )
        },
        {
            title: 'Contact',
            key: 'contact',
            render: (_, record) => (
                <div className="text-sm">
                    <p><MailOutlined /> {record.teacher_id?.email}</p>
                    <p><PhoneOutlined /> {record.teacher_id?.phone}</p>
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Applied',
            dataIndex: 'appliedAt',
            key: 'appliedAt',
            render: (date) => dayjs(date).format('DD MMM YYYY')
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <Button
                        size="small"
                        icon={<FileTextOutlined />}
                        onClick={() => showTeacherProfile(record.teacher_id, record)}
                        block
                    >
                        View Profile
                    </Button>
                    {record.teacher_id?.resume && (
                        <Button
                            size="small"
                            icon={<DownloadOutlined />}
                            href={record.teacher_id.resume}
                            target="_blank"
                            block
                        >
                            Resume
                        </Button>
                    )}
                    {record.status === 'pending' && (
                        <>
                            <Button
                                type="primary"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleShortlist(record._id)}
                                block
                            >
                                Shortlist
                            </Button>
                            <Button
                                danger
                                size="small"
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleReject(record._id)}
                                block
                            >
                                Reject
                            </Button>
                        </>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Applications Received</h1>

                {/* Statistics */}
                <Row gutter={16} className="mb-6">
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Applications"
                                value={stats.total}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Pending Review"
                                value={stats.pending}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Shortlisted"
                                value={stats.shortlisted}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Rejected"
                                value={stats.rejected}
                                valueStyle={{ color: '#f5222d' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Filters */}
                <Card className="mb-6">
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Select
                                placeholder="Filter by Job"
                                style={{ width: '100%' }}
                                allowClear
                                onChange={setSelectedJobId}
                                value={selectedJobId}
                            >
                                {jobs.map(job => (
                                    <Option key={job._id} value={job._id}>
                                        {job.title}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Select
                                placeholder="Filter by Status"
                                style={{ width: '100%' }}
                                allowClear
                                onChange={setSelectedStatus}
                                value={selectedStatus}
                            >
                                <Option value="pending">Pending</Option>
                                <Option value="shortlisted">Shortlisted</Option>
                                <Option value="rejected">Rejected</Option>
                            </Select>
                        </Col>
                    </Row>
                </Card>

                {/* Applications Table */}
                <Card loading={loading}>
                    {applications.length === 0 && !loading ? (
                        <Empty
                            description="No applications received yet"
                            style={{ marginTop: 50, marginBottom: 50 }}
                        />
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={applications}
                            rowKey="_id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} applications`
                            }}
                            scroll={{ x: 1200 }}
                        />
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ApplicationsReceived;
