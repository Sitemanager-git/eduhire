// savedSearchRoutes.js - Fixed version
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

// Import saved search controller (you need to create this)
const {
  saveSearch,
  getSavedSearches,
  deleteSavedSearch,
  executeSearch
} = require('../controllers/savedSearchController');

// @route   POST /api/saved-searches
// @desc    Save a new job search
// @access  Private (Teachers only)
router.post('/', protect, saveSearch);

// @route   GET /api/saved-searches
// @desc    Get all saved searches for current user
// @access  Private (Teachers only)
router.get('/', protect, getSavedSearches);

// @route   DELETE /api/saved-searches/:id
// @desc    Delete a saved search
// @access  Private (Teachers only)
router.delete('/:id', protect, deleteSavedSearch);

// @route   GET /api/saved-searches/:id/execute
// @desc    Execute a saved search
// @access  Private (Teachers only)
router.get('/:id/execute', protect, executeSearch);

module.exports = router;
