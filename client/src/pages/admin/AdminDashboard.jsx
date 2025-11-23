// client/src/pages/admin/AdminDashboard.jsx
// FIXED VERSION - Remove unused imports, fix fetch

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Briefcase, MessageSquare, CreditCard, Settings, LogOut, Menu, X } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchDashboardStats();
  }, []);
  
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('No admin token found');
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      
      console.log('Fetching admin dashboard stats...');
      
      const res = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Dashboard stats received:', data);
      
      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        console.error('Invalid data format:', data);
        setError('Invalid data format');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.message);
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
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f3f4f6' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '256px' : '80px',
        background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
        color: 'white',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {sidebarOpen && <h1 style={{ fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>Eduhire Admin</h1>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        {/* Navigation */}
        <nav style={{ padding: '1rem', flex: 1 }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem',
                  background: activeTab === item.id ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  fontSize: '0.95rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = activeTab === item.id ? 'rgba(255, 255, 255, 0.2)' : 'transparent'}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
        
        {/* Logout Button */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div style={{ padding: '1.5rem' }}>
          {activeTab === 'dashboard' && (
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    border: '3px solid #e5e7eb',
                    borderTop: '3px solid #2563eb',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto'
                  }}></div>
                  <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading dashboard...</p>
                </div>
              ) : error ? (
                <div style={{
                  background: '#fee2e2',
                  border: '1px solid #ef4444',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  color: '#991b1b'
                }}>
                  <strong>Error:</strong> {error}
                  <button 
                    onClick={fetchDashboardStats}
                    style={{
                      marginLeft: '1rem',
                      padding: '0.5rem 1rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer'
                    }}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div>
                  {/* KPI Cards Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                  }}>
                    {/* Total Users Card */}
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 500 }}>Total Users</p>
                          <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                            {stats?.users?.total || 0}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.25rem' }}>
                            ↑ {stats?.users?.growthPercentage || 0}% this month
                          </p>
                        </div>
                        <div style={{
                          background: '#dbeafe',
                          padding: '0.75rem',
                          borderRadius: '0.5rem'
                        }}>
                          <Users style={{ color: '#2563eb' }} size={24} />
                        </div>
                      </div>
                    </div>

                    {/* Total Jobs Card */}
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 500 }}>Total Jobs</p>
                          <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                            {stats?.jobs?.total || 0}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            {stats?.jobs?.active || 0} active
                          </p>
                        </div>
                        <div style={{
                          background: '#d1fae5',
                          padding: '0.75rem',
                          borderRadius: '0.5rem'
                        }}>
                          <Briefcase style={{ color: '#059669' }} size={24} />
                        </div>
                      </div>
                    </div>

                    {/* Applications Card */}
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 500 }}>Applications</p>
                          <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                            {stats?.applications?.total || 0}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            {stats?.applications?.pending || 0} pending
                          </p>
                        </div>
                        <div style={{
                          background: '#e9d5ff',
                          padding: '0.75rem',
                          borderRadius: '0.5rem'
                        }}>
                          <MessageSquare style={{ color: '#9333ea' }} size={24} />
                        </div>
                      </div>
                    </div>

                    {/* Revenue Card */}
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 500 }}>Monthly Revenue</p>
                          <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                            ₹{(stats?.revenue?.monthlyRevenue || 0).toLocaleString()}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            {stats?.revenue?.activeSubscriptions || 0} subscriptions
                          </p>
                        </div>
                        <div style={{
                          background: '#fef3c7',
                          padding: '0.75rem',
                          borderRadius: '0.5rem'
                        }}>
                          <CreditCard style={{ color: '#d97706' }} size={24} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem'
                  }}>
                    {/* User Distribution */}
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>User Distribution</h3>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Teachers</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{stats?.users?.teachers || 0}</span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: '#e5e7eb',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            background: '#2563eb',
                            width: `${((stats?.users?.teachers || 0) / (stats?.users?.total || 1)) * 100}%`,
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Institutions</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{stats?.users?.institutions || 0}</span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: '#e5e7eb',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            background: '#059669',
                            width: `${((stats?.users?.institutions || 0) / (stats?.users?.total || 1)) * 100}%`,
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button 
                          onClick={() => setActiveTab('jobs')}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '0.75rem 1rem',
                            background: '#dbeafe',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#bfdbfe'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#dbeafe'}
                        >
                          <p style={{ fontWeight: 500, color: '#1e40af', margin: 0, marginBottom: '0.25rem' }}>Review Pending Jobs</p>
                          <p style={{ fontSize: '0.875rem', color: '#2563eb', margin: 0 }}>{stats?.jobs?.pending || 0} jobs awaiting approval</p>
                        </button>
                        <button 
                          onClick={() => setActiveTab('users')}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '0.75rem 1rem',
                            background: '#d1fae5',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#a7f3d0'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#d1fae5'}
                        >
                          <p style={{ fontWeight: 500, color: '#065f46', margin: 0, marginBottom: '0.25rem' }}>Manage Users</p>
                          <p style={{ fontSize: '0.875rem', color: '#059669', margin: 0 }}>{stats?.users?.newThisMonth || 0} new users this month</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <p style={{ color: '#6b7280' }}>User management interface - Feature coming soon...</p>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <p style={{ color: '#6b7280' }}>Job moderation interface - Feature coming soon...</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <p style={{ color: '#6b7280' }}>Review moderation interface - Feature coming soon...</p>
            </div>
          )}

          {activeTab === 'payments' && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <p style={{ color: '#6b7280' }}>Payment transactions interface - Feature coming soon...</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <p style={{ color: '#6b7280' }}>System settings interface - Feature coming soon...</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;