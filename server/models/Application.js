const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
        index: true
    },
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TeacherProfile',
        required: true,
        index: true
    },
    institution_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstitutionProfile',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'shortlisted', 'rejected'],
        default: 'pending',
        index: true
    },
    coverLetter: {
        type: String,
        required: true,
        maxlength: 3000
    },
    appliedAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate applications
applicationSchema.index({ job_id: 1, teacher_id: 1 }, { unique: true });

// Instance method to check if application can be withdrawn
applicationSchema.methods.canWithdraw = function() {
    return this.status === 'pending';
};

// Static method to get application count for a job
applicationSchema.statics.getCountByJob = function(jobId) {
    return this.countDocuments({ job_id: jobId });
};

// Static method to check if teacher already applied
applicationSchema.statics.hasApplied = async function(jobId, teacherId) {
    const application = await this.findOne({ job_id: jobId, teacher_id: teacherId });
    return !!application;
};

module.exports = mongoose.model('Application', applicationSchema);
