const reviewController = require('../controllers/reviewController');
console.log('Review Controller:', reviewController);
const express = require('express');
const router = express.Router();
const {
    submitReview,
    getReviews,
    getMyReviews,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication except GET reviews
router.post('/', authenticate, submitReview);
router.get('/my-reviews', authenticate, getMyReviews);
router.get('/:entityType/:entityId', getReviews);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

module.exports = router;
