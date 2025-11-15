// bookmarkRoutes.js - Fixed version
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

// Import bookmark controller
const {
  bookmarkJob,
  removeBookmark,
  getMyBookmarks,
  checkBookmark
} = require('../controllers/bookmarkController');

// @route   POST /api/bookmarks
// @desc    Bookmark a job
// @access  Private (Teachers only)
router.post('/', protect, bookmarkJob);

// @route   GET /api/bookmarks/my
// @desc    Get user's bookmarked jobs
// @access  Private (Teachers only)
router.get('/my', protect, getMyBookmarks);

// @route   GET /api/bookmarks/check/:jobId
// @desc    Check if a job is bookmarked
// @access  Private (Teachers only)
router.get('/check/:jobId', protect, checkBookmark);

// @route   DELETE /api/bookmarks/:jobId
// @desc    Remove a bookmark
// @access  Private (Teachers only)
router.delete('/:jobId', protect, removeBookmark);

module.exports = router;
