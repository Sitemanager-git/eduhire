const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Notification content
  type: {
    type: String,
    enum: [
      'application_received',     // Institution: new application
      'application_status',       // Teacher: application status changed
      'job_match',               // Teacher: job matches profile
      'profile_view',            // Teacher: profile viewed
      'job_expiring',            // Institution: job expiring soon
      'system'                   // System notifications
    ],
    required: true
  },

  title: {
    type: String,
    required: true,
    maxlength: 100
  },

  message: {
    type: String,
    required: true,
    maxlength: 500
  },

  // Related entity references
  relatedJobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },

  relatedApplicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },

  // Status tracking
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },

  readAt: {
    type: Date
  },

  // Link to navigate (optional)
  actionUrl: {
    type: String
  }

}, {
  timestamps: true
});

// Compound indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
