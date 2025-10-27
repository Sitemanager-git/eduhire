const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  institution_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
    unique: true
  },
  tier: {
    type: String,
    enum: ["free", "professional", "premium", "enterprise"],
    default: "free"
  },
  status: {
    type: String,
    enum: ["active", "cancelled", "expired", "trial"],
    default: "trial"
  },
  
  // Feature Limits
  features: {
    job_postings_limit: { type: Number, default: 2 },
    featured_jobs_limit: { type: Number, default: 0 },
    analytics_access: { type: Boolean, default: false },
    export_enabled: { type: Boolean, default: false },
    video_interviews: { type: Boolean, default: false },
    resume_database_views: { type: Number, default: 0 },
    bulk_posting: { type: Boolean, default: false },
    employer_branding: { type: Boolean, default: false },
    priority_support: { type: Boolean, default: false }
  },
  
  // Usage Tracking
  usage: {
    jobs_posted_this_month: { type: Number, default: 0 },
    featured_jobs_used: { type: Number, default: 0 },
    resume_views_used: { type: Number, default: 0 },
    last_reset_date: { type: Date, default: Date.now }
  },
  
  // Billing
  stripe_customer_id: String,
  stripe_subscription_id: String,
  current_period_start: Date,
  current_period_end: Date,
  
  // Trial Information
  trial_start: Date,
  trial_end: Date,
  
}, { timestamps: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);
