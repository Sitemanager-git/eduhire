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
    console.log('🔍 [DEBUG] getProfile called');
    console.log('🔍 [DEBUG] req.user:', req.user);
    console.log('🔍 [DEBUG] req.path:', req.path);
    console.log('🔍 [DEBUG] req.method:', req.method);
    
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

    // Get teacher profile by userId (primary lookup)
    let teacherProfile = await TeacherProfile.findOne({ userId: userId });

    // Fallback: Try email lookup for legacy profiles
    if (!teacherProfile && user.email) {
      console.log('📖 [Teachers] Trying email-based lookup for legacy profile');
      teacherProfile = await TeacherProfile.findOne({ email: user.email });
      
      // Update legacy profile to use userId for future lookups
      if (teacherProfile) {
        teacherProfile.userId = userId;
        await teacherProfile.save();
        console.log('✓ Updated legacy profile to use userId');
      }
    }

    if (!teacherProfile) {
      console.warn('⚠️  Teacher profile not found for userId:', userId);
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
    console.error('❌ Stack:', error.stack);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
};

/**
 * @desc    Create Teacher Profile
 * @route   POST /api/teachers/profile
 * @access  Private (Teacher only)
 * @contract Request: { name, subject, experience, qualifications, languages?, about?, certifications? }
 * @contract Response: { name, email, subject, experience, qualifications, profilePicture }
 */
exports.createProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('📝 [Teachers] Creating profile for user:', userId);

    // Verify user is teacher
    const user = await User.findById(userId);
    if (!user || user.userType !== 'teacher') {
      console.warn('⚠️  User is not a teacher');
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only teachers can create their profile'
      });
    }

    // Check if profile already exists (by userId, not email)
    const existingProfile = await TeacherProfile.findOne({ userId: userId });
    if (existingProfile) {
      console.warn('⚠️  Profile already exists for user');
      return res.status(400).json({
        error: 'Profile already exists',
        message: 'Teacher profile already created. Use PUT to update.'
      });
    }

    // Validate required fields
    if (!req.body.fullName && !req.body.name) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'Full name is required'
      });
    }

    if (!req.body.phone) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'Phone number is required'
      });
    }

    // Validate resume is uploaded
    if (!req.files || !req.files.resume) {
      console.warn('⚠️  Resume file not uploaded');
      return res.status(400).json({
        error: 'Missing required file',
        message: 'Resume file is required'
      });
    }

    // Parse location if it's a JSON string
    let locationData = req.body.location;
    if (typeof locationData === 'string') {
      try {
        locationData = JSON.parse(locationData);
      } catch (e) {
        console.error('Failed to parse location:', e);
        return res.status(400).json({
          error: 'Invalid location format',
          message: 'Location must be valid JSON'
        });
      }
    }

    if (!locationData || !locationData.state || !locationData.district || !locationData.pincode) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'Location details (state, district, pincode) are required'
      });
    }

    if (!req.body.education) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'Education details are required'
      });
    }

    // Parse subjects if it's a JSON string
    let subjects = req.body.subjects || [];
    if (typeof subjects === 'string') {
      try {
        subjects = JSON.parse(subjects);
      } catch (e) {
        subjects = subjects.split(',').map(s => s.trim());
      }
    }

    // Get file paths from uploaded files
    const resumePath = req.files.resume ? req.files.resume[0].path : null;
    const photoPath = req.files.photo ? req.files.photo[0].path : null;

    if (resumePath) console.log('📄 Resume uploaded:', resumePath.split('/').pop());
    if (photoPath) console.log('📸 Photo uploaded:', photoPath.split('/').pop());

    // Create new teacher profile with all fields from model
    const profileData = {
      userId: userId,
      fullName: req.body.fullName || req.body.name,
      email: user.email,
      phone: req.body.phone,
      location: {
        state: locationData.state,
        district: locationData.district,
        pincode: locationData.pincode
      },
      education: req.body.education,
      experience: req.body.experience || 0,
      subjects: subjects,
      otherSubjects: req.body.otherSubjects || '',
      resume: resumePath,
      photo: photoPath,
      profileCompleted: true
    };

    const teacherProfile = new TeacherProfile(profileData);
    await teacherProfile.save();

    // Also update user record with profile complete flag
    user.profileComplete = true;
    await user.save();

    console.log('✅ Teacher profile created successfully');

    // Return response with contract fields
    const response = {
      name: teacherProfile.fullName,
      email: teacherProfile.email,
      subject: teacherProfile.subjects.join(', ') || 'Not specified',
      experience: teacherProfile.experience,
      qualifications: teacherProfile.education,
      profilePicture: teacherProfile.photo || null
    };

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      profile: response
    });
  } catch (error) {
    console.error('❌ Error in createProfile:', error.message);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      error: 'Failed to create profile',
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

    // Get existing teacher profile by userId (primary lookup)
    let teacherProfile = await TeacherProfile.findOne({ userId: userId });

    // Fallback: Try email lookup for legacy profiles
    if (!teacherProfile && user.email) {
      console.log('📖 [Teachers] Trying email-based lookup for legacy profile');
      teacherProfile = await TeacherProfile.findOne({ email: user.email });
      
      // Update legacy profile to use userId for future lookups
      if (teacherProfile) {
        teacherProfile.userId = userId;
        console.log('✓ Updated legacy profile to use userId');
      }
    }

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

    // Get teacher profile by userId (primary lookup)
    let teacherProfile = await TeacherProfile.findOne({ userId: userId });

    // Fallback: Try email lookup for legacy profiles
    if (!teacherProfile && user.email) {
      console.log('📖 [Teachers] Trying email-based lookup for legacy profile');
      teacherProfile = await TeacherProfile.findOne({ email: user.email });
      
      // Update legacy profile to use userId for future lookups
      if (teacherProfile) {
        teacherProfile.userId = userId;
        console.log('✓ Updated legacy profile to use userId');
      }
    }

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
