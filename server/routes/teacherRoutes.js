/**
 * Teacher Profile Routes - Contract-Enforced (API_CONTRACTS.json)
 * Handles: Get, Update teacher profiles with exact field name mapping
 * Version: 1.0 (November 14, 2025 - Contract-driven)
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const teacherProfileController = require('../controllers/teacherProfileController');

/**
 * GET /api/teachers/profile
 * Get current teacher profile
 * Contract Response: { name, email, subject, experience, qualifications, profilePicture, subscription: { plan, renewalDate } }
 * Access: Private (Teacher only)
 */
router.get('/profile', authenticate, teacherProfileController.getProfile);

/**
 * PUT /api/teachers/profile
 * Update existing teacher profile
 * Contract Request: { name?, subject?, experience?, qualifications? }
 * Contract Response: { name, email, subject, experience, qualifications, profilePicture }
 * Access: Private (Teacher only)
 */
router.put('/profile', authenticate, teacherProfileController.updateProfile);

/**
 * POST /api/teachers/profile-picture
 * Upload teacher profile picture
 * Access: Private (Teacher only)
 */
router.post('/profile-picture', authenticate, upload.single('file'), teacherProfileController.uploadProfilePicture);

module.exports = router;
