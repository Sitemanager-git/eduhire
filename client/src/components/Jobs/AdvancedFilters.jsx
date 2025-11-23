import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Select, 
  Slider, 
  Checkbox, 
  Button, 
  Space, 
  Divider,
  Tag,
  message 
} from 'antd';
import { FilterOutlined, SaveOutlined, ClearOutlined } from '@ant-design/icons';

const { Option } = Select;

const AdvancedFilters = ({ onFilterChange, onSaveSearch }) => {
  // State management for all filter values
  const [filters, setFilters] = useState({
    experience: [0, 20],
    qualification: [],
    jobType: [],
    institutionType: [],
    salary: [0, 200000],
    subjects: [],
    level: []
  });

  const [isFilterApplied, setIsFilterApplied] = useState(false);

  // Experience level marks for slider
  const experienceMarks = {
    0: '0',
    2: '2',
    5: '5',
    10: '10',
    20: '20+'
  };

  // Salary range marks
  const salaryMarks = {
    0: '₹0',
    50000: '₹50k',
    100000: '₹1L',
    150000: '₹1.5L',
    200000: '₹2L+'
  };

  // Options data
  const qualificationOptions = [
    'B.Ed',
    'M.Ed',
    'B.A. Education',
    'M.A. Education',
    'Ph.D. Education',
    'Diploma in Education',
    'B.Sc. Education',
    'M.Sc. Education'
  ];

  const jobTypeOptions = [
    'Full-time',
    'Part-time',
    'Contract',
    'Temporary',
    'Substitute'
  ];

  const institutionTypeOptions = [
    'CBSE',
    'ICSE',
    'IB',
    'State Board',
    'Cambridge',
    'IGCSE'
  ];

  const subjectOptions = [
    'Mathematics',
    'Science',
    'English',
    'Hindi',
    'Social Studies',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Physical Education'
  ];

  const levelOptions = [
    'Primary',
    'Secondary',
    'Higher Secondary'
  ];

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    onFilterChange(filters);
    setIsFilterApplied(true);
    message.success('Filters applied successfully');
  };

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters = {
      experience: [0, 20],
      qualification: [],
      jobType: [],
      institutionType: [],
      salary: [0, 200000],
      subjects: [],
      level: []
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
    setIsFilterApplied(false);
    message.info('All filters cleared');
  };

  // Save current search
  const saveCurrentSearch = () => {
    if (!isFilterApplied) {
      message.warning('Please apply filters before saving');
      return;
    }
    onSaveSearch(filters);
    message.success('Search criteria saved successfully');
  };

  return (
    <Card 
      title={
        <Space>
          <FilterOutlined />
          <span>Advanced Filters</span>
        </Space>
      }
      className="mb-4"
    >
      {/* Experience Level Slider */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          Experience Level (Years)
        </label>
        <Slider
          range
          marks={experienceMarks}
          min={0}
          max={20}
          value={filters.experience}
          onChange={(value) => handleFilterChange('experience', value)}
          tooltip={{
            formatter: (value) => `${value} years`
          }}
        />
      </div>

      <Divider />

      {/* Qualification Checkboxes */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Qualification</label>
        <Checkbox.Group
          options={qualificationOptions}
          value={filters.qualification}
          onChange={(value) => handleFilterChange('qualification', value)}
          className="flex flex-col gap-2"
        />
      </div>

      <Divider />

      {/* Job Type */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Job Type</label>
        <Select
          mode="multiple"
          placeholder="Select job types"
          value={filters.jobType}
          onChange={(value) => handleFilterChange('jobType', value)}
          style={{ width: '100%' }}
          maxTagCount={2}
        >
          {jobTypeOptions.map(type => (
            <Option key={type} value={type}>{type}</Option>
          ))}
        </Select>
      </div>

      {/* Institution Type */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Institution Type</label>
        <Checkbox.Group
          options={institutionTypeOptions}
          value={filters.institutionType}
          onChange={(value) => handleFilterChange('institutionType', value)}
          className="flex flex-col gap-2"
        />
      </div>

      <Divider />

      {/* Salary Range Slider */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          Salary Range (Monthly)
        </label>
        <Slider
          range
          marks={salaryMarks}
          min={0}
          max={200000}
          step={5000}
          value={filters.salary}
          onChange={(value) => handleFilterChange('salary', value)}
          tooltip={{
            formatter: (value) => `₹${(value/1000).toFixed(0)}k`
          }}
        />
      </div>

      <Divider />

      {/* Subjects */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Subjects</label>
        <Select
          mode="multiple"
          placeholder="Select subjects"
          value={filters.subjects}
          onChange={(value) => handleFilterChange('subjects', value)}
          style={{ width: '100%' }}
          maxTagCount={3}
          showSearch
        >
          {subjectOptions.map(subject => (
            <Option key={subject} value={subject}>{subject}</Option>
          ))}
        </Select>
      </div>

      {/* Education Level */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Education Level</label>
        <Checkbox.Group
          options={levelOptions}
          value={filters.level}
          onChange={(value) => handleFilterChange('level', value)}
          className="flex flex-col gap-2"
        />
      </div>

      <Divider />

      {/* Action Buttons */}
      <Space className="w-full justify-between">
        <Button 
          type="default" 
          icon={<ClearOutlined />}
          onClick={clearFilters}
        >
          Clear All
        </Button>
        <Space>
          <Button 
            icon={<SaveOutlined />}
            onClick={saveCurrentSearch}
          >
            Save Search
          </Button>
          <Button 
            type="primary" 
            icon={<FilterOutlined />}
            onClick={applyFilters}
          >
            Apply Filters
          </Button>
        </Space>
      </Space>

      {/* Active Filters Display */}
      {isFilterApplied && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Active Filters:</div>
          <Space wrap>
            {filters.qualification.map(q => (
              <Tag key={q} color="blue">{q}</Tag>
            ))}
            {filters.jobType.map(jt => (
              <Tag key={jt} color="green">{jt}</Tag>
            ))}
            {filters.institutionType.map(it => (
              <Tag key={it} color="purple">{it}</Tag>
            ))}
          </Space>
        </div>
      )}
    </Card>
  );
};

export default AdvancedFilters;
