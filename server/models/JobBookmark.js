const mongoose = require('mongoose');

const jobBookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },

  // Optional: Add notes
  notes: {
    type: String,
    maxlength: 500
  },

  // Optional: Categorize bookmarks
  category: {
    type: String,
    enum: ['interested', 'applied', 'interview', 'wishlist'],
    default: 'interested'
  }

}, {
  timestamps: true
});

// Compound unique index to prevent duplicate bookmarks
jobBookmarkSchema.index({ userId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('JobBookmark', jobBookmarkSchema);
