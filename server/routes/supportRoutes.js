/**
 * Support Routes - Contract-Enforced (API_CONTRACTS.json)
 * Handles: Support tickets and FAQ
 * Version: 1.0 (November 14, 2025 - Contract-driven)
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const supportController = require('../controllers/supportController');

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/support/create-ticket
 * Create support ticket
 * Contract Request: { subject, description, category, priority, contactMethod }
 */
router.post('/create-ticket', supportController.createTicket);

/**
 * GET /api/faq
 * Get FAQ list
 * Contract Response: [{ _id, question, answer, category }]
 */
router.get('/faq', supportController.getFAQ);

module.exports = router;
