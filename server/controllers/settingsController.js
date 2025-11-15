/**
 * Settings Controller - Contract-Enforced (API_CONTRACTS.json)
 * Manages user settings, privacy, password changes
 * Version: 1.0 (November 14, 2025 - Contract-driven)
 */

const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Default settings structure
const DEFAULT_SETTINGS = {
  notifications: {
    email: true,
    jobAlerts: true,
    applicationUpdates: true,
    reviews: true,
    messages: true
  },
  privacy: {
    profilePublic: true,
    showReviews: true,
    searchEngineIndex: false
  }
};

/**
 * @desc    Get user settings
 * @route   GET /api/user/settings
 * @access  Private
 * @contract Response: { notifications: {...}, privacy: {...} }
 */
exports.getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📖 [Settings] Getting settings for user:', userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account does not exist'
      });
    }

    // Get settings or use defaults
    const settings = user.settings || DEFAULT_SETTINGS;

    console.log('✓ Settings retrieved');
    res.json(settings);

  } catch (error) {
    console.error('❌ Error in getSettings:', error.message);
    res.status(500).json({
      error: 'Failed to fetch settings',
      message: error.message
    });
  }
};

/**
 * @desc    Update user settings
 * @route   PUT /api/user/settings
 * @access  Private
 * @contract Request: { notifications: {...}, privacy: {...} }
 * @contract Response: { notifications, privacy }
 */
exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('✏️ [Settings] Updating settings for user:', userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account does not exist'
      });
    }

    // Update settings with provided data, keeping defaults for missing keys
    const settings = user.settings || DEFAULT_SETTINGS;

    if (req.body.notifications) {
      settings.notifications = { ...settings.notifications, ...req.body.notifications };
    }

    if (req.body.privacy) {
      settings.privacy = { ...settings.privacy, ...req.body.privacy };
    }

    user.settings = settings;
    await user.save();

    console.log('✓ Settings updated');
    res.json(settings);

  } catch (error) {
    console.error('❌ Error in updateSettings:', error.message);
    res.status(500).json({
      error: 'Failed to update settings',
      message: error.message
    });
  }
};

/**
 * @desc    Change user password
 * @route   POST /api/user/change-password
 * @access  Private
 * @contract Request: { currentPassword, newPassword, confirmPassword }
 * @contract Response: { message }
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    console.log('🔐 [Settings] Changing password for user:', userId);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'currentPassword, newPassword, and confirmPassword are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'New password must be at least 8 characters long'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: 'Password mismatch',
        message: 'newPassword and confirmPassword do not match'
      });
    }

    // Get user with password field
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account does not exist'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    console.log('✓ Password changed successfully');
    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('❌ Error in changePassword:', error.message);
    res.status(500).json({
      error: 'Failed to change password',
      message: error.message
    });
  }
};

/**
 * @desc    Export user data
 * @route   GET /api/user/export-data
 * @access  Private
 * @contract Response: JSON file download
 */
exports.exportData = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📤 [Settings] Exporting data for user:', userId);

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account does not exist'
      });
    }

    const exportData = {
      user: user.toObject(),
      exportedAt: new Date().toISOString()
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}.json"`);
    res.send(JSON.stringify(exportData, null, 2));

    console.log('✓ Data exported');

  } catch (error) {
    console.error('❌ Error in exportData:', error.message);
    res.status(500).json({
      error: 'Failed to export data',
      message: error.message
    });
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/user/account
 * @access  Private
 * @contract Response: { message }
 */
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🗑️ [Settings] Deleting account for user:', userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account does not exist'
      });
    }

    // Delete user and related data
    await User.findByIdAndDelete(userId);

    console.log('✓ Account deleted successfully');
    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('❌ Error in deleteAccount:', error.message);
    res.status(500).json({
      error: 'Failed to delete account',
      message: error.message
    });
  }
};

module.exports = exports;
