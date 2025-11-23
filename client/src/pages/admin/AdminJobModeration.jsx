import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminJobs } from '../../services/adminAPI';
import '../../styles/admin.css';

const AdminJobModeration = () => {
  const navigate = useNavigate();
  const { adminToken } = useAdminAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken, navigate]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await adminJobs.getAll({ token: adminToken });
      setJobs(response.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveJob = async (jobId) => {
    try {
      await adminJobs.approve(jobId, { token: adminToken });
      fetchJobs();
    } catch (error) {
      console.error('Error approving job:', error);
    }
  };

  const handleRejectJob = async (jobId) => {
    try {
      await adminJobs.reject(jobId, { token: adminToken });
      fetchJobs();
    } catch (error) {
      console.error('Error rejecting job:', error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await adminJobs.delete(jobId, { token: adminToken });
        setJobs(jobs.filter(j => j._id !== jobId));
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       job.institution?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterStatus === 'all' || job.status === filterStatus;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Moderation</h1>
          <p className="text-gray-600 mt-2">Review and moderate job postings</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search by job title or institution..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Jobs</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading jobs...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No jobs found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Job Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Institution</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Posted</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{job.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{job.institution?.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          job.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedJob(job);
                              setShowModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                            title="View"
                          >
                            👁️
                          </button>
                          {job.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveJob(job._id)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded"
                                title="Approve"
                              >
                                ✅
                              </button>
                              <button
                                onClick={() => handleRejectJob(job._id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded"
                                title="Reject"
                              >
                                ❌
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteJob(job._id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{selectedJob.title}</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-gray-600">Institution</label>
                <p className="text-gray-900">{selectedJob.institution?.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Subject</label>
                <p className="text-gray-900">{selectedJob.subject}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Description</label>
                <p className="text-gray-900">{selectedJob.jobDescription}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Location</label>
                <p className="text-gray-900">{selectedJob.location}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <p className="text-gray-900">{selectedJob.status}</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobModeration;
