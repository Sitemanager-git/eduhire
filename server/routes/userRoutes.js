/**
 * Settings Routes - Contract-Enforced (API_CONTRACTS.json)
 * Handles: User settings, password changes, data export, account deletion
 * Version: 1.0 (November 14, 2025 - Contract-driven)
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/user/settings
 * Get user settings
 * Contract Response: { notifications: {...}, privacy: {...} }
 */
router.get('/settings', settingsController.getSettings);

/**
 * PUT /api/user/settings
 * Update user settings
 * Contract Request: { notifications: {...}, privacy: {...} }
 */
router.put('/settings', settingsController.updateSettings);

/**
 * POST /api/user/change-password
 * Change password
 * Contract Request: { currentPassword, newPassword, confirmPassword }
 */
router.post('/change-password', settingsController.changePassword);

/**
 * GET /api/user/export-data
 * Export user data
 */
router.get('/export-data', settingsController.exportData);

/**
 * DELETE /api/user/account
 * Delete user account
 */
router.delete('/account', settingsController.deleteAccount);

module.exports = router;
