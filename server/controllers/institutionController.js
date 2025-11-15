/**
 * Institution Controller - Production Ready
 * Handles institution profile CRUD operations
 * Version: 2.0 (November 11, 2025 - Cleaned & Fixed)
 */

const User = require('../models/User');
const InstitutionProfile = require('../models/InstitutionProfile');

/**
 * @desc    Create or Update Institution Profile (Unified)
 * @route   POST/PUT /api/institutions/profile
 * @access  Private (Institution only)
 * @param   POST = Create new OR update existing
 * @param   PUT = Update existing OR create if not exists
 */
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const method = req.method; // POST or PUT

    console.log(`\n📝 ${method} - Processing institution profile for user:`, userId);
    console.log('📋 Received data:', {
      institutionName: req.body.institutionName,
      type: req.body.type,
      state: req.body.state,
      district: req.body.district
    });

    // ========== VALIDATION ==========

    // Verify user exists and is institution
    const user = await User.findById(userId);
    if (!user) {
      console.warn('⚠️  User not found');
      return res.status(404).json({
        error: 'User not found',
        message: 'Your user account does not exist'
      });
    }

    if (user.userType !== 'institution') {
      console.warn('⚠️  User is not an institution');
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only institutions can create/update profiles'
      });
    }

    // ========== PREPARE DATA ==========

    const profileData = {
      userId: userId,
      institutionName: req.body.institutionName?.trim(),
      type: req.body.type || req.body.schoolType,
      schoolType: req.body.schoolType || 'private',
      state: req.body.state,
      district: req.body.district,
      address: req.body.address?.trim(),
      pincode: req.body.pincode,
      
      // Location
      location: req.body.location || {
        state: req.body.state,
        district: req.body.district,
        pincode: req.body.pincode
      },
      
      // Contact
      email: req.body.email || user.email,
      phone: req.body.phone || '',
      hrEmail: req.body.hrEmail || '',
      hrPhone: req.body.hrPhone || '',
      
      // Educational details
      curriculumOffered: req.body.curriculumOffered || [],
      otherCurriculum: req.body.otherCurriculum || '',
      sectionsOffered: req.body.sectionsOffered || [],
      numberOfCampuses: parseInt(req.body.numberOfCampuses) || 1,
      
      // Statistics
      numberOfStudents: req.body.numberOfStudents,
      numberOfTeachers: req.body.numberOfTeachers,
      avgClassSize: req.body.avgClassSize,
      
      // Infrastructure
      website: req.body.website || '',
      isComputerized: req.body.isComputerized === true || false,
      computerLabs: parseInt(req.body.computerLabs) || 0,
      scienceLabs: parseInt(req.body.scienceLabs) || 0,
      libraries: parseInt(req.body.libraries) || 0,
      sportsField: req.body.sportsField === true || false,
      
      // Additional
      founded: req.body.founded,
      accreditations: req.body.accreditations || [],
      achievements: req.body.achievements || '',
      description: req.body.description || '',
      jobDescription: req.body.jobDescription || '',
      
      // Metadata
      profileCompleted: true,
      updatedAt: new Date()
    };


    // ========== VALIDATE REQUIRED FIELDS ==========

    const checkNestedField = (obj, path) => {
      const keys = path.split('.');
      let value = obj;
      for (let key of keys) {
        value = value?.[key];
      }
      return value;
    };

    const requiredFields = {
      'institutionName': 'institutionName',
      'type': 'type',
      'schoolType': 'schoolType',
      'address': 'address',
      'email': 'email',
      'phone': 'phone',
      'location.state': 'location.state',
      'location.district': 'location.district',
      'location.pincode': 'location.pincode'
    };

    const missingFields = Object.keys(requiredFields).filter(field => {
      const value = checkNestedField(profileData, field);
      return !value;
    });

    if (missingFields.length > 0) {
      console.warn('⚠️  Missing required fields:', missingFields);
      return res.status(422).json({
        error: 'Incomplete profile',
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields: missingFields
      });
    }

    // ========== CREATE OR UPDATE ==========

    let institutionProfile = await InstitutionProfile.findOne({ userId: userId });
    let isUpdate = false;

    if (institutionProfile) {
      // UPDATE existing
      console.log('🔄 Updating existing profile...');
      Object.assign(institutionProfile, profileData);
      await institutionProfile.save();
      isUpdate = true;
      console.log('✓ Profile updated successfully');
    } else {
      // CREATE new
      console.log('✨ Creating new profile...');
      institutionProfile = new InstitutionProfile(profileData);
      await institutionProfile.save();
      console.log('✓ Profile created successfully');
    }

    // ========== UPDATE USER STATUS ==========

    user.profile = user.profile || {};
    user.profile.completed = true;
    user.profile.completedAt = new Date();
    await user.save();

    console.log(`✓ User profile completion status updated\n`);

    // ========== RESPONSE ==========

    const message = isUpdate 
      ? 'Profile updated successfully' 
      : 'Profile created successfully';

    res.status(200).json({
      success: true,
      message: message,
      action: isUpdate ? 'UPDATE' : 'CREATE',
      profile: {
        id: institutionProfile._id,
        institutionName: institutionProfile.institutionName,
        type: institutionProfile.type,
        state: institutionProfile.state,
        district: institutionProfile.district,
        email: institutionProfile.email
      }
    });

  } catch (error) {
    console.error('❌ Error in createOrUpdateProfile:', error.message);
    
    // MongoDB Validation Error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(422).json({
        error: 'Validation error',
        message: 'Please check your input',
        details: messages
      });
    }

    // Duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate entry',
        message: 'An institution profile already exists for this user'
      });
    }

    res.status(500).json({
      error: 'Failed to save profile',
      message: error.message
    });
  }
};

/**
 * @desc    Get Institution Profile
 * @route   GET /api/institutions/profile
 * @access  Private (Institution only)
 * @contract Response: { name, email, schoolName, location, about, profilePicture, subscription: { plan, renewalDate } }
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('📖 [Institutions] Getting profile for user:', userId);

    // Verify user is institution
    const user = await User.findById(userId);
    if (!user || user.userType !== 'institution') {
      console.warn('⚠️  User is not an institution');
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only institutions can access this endpoint'
      });
    }

    // Get profile
    const institutionProfile = await InstitutionProfile.findOne({ userId: userId });

    if (!institutionProfile) {
      console.warn('⚠️  Institution profile not found');
      return res.status(404).json({
        error: 'Profile not found',
        message: 'Institution profile does not exist yet'
      });
    }

    // Get subscription info
    const Subscription = require('../models/Subscription');
    const subscription = await Subscription.findOne({ userId: userId });

    console.log('✓ Profile retrieved successfully');

    // ========== CONTRACT MAPPING ==========
    // Map internal field names to contract field names
    const response = {
      name: institutionProfile.institutionName || user.name,
      email: institutionProfile.email || user.email,
      schoolName: institutionProfile.institutionName || '',
      location: institutionProfile.location?.district + ', ' + institutionProfile.location?.state || '',
      about: institutionProfile.description || institutionProfile.achievements || '',
      profilePicture: institutionProfile.logo || null,
      subscription: {
        plan: subscription?.plan || 'Free',
        renewalDate: subscription?.renewalDate || null
      }
    };

    console.log('📊 Response:', response);

    res.json(response);

  } catch (error) {
    console.error('❌ Error in getProfile:', error.message);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
};

/**
 * @desc    Check Institution Profile Status
 * @route   GET /api/institutions/profile-status
 * @access  Private (Institution only)
 */
exports.checkProfileStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('🔍 Checking profile status for user:', userId);

    // Verify user is institution
    const user = await User.findById(userId);
    if (!user || user.userType !== 'institution') {
      console.warn('⚠️  User is not an institution');
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only institutions can access this endpoint'
      });
    }

    // Check institution profile existence
    const institutionProfile = await InstitutionProfile.findOne({ userId: userId });

    if (!institutionProfile) {
      console.log('ℹ️  No profile found for institution');
      return res.json({
        success: true,
        hasProfile: false,
        isComplete: false,
        message: 'Please create your institution profile'
      });
    }

    // Check if profile is complete - IMPROVED LOGIC
    const missingFields = [];
    if (!institutionProfile.institutionName) missingFields.push('institutionName');
    if (!institutionProfile.type) missingFields.push('type');
    if (!institutionProfile.schoolType) missingFields.push('schoolType');
    if (!institutionProfile.address) missingFields.push('address');
    if (!institutionProfile.email) missingFields.push('email');
    if (!institutionProfile.phone) missingFields.push('phone');
    if (!institutionProfile.location?.state) missingFields.push('location.state');
    if (!institutionProfile.location?.district) missingFields.push('location.district');
    if (!institutionProfile.location?.pincode) missingFields.push('location.pincode');
    if (!Array.isArray(institutionProfile.curriculumOffered) || institutionProfile.curriculumOffered.length === 0) missingFields.push('curriculumOffered');
    if (!Array.isArray(institutionProfile.sectionsOffered) || institutionProfile.sectionsOffered.length === 0) missingFields.push('sectionsOffered');

    const isComplete = missingFields.length === 0;

    console.log(`✓ Profile status: hasProfile=true, isComplete=${isComplete}`);
    if (missingFields.length > 0) {
      console.log('⚠️  Missing fields:', missingFields);
    }
    console.log('📊 Profile data:', {
      institutionName: institutionProfile.institutionName,
      type: institutionProfile.type,
      schoolType: institutionProfile.schoolType,
      email: institutionProfile.email,
      phone: institutionProfile.phone,
      address: institutionProfile.address,
      location: institutionProfile.location,
      curriculumOffered: institutionProfile.curriculumOffered,
      sectionsOffered: institutionProfile.sectionsOffered
    });
    console.log('');

    return res.json({
      success: true,
      hasProfile: true,
      isComplete: isComplete,  // ← NOW RETURNS TRUE when all fields are complete!
      missingFields: missingFields,  // Include missing fields for debugging
      profile: {
        id: institutionProfile._id,
        institutionName: institutionProfile.institutionName,
        type: institutionProfile.type,
        state: institutionProfile.location?.state,
        district: institutionProfile.location?.district,
        email: institutionProfile.email
      }
    });

  } catch (error) {
    console.error('❌ Error in checkProfileStatus:', error.message);
    res.status(500).json({
      error: 'Failed to check profile status',
      message: error.message
    });
  }
};


module.exports = exports;
