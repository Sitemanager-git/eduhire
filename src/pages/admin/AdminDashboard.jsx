import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminDashboard, adminUsers, adminJobs, adminReviews } from '../../services/adminAPI';
import { LayoutDashboard, Users, Briefcase, MessageSquare, CreditCard, Settings, X, Menu, LogOut } from 'lucide-react';
import '../../styles/admin.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboardStats();
  }, []);
  
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  };
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'jobs', label: 'Job Moderation', icon: Briefcase },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-blue-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 border-b border-blue-800">
          <div className="flex items-center justify-between">
            <h1 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>Eduhire Admin</h1>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:bg-blue-800 p-2 rounded">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        
        <nav className="p-4">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
                  activeTab === item.id ? 'bg-blue-700' : 'hover:bg-blue-800'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-blue-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 transition">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
              ) : (
                <div>
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total Users</p>
                          <p className="text-3xl font-bold text-gray-900">{stats?.users?.total || 0}</p>
                          <p className="text-xs text-green-600 mt-1">↑ {stats?.users?.growthPercentage}% this month</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <Users className="text-blue-600" size={24} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
                          <p className="text-3xl font-bold text-gray-900">{stats?.jobs?.total || 0}</p>
                          <p className="text-xs text-gray-500 mt-1">{stats?.jobs?.active} active</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <Briefcase className="text-green-600" size={24} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Applications</p>
                          <p className="text-3xl font-bold text-gray-900">{stats?.applications?.total || 0}</p>
                          <p className="text-xs text-gray-500 mt-1">{stats?.applications?.pending} pending</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <MessageSquare className="text-purple-600" size={24} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                          <p className="text-3xl font-bold text-gray-900">₹{(stats?.revenue?.monthlyRevenue || 0).toLocaleString()}</p>
                          <p className="text-xs text-gray-500 mt-1">{stats?.revenue?.activeSubscriptions} subscriptions</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <CreditCard className="text-yellow-600" size={24} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600">Teachers</span>
                            <span className="text-sm font-medium">{stats?.users?.teachers || 0}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${((stats?.users?.teachers || 0) / (stats?.users?.total || 1)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600">Institutions</span>
                            <span className="text-sm font-medium">{stats?.users?.institutions || 0}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${((stats?.users?.institutions || 0) / (stats?.users?.total || 1)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button onClick={() => setActiveTab('jobs')} className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                          <p className="font-medium text-blue-900">Review Pending Jobs</p>
                          <p className="text-sm text-blue-600">{stats?.jobs?.pending || 0} jobs awaiting approval</p>
                        </button>
                        <button onClick={() => setActiveTab('users')} className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition">
                          <p className="font-medium text-green-900">Manage Users</p>
                          <p className="text-sm text-green-600">{stats?.users?.newThisMonth || 0} new users this month</p>
                        </button>
                        <button onClick={() => setActiveTab('payments')} className="w-full text-left px-4 py-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition">
                          <p className="font-medium text-yellow-900">View Transactions</p>
                          <p className="text-sm text-yellow-600">{stats?.revenue?.activeSubscriptions || 0} active subscriptions</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600">User management interface coming soon...</p>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600">Job moderation interface coming soon...</p>
            </div>
          )}

          {/* Add more tab content... */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
