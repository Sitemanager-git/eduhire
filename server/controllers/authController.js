/**
 * Authentication Controller - Production Ready WITH EMAIL NOTIFICATIONS
 * Features: Register, Login, Get Current User, Password Management
 * Version: 2.2 (Updated November 9, 2025 - Day 14 Corrections)
 */

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// EMAIL IMPORTS (conditional - won't break if email service not set up yet)
let sendMail, renderTemplate;
try {
  const emailService = require('../utils/emailService');
  const emailTemplates = require('../utils/emailTemplates');
  sendMail = emailService.sendMail;
  renderTemplate = emailTemplates.renderTemplate;
} catch (err) {
  console.warn('⚠️  Email service not configured - emails will be skipped');
  sendMail = null;
  renderTemplate = null;
}

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
    try {
        const { email, password, userType, profile } = req.body;

        // Validate input
        if (!email || !password || !userType) {
            return res.status(400).json({
                error: 'Email, password, and user type are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long'
            });
        }

        // Validate user type
        if (!['teacher', 'institution'].includes(userType)) {
            return res.status(400).json({
                error: 'User type must be either teacher or institution'
            });
        }

        // Check if user already exists
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({
                error: 'Email already registered',
                message: 'This email is already associated with an account'
            });
        }

        // Create new user instance
        // Password will be hashed automatically by model pre-save hook
        user = new User({
            email: email.toLowerCase(),
            password,
            userType,
            profile: profile || {}
        });

        await user.save();

        console.log(`✓ New ${userType} registered: ${email}`);

        // ***** EMAIL NOTIFICATION (NON-BLOCKING) *****
        if (sendMail && renderTemplate) {
            setImmediate(async () => {
                try {
                    const templateName = userType === 'teacher' ? 'welcome-teacher' : 'welcome-institution';
                    
                    const emailData = {
                        name: profile?.fullName || profile?.name || 'User',
                        institutionName: profile?.institutionName || 'Institution',
                        email: user.email,
                        profileUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/create-${userType}-profile`,
                        dashboardUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard`
                    };

                    await sendMail({
                        to: user.email,
                        subject: 'Welcome to Eduhire!',
                        html: renderTemplate(templateName, emailData),
                        text: `Welcome to Eduhire! Your ${userType} account has been created successfully.`
                    });

                    console.log(`✓ Welcome email sent to ${userType}:`, user.email);
                } catch (emailError) {
                    console.error('⚠️  Failed to send welcome email:', emailError.message);
                    // Don't fail registration if email fails
                }
            });
        }
        // ***** EMAIL NOTIFICATION END *****

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user._id,
                email: user.email,
                userType: user.userType
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                error: 'Email already registered'
            });
        }

        res.status(500).json({
            error: 'Server error during registration',
            message: error.message
        });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Check if account is active
    if (user.status && user.status !== 'active') {
      return res.status(403).json({ 
        error: 'Account suspended',
        message: 'Your account has been suspended. Please contact support.'
      });
    }
    
    // CRITICAL: Use schema method with fallback
    // First try to use the schema method defined in User model
    let isMatch;
    if (typeof user.comparePassword === 'function') {
      // Schema method exists - use it
      isMatch = await user.comparePassword(password);
    } else {
      // Fallback: Schema method doesn't exist, use direct bcrypt
      console.warn('⚠️  Schema comparePassword method not found, using direct bcrypt');
      isMatch = await bcrypt.compare(password, user.password);
    }
    
    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Generate JWT auth token using schema method with fallback
    let token;
    if (typeof user.generateAuthToken === 'function') {
      // Schema method exists - use it
      token = user.generateAuthToken();
    } else {
      // Fallback: Schema method doesn't exist, generate directly
      console.warn('⚠️  Schema generateAuthToken method not found, generating directly');
      const payload = {
        id: user._id,
        email: user.email,
        userType: user.userType
      };
      token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    }
    
    console.log(`✓ ${user.userType} logged in: ${user.email}`);
    
    // Return success response
    res.json({ 
      success: true, 
      token: token, 
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        profileCompleted: user.profile?.completed || false
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Server error during login',
      message: error.message
    });
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getCurrentUser = async (req, res) => {
    try {
        // req.user is set in auth middleware after token verification
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'No user found with this ID'
            });
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                userType: user.userType,
                profile: user.profile,
                status: user.status,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            error: 'Failed to fetch user information',
            message: error.message
        });
    }
};

/**
 * @desc    Logout user (optional - primarily frontend)
 * @route   POST /api/auth/logout
 * @access  Private (or Public)
 */
exports.logout = async (req, res) => {
    try {
        // In JWT auth, logout is mainly handled on frontend by removing token
        // But we can log the event for analytics
        const userId = req.user?.id;
        if (userId) {
            console.log(`✓ User logged out: ${userId}`);
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Logout failed',
            message: error.message
        });
    }
};

/**
 * @desc    Verify JWT token
 * @route   POST /api/auth/verify
 * @access  Private
 */
exports.verifyToken = async (req, res) => {
    try {
        // If middleware passed, token is valid
        res.json({
            success: true,
            valid: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                userType: req.user.userType
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            valid: false,
            error: 'Invalid token'
        });
    }
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
exports.updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                error: 'All password fields are required'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                error: 'New passwords do not match'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'New password must be at least 6 characters'
            });
        }

        // Get user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Verify old password using schema method with fallback
        let isMatch;
        if (typeof user.comparePassword === 'function') {
            isMatch = await user.comparePassword(oldPassword);
        } else {
            isMatch = await bcrypt.compare(oldPassword, user.password);
        }
        
        if (!isMatch) {
            return res.status(401).json({
                error: 'Current password is incorrect'
            });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        console.log(`✓ Password updated for: ${user.email}`);

        // ***** EMAIL NOTIFICATION (NON-BLOCKING) *****
        if (sendMail && renderTemplate) {
            setImmediate(async () => {
                try {
                    const emailData = {
                        name: user.profile?.fullName || user.profile?.institutionName || user.profile?.name || 'User',
                        email: user.email,
                        changedDate: new Date().toLocaleString('en-IN', { 
                            timeZone: 'Asia/Kolkata',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    };

                    await sendMail({
                        to: user.email,
                        subject: 'Password Changed - Eduhire',
                        html: renderTemplate('password-changed', emailData),
                        text: `Your Eduhire password has been changed on ${emailData.changedDate}`
                    });

                    console.log('✓ Password change notification sent to:', user.email);
                } catch (emailError) {
                    console.error('⚠️  Failed to send password change email:', emailError.message);
                }
            });
        }

        res.json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            error: 'Failed to update password',
            message: error.message
        });
    }
};

/**
 * @desc    Refresh JWT token
 * @route   POST /api/auth/refresh
 * @access  Private
 */
exports.refreshToken = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Generate new token using schema method with fallback
        let newToken;
        if (typeof user.generateAuthToken === 'function') {
            newToken = user.generateAuthToken();
        } else {
            const payload = {
                id: user._id,
                email: user.email,
                userType: user.userType
            };
            newToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        }

        res.json({
            success: true,
            token: newToken
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            error: 'Failed to refresh token',
            message: error.message
        });
    }
};

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: 'Email is required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        // Always return success (security best practice)
        // Don't reveal if email exists or not
        res.json({
            success: true,
            message: 'If email exists, reset instructions will be sent'
        });

        if (user) {
            // TODO: Generate reset token and send email
            console.log(`Password reset requested for: ${email}`);
            // Implement reset token generation and email sending here
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            error: 'Failed to process request',
            message: error.message
        });
    }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!resetToken || !newPassword || !confirmPassword) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                error: 'Passwords do not match'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters'
            });
        }

        // TODO: Verify reset token and update password
        // For now, return not implemented

        res.status(501).json({
            error: 'Password reset feature coming soon'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            error: 'Failed to reset password',
            message: error.message
        });
    }
};

module.exports = exports;