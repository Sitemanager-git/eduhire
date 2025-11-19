// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();

// Import admin controllers
const adminAuthController = require('../controllers/adminAuthController');
const adminDashboardController = require('../controllers/adminDashboardController');
const adminUserController = require('../controllers/adminUserController');
const adminJobController = require('../controllers/adminJobController');
const adminReviewController = require('../controllers/adminReviewController');
const adminPaymentController = require('../controllers/adminPaymentController');
const adminSystemController = require('../controllers/adminSystemController');

// Import admin middleware
const { authenticateAdmin, requirePermission, requireSuperAdmin } = require('../middleware/adminAuth');

// ==========================================
// PUBLIC ADMIN ROUTES (No auth required)
// ==========================================

/**
 * POST /api/admin/auth/login
 * Admin login
 */
router.post('/auth/login', adminAuthController.login);

// ==========================================
// PROTECTED ADMIN ROUTES (Auth required)
// ==========================================

/**
 * GET /api/admin/auth/me
 * Get current admin info
 */
router.get('/auth/me', authenticateAdmin, adminAuthController.getMe);

/**
 * POST /api/admin/auth/change-password
 * Change admin password
 */
router.post('/auth/change-password', authenticateAdmin, adminAuthController.changePassword);

/**
 * POST /api/admin/auth/logout
 * Admin logout
 */
router.post('/auth/logout', authenticateAdmin, adminAuthController.logout);

// ==========================================
// DASHBOARD & ANALYTICS
// ==========================================

/**
 * GET /api/admin/dashboard/stats
 * Get dashboard KPIs
 */
router.get('/dashboard/stats', authenticateAdmin, requirePermission('canViewAnalytics'), adminDashboardController.getStats);

/**
 * GET /api/admin/dashboard/charts
 * Get chart data (growth, revenue)
 */
router.get('/dashboard/charts', authenticateAdmin, requirePermission('canViewAnalytics'), adminDashboardController.getCharts);

// ==========================================
// USER MANAGEMENT
// ==========================================

/**
 * GET /api/admin/users
 * List all users with filters
 */
router.get('/users', authenticateAdmin, requirePermission('canManageUsers'), adminUserController.getUsers);

/**
 * GET /api/admin/users/:id
 * Get single user details
 */
router.get('/users/:id', authenticateAdmin, requirePermission('canManageUsers'), adminUserController.getUserDetails);

/**
 * PUT /api/admin/users/:id/suspend
 * Suspend/activate user
 */
router.put('/users/:id/suspend', authenticateAdmin, requirePermission('canManageUsers'), adminUserController.suspendUser);

/**
 * DELETE /api/admin/users/:id
 * Delete user (superadmin only)
 */
router.delete('/users/:id', authenticateAdmin, requireSuperAdmin, adminUserController.deleteUser);

// ==========================================
// JOB MODERATION
// ==========================================

/**
 * GET /api/admin/jobs
 * List all jobs with filters
 */
router.get('/jobs', authenticateAdmin, requirePermission('canModerateJobs'), adminJobController.getJobs);

/**
 * GET /api/admin/jobs/:id
 * Get job details
 */
router.get('/jobs/:id', authenticateAdmin, requirePermission('canModerateJobs'), adminJobController.getJobDetails);

/**
 * PUT /api/admin/jobs/:id/approve
 * Approve job
 */
router.put('/jobs/:id/approve', authenticateAdmin, requirePermission('canModerateJobs'), adminJobController.approveJob);

/**
 * PUT /api/admin/jobs/:id/reject
 * Reject job
 */
router.put('/jobs/:id/reject', authenticateAdmin, requirePermission('canModerateJobs'), adminJobController.rejectJob);

// ==========================================
// REVIEW MODERATION
// ==========================================

/**
 * GET /api/admin/reviews
 * List all reviews
 */
router.get('/reviews', authenticateAdmin, requirePermission('canModerateReviews'), adminReviewController.getReviews);

/**
 * PUT /api/admin/reviews/:id/approve
 * Approve review
 */
router.put('/reviews/:id/approve', authenticateAdmin, requirePermission('canModerateReviews'), adminReviewController.approveReview);

/**
 * PUT /api/admin/reviews/:id/flag
 * Flag/reject review
 */
router.put('/reviews/:id/flag', authenticateAdmin, requirePermission('canModerateReviews'), adminReviewController.flagReview);

// ==========================================
// PAYMENT MANAGEMENT
// ==========================================

/**
 * GET /api/admin/payments
 * List all payment transactions
 */
router.get('/payments', authenticateAdmin, requirePermission('canManagePayments'), adminPaymentController.getPayments);

/**
 * GET /api/admin/payments/:id
 * Get payment details
 */
router.get('/payments/:id', authenticateAdmin, requirePermission('canManagePayments'), adminPaymentController.getPaymentDetails);

// ==========================================
// SYSTEM MANAGEMENT (Superadmin only)
// ==========================================

/**
 * GET /api/admin/system/config
 * Get system configuration
 */
router.get('/system/config', authenticateAdmin, requireSuperAdmin, adminSystemController.getConfig);

/**
 * PUT /api/admin/system/config
 * Update system configuration
 */
router.put('/system/config', authenticateAdmin, requireSuperAdmin, adminSystemController.updateConfig);

/**
 * POST /api/admin/system/backup
 * Create database backup
 */
router.post('/system/backup', authenticateAdmin, requireSuperAdmin, adminSystemController.createBackup);

// ==========================================
// ERROR HANDLING
// ==========================================

router.use((req, res) => {
  res.status(404).json({
    error: 'Admin route not found',
    message: `No route found for ${req.method} ${req.path}`
  });
});

module.exports = router;
