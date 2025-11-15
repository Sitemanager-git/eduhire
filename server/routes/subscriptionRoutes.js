/**
 * Subscriptions Routes - Contract-Enforced (API_CONTRACTS.json)
 * Handles: Subscription management, upgrades, cancellations, billing
 * Version: 1.0 (November 14, 2025 - Contract-driven)
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/subscriptions/my-subscription
 * Get current subscription
 * Contract Response: { plan, renewalDate, status }
 */
router.get('/my-subscription', subscriptionController.getCurrent);

/**
 * POST /api/subscriptions/upgrade
 * Upgrade subscription
 * Contract Request: { plan }
 */
router.post('/upgrade', subscriptionController.upgrade);

/**
 * POST /api/subscriptions/cancel
 * Cancel subscription
 */
router.post('/cancel', subscriptionController.cancel);

/**
 * GET /api/subscriptions/billing-history
 * Get billing history
 * Contract Response: [{ _id, invoiceId, amount, date, status }]
 */
router.get('/billing-history', subscriptionController.getBillingHistory);

module.exports = router;
