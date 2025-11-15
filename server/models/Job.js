const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    // Basic Job Information
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    institutionid: {  //FIXED: Consistent camelCase naming
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstitutionProfile",  //FIXED: Correct ref to InstitutionProfile model
        required: true,
        index: true
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    level: {
        type: String,
        enum: ["primary", "secondary", "higher"],
        required: true,
        index: true
    },
    location: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    // Salary Information
    salary: {
        min: { type: Number, index: true },
        max: { type: Number, index: true },
        currency: { type: String, default: "INR" },  //Changed from USD to INR
        period: { type: String, enum: ["hourly", "monthly", "annual"], default: "monthly" }
    },

    // Experience & Requirements
    experience: {
        type: Number,
        required: true,
        min: 0
    },
    jobDescription: {
        type: String,
        required: true,
        maxlength: 5000
    },
    requirements: {
        type: String,
        required: true,
        maxlength: 3000
    },
    desirables: {
        type: String,
        maxlength: 2000
    },

    // Job Status & Timing
    status: {
        type: String,
        enum: ["pending", "approved", "active", "expired", "closed"],
        default: "pending",
        index: true
    },
    postedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },

    // Premium Features
    isfeatured: {
        type: Boolean,
        default: false,
        index: true
    },
    featureduntil: {
        type: Date
    },
        badgetype: {
        type: String,
        enum: ['featured', 'urgent', 'hot', 'new', null],
        default: null
    },
    priorityplacementtier: {
        type: Number,
        enum: [1, 2, 3],
        default: 3  // 1 = highest priority
    },

    // Analytics
    views: {
        type: Number,
        default: 0,
        index: true
    },
    clicks: {
        type: Number,
        default: 0
    },
    applicationscount: {  // FIXED: Consistent camelCase (was applications_count)
        type: Number,
        default: 0,
        index: true
    },

    // Applicants Management
    applicants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    // Additional Metadata
    employmentType: {
        type: String,
        enum: ["full-time", "part-time", "contract", "temporary", "substitute"],
        default: "full-time",
        index: true
    },
    remote: {
        type: Boolean,
        default: false,
        index: true
    },
    benefits: [String],

    // NEW: Soft delete support
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date
    }

}, {
    timestamps: true
});

// ===============================================
// INDEXES FOR SEARCH OPTIMIZATION
// ===============================================

// Text index for full-text search
jobSchema.index({ title: "text", subject: "text", location: "text" });

// Compound indexes for filtering
jobSchema.index({ status: 1, expiresAt: 1 });
jobSchema.index({ institutionid: 1, status: 1 });
jobSchema.index({ subject: 1, level: 1, status: 1 });
jobSchema.index({ location: 1, status: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ isfeatured: 1, status: 1 });
jobSchema.index({ isDeleted: 1, status: 1 });  // NEW: For soft delete queries

// ===============================================
// INSTANCE METHODS
// ===============================================

// Soft delete method
jobSchema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.status = 'closed';
    return this.save();
};

// ===============================================
// QUERY HELPERS
// ===============================================

// Helper to exclude deleted jobs by default
jobSchema.query.notDeleted = function () {
    return this.where({ isDeleted: false });
};

// Helper to get active jobs only
jobSchema.query.active = function () {
    return this.where({
        status: 'active',
        expiresAt: { $gt: new Date() },
        isDeleted: false
    });
};

// ===============================================
// VIRTUAL PROPERTIES
// ===============================================

// Check if job is expired
jobSchema.virtual('isExpired').get(function () {
    return this.expiresAt < new Date();
});

// Days until expiry
jobSchema.virtual('daysUntilExpiry').get(function () {
    const now = new Date();
    const diffTime = this.expiresAt - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
});

// ===============================================
// MIDDLEWARE (HOOKS)
// ===============================================

// Pre-save hook to auto-update status based on expiry
jobSchema.pre('save', function (next) {
    if (this.expiresAt < new Date() && this.status === 'active') {
        this.status = 'expired';
    }
    next();
});

// Pre-find hook to exclude deleted jobs by default
jobSchema.pre(/^find/, function (next) {
    // Only apply if isDeleted filter not explicitly set
    if (this.getQuery().isDeleted === undefined) {
        this.where({ isDeleted: false });
    }
    next();
});

module.exports = mongoose.model("Job", jobSchema);
