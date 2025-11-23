import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import React, { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import MainLayout from "./components/Layout/MainLayout";
import InstitutionProfileForm from './components/InstitutionProfileForm';
import TeacherProfileForm from './components/TeacherProfileForm';
import JobPostForm from './components/Institutions/JobPostForm';
import MyJobPostings from './components/Institutions/MyJobPostings';
import ApplicationReview from './components/Institutions/ApplicationReview';
import TeacherProfile from './pages/TeacherProfile';
import InstitutionProfile from './pages/InstitutionProfile';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminJobModeration from './pages/admin/AdminJobModeration';
import AdminReviewModeration from './pages/admin/AdminReviewModeration';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSettings from './pages/admin/AdminSettings';
import { AdminAuthProvider } from './context/AdminAuthContext';

// Lazy loaded components
const EnhancedLandingPage = lazy(() => import('./pages/EnhancedLandingPage'));
const JobBrowse = lazy(() => import('./pages/JobBrowse'));
const JobDetail = lazy(() => import('./pages/JobDetail'));
const MyApplications = lazy(() => import('./pages/MyApplications'));
const ApplicationsReceived = lazy(() => import('./pages/ApplicationsReceived'));
const TeacherDashboard = lazy(() => import('./components/Dashboard/TeacherDashboard'));
const InstitutionDashboard = lazy(() => import('./components/Dashboard/InstitutionDashboard'));
const SavedJobs = lazy(() => import('./pages/SavedJobs'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage'));
const HelpSupportPage = lazy(() => import('./pages/HelpSupportPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));

// Admin components
const Dashboard = () => (
    <div className="min-h-screen flex justify-center items-center bg-green-50">
        <h1 className="text-3xl font-semibold">Welcome, you are logged in!</h1>
    </div>
);

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <Spin size="large" tip="Loading..." />
  </div>
);

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Admin Routes - Separate Layout */}
                <Route path="/admin/*" element={
                    <AdminAuthProvider>
                        <Routes>
                            <Route path="login" element={<AdminLoginPage />} />
                            <Route path="dashboard" element={
                                <ProtectedAdminRoute>
                                    <AdminDashboard />
                                </ProtectedAdminRoute>
                            } />
                            <Route path="users" element={
                                <ProtectedAdminRoute>
                                    <AdminUserManagement />
                                </ProtectedAdminRoute>
                            } />
                            <Route path="jobs" element={
                                <ProtectedAdminRoute>
                                    <AdminJobModeration />
                                </ProtectedAdminRoute>
                            } />
                            <Route path="reviews" element={
                                <ProtectedAdminRoute>
                                    <AdminReviewModeration />
                                </ProtectedAdminRoute>
                            } />
                            <Route path="payments" element={
                                <ProtectedAdminRoute>
                                    <AdminPayments />
                                </ProtectedAdminRoute>
                            } />
                            <Route path="settings" element={
                                <ProtectedAdminRoute>
                                    <AdminSettings />
                                </ProtectedAdminRoute>
                            } />
                        </Routes>
                    </AdminAuthProvider>
                } />

                {/* User Routes - With MainLayout */}
                <Route path="/*" element={
                    <AuthProvider>
                        <Suspense fallback={<LoadingFallback />}>
                            <MainLayout>
                                <Routes>
                                    {/* Public Routes */}
                                    <Route path="/" element={<EnhancedLandingPage />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/jobs" element={<JobBrowse />} />
                                    <Route path="/jobs/:id" element={<JobDetail />} />
                                    <Route path="/teacher-profile/:id" element={<TeacherProfile />} />
                                    <Route path="/institution-profile/:id" element={<InstitutionProfile />} />

                        {/* Teacher - Protected Routes */}
                        <Route
                            path="/my-applications"
                            element={
                                <ProtectedRoute allowedRoles={['teacher']}>
                                    <MyApplications />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/create-teacher-profile"
                            element={
                                <ProtectedRoute allowedRoles={['teacher']}>
                                    <TeacherProfileForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/saved-jobs"
                            element={
                                <ProtectedRoute allowedRoles={['teacher']}>
                                    <SavedJobs />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/teacher-dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['teacher']}>
                                    <TeacherDashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Institution - Protected Routes */}
                        <Route
                            path="/applications-received"
                            element={
                                <ProtectedRoute allowedRoles={['institution']}>
                                    <ApplicationsReceived />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/create-institution-profile"
                            element={
                                <ProtectedRoute allowedRoles={['institution']}>
                                    <InstitutionProfileForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/post-job"
                            element={
                                <ProtectedRoute allowedRoles={['institution']}>
                                        <JobPostForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/my-jobs"
                            element={
                                <ProtectedRoute allowedRoles={['institution']}>
                                        <MyJobPostings />
                                </ProtectedRoute>
                            }
                        />
                        <Route 
                            path="/review-applications" 
                            element={
                                <ProtectedRoute allowedRoles={['institution']}>
                                    <ApplicationReview />
                                </ProtectedRoute>
                            } 
                        />
                        <Route
                            path="/institution-dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['institution']}>
                                    <InstitutionDashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin Routes */}
                        // ...existing code...
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminUserManagement />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/jobs"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminJobModeration />
                                </ProtectedRoute>
                            }
                        />

                        {/* General Protected Routes */}
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/notifications"
                            element={
                                <ProtectedRoute>
                                    <NotificationsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <SettingsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/subscriptions"
                            element={
                                <ProtectedRoute>
                                    <SubscriptionsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/help"
                            element={
                                <ProtectedRoute>
                                    <HelpSupportPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Public Static Pages */}
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="/contact" element={<ContactUsPage />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                        <Route path="/terms-of-service" element={<TermsOfServicePage />} />

                                    {/* Catch all - redirect to landing */}
                                    <Route path="*" element={<EnhancedLandingPage />} />
                                </Routes>
                            </MainLayout>
                        </Suspense>
                    </AuthProvider>
                } />
            </Routes>
        </Router>
    );
};

export default App;
