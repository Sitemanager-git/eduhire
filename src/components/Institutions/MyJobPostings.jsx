import React, { useState, useEffect, useCallback } from "react";
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    Modal,
    message,
    Empty,
    Row,
    Col,
    Statistic,
    Popconfirm,
    Select
} from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    CopyOutlined,
    DownloadOutlined,
    PlusOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import jobService from "../../services/jobService";
import dayjs from "dayjs";

const { Option } = Select;

const MyJobPostings = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        pending: 0,
        expired: 0
    });

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                status: filter !== "all" ? filter : undefined,
                page: pagination.current,
                limit: pagination.pageSize
            };

            const response = await jobService.getMyJobs(params);

            setJobs(response.data.jobs);
            setPagination(prev => ({
                ...prev,
                total: response.data.total
            }));

            // Calculate stats
            const allJobsResponse = await jobService.getMyJobs();
            const allJobs = allJobsResponse.data.jobs;

            setStats({
                total: allJobs.length,
                active: allJobs.filter(j => j.status === "active").length,
                pending: allJobs.filter(j => j.status === "pending").length,
                expired: allJobs.filter(j => j.status === "expired").length
            });
        } catch (error) {
            message.error("Failed to fetch jobs");
        } finally {
            setLoading(false);
        }
    }, [filter, pagination.current, pagination.pageSize]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleDelete = async (jobId) => {
        try {
            await jobService.deleteJob(jobId);
            message.success("Job deleted successfully");
            fetchJobs();
        } catch (error) {
            message.error("Failed to delete job");
        }
    };

    const handleDuplicate = async (jobId) => {
        try {
            await jobService.duplicateJob(jobId);
            message.success("Job duplicated successfully");
            fetchJobs();
        } catch (error) {
            message.error("Failed to duplicate job");
        }
    };

    const handleExport = async (jobId, jobTitle) => {
        try {
            const response = await jobService.exportApplicants(jobId, "csv");

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `applicants_${jobTitle.replace(/\s+/g, "_")}_${Date.now()}.csv`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            message.success("Applicants exported successfully");
        } catch (error) {
            if (error.response?.data?.upgrade_required) {
                message.error("Premium feature - Please upgrade your subscription");
            } else {
                message.error("Failed to export applicants");
            }
        }
    };

    const showApplicantsModal = async (jobId, jobTitle) => {
        try {
            const response = await jobService.getApplicants(jobId);

            Modal.info({
                title: `Applicants for "${jobTitle}"`,
                width: 800,
                content: (
                    <div>
                        {response.data.applicants.length > 0 ? (
                            <Table
                                dataSource={response.data.applicants.map((app, i) => ({
                                    ...app,
                                    key: app._id || i
                                }))}
                                columns={[
                                    { title: "Name", dataIndex: "name", key: "name" },
                                    { title: "Email", dataIndex: "email", key: "email" },
                                    { title: "Phone", dataIndex: "phone", key: "phone" }
                                ]}
                                pagination={false}
                                size="small"
                            />
                        ) : (
                            <Empty description="No applicants yet" />
                        )}
                    </div>
                )
            });
        } catch (error) {
            message.error("Failed to fetch applicants");
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            active: "green",
            pending: "orange",
            approved: "blue",
            expired: "red",
            closed: "gray"
        };
        return colors[status] || "default";
    };

    const isExpiringSoon = (expiresAt) => {
        const daysUntilExpiry = dayjs(expiresAt).diff(dayjs(), "day");
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    };

    const columns = [
        {
            title: "Job Title",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <div>
                    <p className="font-semibold">{text}</p>
                    <p className="text-xs text-gray-500">
                        {record.subject} • {record.level}
                    </p>
                </div>
            )
        },
        {
            title: "Location",
            dataIndex: "location",
            key: "location",
            render: (text) => <span className="text-sm">{text}</span>
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
            )
        },
        {
            title: "Applications",
            dataIndex: "applications_count",
            key: "applications_count",
            render: (count) => <span className="font-semibold">{count || 0}</span>
        },
        {
            title: "Expires",
            dataIndex: "expiresAt",
            key: "expiresAt",
            render: (date) => {
                const daysLeft = dayjs(date).diff(dayjs(), "day");
                const isExpiring = isExpiringSoon(date);

                return (
                    <div>
                        <p className="text-sm">
                            {dayjs(date).format("DD MMM YYYY")}
                        </p>
                        <p className={`text-xs ${isExpiring ? "text-red-500 font-semibold" : "text-gray-500"}`}>
                            {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                        </p>
                    </div>
                );
            }
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space size="small" wrap>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => showApplicantsModal(record._id, record.title)}
                        title="View Applicants"
                    >
                        {record.applications_count || 0}
                    </Button>

                    <Button
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => handleExport(record._id, record.title)}
                        title="Export Applicants (Premium)"
                    >
                        Export
                    </Button>

                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/jobs/edit/${record._id}`)}
                        disabled={record.status === "expired" || record.status === "closed"}
                        title="Edit Job"
                    >
                        Edit
                    </Button>

                    <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => handleDuplicate(record._id)}
                        title="Duplicate Job"
                    >
                        Duplicate
                    </Button>

                    <Popconfirm
                        title="Delete Job"
                        description="Are you sure you want to delete this job posting?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            title="Delete Job"
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">My Job Postings</h1>
                        <p className="text-gray-600">Manage and track your job listings</p>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => navigate("/post-job")}
                    >
                        Post New Job
                    </Button>
                </div>

                {/* Statistics */}
                <Row gutter={16} className="mb-6">
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Jobs"
                                value={stats.total}
                                valueStyle={{ color: "#1890ff" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Active"
                                value={stats.active}
                                valueStyle={{ color: "#52c41a" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Pending"
                                value={stats.pending}
                                valueStyle={{ color: "#faad14" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Expired"
                                value={stats.expired}
                                valueStyle={{ color: "#f5222d" }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Filter & Search */}
                <Card className="mb-6">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={8}>
                            <Select
                                placeholder="Filter by status"
                                value={filter}
                                onChange={(value) => {
                                    setFilter(value);
                                    setPagination({ ...pagination, current: 1 });
                                }}
                                style={{ width: "100%" }}
                            >
                                <Option value="all">All Jobs</Option>
                                <Option value="active">Active</Option>
                                <Option value="pending">Pending Approval</Option>
                                <Option value="expired">Expired</Option>
                            </Select>
                        </Col>
                    </Row>
                </Card>

                {/* Jobs Table */}
                <Card
                    loading={loading}
                    className="shadow-md"
                >
                    {jobs.length === 0 && !loading ? (
                        <Empty
                            description="No jobs found"
                            style={{ marginTop: 50, marginBottom: 50 }}
                        />
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={jobs.map((job, i) => ({
                                ...job,
                                key: job._id || i
                            }))}
                            pagination={{
                                current: pagination.current,
                                pageSize: pagination.pageSize,
                                total: pagination.total,
                                onChange: (page) => {
                                    setPagination({ ...pagination, current: page });
                                }
                            }}
                            scroll={{ x: 1000 }}
                            rowClassName={(record) => {
                                if (isExpiringSoon(record.expiresAt)) {
                                    return "bg-orange-50";
                                }
                                return "";
                            }}
                        />
                    )}
                </Card>

                {/* Help Text */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                        💡 <strong>Tip:</strong> Jobs highlighted in orange are expiring within 7 days.
                        Duplicate them to keep posting similar roles!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MyJobPostings;
