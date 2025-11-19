// server/controllers/adminSystemController.js
// FIXED VERSION

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
    
    // Get all configs
    const configs = await SystemConfig.find().lean();
    
    console.log(`✓ Found ${configs.length} config entries`);
    
    // If no configs exist, create defaults
    if (configs.length === 0) {
      console.log('📝 Creating default system configurations...');
      
      const defaults = [
        {
          key: 'maintenance_mode',
          value: false,
          description: 'Put site in maintenance mode'
        },
        {
          key: 'registration_enabled',
          value: true,
          description: 'Allow new user registrations'
        },
        {
          key: 'job_posting_enabled',
          value: true,
          description: 'Allow institutions to post jobs'
        },
        {
          key: 'payment_gateway_enabled',
          value: true,
          description: 'Enable payment processing'
        },
        {
          key: 'email_notifications_enabled',
          value: true,
          description: 'Send email notifications'
        },
        {
          key: 'auto_approval_jobs',
          value: false,
          description: 'Auto-approve job postings without moderation'
        },
        {
          key: 'auto_approval_reviews',
          value: true,
          description: 'Auto-approve reviews without moderation'
        }
      ];
      
      await SystemConfig.insertMany(defaults);
      
      const newConfigs = await SystemConfig.find().lean();
      
      // Convert to map
      const configMap = {};
      newConfigs.forEach(config => {
        configMap[config.key] = {
          value: config.value,
          description: config.description,
          updatedAt: config.updatedAt
        };
      });
      
      console.log('✓ Default configs created');
      
      return res.json({
        success: true,
        config: configMap
      });
    }
    
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
      success: false,
      error: 'Failed to fetch config',
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
    
    const timestamp = Date.now();
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../../backups');
    const backupFile = path.join(backupDir, `backup_${timestamp}.json`);
    
    // Create backups directory if it doesn't exist
    try {
      await fs.access(backupDir);
      console.log('✓ Backups directory exists');
    } catch {
      console.log('📁 Creating backups directory...');
      await fs.mkdir(backupDir, { recursive: true });
      console.log('✓ Backups directory created');
    }
    
    console.log('📊 Collecting data from database...');
    
    // Collect data from all collections
    const users = await User.find().select('-password').lean();
    const jobs = await Job.find().lean();
    const applications = await Application.find().lean();
    const systemConfigs = await SystemConfig.find().lean();
    
    const backup = {
      id: `backup_${timestamp}`,
      timestamp: new Date().toISOString(),
      version: '1.0',
      collections: {
        users: { count: users.length, data: users },
        jobs: { count: jobs.length, data: jobs },
        applications: { count: applications.length, data: applications },
        systemConfigs: { count: systemConfigs.length, data: systemConfigs }
      }
    };
    
    console.log('💾 Writing backup to file...');
    
    // Write to file
    await fs.writeFile(backupFile, JSON.stringify(backup, null, 2), 'utf8');
    
    const stats = await fs.stat(backupFile);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('✓ Backup created:', backupFile);
    console.log('  Size:', sizeInMB, 'MB');
    console.log('  Users:', backup.collections.users.count);
    console.log('  Jobs:', backup.collections.jobs.count);
    console.log('  Applications:', backup.collections.applications.count);
    
    res.json({
      success: true,
      message: 'Database backup created successfully',
      backup: {
        id: `backup_${timestamp}`,
        timestamp: backup.timestamp,
        status: 'completed',
        size: `${sizeInMB} MB`,
        filename: path.basename(backupFile),
        path: backupFile,
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
      message: error.message,
      details: error.stack
    });
  }
};

module.exports = exports;