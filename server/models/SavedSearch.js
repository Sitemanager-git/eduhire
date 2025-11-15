// SavedSearch.js - Model for saved job searches
const mongoose = require('mongoose');

const SavedSearchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  filters: {
    search: String,
    subject: String,
    level: String,
    location: String,
    salaryMin: Number,
    salaryMax: Number
  },
  lastExecuted: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
SavedSearchSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('SavedSearch', SavedSearchSchema);
