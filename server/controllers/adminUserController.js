// server/controllers/adminUserController.js
const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const InstitutionProfile = require('../models/InstitutionProfile');
const { sendMail, renderTemplate } = require('../utils/emailService');

/**
 * Get all users with search and filters
 * GET /api/admin/users
 */
exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      userType = 'all',
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    console.log('📋 [Admin] Getting users list');
    
    // Build query
    const query = {};
    
    if (userType !== 'all') {
      query.userType = userType;
    }
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (search && search.trim()) {
      query.email = { $regex: search.trim(), $options: 'i' };
    }
    
    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    
    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limitNum);
    
    // Get profile info for each user
    const usersWithProfiles = await Promise.all(users.map(async (user) => {
      let profileInfo = null;
      
      if (user.userType === 'teacher') {
        const profile = await TeacherProfile.findOne({ userId: user._id })
          .select('fullName phone subjects experience')
          .lean();
        profileInfo = profile;
      } else if (user.userType === 'institution') {
        const profile = await InstitutionProfile.findOne({ userId: user._id })
          .select('institutionName type phone')
          .lean();
        profileInfo = profile;
      }
      
      return {
        ...user,
        profile: profileInfo
      };
    }));
    
    console.log(`✓ Found ${users.length} users`);
    
    res.json({
      success: true,
      users: usersWithProfiles,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalUsers,
        limit: limitNum
      }
    });
    
  } catch (error) {
    console.error('❌ Get users error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
};

/**
 * Get single user details
 * GET /api/admin/users/:id
 */
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('📋 [Admin] Getting user details:', id);
    
    const user = await User.findById(id).select('-password').lean();
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // Get profile
    let profile = null;
    if (user.userType === 'teacher') {
      profile = await TeacherProfile.findOne({ userId: user._id }).lean();
    } else if (user.userType === 'institution') {
      profile = await InstitutionProfile.findOne({ userId: user._id }).lean();
    }
    
    // Get activity stats
    const Job = require('../models/Job');
    const Application = require('../models/Application');
    
    let stats = {};
    if (user.userType === 'teacher') {
      const teacherProfile = await TeacherProfile.findOne({ userId: user._id });
      if (teacherProfile) {
        stats.totalApplications = await Application.countDocuments({ 
          teacher_id: teacherProfile._id 
        });
        stats.pendingApplications = await Application.countDocuments({ 
          teacher_id: teacherProfile._id,
          status: 'pending'
        });
      }
    } else if (user.userType === 'institution') {
      const institutionProfile = await InstitutionProfile.findOne({ userId: user._id });
      if (institutionProfile) {
        stats.totalJobs = await Job.countDocuments({ 
          institutionid: institutionProfile._id 
        });
        stats.activeJobs = await Job.countDocuments({ 
          institutionid: institutionProfile._id,
          status: 'active'
        });
        stats.totalApplicationsReceived = await Application.countDocuments({ 
          institution_id: institutionProfile._id 
        });
      }
    }
    
    console.log('✓ User details retrieved');
    
    res.json({
      success: true,
      user: {
        ...user,
        profile,
        stats
      }
    });
    
  } catch (error) {
    console.error('❌ Get user details error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch user details',
      message: error.message
    });
  }
};

/**
 * Suspend/Activate user
 * PUT /api/admin/users/:id/suspend
 */
exports.suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'suspend' or 'activate'
    
    console.log(`🔒 [Admin] ${action} user:`, id);
    
    if (!['suspend', 'activate'].includes(action)) {
      return res.status(400).json({
        error: 'Invalid action',
        message: 'Action must be suspend or activate'
      });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    const newStatus = action === 'suspend' ? 'suspended' : 'active';
    user.status = newStatus;
    await user.save();
    
    console.log(`✓ User ${action}ed:`, user.email);
    
    // Send email notification
    if (sendMail && renderTemplate) {
      setImmediate(async () => {
        try {
          const emailData = {
            name: user.profile?.fullName || user.profile?.institutionName || 'User',
            email: user.email,
            action: action,
            reason: reason || 'No reason provided',
            supportEmail: 'support@eduhire.com'
          };
          
          const subject = action === 'suspend' 
            ? 'Your Eduhire Account Has Been Suspended'
            : 'Your Eduhire Account Has Been Reactivated';
          
          await sendMail({
            to: user.email,
            subject,
            html: `<p>Hi ${emailData.name},</p>
                   <p>Your account has been ${action}ed.</p>
                   ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                   <p>If you have questions, contact ${emailData.supportEmail}</p>`,
            text: `Your account has been ${action}ed. ${reason ? `Reason: ${reason}` : ''}`
          });
          
          console.log(`✓ ${action} email sent to:`, user.email);
        } catch (emailError) {
          console.error('⚠️  Failed to send suspension email:', emailError.message);
        }
      });
    }
    
    res.json({
      success: true,
      message: `User ${action}ed successfully`,
      user: {
        id: user._id,
        email: user.email,
        status: user.status
      }
    });
    
  } catch (error) {
    console.error('❌ Suspend user error:', error.message);
    res.status(500).json({
      error: 'Failed to suspend/activate user',
      message: error.message
    });
  }
};

/**
 * Delete user (superadmin only)
 * DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️  [Admin] Deleting user:', id);
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // Delete associated profiles
    if (user.userType === 'teacher') {
      await TeacherProfile.deleteOne({ userId: user._id });
    } else if (user.userType === 'institution') {
      await InstitutionProfile.deleteOne({ userId: user._id });
    }
    
    // Delete user
    await User.findByIdAndDelete(id);
    
    console.log('✓ User deleted:', user.email);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete user error:', error.message);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error.message
    });
  }
};
