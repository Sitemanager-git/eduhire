const Job = require('../models/Job');
const InstitutionProfile = require('../models/InstitutionProfile');

exports.createJob = async (req, res) => {
    try {
        const {
            title,
            subject,
            level,
            location,
            description,
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

        const institutionProfile = await InstitutionProfile.findOne({
            userId: userId
        });

        if (!institutionProfile) {
            return res.status(404).json({
                error: 'Institution profile not found. Please complete your profile first.'
            });
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (expiryDays || 30));

        const job = new Job({
            title,
            subject,
            level,
            location,
            description,
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
            status: 'active',
            postedAt: new Date()
        });

        await job.save();

        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            job
        });

    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({
            error: error.message || 'Failed to create job'
        });
    }
};

exports.getMyJobs = async (req, res) => {
    try {
        const userId = req.user.id;

        const institutionProfile = await InstitutionProfile.findOne({ userId });

        if (!institutionProfile) {
            return res.status(404).json({
                error: 'Institution profile not found'
            });
        }

        const jobs = await Job.find({
            institutionid: institutionProfile._id
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            jobs
        });

    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({
            error: 'Failed to fetch jobs'
        });
    }
};

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

        const job = await Job.findByIdAndUpdate(
            jobId,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!job) {
            return res.status(404).json({
                error: 'Job not found'
            });
        }

        res.json({
            success: true,
            message: 'Job updated successfully',
            job
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
        const job = await Job.findByIdAndDelete(req.params.id);

        if (!job) {
            return res.status(404).json({
                error: 'Job not found'
            });
        }

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

module.exports = exports;