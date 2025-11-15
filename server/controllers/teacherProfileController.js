/**
 * Teacher Profile Controller - Contract-Enforced (API_CONTRACTS.json)
 * Ensures exact field names match frontend expectations
 * Version: 1.0 (November 14, 2025 - Contract-driven)
 */

const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const Subscription = require('../models/Subscription');

/**
 * @desc    Get Teacher Profile
 * @route   GET /api/teachers/profile
 * @access  Private (Teacher only)
 * @contract Response: { name, email, subject, experience, qualifications, profilePicture, subscription: { plan, renewalDate } }
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('📖 [Teachers] Getting profile for user:', userId);

    // Verify user is teacher
    const user = await User.findById(userId);
    if (!user || user.userType !== 'teacher') {
      console.warn('⚠️  User is not a teacher');
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only teachers can access this endpoint'
      });
    }

    // Get teacher profile
    const teacherProfile = await TeacherProfile.findOne({ userId: userId });

    if (!teacherProfile) {
      console.warn('⚠️  Teacher profile not found');
      return res.status(404).json({
        error: 'Profile not found',
        message: 'Teacher profile does not exist yet'
      });
    }

    // Get subscription info
    const subscription = await Subscription.findOne({ userId: userId });

    // ========== CONTRACT MAPPING ==========
    // Map internal field names to contract field names
    const response = {
      name: teacherProfile.fullName || user.name,
      email: teacherProfile.email || user.email,
      subject: teacherProfile.subjects?.length > 0 
        ? teacherProfile.subjects[0] 
        : teacherProfile.otherSubjects || '',
      experience: teacherProfile.experience || 0,
      qualifications: teacherProfile.education || '',
      profilePicture: teacherProfile.photo || null,
      subscription: {
        plan: subscription?.plan || 'Free',
        renewalDate: subscription?.renewalDate || null
      }
    };

    console.log('✓ Teacher profile retrieved successfully');
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
 * @desc    Update Teacher Profile
 * @route   PUT /api/teachers/profile
 * @access  Private (Teacher only)
 * @contract Request: { name?, subject?, experience?, qualifications? }
 * @contract Response: { name, email, subject, experience, qualifications, profilePicture }
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('✏️ [Teachers] Updating profile for user:', userId);
    console.log('📋 Received data:', {
      name: req.body.name,
      subject: req.body.subject,
      experience: req.body.experience,
      qualifications: req.body.qualifications
    });

    // Verify user is teacher
    const user = await User.findById(userId);
    if (!user || user.userType !== 'teacher') {
      console.warn('⚠️  User is not a teacher');
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only teachers can update their profile'
      });
    }

    // Get existing teacher profile or create new one
    let teacherProfile = await TeacherProfile.findOne({ userId: userId });

    if (!teacherProfile) {
      console.log('📝 Creating new teacher profile...');
      teacherProfile = new TeacherProfile({
        userId: userId,
        fullName: req.body.name || user.name,
        email: user.email,
        phone: req.body.phone || '0000000000'
      });
    }

    // ========== UPDATE FIELDS ==========
    // Map contract field names to internal field names
    if (req.body.name) {
      teacherProfile.fullName = req.body.name.trim();
    }

    if (req.body.subject) {
      teacherProfile.subjects = [req.body.subject];
    }

    if (req.body.experience !== undefined) {
      teacherProfile.experience = parseInt(req.body.experience) || 0;
    }

    if (req.body.qualifications) {
      teacherProfile.education = req.body.qualifications.trim();
    }

    teacherProfile.profileCompleted = true;
    await teacherProfile.save();

    console.log('✓ Teacher profile updated successfully');

    // ========== CONTRACT RESPONSE ==========
    const response = {
      name: teacherProfile.fullName,
      email: teacherProfile.email,
      subject: teacherProfile.subjects?.[0] || teacherProfile.otherSubjects || '',
      experience: teacherProfile.experience,
      qualifications: teacherProfile.education,
      profilePicture: teacherProfile.photo || null
    };

    console.log('📊 Response:', response);

    res.json(response);

  } catch (error) {
    console.error('❌ Error in updateProfile:', error.message);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(422).json({
        error: 'Validation error',
        message: 'Please check your input',
        details: messages
      });
    }

    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
};

/**
 * @desc    Upload Teacher Profile Picture
 * @route   POST /api/teachers/profile-picture
 * @access  Private (Teacher only)
 * @contract Response: { url }
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('📤 [Teachers] Uploading profile picture for user:', userId);

    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please upload a profile picture'
      });
    }

    // Verify user is teacher
    const user = await User.findById(userId);
    if (!user || user.userType !== 'teacher') {
      console.warn('⚠️  User is not a teacher');
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only teachers can upload profile pictures'
      });
    }

    // Get teacher profile
    let teacherProfile = await TeacherProfile.findOne({ userId: userId });

    if (!teacherProfile) {
      teacherProfile = new TeacherProfile({
        userId: userId,
        fullName: user.name,
        email: user.email,
        phone: '0000000000'
      });
    }

    // Update photo URL (from upload middleware - assume Cloudinary)
    teacherProfile.photo = req.file.path || req.file.url;
    await teacherProfile.save();

    console.log('✓ Profile picture uploaded successfully');

    res.json({
      url: teacherProfile.photo
    });

  } catch (error) {
    console.error('❌ Error in uploadProfilePicture:', error.message);
    res.status(500).json({
      error: 'Failed to upload profile picture',
      message: error.message
    });
  }
};

module.exports = exports;
