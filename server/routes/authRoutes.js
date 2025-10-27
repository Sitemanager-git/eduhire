/**
 * Authentication Routes - Updated & Production Ready
 * Features: Register, Login, Get Current User, Logout
 * Middleware: Auth verification on protected routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// CORRECT IMPORT: Named export from auth middleware
const { authenticate } = require('../middleware/auth');

// ================================================
// PUBLIC ROUTES (No auth required)
// ================================================

/**
 * POST /api/auth/register
 * Register a new user (teacher or institution)
 * Body: { email, password, userType }
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Login user and return JWT token
 * Body: { email, password }
 * Returns: { token, user: { id, email, userType } }
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/logout
 * Logout current user (optional - mostly frontend clearing token)
 */
router.post('/logout', authController.logout);

// ================================================
// PROTECTED ROUTES (Authentication required)
// ================================================

/**
 * GET /api/auth/me
 * Get current logged-in user information
 * Requires: Valid JWT token
 * Returns: { user: { id, email, userType, profileCompleted } }
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * POST /api/auth/verify
 * Verify if token is valid
 * Requires: Valid JWT token
 * Returns: { valid: true/false }
 */
router.post('/verify', authenticate, authController.verifyToken);

/**
 * PUT /api/auth/update-password
 * Update user password (change password feature)
 * Requires: Valid JWT token
 * Body: { oldPassword, newPassword, confirmPassword }
 */
router.put('/update-password', authenticate, authController.updatePassword);

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 * Requires: Valid JWT token
 * Returns: { token: newToken }
 */
router.post('/refresh', authenticate, authController.refreshToken);

// ================================================
// PASSWORD RESET ROUTES (Optional)
// ================================================

/**
 * POST /api/auth/forgot-password
 * Request password reset (sends email with reset link)
 * Body: { email }
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * POST /api/auth/reset-password
 * Reset password using token from email
 * Body: { resetToken, newPassword, confirmPassword }
 */
router.post('/reset-password', authController.resetPassword);

// ================================================
// ERROR HANDLING
// ================================================

// 404 - Route not found
router.use((req, res) => {
    res.status(404).json({
        error: 'Auth route not found',
        message: `No route found for ${req.method} ${req.path}`
    });
});

module.exports = router;
