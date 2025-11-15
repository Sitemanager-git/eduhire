/**
 * Institution Routes - Profile management
 * Handles: Create, Read, Update institution profiles
 * Version: 2.0 (November 11, 2025 - Cleaned & Fixed)
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const institutionController = require('../controllers/institutionController');

/**
 * POST /api/institutions/profile
 * Create or update institution profile
 * Access: Private (Institution only)
 */
router.post('/profile', authenticate, institutionController.createOrUpdateProfile);

/**
 * GET /api/institutions/profile
 * Get current institution profile
 * Access: Private (Institution only)
 */
router.get('/profile', authenticate, institutionController.getProfile);

/**
 * PUT /api/institutions/profile
 * Update existing institution profile
 * Access: Private (Institution only)
 */
router.put('/profile', authenticate, institutionController.createOrUpdateProfile);

/**
 * GET /api/institutions/profile-status
 * Check if institution profile is complete
 * Returns: { hasProfile, isComplete, profile }
 * Access: Private (Institution only)
 */
router.get('/profile-status', authenticate, institutionController.checkProfileStatus);

module.exports = router;
