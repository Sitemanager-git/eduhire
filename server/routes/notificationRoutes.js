// notificationRoutes.js - Contract-Enforced (API_CONTRACTS.json)
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Import notification controller with contract-enforced methods
const notificationController = require('../controllers/notificationController');

// Protect all routes with authentication middleware
router.use(protect);

/**
 * GET /api/notifications
 * Contract: Response: [{ _id, userId, message, type, read, createdAt }]
 */
router.get('/', notificationController.getNotifications);

/**
 * GET /api/notifications/unread-count
 * Contract: Response: { count }
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * PATCH /api/notifications/:id/read
 * Contract: Response: { _id, read: true }
 */
router.patch('/:id/read', notificationController.markAsReadContract);

/**
 * DELETE /api/notifications/:id
 * Contract: Response: { message }
 */
router.delete('/:id', notificationController.deleteNotificationContract);

// Legacy endpoints (kept for backward compatibility)
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

module.exports = router;
