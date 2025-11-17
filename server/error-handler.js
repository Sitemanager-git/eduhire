/**
 * Enhanced Application Controller with Comprehensive Error Handling
 * Location: server/controllers/applicationController.js
 * Version: 3.0 - Error Handling Enhanced
 */

const Application = require('../models/Application');
const Job = require('../models/Job');
const TeacherProfile = require('../models/TeacherProfile');
const InstitutionProfile = require('../models/InstitutionProfile');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

/**
 * Custom Error Classes for Better Error Handling
 */
class ApplicationError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.name = 'ApplicationError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

/**
 * Error Logger - Logs errors with context
 */
function logError(context, error, additionalInfo = {}) {
  console.error('\n╔════════════════════════════════════════════════════════');
  console.error('║ APPLICATION ERROR');
  console.error('╠════════════════════════════════════════════════════════');
  console.error('║ Context:', context);
  console.error('║ Timestamp:', new Date().toISOString());
  console.error('║ Error:', error.message);
  console.error('║ Stack:', error.stack);
  if (Object.keys(additionalInfo).length > 0) {
    console.error('║ Additional Info:', JSON.stringify(additionalInfo, null, 2));
  }
  console.error('╚════════════════════════════════════════════════════════\n');
}

/**
 * @desc    Submit job application (Teacher) - ENHANCED
 * @route   POST /api/applications/apply
 * @access  Private (Teacher only)
 */
exports.submitApplication = async (req, res) => {
  const startTime = Date.now();
  let step = 'INITIALIZATION';
  
  try {
    console.log('\n🚀 APPLICATION SUBMISSION STARTED');
    console.log('═══════════════════════════════════════');
    
    // ========================================
    // STEP 1: VALIDATE REQUEST DATA
    // ========================================
    step = 'REQUEST_VALIDATION';
    console.log('📝 Step 1: Validating request data...');
    
    const { job_id, coverLetter } = req.body;
    const userId = req.user?.id;
    
    // Check if user ID exists (from auth middleware)
    if (!userId) {
      throw new ApplicationError(
        'User authentication failed. Please login again.',
        401,
        'AUTH_USER_ID_MISSING'
      );
    }
    console.log('✓ User ID:', userId);
    
    // Validate job_id
    if (!job_id) {
      throw new ApplicationError(
        'Job ID is required',
        400,
        'JOB_ID_MISSING'
      );
    }
    console.log('✓ Job ID:', job_id);
    
    // Validate cover letter
    if (!coverLetter) {
      throw new ApplicationError(
        'Cover letter is required',
        400,
        'COVER_LETTER_MISSING'
      );
    }
    
    if (typeof coverLetter !== 'string') {
      throw new ApplicationError(
        'Cover letter must be a string',
        400,
        'COVER_LETTER_INVALID_TYPE'
      );
    }
    
    const trimmedCoverLetter = coverLetter.trim();
    
    if (trimmedCoverLetter.length < 20) {
      throw new ApplicationError(
        'Cover letter must be at least 20 characters long',
        400,
        'COVER_LETTER_TOO_SHORT'
      );
    }
    
    if (trimmedCoverLetter.length > 3000) {
      throw new ApplicationError(
        `Cover letter too long (${trimmedCoverLetter.length} characters). Maximum 3000 characters allowed.`,
        400,
        'COVER_LETTER_TOO_LONG'
      );
    }
    console.log('✓ Cover letter valid (', trimmedCoverLetter.length, 'chars)');
    
    // ========================================
    // STEP 2: VERIFY USER AND USER TYPE
    // ========================================
    step = 'USER_VERIFICATION';
    console.log('\n👤 Step 2: Verifying user...');
    
    const user = await User.findById(userId);
    
    if (!user) {
      throw new ApplicationError(
        'User account not found. Please register again.',
        404,
        'USER_NOT_FOUND'
      );
    }
    console.log('✓ User found:', user.email);
    
    if (user.userType !== 'teacher') {
      throw new ApplicationError(
        `Only teachers can apply for jobs. Your account type is: ${user.userType}`,
        403,
        'INVALID_USER_TYPE'
      );
    }
    console.log('✓ User is a teacher');
    
    // Check if account is active
    if (user.status && user.status !== 'active') {
      throw new ApplicationError(
        `Your account is ${user.status}. Please contact support.`,
        403,
        'ACCOUNT_NOT_ACTIVE'
      );
    }
    console.log('✓ Account is active');
    
    // ========================================
    // STEP 3: VERIFY TEACHER PROFILE
    // ========================================
    step = 'TEACHER_PROFILE_VERIFICATION';
    console.log('\n📋 Step 3: Verifying teacher profile...');
    
    const teacherProfile = await TeacherProfile.findOne({ 
      $or: [
        { email: user.email },
        { userId: userId }
      ]
    });
    
    if (!teacherProfile) {
      throw new ApplicationError(
        'Teacher profile not found. Please complete your profile before applying.',
        404,
        'TEACHER_PROFILE_NOT_FOUND'
      );
    }
    console.log('✓ Teacher profile found:', teacherProfile._id);
    
    // Check if profile is complete
    const missingFields = [];
    if (!teacherProfile.fullName) missingFields.push('fullName');
    if (!teacherProfile.phone) missingFields.push('phone');
    if (!teacherProfile.education) missingFields.push('education');
    if (!teacherProfile.subjects || teacherProfile.subjects.length === 0) {
      missingFields.push('subjects');
    }
    
    if (missingFields.length > 0) {
      throw new ApplicationError(
        `Profile incomplete. Missing fields: ${missingFields.join(', ')}`,
        400,
        'PROFILE_INCOMPLETE'
      );
    }
    console.log('✓ Profile is complete');
    
    // Check for resume
    if (!teacherProfile.resume) {
      throw new ApplicationError(
        'Resume is required. Please upload your resume before applying.',
        400,
        'RESUME_MISSING'
      );
    }
    console.log('✓ Resume uploaded:', teacherProfile.resume);
    
    // ========================================
    // STEP 4: VERIFY JOB EXISTS AND IS ACTIVE
    // ========================================
    step = 'JOB_VERIFICATION';
    console.log('\n💼 Step 4: Verifying job...');
    
    const job = await Job.findById(job_id)
      .populate('institutionid', 'institutionName email userId');
    
    if (!job) {
      throw new ApplicationError(
        'Job not found. It may have been deleted.',
        404,
        'JOB_NOT_FOUND'
      );
    }
    console.log('✓ Job found:', job.title);
    
    // Check if job is deleted (soft delete)
    if (job.isDeleted) {
      throw new ApplicationError(
        'This job posting has been removed.',
        410,
        'JOB_DELETED'
      );
    }
    
    // Check job status
    if (job.status !== 'active') {
      throw new ApplicationError(
        `This job is no longer accepting applications. Status: ${job.status}`,
        400,
        'JOB_NOT_ACTIVE'
      );
    }
    console.log('✓ Job is active');
    
    // Check if job has expired
    const now = new Date();
    if (job.expiresAt && job.expiresAt < now) {
      throw new ApplicationError(
        `This job posting expired on ${job.expiresAt.toLocaleDateString()}`,
        410,
        'JOB_EXPIRED'
      );
    }
    console.log('✓ Job not expired (expires:', job.expiresAt, ')');
    
    // Verify institution exists
    if (!job.institutionid) {
      throw new ApplicationError(
        'Institution information missing for this job',
        500,
        'INSTITUTION_MISSING'
      );
    }
    console.log('✓ Institution:', job.institutionid.institutionName);
    
    // ========================================
    // STEP 5: CHECK FOR DUPLICATE APPLICATION
    // ========================================
    step = 'DUPLICATE_CHECK';
    console.log('\n🔍 Step 5: Checking for duplicate application...');
    
    const existingApplication = await Application.findOne({
      job_id: job_id,
      teacher_id: teacherProfile._id
    });
    
    if (existingApplication) {
      throw new ApplicationError(
        `You have already applied for this job on ${existingApplication.appliedAt.toLocaleDateString()}`,
        409,
        'DUPLICATE_APPLICATION'
      );
    }
    console.log('✓ No duplicate application found');
    
    // ========================================
    // STEP 6: CREATE APPLICATION
    // ========================================
    step = 'APPLICATION_CREATION';
    console.log('\n✨ Step 6: Creating application...');
    
    const application = new Application({
      job_id: job_id,
      teacher_id: teacherProfile._id,
      institution_id: job.institutionid._id,
      coverLetter: trimmedCoverLetter,
      status: 'pending',
      appliedAt: new Date()
    });
    
    await application.save();
    console.log('✓ Application created:', application._id);
    
    // ========================================
    // STEP 7: UPDATE JOB APPLICATION COUNT
    // ========================================
    step = 'JOB_UPDATE';
    console.log('\n📊 Step 7: Updating job statistics...');
    
    await Job.findByIdAndUpdate(
      job_id,
      { $inc: { applicationscount: 1 } },
      { new: false }
    );
    console.log('✓ Job application count incremented');
    
    // ========================================
    // STEP 8: SEND NOTIFICATION (NON-BLOCKING)
    // ========================================
    step = 'NOTIFICATION';
    console.log('\n🔔 Step 8: Sending notification...');
    
    // Don't block response on notification
    setImmediate(async () => {
      try {
        if (job.institutionid.userId) {
          await createNotification({
            userId: job.institutionid.userId,
            type: 'application_received',
            title: 'New Application Received',
            message: `${teacherProfile.fullName} applied for ${job.title}`,
            relatedJobId: job_id,
            relatedApplicationId: application._id,
            actionUrl: `/applications-received?jobId=${job_id}`
          });
          console.log('✓ Notification sent to institution');
        }
      } catch (notifError) {
        console.warn('⚠️  Notification failed (non-critical):', notifError.message);
      }
    });
    
    // ========================================
    // STEP 9: SEND SUCCESS RESPONSE
    // ========================================
    const executionTime = Date.now() - startTime;
    console.log('\n✅ APPLICATION SUBMITTED SUCCESSFULLY');
    console.log('═══════════════════════════════════════');
    console.log('Execution time:', executionTime, 'ms');
    console.log('Application ID:', application._id);
    console.log('═══════════════════════════════════════\n');
    
    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        _id: application._id,
        job_id: application.job_id,
        teacher_id: application.teacher_id,
        institution_id: application.institution_id,
        status: application.status,
        appliedAt: application.appliedAt
      },
      job: {
        title: job.title,
        institutionName: job.institutionid.institutionName
      },
      metadata: {
        executionTime: `${executionTime}ms`
      }
    });
    
  } catch (error) {
    // ========================================
    // COMPREHENSIVE ERROR HANDLING
    // ========================================
    
    const executionTime = Date.now() - startTime;
    
    // Log error with context
    logError('Application Submission', error, {
      step,
      userId: req.user?.id,
      jobId: req.body?.job_id,
      executionTime: `${executionTime}ms`
    });
    
    // Handle different error types
    if (error instanceof ApplicationError) {
      // Custom application errors
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        errorCode: error.errorCode,
        step: step,
        timestamp: new Date().toISOString()
      });
    }
    
    // MongoDB Duplicate Key Error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'You have already applied for this job',
        errorCode: 'DUPLICATE_APPLICATION',
        step: step,
        timestamp: new Date().toISOString()
      });
    }
    
    // MongoDB Validation Error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errorCode: 'VALIDATION_ERROR',
        details: messages,
        step: step,
        timestamp: new Date().toISOString()
      });
    }
    
    // MongoDB CastError (Invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: `Invalid ${error.path}: ${error.value}`,
        errorCode: 'INVALID_ID',
        step: step,
        timestamp: new Date().toISOString()
      });
    }
    
    // Generic Server Error
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while processing your application',
      errorCode: 'INTERNAL_SERVER_ERROR',
      step: step,
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Health Check Endpoint for Application Service
 */
exports.healthCheck = async (req, res) => {
  try {
    // Check database connectivity
    const applicationCount = await Application.estimatedDocumentCount();
    const jobCount = await Job.estimatedDocumentCount();
    
    res.json({
      success: true,
      service: 'Application Submission',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        applications: applicationCount,
        jobs: jobCount
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      service: 'Application Submission',
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = exports;
