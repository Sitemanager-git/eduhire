/**
 * Job Controller - Create Job Function
 * Refined version with proper error handling and status management
 * Version: 2.1 (November 9, 2025 - Day 14)
 */

const Job = require('../models/Job');
const InstitutionProfile = require('../models/InstitutionProfile');
const User = require('../models/User');
/**
 * @desc    Create a new job posting
 * @route   POST /api/jobs/create
 * @access  Private (Institution only)
 */
exports.createJob = async (req, res) => {
    try {
        const {
            title,
            subject,
            level,
            location,
            jobDescription,
            requirements,
            desirables,
            salary,
            experience,
            employmentType,
            remote,
            expiryDays,
            benefits
        } = req.body;

        const userId = req.user.id;

        // Verify user is institution
        const user = await User.findById(userId);
        if (!user || user.userType !== 'institution') {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Only institutions can post jobs'
            });
        }

        // Get institution profile
        const institutionProfile = await InstitutionProfile.findOne({
            userId: userId
        });

        if (!institutionProfile) {
            return res.status(422).json({ // Use 422 Unprocessable Entity instead of 404
                error: 'Profile incomplete',
                message: 'Please complete your institution profile first',
                action: 'complete-profile',
                redirectUrl: '/create-institution-profile'
            });
        }
        // Check if profile is complete - Validate nested fields properly
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
            const value = checkNestedField(institutionProfile, field);
            return !value;
        });

        if (missingFields.length > 0) {
            return res.status(422).json({
                error: 'Incomplete profile',
                message: `Please complete these fields: ${missingFields.join(', ')}`,
                missingFields: missingFields,
                action: 'complete-profile',
                redirectUrl: '/create-institution-profile'
            });
        }
        // Calculate expiry date
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (expiryDays || 30));

        // Prepare job data
        const jobData = {
            title,
            subject,
            level,
            location,
            jobDescription,
            requirements,
            desirables: desirables || '',
            salary: {
                min: salary?.min || 0,
                max: salary?.max || 0,
                currency: salary?.currency || 'INR',
                period: salary?.period || 'monthly'
            },
            experience: experience || 0,
            employmentType: employmentType || 'full-time',
            remote: remote || false,
            institutionid: institutionProfile._id,
            expiresAt: expiryDate,
            benefits: benefits || [],
            status: 'active', // CRITICAL: Set to active immediately
            postedAt: new Date(),
            applicationsCount: 0,
            views: 0
        };

        // Create job using constructor pattern
        const job = new Job(jobData);

        // Save to database
        await job.save();

        console.log('✓ Job created successfully:', job._id, 'Status:', job.status);

        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            job: job
        });

    } catch (error) {
        console.error('❌ Error creating job:', error);
        res.status(500).json({
            error: error.message || 'Failed to create job',
            details: error.message
        });
    }
};

/**
 * @desc    Get institution's posted jobs
 * @route   GET /api/jobs/my-jobs
 * @access  Private (Institution only)
 */
exports.getMyJobs = async (req, res) => {
    try {
        const userId = req.user.id;

        // Verify user is institution
        const user = await User.findById(userId);
        if (!user || user.userType !== 'institution') {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Only institutions can access this endpoint'
            });
        }

        // Get institution profile
        const institutionProfile = await InstitutionProfile.findOne({ 
            userId: userId 
        });

        if (!institutionProfile) {
            return res.status(404).json({
                error: 'Institution profile not found',
                message: 'Please complete your institution profile first'
            });
        }

        // Get jobs with pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const jobs = await Job.find({
            institutionid: institutionProfile._id
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const total = await Job.countDocuments({
            institutionid: institutionProfile._id
        });

        console.log(`✓ Fetched ${jobs.length} jobs for institution:`, user.email);

        res.json({
            success: true,
            count: jobs.length,
            total: total,
            page: page,
            totalPages: Math.ceil(total / limit),
            jobs: jobs
        });

    } catch (error) {
        console.error('Get my jobs error:', error);
        res.status(500).json({
            error: 'Failed to fetch jobs',
            details: error.message
        });
    }
};

/**
 * @desc    Get job by ID
 * @route   GET /api/jobs/:id
 * @access  Public (for job details) or Private (for management)
 */
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('institutionid');

        if (!job) {
            return res.status(404).json({
                error: 'Job not found'
            });
        }

        res.json({
            success: true,
            job
        });

    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({
            error: 'Failed to fetch job'
        });
    }
};


exports.updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const updates = req.body;
        const userId = req.user.id;

        // First, fetch the job to verify ownership
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                error: 'Job not found'
            });
        }

        // Verify user is an institution and owns this job
        const user = await User.findById(userId);
        if (!user || user.userType !== 'institution') {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Only institutions can update jobs'
            });
        }

        // Get the institution profile
        const institutionProfile = await InstitutionProfile.findOne({ userId: userId });
        if (!institutionProfile) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Institution profile not found'
            });
        }

        // Verify the job belongs to this institution
        if (job.institutionid.toString() !== institutionProfile._id.toString()) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'You can only update your own job postings'
            });
        }

        // Update the job
        const updatedJob = await Job.findByIdAndUpdate(
            jobId,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Job updated successfully',
            job: updatedJob
        });

    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({
            error: 'Failed to update job'
        });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user.id;

        // First, fetch the job to verify ownership
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                error: 'Job not found'
            });
        }

        // Verify user is an institution and owns this job
        const user = await User.findById(userId);
        if (!user || user.userType !== 'institution') {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Only institutions can delete jobs'
            });
        }

        // Get the institution profile
        const institutionProfile = await InstitutionProfile.findOne({ userId: userId });
        if (!institutionProfile) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Institution profile not found'
            });
        }

        // Verify the job belongs to this institution
        if (job.institutionid.toString() !== institutionProfile._id.toString()) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'You can only delete your own job postings'
            });
        }

        // Delete the job
        await Job.findByIdAndDelete(jobId);

        res.json({
            success: true,
            message: 'Job deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({
            error: 'Failed to delete job'
        });
    }
};

exports.duplicateJob = async (req, res) => {
    try {
        const originalJob = await Job.findById(req.params.id);

        if (!originalJob) {
            return res.status(404).json({
                error: 'Job not found'
            });
        }

        const duplicatedJob = new Job({
            ...originalJob.toObject(),
            _id: undefined,
            createdAt: new Date(),
            postedAt: new Date()
        });

        await duplicatedJob.save();

        res.status(201).json({
            success: true,
            message: 'Job duplicated successfully',
            job: duplicatedJob
        });

    } catch (error) {
        console.error('Error duplicating job:', error);
        res.status(500).json({
            error: 'Failed to duplicate job'
        });
    }
};

exports.getJobApplicants = async (req, res) => {
    try {
        res.status(501).json({
            error: 'Not implemented yet'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch applicants'
        });
    }
};

exports.exportApplicants = async (req, res) => {
    try {
        res.status(501).json({
            error: 'Premium feature not implemented yet'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to export applicants'
        });
    }
};

exports.getJobAnalytics = async (req, res) => {
    try {
        res.status(501).json({
            error: 'Premium feature not implemented yet'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch analytics'
        });
    }
};

exports.bulkCreateJobs = async (req, res) => {
    try {
        res.status(501).json({
            error: 'Premium feature not implemented yet'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to bulk create jobs'
        });
    }
};
/**
 * Get featured jobs for homepage
 * GET /api/jobs/featured
 */
exports.getFeaturedJobs = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const featuredJobs = await Job.find({
      isfeatured: true,
      status: 'active',
      isDeleted: false,
      expiresAt: { $gt: new Date() },
      $or: [
        { featureduntil: { $exists: false } },
        { featureduntil: null },
        { featureduntil: { $gt: new Date() } }
      ]
    })
    .select('title subject level location salary experience employmentType isfeatured badgetype priorityplacementtier institutionid postedAt')
    .populate('institutionid', 'institutionName type location')
    .sort({ priorityplacementtier: 1, postedAt: -1 })
    .limit(parseInt(limit))
    .lean();

    res.json({
      success: true,
      count: featuredJobs.length,
      jobs: featuredJobs
    });

  } catch (error) {
    console.error('Get featured jobs error:', error);
    res.status(500).json({
      error: 'Failed to fetch featured jobs',
      message: error.message
    });
  }
};

/**
 * Mark job as featured (Institution with premium subscription)
 * POST /api/jobs/:id/feature
 */
exports.markJobAsFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration = 30, tier = 2 } = req.body; // duration in days
    const userId = req.user.id;

    // Find institution profile
    const InstitutionProfile = require('../models/InstitutionProfile');
    const institutionProfile = await InstitutionProfile.findOne({ userId });

    if (!institutionProfile) {
      return res.status(404).json({ error: 'Institution profile not found' });
    }

    // Find job
    const job = await Job.findOne({
      _id: id,
      institutionid: institutionProfile._id
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check subscription (implement this based on your subscription model)
    // For now, allow all institutions to feature jobs

    // Update job
    job.isfeatured = true;
    job.featureduntil = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
    job.priorityplacementtier = tier;
    job.badgetype = 'featured';

    await job.save();

    res.json({
      success: true,
      message: 'Job marked as featured successfully',
      job: {
        id: job._id,
        title: job.title,
        isfeatured: job.isfeatured,
        featureduntil: job.featureduntil,
        tier: job.priorityplacementtier
      }
    });

  } catch (error) {
    console.error('Mark job as featured error:', error);
    res.status(500).json({
      error: 'Failed to mark job as featured',
      message: error.message
    });
  }
};

module.exports = exports;