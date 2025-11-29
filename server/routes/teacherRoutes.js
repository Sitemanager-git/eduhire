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

console.log('📚 [ROUTES] Teaching routes file loaded');

// Debug route
router.get('/debug', (req, res) => {
    res.json({ message: 'Teacher routes working', timestamp: new Date() });
});

/**
 * GET /api/teachers/profile
 * Get current teacher profile
 * Contract Response: { name, email, subject, experience, qualifications, profilePicture, subscription: { plan, renewalDate } }
 * Access: Private (Teacher only)
 */
router.get('/profile', authenticate, teacherProfileController.getProfile);

/**
 * POST /api/teachers/profile
 * Create new teacher profile
 * Contract Request: { name, subject, experience, qualifications, languages?, about?, certifications? }
 * Contract Response: { name, email, subject, experience, qualifications, profilePicture }
 * Access: Private (Teacher only)
 */
router.post('/profile', authenticate, upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]), teacherProfileController.createProfile);

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
