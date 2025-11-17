/**
 * Payment Routes for Eduhire
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.use(authenticate);

router.post('/create-order', paymentController.createOrder);
router.post('/verify-payment', paymentController.verifyPayment);
router.get('/current-subscription', paymentController.getCurrentSubscription);
router.post('/cancel-subscription', paymentController.cancelSubscription);
router.post('/upgrade-plan', paymentController.upgradePlan);
router.get('/check-posting-limit', paymentController.checkJobPostingLimit);
router.post('/increment-posting-count', paymentController.incrementJobPostingCount);

module.exports = router;
