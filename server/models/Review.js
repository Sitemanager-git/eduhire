const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  // Core review data
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer between 1 and 5'
    }
  },
  
  comment: {
    type: String,
    required: true,
    minlength: [10, 'Comment must be at least 10 characters long'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    trim: true
  },
  
  // Reviewer information
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Reviewed entity information
  reviewedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  reviewedEntityType: {
    type: String,
    required: true,
    enum: ['Institution', 'Teacher'],
    index: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'approved', 'flagged'],
    default: 'approved'
  },
  
  // Helpfulness tracking (optional feature)
  helpfulCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate reviews
ReviewSchema.index({ reviewerId: 1, reviewedEntityId: 1 }, { unique: true });

// Index for efficient queries
ReviewSchema.index({ reviewedEntityType: 1, reviewedEntityId: 1, createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema);
