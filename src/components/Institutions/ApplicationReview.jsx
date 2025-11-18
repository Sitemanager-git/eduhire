import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Select, message, Modal, Descriptions, Space, Avatar } from 'antd';
import {
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DownloadOutlined,
    UserOutlined
} from '@ant-design/icons';
import { applicationAPI, jobAPI } from '../../services/api';

const { Option } = Select;

const ApplicationReview = () => {
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedJob, setSelectedJob] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

    useEffect(() => {
        fetchMyJobs();
        fetchApplications();
    }, []);

    const fetchMyJobs = async () => {
        try {
            const response = await jobAPI.getMyJobs();
            setJobs(response.data.jobs || []);
        } catch (error) {
            message.error('Failed to load your jobs');
        }
    };

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await applicationAPI.getReceived();
            setApplications(response.data.applications || []);
        } catch (error) {
            message.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            await applicationAPI.updateStatus(applicationId, newStatus);
            message.success(`Application ${newStatus}`);
            fetchApplications(); // Refresh list
        } catch (error) {
            message.error('Failed to update status');
        }
    };

    const handleExport = async (jobId) => {
        try {
            const response = await applicationAPI.exportApplicants(jobId, 'csv');
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `applicants-${jobId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            message.success('Applications exported successfully');
        } catch (error) {
            message.error('Failed to export applications');
        }
    };

    const viewDetails = (application) => {
        setSelectedApplication(application);
        setViewModalVisible(true);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'blue',
            reviewed: 'orange',
            shortlisted: 'purple',
            accepted: 'green',
            rejected: 'red'
        };
        return colors[status] || 'default';
    };

    const filteredApplications = applications.filter(app => {
        const jobMatch = selectedJob === 'all' || app.jobId?._id === selectedJob;
        const statusMatch = selectedStatus === 'all' || app.status === selectedStatus;
        return jobMatch && statusMatch;
    });

    const columns = [
        {
            title: 'Applicant',
            dataIndex: ['teacherId', 'name'],
            key: 'name',
            render: (name, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} src={record.teacherId?.photo} />
                    <span>{name || 'N/A'}</span>
                </Space>
            )
        },
        {
            title: 'Job Position',
            dataIndex: ['jobId', 'title'],
            key: 'job',
            render: (title) => title || 'N/A'
        },
        {
            title: 'Subject',
            dataIndex: ['jobId', 'subject'],
            key: 'subject'
        },
        {
            title: 'Experience',
            dataIndex: ['teacherId', 'experience'],
            key: 'experience',
            render: (exp) => `${exp || 0} years`
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
            title: 'Applied On',
            dataIndex: 'createdAt',
            key: 'date',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => viewDetails(record)}
                        size="small"
                    >
                        View
                    </Button>
                    {record.status === 'pending' && (
                        <>
                            <Button
                                icon={<CheckCircleOutlined />}
                                type="primary"
                                size="small"
                                onClick={() => handleStatusChange(record._id, 'accepted')}
                            >
                                Accept
                            </Button>
                            <Button
                                icon={<CloseCircleOutlined />}
                                danger
                                size="small"
                                onClick={() => handleStatusChange(record._id, 'rejected')}
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
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Review Applications
                        </h1>
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={() => handleExport(selectedJob)}
                            disabled={selectedJob === 'all'}
                        >
                            Export to CSV
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex gap-4">
                        <Select
                            style={{ width: 250 }}
                            value={selectedJob}
                            onChange={setSelectedJob}
                            placeholder="Filter by Job"
                        >
                            <Option value="all">All Jobs</Option>
                            {jobs.map(job => (
                                <Option key={job._id} value={job._id}>
                                    {job.title}
                                </Option>
                            ))}
                        </Select>

                        <Select
                            style={{ width: 200 }}
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                            placeholder="Filter by Status"
                        >
                            <Option value="all">All Status</Option>
                            <Option value="pending">Pending</Option>
                            <Option value="reviewed">Reviewed</Option>
                            <Option value="shortlisted">Shortlisted</Option>
                            <Option value="accepted">Accepted</Option>
                            <Option value="rejected">Rejected</Option>
                        </Select>
                    </div>

                    {/* Applications Table */}
                    <Table
                        columns={columns}
                        dataSource={filteredApplications}
                        rowKey="_id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showTotal: (total) => `Total ${total} applications`
                        }}
                    />
                </Card>

                {/* View Details Modal */}
                <Modal
                    title="Application Details"
                    open={viewModalVisible}
                    onCancel={() => setViewModalVisible(false)}
                    footer={[
                        <Button key="close" onClick={() => setViewModalVisible(false)}>
                            Close
                        </Button>,
                        selectedApplication?.status === 'pending' && (
                            <>
                                <Button
                                    key="accept"
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => {
                                        handleStatusChange(selectedApplication._id, 'accepted');
                                        setViewModalVisible(false);
                                    }}
                                >
                                    Accept
                                </Button>
                                <Button
                                    key="reject"
                                    danger
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => {
                                        handleStatusChange(selectedApplication._id, 'rejected');
                                        setViewModalVisible(false);
                                    }}
                                >
                                    Reject
                                </Button>
                            </>
                        )
                    ]}
                    width={800}
                >
                    {selectedApplication && (
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Applicant Name">
                                {selectedApplication.teacherId?.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {selectedApplication.teacherId?.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phone">
                                {selectedApplication.teacherId?.phone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Qualifications">
                                {selectedApplication.teacherId?.qualifications?.map(q =>
                                    `${q.degree} from ${q.institution} (${q.year})`
                                ).join(', ')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Experience">
                                {selectedApplication.teacherId?.experience} years
                            </Descriptions.Item>
                            <Descriptions.Item label="Specializations">
                                {selectedApplication.teacherId?.specializations?.join(', ')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cover Letter">
                                {selectedApplication.coverLetter || 'No cover letter provided'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Applied Job">
                                {selectedApplication.jobId?.title}
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={getStatusColor(selectedApplication.status)}>
                                    {selectedApplication.status.toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Applied On">
                                {new Date(selectedApplication.createdAt).toLocaleString()}
                            </Descriptions.Item>
                        </Descriptions>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default ApplicationReview;
