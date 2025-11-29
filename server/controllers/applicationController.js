/**
 * Application Controller - Production Ready
 * Features: Submit, manage, track applications
 * Version: 2.0 (Updated October 2025)
 */

const Application = require('../models/Application');
const Job = require('../models/Job');
const TeacherProfile = require('../models/TeacherProfile');
const InstitutionProfile = require('../models/InstitutionProfile');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// ================================================
// TEACHER METHODS
// ================================================

/**
 * @desc    Submit job application (Teacher)
 * @route   POST /api/applications/apply
 * @access  Private (Teacher only)
 */
exports.submitApplication = async (req, res) => {
    try {
        const { job_id, coverLetter } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!job_id || !coverLetter) {
            return res.status(400).json({
                error: 'Job ID and cover letter are required'
            });
        }

        // Verify user is a teacher
        const user = await User.findById(userId);
        if (!user || user.userType !== 'teacher') {
            return res.status(403).json({
                error: 'Only teachers can apply for jobs'
            });
        }

        // Get teacher profile
        let teacherProfile = await TeacherProfile.findOne({ userId: userId });
        
        // Fallback: Try email lookup for legacy profiles
        if (!teacherProfile && user.email) {
            teacherProfile = await TeacherProfile.findOne({ email: user.email });
            if (teacherProfile) {
                teacherProfile.userId = userId;
                await teacherProfile.save();
            }
        }
        
        if (!teacherProfile) {
            return res.status(404).json({
                error: 'Teacher profile not found. Please complete your profile first.'
            });
        }

        // Check if resume exists
        if (!teacherProfile.resume) {
            return res.status(400).json({
                error: 'Please upload your resume before applying'
            });
        }

        // Verify job exists and is active
        const job = await Job.findById(job_id);
        if (!job) {
            return res.status(404).json({
                error: 'Job not found'
            });
        }

        if (job.status !== 'active' || job.expiresAt < new Date()) {
            return res.status(400).json({
                error: 'This job posting is no longer active'
            });
        }

        // Check for duplicate application
        const existingApplication = await Application.findOne({
            job_id: job_id,
            teacher_id: teacherProfile._id
        });

        if (existingApplication) {
            return res.status(400).json({
                error: 'You have already applied for this job',
                application: existingApplication
            });
        }

        // Create new application
        const application = new Application({
            job_id: job_id,
            teacher_id: teacherProfile._id,
            institution_id: job.institutionid,
            coverLetter: coverLetter.trim()
        });

        await application.save();

        // Update job's application count
        await Job.findByIdAndUpdate(job_id, {
            $inc: { applicationscount: 1 }
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            application: application
        });

    } catch (error) {
        console.error('Application submission error:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                error: 'You have already applied for this job'
            });
        }

        res.status(500).json({
            error: 'Failed to submit application',
            details: error.message
        });
    }
};

/**
 * @desc    Get all applications for a teacher
 * @route   GET /api/applications/my
 * @access  Private (Teacher only)
 */
exports.getMyApplications = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get teacher profile
        const user = await User.findById(userId);
        if (!user || user.userType !== 'teacher') {
            return res.status(403).json({
                error: 'Access denied'
            });
        }

        const teacherProfile = await TeacherProfile.findOne({ userId: userId });
        if (!teacherProfile) {
            return res.status(404).json({
                error: 'Teacher profile not found'
            });
        }

        // Get all applications with job details
        const applications = await Application.find({
            teacher_id: teacherProfile._id
        })
        .populate({
            path: 'job_id',
            select: 'title subject level location salary employmentType status expiresAt institutionid',
            populate: {
                path: 'institutionid',
                select: 'institutionName type location'
            }
        })
        .sort({ appliedAt: -1 });

        res.json({
            success: true,
            count: applications.length,
            applications: applications
        });

    } catch (error) {
        console.error('Get my applications error:', error);
        res.status(500).json({
            error: 'Failed to fetch applications',
            details: error.message
        });
    }
};

/**
 * @desc    Withdraw application (Teacher)
 * @route   DELETE /api/applications/:id
 * @access  Private (Teacher only)
 */
exports.withdrawApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify user is teacher
        const user = await User.findById(userId);
        if (!user || user.userType !== 'teacher') {
            return res.status(403).json({
                error: 'Access denied'
            });
        }

        let teacherProfile = await TeacherProfile.findOne({ userId: userId });
        
        // Fallback: Try email lookup for legacy profiles
        if (!teacherProfile && user.email) {
            teacherProfile = await TeacherProfile.findOne({ email: user.email });
            if (teacherProfile) {
                teacherProfile.userId = userId;
                await teacherProfile.save();
            }
        }
        
        if (!teacherProfile) {
            return res.status(404).json({
                error: 'Teacher profile not found'
            });
        }

        // Find application
        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({
                error: 'Application not found'
            });
        }

        // Verify application belongs to this teacher
        if (application.teacher_id.toString() !== teacherProfile._id.toString()) {
            return res.status(403).json({
                error: 'You can only withdraw your own applications'
            });
        }

        // Check if can withdraw
        if (application.status !== 'pending') {
            return res.status(400).json({
                error: `Cannot withdraw application with status: ${application.status}`
            });
        }

        // Delete application
        await Application.findByIdAndDelete(id);

        // Update job's application count
        await Job.findByIdAndUpdate(application.job_id, {
            $inc: { applicationscount: -1 }
        });

        res.json({
            success: true,
            message: 'Application withdrawn successfully'
        });

    } catch (error) {
        console.error('Withdraw application error:', error);
        res.status(500).json({
            error: 'Failed to withdraw application',
            details: error.message
        });
    }
};

// ================================================
// INSTITUTION METHODS
// ================================================

/**
 * @desc    Get applications received for a specific job (Institution)
 * @route   GET /api/applications/received/:jobId
 * @access  Private (Institution only)
 */
exports.getApplicationsForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.id;

        // Verify user is institution
        const user = await User.findById(userId);
        if (!user || user.userType !== 'institution') {
            return res.status(403).json({
                error: 'Access denied'
            });
        }

        // Get institution profile
        let institutionProfile = await InstitutionProfile.findOne({ userId: userId });
        
        // Fallback: Try email lookup for legacy profiles
        if (!institutionProfile && user.email) {
            institutionProfile = await InstitutionProfile.findOne({ email: user.email });
            if (institutionProfile) {
                institutionProfile.userId = userId;
                await institutionProfile.save();
            }
        }
        
        if (!institutionProfile) {
            return res.status(404).json({
                error: 'Institution profile not found'
            });
        }

        // Verify job belongs to this institution
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                error: 'Job not found'
            });
        }

        if (job.institutionid.toString() !== institutionProfile._id.toString()) {
            return res.status(403).json({
                error: 'You can only view applications for your own jobs'
            });
        }

        // Get all applications for this job
        const applications = await Application.find({ job_id: jobId })
            .populate({
                path: 'teacher_id',
                select: 'fullName email phone experience education subjects resume photo location'
            })
            .sort({ appliedAt: -1 });

        res.json({
            success: true,
            jobTitle: job.title,
            count: applications.length,
            applications: applications
        });

    } catch (error) {
        console.error('Get applications for job error:', error);
        res.status(500).json({
            error: 'Failed to fetch applications',
            details: error.message
        });
    }
};

/**
 * @desc    Get all applications received by institution
 * @route   GET /api/applications/received
 * @access  Private (Institution only)
 */
exports.getAllReceivedApplications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, jobId } = req.query;

        // Verify user is institution
        const user = await User.findById(userId);
        if (!user || user.userType !== 'institution') {
            return res.status(403).json({
                error: 'Access denied'
            });
        }

        let institutionProfile = await InstitutionProfile.findOne({ userId: userId });
        
        // Fallback: Try email lookup for legacy profiles
        if (!institutionProfile && user.email) {
            institutionProfile = await InstitutionProfile.findOne({ email: user.email });
            if (institutionProfile) {
                institutionProfile.userId = userId;
                await institutionProfile.save();
            }
        }
        
        if (!institutionProfile) {
            return res.status(404).json({
                error: 'Institution profile not found'
            });
        }

        // Build query
        const query = { institution_id: institutionProfile._id };
        if (status) query.status = status;
        if (jobId) query.job_id = jobId;

        // Get applications
        const applications = await Application.find(query)
            .populate({
                path: 'job_id',
                select: 'title subject level location status'
            })
            .populate({
                path: 'teacher_id',
                select: 'fullName email phone experience education subjects resume'
            })
            .sort({ appliedAt: -1 });

        res.json({
            success: true,
            count: applications.length,
            applications: applications
        });

    } catch (error) {
        console.error('Get all received applications error:', error);
        res.status(500).json({
            error: 'Failed to fetch applications',
            details: error.message
        });
    }
};

/**
 * @desc    Shortlist an application (Institution)
 * @route   POST /api/applications/:id/shortlist
 * @access  Private (Institution only)
 */
exports.shortlistApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify user is institution
        const user = await User.findById(userId);
        if (!user || user.userType !== 'institution') {
            return res.status(403).json({
                error: 'Access denied'
            });
        }

        let institutionProfile = await InstitutionProfile.findOne({ userId: userId });
        
        // Fallback: Try email lookup for legacy profiles
        if (!institutionProfile && user.email) {
            institutionProfile = await InstitutionProfile.findOne({ email: user.email });
            if (institutionProfile) {
                institutionProfile.userId = userId;
                await institutionProfile.save();
            }
        }
        
        if (!institutionProfile) {
            return res.status(404).json({
                error: 'Institution profile not found'
            });
        }

        // Find application
        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({
                error: 'Application not found'
            });
        }

        // Verify application belongs to this institution
        if (application.institution_id.toString() !== institutionProfile._id.toString()) {
            return res.status(403).json({
                error: 'You can only manage applications for your own jobs'
            });
        }

        // Update status
        application.status = 'shortlisted';
        await application.save();

        res.json({
            success: true,
            message: 'Application shortlisted successfully',
            application: application
        });

    } catch (error) {
        console.error('Shortlist application error:', error);
        res.status(500).json({
            error: 'Failed to shortlist application',
            details: error.message
        });
    }
    try {
        const teacher = await TeacherProfile.findById(application.teacherid);
        await createNotification({
            userId: teacher.userId,
            type: 'application_status',
            title: 'Application Status Updated',
            message: `Your application for ${job.title} has been ${status}`,
            relatedApplicationId: application._id,
            actionUrl: `/my-applications`
        });
    } catch (notifError) {
        console.error('Failed to create notification:', notifError);
    }
};

/**
 * @desc    Reject an application (Institution)
 * @route   POST /api/applications/:id/reject
 * @access  Private (Institution only)
 */
exports.rejectApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify user is institution
        const user = await User.findById(userId);
        if (!user || user.userType !== 'institution') {
            return res.status(403).json({
                error: 'Access denied'
            });
        }

        let institutionProfile = await InstitutionProfile.findOne({ userId: userId });
        
        // Fallback: Try email lookup for legacy profiles
        if (!institutionProfile && user.email) {
            institutionProfile = await InstitutionProfile.findOne({ email: user.email });
            if (institutionProfile) {
                institutionProfile.userId = userId;
                await institutionProfile.save();
            }
        }
        
        if (!institutionProfile) {
            return res.status(404).json({
                error: 'Institution profile not found'
            });
        }

        // Find application
        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({
                error: 'Application not found'
            });
        }

        // Verify application belongs to this institution
        if (application.institution_id.toString() !== institutionProfile._id.toString()) {
            return res.status(403).json({
                error: 'You can only manage applications for your own jobs'
            });
        }

        // Update status
        application.status = 'rejected';
        await application.save();

        res.json({
            success: true,
            message: 'Application rejected',
            application: application
        });

    } catch (error) {
        console.error('Reject application error:', error);
        res.status(500).json({
            error: 'Failed to reject application',
            details: error.message
        });
    }
};

/**
 * @desc    Update application status (Institution)
 * @route   PUT /api/applications/:id
 * @access  Private (Institution only)
 * @contract Maps to generic status update endpoint
 */
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        // Validate status
        const validStatuses = ['pending', 'shortlisted', 'rejected'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                error: 'Invalid status. Must be one of: pending, shortlisted, rejected'
            });
        }

        // Verify user is institution
        const user = await User.findById(userId);
        if (!user || user.userType !== 'institution') {
            return res.status(403).json({
                error: 'Access denied'
            });
        }

        let institutionProfile = await InstitutionProfile.findOne({ userId: userId });
        
        // Fallback: Try email lookup for legacy profiles
        if (!institutionProfile && user.email) {
            institutionProfile = await InstitutionProfile.findOne({ email: user.email });
            if (institutionProfile) {
                institutionProfile.userId = userId;
                await institutionProfile.save();
            }
        }
        
        if (!institutionProfile) {
            return res.status(404).json({
                error: 'Institution profile not found'
            });
        }

        // Find application
        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({
                error: 'Application not found'
            });
        }

        // Verify application belongs to this institution
        if (application.institution_id.toString() !== institutionProfile._id.toString()) {
            return res.status(403).json({
                error: 'You can only manage applications for your own jobs'
            });
        }

        // Update status
        application.status = status;
        await application.save();

        // Create notification for teacher
        try {
            const job = await Job.findById(application.job_id).select('title');
            const teacher = await TeacherProfile.findById(application.teacher_id);
            
            if (teacher) {
                await createNotification({
                    userId: teacher.userId || teacher._id,
                    type: 'application_status',
                    title: 'Application Status Updated',
                    message: `Your application for ${job?.title || 'job'} is now ${status}`,
                    relatedApplicationId: application._id,
                    actionUrl: '/my-applications'
                });
            }
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
            // Don't fail the request if notification fails
        }

        res.json({
            success: true,
            message: `Application status updated to ${status}`,
            application: application
        });

    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({
            error: 'Failed to update application status',
            details: error.message
        });
    }
};

module.exports = exports;
