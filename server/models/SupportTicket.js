/**
 * Support Ticket Model
 * Stores customer support tickets and inquiries
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SupportTicketSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  subject: {
    type: String,
    required: true,
    minlength: 5
  },
  description: {
    type: String,
    required: true,
    minlength: 20
  },
  category: {
    type: String,
    enum: ['technical', 'payment', 'account', 'jobs', 'subscription', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  contactMethod: {
    type: String,
    enum: ['email', 'phone', 'chat'],
    default: 'email'
  },
  responses: [
    {
      message: String,
      respondedBy: { type: String, enum: ['user', 'support'] },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
SupportTicketSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
