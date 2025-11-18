import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Input, Select, Button, Pagination, 
  Empty, Spin, Space, Radio, Slider, message 
} from 'antd';
import { 
  SearchOutlined, FilterOutlined, AppstoreOutlined, 
  UnorderedListOutlined, DollarOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './JobBrowse.css';

const { Option } = Select;

const JobBrowse = () => {
  const navigate = useNavigate();

  // State management
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalJobs: 0,
    limit: 10
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    subject: undefined,
    location: '',
    level: undefined,
    salaryMin: 0,
    salaryMax: 100000
  });

  // Sort state
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch jobs from API
  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '' && v !== 0)
        )
      };

      const response = await axios.get('http://localhost:5000/api/jobs/search', { params });

      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      message.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchJobs(1);
  }, [sortBy, sortOrder]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle search button click
  const handleSearch = () => {
    fetchJobs(1);
  };

  // Handle pagination change
  const handlePageChange = (page) => {
    fetchJobs(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle sort change
  const handleSortChange = (value) => {
    const [field, order] = value.split('-');
    setSortBy(field);
    setSortOrder(order);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      subject: undefined,
      location: '',
      level: undefined,
      salaryMin: 0,
      salaryMax: 100000
    });
    setSortBy('createdAt');
    setSortOrder('desc');
    fetchJobs(1);
  };

  return (
    <div className="job-browse-container">
      {/* Header */}
      <div className="browse-header">
        <h1 className="page-title">Browse Teaching Jobs</h1>
        <p className="page-subtitle">
          Find your perfect teaching position from {pagination.totalJobs} available opportunities
        </p>
      </div>

      {/* Search and Filter Section */}
      <Card className="filter-card">
        <Row gutter={[16, 16]}>
          {/* Search Bar */}
          <Col xs={24} md={8}>
            <Input
              size="large"
              placeholder="Search by title, subject, or location..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onPressEnter={handleSearch}
            />
          </Col>

          {/* Subject Filter */}
          <Col xs={24} sm={12} md={4}>
            <Select
              size="large"
              placeholder="Subject"
              style={{ width: '100%' }}
              value={filters.subject}
              onChange={(value) => handleFilterChange('subject', value)}
              allowClear
            >
              <Option value="Mathematics">Mathematics</Option>
              <Option value="Physics">Physics</Option>
              <Option value="Chemistry">Chemistry</Option>
              <Option value="Biology">Biology</Option>
              <Option value="English">English</Option>
              <Option value="Hindi">Hindi</Option>
              <Option value="Social Studies">Social Studies</Option>
              <Option value="Computer Science">Computer Science</Option>
            </Select>
          </Col>

          {/* Level Filter */}
          <Col xs={24} sm={12} md={4}>
            <Select
              size="large"
              placeholder="Education Level"
              style={{ width: '100%' }}
              value={filters.level}
              onChange={(value) => handleFilterChange('level', value)}
              allowClear
            >
              <Option value="primary">Primary (1-5)</Option>
              <Option value="secondary">Secondary (6-10)</Option>
              <Option value="higher">Higher (11-12, UG, PG)</Option>
            </Select>
          </Col>

          {/* Location Filter */}
          <Col xs={24} sm={12} md={4}>
            <Input
              size="large"
              placeholder="Location (City/State)"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </Col>

          {/* Search Button */}
          <Col xs={12} sm={6} md={2}>
            <Button 
              type="primary" 
              size="large" 
              icon={<SearchOutlined />}
              onClick={handleSearch}
              block
            >
              Search
            </Button>
          </Col>

          {/* Reset Button */}
          <Col xs={12} sm={6} md={2}>
            <Button 
              size="large" 
              onClick={resetFilters}
              block
            >
              Reset
            </Button>
          </Col>
        </Row>

        {/* Salary Range Filter */}
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <div className="salary-filter">
              <DollarOutlined /> Salary Range: ₹{filters.salaryMin.toLocaleString()} - ₹{filters.salaryMax.toLocaleString()}
              <Slider
                range
                min={0}
                max={100000}
                step={5000}
                value={[filters.salaryMin, filters.salaryMax]}
                onChange={([min, max]) => {
                  handleFilterChange('salaryMin', min);
                  handleFilterChange('salaryMax', max);
                }}
                style={{ marginTop: 8 }}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Results Header with View Toggle and Sort */}
      <Card className="results-header">
        <Row justify="space-between" align="middle">
          <Col>
            <span className="results-count">
              Showing {jobs.length} of {pagination.totalJobs} jobs
            </span>
          </Col>

          <Col>
            <Space>
              {/* Sort Dropdown */}
              <Select
                value={`${sortBy}-${sortOrder}`}
                onChange={handleSortChange}
                style={{ width: 200 }}
              >
                <Option value="createdAt-desc">Latest First</Option>
                <Option value="createdAt-asc">Oldest First</Option>
                <Option value="salary.min-desc">Salary: High to Low</Option>
                <Option value="salary.min-asc">Salary: Low to High</Option>
              </Select>

              {/* View Toggle */}
              <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                <Radio.Button value="grid">
                  <AppstoreOutlined /> Grid
                </Radio.Button>
                <Radio.Button value="list">
                  <UnorderedListOutlined /> List
                </Radio.Button>
              </Radio.Group>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Jobs Display */}
      {loading ? (
        <div className="loading-container">
          <Spin size="large" tip="Loading jobs..." />
        </div>
      ) : jobs.length === 0 ? (
        <Empty 
          description="No jobs found. Try adjusting your filters." 
          style={{ margin: '60px 0' }}
        />
      ) : (
        <div className={`jobs-container ${viewMode}-view`}>
          <Row gutter={[16, 16]}>
            {jobs.map((job) => (
              <Col 
                key={job._id} 
                xs={24} 
                sm={viewMode === 'grid' ? 12 : 24} 
                lg={viewMode === 'grid' ? 8 : 24}
              >
                <JobCard job={job} viewMode={viewMode} navigate={navigate} />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Pagination */}
      {!loading && jobs.length > 0 && (
        <div className="pagination-container">
          <Pagination
            current={pagination.currentPage}
            total={pagination.totalJobs}
            pageSize={pagination.limit}
            onChange={handlePageChange}
            showSizeChanger={false}
            showTotal={(total) => `Total ${total} jobs`}
          />
        </div>
      )}
    </div>
  );
};

// Job Card Component
const JobCard = ({ job, viewMode, navigate }) => {
  const salaryDisplay = job.salary?.min && job.salary?.max
    ? `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}`
    : 'Salary not specified';

  const institutionName = job.institutionid?.institutionName || 'Institution';
  const location = job.location || 'Location not specified';

  return (
    <Card
      className={`job-card ${viewMode}-card`}
      hoverable
      onClick={() => navigate(`/jobs/${job._id}`)}
    >
      <div className="job-card-header">
        <h3 className="job-title">{job.title}</h3>
        <span className={`job-badge ${job.employmentType}`}>
          {job.employmentType || 'Full-time'}
        </span>
      </div>

      <div className="job-card-body">
        <p className="institution-name">
          <strong>{institutionName}</strong>
        </p>

        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div className="job-detail">
            <span className="label">Subject:</span> {job.subject}
          </div>
          <div className="job-detail">
            <span className="label">Level:</span> {job.level}
          </div>
          <div className="job-detail">
            <span className="label">Location:</span> {location}
          </div>
          <div className="job-detail">
            <span className="label">Salary:</span> {salaryDisplay}
          </div>
          <div className="job-detail">
            <span className="label">Experience:</span> {job.experience} years
          </div>
        </Space>
      </div>

      <div className="job-card-footer">
        <span className="posted-date">
          Posted: {new Date(job.postedAt).toLocaleDateString()}
        </span>
        <Button type="primary" size="small">
          View Details
        </Button>
      </div>
    </Card>
  );
};

export default JobBrowse;
