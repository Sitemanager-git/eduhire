/**
 * Job Search Controller - Production Ready
 * Features: Search, filter, browse jobs
 * Version: 2.0 (Updated October 2025)
 */

const Job = require('../models/Job');
const mongoose = require('mongoose');

/**
 * Search and filter jobs with pagination
 * GET /api/jobs/search
 */


exports.advancedSearchJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      subject,
      location,
      level,
      experienceMin,
      experienceMax,
      salaryMin,
      salaryMax,
      qualification,
      jobType,
      institutionType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build comprehensive query
    const query = {
      status: 'active',
      isDeleted: false,
      expiresAt: { $gt: new Date() }
    };

    // Text search
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    // Experience range filter
    if (experienceMin || experienceMax) {
      query.experience = {};
      if (experienceMin) query.experience.$gte = Number(experienceMin);
      if (experienceMax) query.experience.$lte = Number(experienceMax);
    }

    // Salary range filter
    if (salaryMin || salaryMax) {
      const minVal = Number(salaryMin) || 0;
      const maxVal = Number(salaryMax) || 999999;
      query.$and = [
        { 'salary.min': { $lte: maxVal } },
        { 'salary.max': { $gte: minVal } }
      ];
    }

    // Qualification filter (array matching)
    if (qualification) {
      const qualArray = Array.isArray(qualification) 
        ? qualification 
        : [qualification];
      query.qualification = { $in: qualArray };
    }

    // Job type filter
    if (jobType) {
      const jobTypeArray = Array.isArray(jobType) 
        ? jobType 
        : [jobType];
      query.employmentType = { $in: jobTypeArray };
    }

    // Institution type filter
    if (institutionType) {
      const instTypeArray = Array.isArray(institutionType) 
        ? institutionType 
        : [institutionType];
      
      // Find institutions matching these types
      const InstitutionProfile = require('../models/InstitutionProfile');
      const matchingInstitutions = await InstitutionProfile.find({
        curriculumOffered: { $in: instTypeArray }
      }).select('_id');
      
      const instIds = matchingInstitutions.map(inst => inst._id);
      query.institutionid = { $in: instIds };
    }

    // Subject filter
    if (subject) {
      const subjectArray = Array.isArray(subject) ? subject : [subject];
      query.subject = { $in: subjectArray };
    }

    // Location filter
    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Education level filter
    if (level) {
      const levelArray = Array.isArray(level) ? level : [level];
      query.level = { $in: levelArray };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    console.log('Advanced search query:', JSON.stringify(query, null, 2));

    // Execute query
    const jobs = await Job.find(query)
      .select('title subject level location salary experience employmentType remote postedAt expiresAt isfeatured badgetype institutionid applicationscount views')
      .populate('institutionid', 'institutionName type location')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean()
      .exec();

    const totalJobs = await Job.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / limitNum);

    res.status(200).json({
      success: true,
      jobs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalJobs,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      appliedFilters: {
        experienceRange: [experienceMin, experienceMax],
        salaryRange: [salaryMin, salaryMax],
        qualification,
        jobType,
        institutionType,
        subject,
        level
      }
    });

  } catch (error) {
    console.error('Advanced search error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to perform advanced search',
      message: error.message
    });
  }
};

/**
 * Get similar jobs based on subject, location, and level
 * GET /api/jobs/search/:id/similar
 */
exports.getSimilarJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid job ID format' 
      });
    }

    // Get current job
    const currentJob = await Job.findById(id).select('subject level location institutionid');

    if (!currentJob) {
      return res.status(404).json({ 
        success: false, 
        error: 'Job not found' 
      });
    }

    // Extract city from location
    const locationCity = currentJob.location.split(',')[0].trim();

    // Build similarity query with scoring
    // Priority: 1. Same subject (most important)
    //          2. Same location (city)
    //          3. Same level
    const similarJobs = await Job.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(id) },
          status: 'active',
          isDeleted: false,
          expiresAt: { $gt: new Date() }
        }
      },
      {
        $addFields: {
          similarityScore: {
            $add: [
              // Subject match: +50 points
              { $cond: [{ $eq: ['$subject', currentJob.subject] }, 50, 0] },
              // Location match: +30 points
              { 
                $cond: [
                  { $regexMatch: { input: '$location', regex: locationCity, options: 'i' } },
                  30,
                  0
                ]
              },
              // Level match: +20 points
              { $cond: [{ $eq: ['$level', currentJob.level] }, 20, 0] },
              // Same institution: -10 points (prefer different institutions)
              { 
                $cond: [
                  { $eq: ['$institutionid', currentJob.institutionid] },
                  -10,
                  0
                ]
              },
              // Featured jobs: +5 points
              { $cond: ['$isfeatured', 5, 0] }
            ]
          }
        }
      },
      {
        $match: {
          similarityScore: { $gt: 20 } // Minimum threshold
        }
      },
      {
        $sort: { similarityScore: -1, postedAt: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          title: 1,
          subject: 1,
          level: 1,
          location: 1,
          salary: 1,
          experience: 1,
          employmentType: 1,
          isfeatured: 1,
          badgetype: 1,
          institutionid: 1,
          postedAt: 1,
          similarityScore: 1
        }
      }
    ]);

    // Populate institution details
    await Job.populate(similarJobs, {
      path: 'institutionid',
      select: 'institutionName type location'
    });

    res.status(200).json({
      success: true,
      count: similarJobs.length,
      baseJob: {
        id: currentJob._id,
        subject: currentJob.subject,
        level: currentJob.level,
        location: currentJob.location
      },
      similarJobs
    });

  } catch (error) {
    console.error('Get similar jobs error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch similar jobs',
      message: error.message
    });
  }
};

exports.searchJobs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            subject,
            location,
            level,
            salaryMin,
            salaryMax,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        console.log('🔍 Search params:', { search, subject, location, level });

        // Build query object
        const query = {
            status: 'active',
            isDeleted: false,
            expiresAt: { $gt: new Date() } // Only active jobs
        };

        // Text search
        if (search && search.trim()) {
            query.$text = { $search: search.trim() };
            console.log('📝 Text search for:', search);
        }

        // Subject filter
        if (subject) {
            query.subject = subject;
            console.log('📚 Subject filter:', subject);
        }

        // Location filter (case-insensitive)
        if (location && location.trim()) {
            query.location = { $regex: location.trim(), $options: 'i' };
            console.log('📍 Location filter:', location);
        }

        // Level filter
        if (level) {
            query.level = level;
            console.log('📊 Level filter:', level);
        }

        // Salary range filter
        if (salaryMin || salaryMax) {
            const minVal = Number(salaryMin) || 0;
            const maxVal = Number(salaryMax) || 999999;

            query.$and = [
                { 'salary.min': { $lte: maxVal } },
                { 'salary.max': { $gte: minVal } }
            ];
            console.log('💰 Salary filter:', { min: minVal, max: maxVal });
        }

        // Build sort
        const sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        } else {
            sort.createdAt = -1;
        }

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        console.log('📄 Pagination:', { pageNum, limitNum, skip });

        // Execute query
        console.time('⏱️  Query Execution');

        const jobs = await Job.find(query)
            .select('title subject level location salary experience employmentType remote postedAt expiresAt isfeatured badgetype institutionid applicationscount views')
            .populate('institutionid', 'institutionName type location')
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .lean()
            .exec();

        console.timeEnd('⏱️  Query Execution');

        // Get total count
        const totalJobs = await Job.countDocuments(query);
        const totalPages = Math.ceil(totalJobs / limitNum);

        console.log(`✅ Found ${jobs.length} jobs, total: ${totalJobs}`);

        res.status(200).json({
            success: true,
            jobs,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalJobs,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            }
        });

    } catch (error) {
        console.error('❌ Search error:', error.message);
        console.error('Stack:', error.stack);

        res.status(500).json({
            success: false,
            error: 'Failed to search jobs',
            message: error.message
        });
    }
};

/**
 * Get single job details
 * GET /api/jobs/search/:id
 */
exports.getJobDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid job ID format'
            });
        }

        // Find job with institution details
        const job = await Job.findById(id)
            .populate('institutionid', 'institutionName type location address email phone website numberOfStudents numberOfTeachers description')
            .lean();

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        // Check if job has expired
        if (job.expiresAt < new Date()) {
            return res.status(410).json({
                success: false,
                error: 'This job posting has expired'
            });
        }

        res.status(200).json({
            success: true,
            job
        });

    } catch (error) {
        console.error('❌ Get job details error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch job details',
            message: error.message
        });
    }
};

/**
 * Get similar jobs
 * GET /api/jobs/search/:id/similar
 */
exports.getSimilarJobs = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 5 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid job ID format'
            });
        }

        // Get current job
        const currentJob = await Job.findById(id).select('subject level location');

        if (!currentJob) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        // Extract city from location
        const locationCity = currentJob.location.split(',')[0].trim();

        // Find similar jobs
        const similarJobs = await Job.find({
            _id: { $ne: new mongoose.Types.ObjectId(id) },
            status: 'active',
            isDeleted: false,
            expiresAt: { $gt: new Date() },
            $or: [
                { subject: currentJob.subject },
                { location: { $regex: locationCity, $options: 'i' } },
                { level: currentJob.level }
            ]
        })
            .select('title subject level location salary institutionid experience employmentType postedAt')
            .populate('institutionid', 'institutionName')
            .limit(Math.min(parseInt(limit), 10))
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            similarJobs,
            count: similarJobs.length
        });

    } catch (error) {
        console.error('❌ Get similar jobs error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch similar jobs',
            message: error.message
        });
    }
};

/**
 * Get search filters
 * GET /api/jobs/search/filters
 */
exports.getSearchFilters = async (req, res) => {
    try {
        // Get distinct values for filters
        const subjects = await Job.distinct('subject', {
            status: 'active',
            isDeleted: false,
            expiresAt: { $gt: new Date() }
        });

        const levels = await Job.distinct('level', {
            status: 'active',
            isDeleted: false,
            expiresAt: { $gt: new Date() }
        });

        const employmentTypes = await Job.distinct('employmentType', {
            status: 'active',
            isDeleted: false,
            expiresAt: { $gt: new Date() }
        });

        // Get locations
        const locationDocs = await Job.distinct('location', {
            status: 'active',
            isDeleted: false,
            expiresAt: { $gt: new Date() }
        });

        // Extract unique cities from locations
        const locations = [...new Set(
            locationDocs
                .slice(0, 100)
                .map(loc => loc.split(',')[0].trim())
        )];

        // Get salary range
        const salaryStats = await Job.aggregate([
            {
                $match: {
                    status: 'active',
                    isDeleted: false,
                    expiresAt: { $gt: new Date() },
                    'salary.min': { $exists: true }
                }
            },
            {
                $group: {
                    _id: null,
                    minSalary: { $min: '$salary.min' },
                    maxSalary: { $max: '$salary.max' }
                }
            }
        ]);

        const salaryRange = salaryStats.length > 0 ? {
            min: salaryStats[0].minSalary || 0,
            max: salaryStats[0].maxSalary || 100000
        } : { min: 0, max: 100000 };

        res.status(200).json({
            success: true,
            filters: {
                subjects: subjects.sort(),
                levels: ['primary', 'secondary', 'higher'],
                employmentTypes: employmentTypes.sort(),
                locations: locations.sort(),
                salaryRange
            }
        });

    } catch (error) {
        console.error('❌ Get search filters error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch filter options',
            message: error.message
        });
    }
};

/**
 * Get trending jobs
 * GET /api/jobs/search/trending
 */
exports.getTrendingJobs = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        const trendingJobs = await Job.find({
            status: 'active',
            isDeleted: false,
            isfeatured: true,
            expiresAt: { $gt: new Date() }
        })
            .select('title subject level location salary institutionid views applicationscount')
            .populate('institutionid', 'institutionName')
            .sort({ views: -1, applicationscount: -1 })
            .limit(Math.min(parseInt(limit), 10))
            .lean();

        res.status(200).json({
            success: true,
            trendingJobs,
            count: trendingJobs.length
        });

    } catch (error) {
        console.error('❌ Get trending jobs error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch trending jobs',
            message: error.message
        });
    }
};

/**
 * Get jobs by institution
 * GET /api/jobs/search/institution/:institutionId
 */
exports.getJobsByInstitution = async (req, res) => {
    try {
        const { institutionId } = req.params;
        const { page = 1, limit = 10, status = 'all' } = req.query;

        if (!mongoose.Types.ObjectId.isValid(institutionId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid institution ID format'
            });
        }

        const query = {
            institutionid: new mongoose.Types.ObjectId(institutionId),
            isDeleted: false
        };

        if (status !== 'all') {
            query.status = status;
        }

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const jobs = await Job.find(query)
            .select('title subject level location salary status applicationscount postedAt expiresAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        const totalJobs = await Job.countDocuments(query);
        const totalPages = Math.ceil(totalJobs / limitNum);

        res.status(200).json({
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
        console.error('❌ Get jobs by institution error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch institution jobs',
            message: error.message
        });
    }
};

/**
 * Track job view
 * POST /api/jobs/search/:id/view
 */
exports.trackJobView = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid job ID format'
            });
        }

        // Increment view count
        await Job.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: false }
        );

        res.status(200).json({
            success: true,
            message: 'View tracked successfully'
        });

    } catch (error) {
        console.error('❌ Track view error:', error.message);
        // Don't fail the request if view tracking fails
        res.status(200).json({
            success: true,
            message: 'View tracked'
        });
    }
};

module.exports = exports;
