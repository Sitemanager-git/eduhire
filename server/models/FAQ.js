/**
 * FAQ Model
 * Stores frequently asked questions
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FAQSchema = new Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'jobs', 'subscriptions', 'profiles', 'account', 'technical'],
    default: 'general'
  },
  order: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FAQ', FAQSchema);
