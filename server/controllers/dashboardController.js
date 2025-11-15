const Application = require('../models/Application');
const JobBookmark = require('../models/JobBookmark');
const TeacherProfile = require('../models/TeacherProfile');
const Job = require('../models/Job');

/**
 * Get teacher dashboard statistics
 * GET /api/dashboard/teacher-stats
 */
exports.getTeacherStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get teacher profile
    const teacherProfile = await TeacherProfile.findOne({ userId });
    if (!teacherProfile) {
      return res.status(404).json({ error: 'Teacher profile not found' });
    }

    // Total applications
    const totalApplications = await Application.countDocuments({
      teacherid: teacherProfile._id
    });

    // Applications by status
    const applicationsByStatus = await Application.aggregate([
      { $match: { teacherid: teacherProfile._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusMap = {
      pending: 0,
      shortlisted: 0,
      rejected: 0
    };
    applicationsByStatus.forEach(item => {
      statusMap[item._id] = item.count;
    });

    // Saved jobs count
    const savedJobs = await JobBookmark.countDocuments({ userId });

    // Profile views (mock data - implement tracking if needed)
    const profileViews = Math.floor(Math.random() * 100); // Replace with actual tracking

    // Applications over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const applicationsOverTime = await Application.aggregate([
      {
        $match: {
          teacherid: teacherProfile._id,
          appliedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } }
    ]);

    // Applications by subject
    const applicationsBySubject = await Application.aggregate([
      { $match: { teacherid: teacherProfile._id } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobid',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $group: {
          _id: '$job.subject',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { subject: '$_id', count: 1, _id: 0 } }
    ]);

    // Recent applications
    const recentApplications = await Application.find({
      teacherid: teacherProfile._id
    })
    .populate({
      path: 'jobid',
      select: 'title subject location institutionid',
      populate: {
        path: 'institutionid',
        select: 'institutionName'
      }
    })
    .sort({ appliedAt: -1 })
    .limit(5)
    .lean();

    res.json({
      success: true,
      stats: {
        totalApplications,
        applicationsByStatus: statusMap,
        savedJobs,
        profileViews,
        applicationsOverTime,
        applicationsBySubject,
        recentApplications
      }
    });

  } catch (error) {
    console.error('Get teacher stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch teacher statistics',
      message: error.message
    });
  }
};

/**
 * Get institution dashboard statistics
 * GET /api/dashboard/institution-stats
 */
exports.getInstitutionStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get institution profile
    const InstitutionProfile = require('../models/InstitutionProfile');
    const institutionProfile = await InstitutionProfile.findOne({ userId });
    
    if (!institutionProfile) {
      return res.status(404).json({ error: 'Institution profile not found' });
    }

    // Total jobs posted
    const totalJobs = await Job.countDocuments({
      institutionid: institutionProfile._id
    });

    // Active jobs
    const activeJobs = await Job.countDocuments({
      institutionid: institutionProfile._id,
      status: 'active',
      expiresAt: { $gt: new Date() }
    });

    // Total applications received
    const totalApplications = await Application.countDocuments({
      institutionid: institutionProfile._id
    });

    // Applications by status
    const applicationsByStatus = await Application.aggregate([
      { $match: { institutionid: institutionProfile._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusMap = {
      pending: 0,
      shortlisted: 0,
      rejected: 0
    };
    applicationsByStatus.forEach(item => {
      statusMap[item._id] = item.count;
    });

    // Profile views (mock)
    const profileViews = Math.floor(Math.random() * 200);

    // Applications over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const applicationsOverTime = await Application.aggregate([
      {
        $match: {
          institutionid: institutionProfile._id,
          appliedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } }
    ]);

    // Applications by job
    const applicationsByJob = await Application.aggregate([
      { $match: { institutionid: institutionProfile._id } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobid',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $group: {
          _id: '$job._id',
          title: { $first: '$job.title' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { job: '$title', count: 1, _id: 0 } }
    ]);

    // Recent applications
    const recentApplications = await Application.find({
      institutionid: institutionProfile._id
    })
    .populate({
      path: 'teacherid',
      select: 'fullName email experience education'
    })
    .populate('jobid', 'title subject')
    .sort({ appliedAt: -1 })
    .limit(5)
    .lean();

    res.json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        applicationsByStatus: statusMap,
        profileViews,
        applicationsOverTime,
        applicationsByJob,
        recentApplications
      }
    });

  } catch (error) {
    console.error('Get institution stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch institution statistics',
      message: error.message
    });
  }
};

module.exports = exports;
