// dashboardRoutes.js - Fixed version
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

// Import dashboard controller
const {
  getTeacherStats,
  getInstitutionStats
} = require('../controllers/dashboardController');

// Protect all routes with authentication middleware
router.use(protect);

// @route   GET /api/dashboard/teacher-stats
// @desc    Get teacher dashboard statistics
// @access  Private (Teachers only)
router.get('/teacher-stats', getTeacherStats);

// @route   GET /api/dashboard/institution-stats
// @desc    Get institution dashboard statistics
// @access  Private (Institutions only)
router.get('/institution-stats', getInstitutionStats);

module.exports = router;
