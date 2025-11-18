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
    Popconfirm,
    Row,
    Col,
    Statistic
} from 'antd';
import {
    EyeOutlined,
    DeleteOutlined,
    CalendarOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import applicationService from '../services/applicationService';
import dayjs from 'dayjs';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        shortlisted: 0,
        rejected: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const loadApplications = async () => {
            try {
                setLoading(true);
                const response = await applicationService.getMyApplications();
                
                if (isMounted) {
                    setApplications(response.applications);

                    // Calculate stats
                    const stats = {
                        total: response.applications.length,
                        pending: response.applications.filter(a => a.status === 'pending').length,
                        shortlisted: response.applications.filter(a => a.status === 'shortlisted').length,
                        rejected: response.applications.filter(a => a.status === 'rejected').length
                    };
                    setStats(stats);
                }
            } catch (error) {
                if (isMounted) {
                    message.error('Failed to fetch applications');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadApplications();

        return () => {
            isMounted = false; // Prevent setState on unmounted component
        };
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await applicationService.getMyApplications();
            setApplications(response.applications);

            // Calculate stats
            const stats = {
                total: response.applications.length,
                pending: response.applications.filter(a => a.status === 'pending').length,
                shortlisted: response.applications.filter(a => a.status === 'shortlisted').length,
                rejected: response.applications.filter(a => a.status === 'rejected').length
            };
            setStats(stats);
        } catch (error) {
            message.error('Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (applicationId) => {
        try {
            await applicationService.withdrawApplication(applicationId);
            message.success('Application withdrawn successfully');
            fetchApplications();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to withdraw application');
        }
    };

    const showJobDetails = (job) => {
        Modal.info({
            title: job.title,
            width: 700,
            content: (
                <div style={{ marginTop: 20 }}>
                    <p><strong>Subject:</strong> {job.subject}</p>
                    <p><strong>Level:</strong> {job.level}</p>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p><strong>Employment Type:</strong> {job.employmentType}</p>
                    {job.salary?.min && job.salary?.max && (
                        <p>
                            <strong>Salary:</strong> {job.salary.currency} {job.salary.min} - {job.salary.max} / {job.salary.period}
                        </p>
                    )}
                    <p><strong>Institution:</strong> {job.institutionid?.institutionName}</p>
                    <Button
                        type="primary"
                        onClick={() => {
                            Modal.destroyAll();
                            navigate(`/jobs/${job._id}`);
                        }}
                        style={{ marginTop: 10 }}
                    >
                        View Full Details
                    </Button>
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
            title: 'Job Title',
            dataIndex: ['job_id', 'title'],
            key: 'title',
            render: (text, record) => (
                <div>
                    <p className="font-semibold">{text}</p>
                    <p className="text-xs text-gray-500">
                        {record.job_id?.subject} � {record.job_id?.level}
                    </p>
                </div>
            )
        },
        {
            title: 'Institution',
            dataIndex: ['job_id', 'institutionid', 'institutionName'],
            key: 'institution',
            render: (text) => <span className="text-sm">{text || 'N/A'}</span>
        },
        {
            title: 'Location',
            dataIndex: ['job_id', 'location'],
            key: 'location',
            render: (text) => (
                <span className="text-sm">
                    <EnvironmentOutlined /> {text}
                </span>
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
            title: 'Applied Date',
            dataIndex: 'appliedAt',
            key: 'appliedAt',
            render: (date) => (
                <span className="text-sm">
                    <CalendarOutlined /> {dayjs(date).format('DD MMM YYYY')}
                </span>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => showJobDetails(record.job_id)}
                    >
                        View Job
                    </Button>
                    {record.status === 'pending' && (
                        <Popconfirm
                            title="Withdraw Application"
                            description="Are you sure you want to withdraw this application?"
                            onConfirm={() => handleWithdraw(record._id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                            >
                                Withdraw
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">My Applications</h1>

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
                                title="Pending"
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

                {/* Applications Table */}
                <Card loading={loading}>
                    {applications.length === 0 && !loading ? (
                        <Empty
                            description="You haven't applied for any jobs yet"
                            style={{ marginTop: 50, marginBottom: 50 }}
                        >
                            <Button type="primary" onClick={() => navigate('/jobs')}>
                                Browse Jobs
                            </Button>
                        </Empty>
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
                            scroll={{ x: 1000 }}
                        />
                    )}
                </Card>
            </div>
        </div>
    );
};

export default MyApplications;
