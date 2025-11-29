/**
 * Application Routes - Production Ready
 * Features: Submit, manage, and track job applications
 * Version: 2.0 (Updated October 2025)
 */

const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

// Import authentication middleware
const { authenticate } = require('../middleware/auth');

// ================================================
// TEACHER ROUTES (Apply for jobs, track applications)
// ================================================

/**
 * POST /api/applications/apply
 * Submit a job application
 * Requires: Valid JWT token (teacher)
 * Body: { job_id, coverLetter }
 * Returns: { success, message, application }
 */
router.post('/apply', authenticate, applicationController.submitApplication);

/**
 * GET /api/applications/my
 * Get current teacher's applications
 * Requires: Valid JWT token (teacher)
 * Query: { status, jobId }
 * Returns: { success, count, applications }
 */
router.get('/my', authenticate, applicationController.getMyApplications);

/**
 * DELETE /api/applications/:id
 * Withdraw a job application
 * Requires: Valid JWT token (teacher)
 * Params: { id = applicationId }
 * Returns: { success, message }
 */
router.delete('/:id', authenticate, applicationController.withdrawApplication);

/**
 * PUT /api/applications/:id
 * Update application status (generic endpoint for accept/reject/pending)
 * Requires: Valid JWT token (institution)
 * Params: { id = applicationId }
 * Body: { status = 'pending' | 'shortlisted' | 'rejected' }
 * Returns: { success, message, application }
 */
router.put('/:id', authenticate, applicationController.updateApplicationStatus);

// ================================================
// INSTITUTION ROUTES (Manage received applications)
// ================================================

/**
 * GET /api/applications/received
 * Get all applications received by institution
 * Requires: Valid JWT token (institution)
 * Query: { status, jobId }
 * Returns: { success, count, applications }
 */
router.get('/received', authenticate, applicationController.getAllReceivedApplications);

/**
 * GET /api/applications/received/:jobId
 * Get applications for specific job
 * Requires: Valid JWT token (institution)
 * Params: { jobId }
 * Returns: { success, jobTitle, count, applications }
 */
router.get('/received/:jobId', authenticate, applicationController.getApplicationsForJob);

/**
 * POST /api/applications/:id/shortlist
 * Shortlist an application
 * Requires: Valid JWT token (institution)
 * Params: { id = applicationId }
 * Returns: { success, message, application }
 */
router.post('/:id/shortlist', authenticate, applicationController.shortlistApplication);

/**
 * POST /api/applications/:id/reject
 * Reject an application
 * Requires: Valid JWT token (institution)
 * Params: { id = applicationId }
 * Returns: { success, message, application }
 */
router.post('/:id/reject', authenticate, applicationController.rejectApplication);

// ================================================
// ERROR HANDLING
// ================================================

// 404 - Route not found
router.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Application route not found',
        message: `No route found for ${req.method} ${req.path}`
    });
});

module.exports = router;