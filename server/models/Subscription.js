const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  planType: {
    type: String,
    enum: ['free', 'basic', 'professional', 'enterprise'],
    default: 'free',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'cancelled'],
    default: 'inactive',
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null,
    index: true
  },
  razorpayOrderId: {
    type: String,
    default: null
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    default: 0
  },
  jobPostingsLimit: {
    type: Number,
    default: 3
  },
  jobPostingsUsed: {
    type: Number,
    default: 0
  },
  autoRenew: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ endDate: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
