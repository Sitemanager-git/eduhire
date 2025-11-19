// server/controllers/adminAuthController.js
const AdminUser = require('../models/AdminUser');
const jwt = require('jsonwebtoken');

/**
 * Admin Login
 * POST /api/admin/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔐 [Admin] Login attempt:', username);
    
    if (!username || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Username and password are required'
      });
    }
    
    // Find admin by username or email
    const admin = await AdminUser.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    });
    
    if (!admin) {
      console.warn('⚠️  Admin not found:', username);
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }
    
    if (!admin.isActive) {
      console.warn('⚠️  Inactive admin login attempt:', username);
      return res.status(403).json({
        error: 'Account disabled',
        message: 'Your admin account has been deactivated'
      });
    }
    
    // Verify password
    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      console.warn('⚠️  Invalid password for admin:', username);
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }
    
    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        userType: 'admin',
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    
    console.log('✓ Admin logged in:', username);
    
    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
    
  } catch (error) {
    console.error('❌ Admin login error:', error.message);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
};

/**
 * Get current admin info
 * GET /api/admin/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      admin: {
        id: req.admin._id,
        username: req.admin.username,
        email: req.admin.email,
        role: req.admin.role,
        permissions: req.admin.permissions,
        lastLogin: req.admin.lastLogin
      }
    });
  } catch (error) {
    console.error('❌ Get admin me error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch admin info',
      message: error.message
    });
  }
};

/**
 * Change admin password
 * POST /api/admin/auth/change-password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin._id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'Current and new passwords are required'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Weak password',
        message: 'New password must be at least 8 characters'
      });
    }
    
    const admin = await AdminUser.findById(adminId);
    
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect'
      });
    }
    
    admin.password = newPassword;
    await admin.save();
    
    console.log('✓ Admin password changed:', admin.username);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('❌ Change password error:', error.message);
    res.status(500).json({
      error: 'Failed to change password',
      message: error.message
    });
  }
};

/**
 * Logout (mainly frontend clears token)
 * POST /api/admin/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    console.log('✓ Admin logged out:', req.admin.username);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Logout failed',
      message: error.message
    });
  }
};
