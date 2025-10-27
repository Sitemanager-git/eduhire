const mongoose = require("mongoose");

const jobAnalyticsSchema = new mongoose.Schema({
    job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
        index: true
    },
    institution_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true
    },

    // Daily Metrics
    date: {
        type: Date,
        required: true,
        index: true,
        default: () => new Date().setHours(0, 0, 0, 0)
    },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },

    // Source Tracking
    sources: {
        direct: { type: Number, default: 0 },
        search: { type: Number, default: 0 },
        social: { type: Number, default: 0 },
        email: { type: Number, default: 0 }
    },

    // Candidate Demographics
    candidate_demographics: {
        experience_levels: {
            entry: { type: Number, default: 0 },
            mid: { type: Number, default: 0 },
            senior: { type: Number, default: 0 }
        }
    }
}, { timestamps: true });

jobAnalyticsSchema.index({ job_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("JobAnalytics", jobAnalyticsSchema);
