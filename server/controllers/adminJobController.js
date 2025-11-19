// server/controllers/adminJobController.js
const Job = require('../models/Job');
const InstitutionProfile = require('../models/InstitutionProfile');
const User = require('../models/User');
const { sendMail } = require('../utils/emailService');

/**
 * Get all jobs with filters (for moderation)
 * GET /api/admin/jobs
 */
exports.getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'all',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    console.log('📋 [Admin] Getting jobs for moderation');
    
    const query = { isDeleted: false };
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { subject: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const jobs = await Job.find(query)
      .populate('institutionid', 'institutionName type email phone')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const totalJobs = await Job.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / limitNum);
    
    console.log(`✓ Found ${jobs.length} jobs for moderation`);
    
    res.json({
      success: true,
      jobs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalJobs,
        limit: limitNum
      }
    });
    
  } catch (error) {
    console.error('❌ Get jobs error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch jobs',
      message: error.message
    });
  }
};

/**
 * Get job details
 * GET /api/admin/jobs/:id
 */
exports.getJobDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('📋 [Admin] Getting job details:', id);
    
    const job = await Job.findById(id)
      .populate('institutionid')
      .lean();
    
    if (!job) {
      return res.status(404).json({
        error: 'Job not found'
      });
    }
    
    // Get application stats
    const Application = require('../models/Application');
    const applicationStats = {
      total: await Application.countDocuments({ job_id: job._id }),
      pending: await Application.countDocuments({ job_id: job._id, status: 'pending' }),
      shortlisted: await Application.countDocuments({ job_id: job._id, status: 'shortlisted' }),
      rejected: await Application.countDocuments({ job_id: job._id, status: 'rejected' })
    };
    
    console.log('✓ Job details retrieved');
    
    res.json({
      success: true,
      job: {
        ...job,
        applicationStats
      }
    });
    
  } catch (error) {
    console.error('❌ Get job details error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch job details',
      message: error.message
    });
  }
};

/**
 * Approve job
 * PUT /api/admin/jobs/:id/approve
 */
exports.approveJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    console.log('✅ [Admin] Approving job:', id);
    
    const job = await Job.findById(id).populate('institutionid');
    
    if (!job) {
      return res.status(404).json({
        error: 'Job not found'
      });
    }
    
    job.status = 'active';
    await job.save();
    
    console.log('✓ Job approved:', job.title);
    
    // Send email to institution
    if (sendMail) {
      setImmediate(async () => {
        try {
          const institution = await InstitutionProfile.findById(job.institutionid._id);
          const user = await User.findById(institution.userId);
          
          await sendMail({
            to: user.email,
            subject: '✅ Your Job Posting Has Been Approved - Eduhire',
            html: `
              <h2>Job Posting Approved!</h2>
              <p>Dear ${institution.institutionName},</p>
              <p>Your job posting "<strong>${job.title}</strong>" has been approved and is now live on Eduhire.</p>
              ${notes ? `<p><strong>Admin Notes:</strong> ${notes}</p>` : ''}
              <p>Candidates can now view and apply to this position.</p>
              <p>View your job: <a href="${process.env.CLIENT_URL}/jobs/${job._id}">${job.title}</a></p>
              <br>
              <p>Best regards,<br>The Eduhire Team</p>
            `,
            text: `Your job posting "${job.title}" has been approved.`
          });
          
          console.log('✓ Approval email sent');
        } catch (emailError) {
          console.error('⚠️  Failed to send approval email:', emailError.message);
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Job approved successfully',
      job: {
        id: job._id,
        title: job.title,
        status: job.status
      }
    });
    
  } catch (error) {
    console.error('❌ Approve job error:', error.message);
    res.status(500).json({
      error: 'Failed to approve job',
      message: error.message
    });
  }
};

/**
 * Reject job
 * PUT /api/admin/jobs/:id/reject
 */
exports.rejectJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    console.log('❌ [Admin] Rejecting job:', id);
    
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        error: 'Rejection reason required',
        message: 'Please provide a detailed reason (minimum 10 characters)'
      });
    }
    
    const job = await Job.findById(id).populate('institutionid');
    
    if (!job) {
      return res.status(404).json({
        error: 'Job not found'
      });
    }
    
    job.status = 'closed';
    await job.save();
    
    console.log('✓ Job rejected:', job.title);
    
    // Send email to institution
    if (sendMail) {
      setImmediate(async () => {
        try {
          const institution = await InstitutionProfile.findById(job.institutionid._id);
          const user = await User.findById(institution.userId);
          
          await sendMail({
            to: user.email,
            subject: '❌ Your Job Posting Was Not Approved - Eduhire',
            html: `
              <h2>Job Posting Not Approved</h2>
              <p>Dear ${institution.institutionName},</p>
              <p>Unfortunately, your job posting "<strong>${job.title}</strong>" could not be approved at this time.</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p>You can edit and resubmit this job posting from your dashboard.</p>
              <p>If you have questions, please contact our support team.</p>
              <br>
              <p>Best regards,<br>The Eduhire Team</p>
            `,
            text: `Your job posting "${job.title}" was not approved. Reason: ${reason}`
          });
          
          console.log('✓ Rejection email sent');
        } catch (emailError) {
          console.error('⚠️  Failed to send rejection email:', emailError.message);
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Job rejected successfully',
      job: {
        id: job._id,
        title: job.title,
        status: job.status
      }
    });
    
  } catch (error) {
    console.error('❌ Reject job error:', error.message);
    res.status(500).json({
      error: 'Failed to reject job',
      message: error.message
    });
  }
};
