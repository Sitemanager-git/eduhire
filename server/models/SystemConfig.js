// server/models/SystemConfig.js
const mongoose = require('mongoose');

const SystemConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'maintenance_mode',
      'registration_enabled',
      'job_posting_enabled',
      'payment_gateway_enabled',
      'email_notifications_enabled',
      'auto_approval_jobs',
      'auto_approval_reviews'
    ]
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', SystemConfigSchema);

// ============================================
// server/controllers/adminSystemController.js
// ============================================
const SystemConfig = require('../models/SystemConfig');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const fs = require('fs').promises;
const path = require('path');

/**
 * Get system configuration
 * GET /api/admin/system/config
 */
exports.getConfig = async (req, res) => {
  try {
    console.log('⚙️  [Admin] Getting system config');
    
    const configs = await SystemConfig.find().lean();
    
    // Convert array to object for easier frontend use
    const configMap = {};
    configs.forEach(config => {
      configMap[config.key] = {
        value: config.value,
        description: config.description,
        updatedAt: config.updatedAt
      };
    });
    
    console.log('✓ System config retrieved');
    
    res.json({
      success: true,
      config: configMap
    });
    
  } catch (error) {
    console.error('❌ Get system config error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch system configuration',
      message: error.message
    });
  }
};

/**
 * Update system configuration
 * PUT /api/admin/system/config
 */
exports.updateConfig = async (req, res) => {
  try {
    const { key, value } = req.body;
    const adminId = req.admin._id;
    
    console.log('⚙️  [Admin] Updating system config:', key, '=', value);
    
    if (!key || value === undefined) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'key and value are required'
      });
    }
    
    const validKeys = [
      'maintenance_mode',
      'registration_enabled',
      'job_posting_enabled',
      'payment_gateway_enabled',
      'email_notifications_enabled',
      'auto_approval_jobs',
      'auto_approval_reviews'
    ];
    
    if (!validKeys.includes(key)) {
      return res.status(400).json({
        error: 'Invalid config key',
        message: `Key must be one of: ${validKeys.join(', ')}`
      });
    }
    
    // Update or create config
    const config = await SystemConfig.findOneAndUpdate(
      { key },
      { 
        value, 
        updatedBy: adminId,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log('✓ System config updated:', key);
    
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      config: {
        key: config.key,
        value: config.value,
        updatedAt: config.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Update system config error:', error.message);
    res.status(500).json({
      error: 'Failed to update system configuration',
      message: error.message
    });
  }
};

/**
 * Create database backup
 * POST /api/admin/system/backup
 */
exports.createBackup = async (req, res) => {
  try {
    console.log('💾 [Admin] Creating database backup');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../../backups');
    const backupFile = path.join(backupDir, `backup_${timestamp}.json`);
    
    // Create backups directory if it doesn't exist
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }
    
    // Collect data from all collections
    const users = await User.find().select('-password').lean();
    const jobs = await Job.find().lean();
    const applications = await Application.find().lean();
    const systemConfigs = await SystemConfig.find().lean();
    
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      collections: {
        users: { count: users.length, data: users },
        jobs: { count: jobs.length, data: jobs },
        applications: { count: applications.length, data: applications },
        systemConfigs: { count: systemConfigs.length, data: systemConfigs }
      }
    };
    
    // Write to file
    await fs.writeFile(backupFile, JSON.stringify(backup, null, 2), 'utf8');
    
    console.log('✓ Backup created:', backupFile);
    
    res.json({
      success: true,
      message: 'Database backup created successfully',
      backup: {
        filename: path.basename(backupFile),
        timestamp: backup.timestamp,
        size: (await fs.stat(backupFile)).size,
        collections: {
          users: backup.collections.users.count,
          jobs: backup.collections.jobs.count,
          applications: backup.collections.applications.count,
          systemConfigs: backup.collections.systemConfigs.count
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Create backup error:', error.message);
    res.status(500).json({
      error: 'Failed to create database backup',
      message: error.message
    });
  }
};

// ============================================
// server/controllers/adminReviewController.js
// ============================================
const Review = require('../models/Review');

/**
 * Get all reviews for moderation
 * GET /api/admin/reviews
 */
exports.getReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    console.log('📋 [Admin] Getting reviews for moderation');
    
    const query = {};
    if (status !== 'all') {
      query.status = status;
    }
    
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const reviews = await Review.find(query)
      .populate('reviewerId', 'email userType')
      .populate('reviewedEntityId')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const totalReviews = await Review.countDocuments(query);
    
    console.log(`✓ Found ${reviews.length} reviews`);
    
    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalReviews / limitNum),
        totalReviews,
        limit: limitNum
      }
    });
    
  } catch (error) {
    console.error('❌ Get reviews error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch reviews',
      message: error.message
    });
  }
};

/**
 * Approve review
 * PUT /api/admin/reviews/:id/approve
 */
exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    console.log('✓ Review approved:', id);
    
    res.json({
      success: true,
      message: 'Review approved',
      review
    });
    
  } catch (error) {
    console.error('❌ Approve review error:', error.message);
    res.status(500).json({
      error: 'Failed to approve review',
      message: error.message
    });
  }
};

/**
 * Flag/reject review
 * PUT /api/admin/reviews/:id/flag
 */
exports.flagReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const review = await Review.findByIdAndUpdate(
      id,
      { status: 'flagged' },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    console.log('✓ Review flagged:', id);
    
    res.json({
      success: true,
      message: 'Review flagged',
      review
    });
    
  } catch (error) {
    console.error('❌ Flag review error:', error.message);
    res.status(500).json({
      error: 'Failed to flag review',
      message: error.message
    });
  }
};

// ============================================
// server/controllers/adminPaymentController.js
// ============================================
const Subscription = require('../models/Subscription');

/**
 * Get all payment transactions
 * GET /api/admin/payments
 */
exports.getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    console.log('💳 [Admin] Getting payment transactions');
    
    // This is a simplified version - integrate with actual Razorpay records
    const subscriptions = await Subscription.find()
      .populate('institution_id', 'institutionName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Subscription.countDocuments();
    
    console.log(`✓ Found ${subscriptions.length} payment records`);
    
    res.json({
      success: true,
      payments: subscriptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      }
    });
    
  } catch (error) {
    console.error('❌ Get payments error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch payments',
      message: error.message
    });
  }
};

/**
 * Get payment details
 * GET /api/admin/payments/:id
 */
exports.getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscription = await Subscription.findById(id)
      .populate('institution_id')
      .lean();
    
    if (!subscription) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json({
      success: true,
      payment: subscription
    });
    
  } catch (error) {
    console.error('❌ Get payment details error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch payment details',
      message: error.message
    });
  }
};
