/**
 * Payment Controller
 * Handles subscription payments and webhook events
 */
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const TIERS = require('../config/subscriptionTiers');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
module.exports = {
  async createOrder(req, res) {
    try {
  const { planType } = req.body;
  const tier = TIERS[planType];
  if (!tier) return res.status(400).json({ success: false, error: 'Invalid plan type' });
      const amount = tier.price * 100;
      const options = {
        amount,
        currency: tier.currency || 'INR',
        receipt: `rcpt_${req.user._id}_${Date.now()}`
      };
  const order = await razorpay.orders.create(options);
  // Save order to Subscription (inactive until payment verified)
  const sub = new Subscription({
    userId: req.user._id,
    planType,
    status: 'inactive',
    amount: tier.price,
    jobPostingsLimit: tier.jobPostingsLimit,
    razorpayOrderId: order.id
  });
  await sub.save();
  console.log('Order created:', order.id);
  res.json({ success: true, order });
    } catch (err) {
      console.error('createOrder error:', err);
      res.status(500).json({ success: false, error: 'Failed to create order' });
    }
  },

  async verifyPayment(req, res) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const sub = await Subscription.findOne({ razorpayOrderId, userId: req.user._id });
  if (!sub) return res.status(404).json({ success: false, error: 'Subscription not found' });
  const text = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');
      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({ success: false, error: 'Invalid signature' });
      }
      // Activate subscription
  const tier = TIERS[sub.planType];
  sub.status = 'active';
  sub.razorpayPaymentId = razorpayPaymentId;
  sub.razorpaySignature = razorpaySignature;
  sub.startDate = new Date();
  sub.endDate = new Date(Date.now() + (tier.durationDays * 24 * 60 * 60 * 1000));
  await sub.save();
  console.log('Payment verified, subscription activated:', sub._id);
  res.json({ success: true, subscription: sub });
    } catch (err) {
      console.error('verifyPayment error:', err);
      res.status(500).json({ success: false, error: 'Failed to verify payment' });
    }
  },

  async getCurrentSubscription(req, res) {
    try {
      const sub = await Subscription.findOne({ userId: req.user._id, status: 'active' });
      if (!sub) {
  // Return free tier default
  const tier = TIERS['free'];
  return res.json({ success: true, subscription: {
          planType: 'free',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + (tier.durationDays * 24 * 60 * 60 * 1000)),
          jobPostingsLimit: tier.jobPostingsLimit,
          jobPostingsUsed: 0,
          amount: 0
        }});
      }
      res.json({ success: true, subscription: sub });
    } catch (err) {
      console.error('getCurrentSubscription error:', err);
      res.status(500).json({ success: false, error: 'Failed to get subscription' });
    }
  },

  async cancelSubscription(req, res) {
    try {
      const sub = await Subscription.findOne({ userId: req.user._id, status: 'active' });
      if (!sub) return res.status(404).json({ success: false, error: 'No active subscription' });
  sub.status = 'cancelled';
  sub.endDate = new Date();
  await sub.save();
      console.log('Subscription cancelled:', sub._id);
      res.json({ success: true });
    } catch (err) {
      console.error('cancelSubscription error:', err);
      res.status(500).json({ success: false, error: 'Failed to cancel subscription' });
    }
  },

  async upgradePlan(req, res) {
    try {
      const { planType } = req.body;
      const tier = TIERS[planType];
  if (!tier) return res.status(400).json({ success: false, error: 'Invalid plan type' });
  // Create new order for upgrade
  const amount = tier.price * 100;
      const options = {
        amount,
        currency: tier.currency || 'INR',
        receipt: `upgrade_${req.user._id}_${Date.now()}`
      };
      const order = await razorpay.orders.create(options);
      // Save new subscription (inactive until payment verified)
      const sub = new Subscription({
        userId: req.user._id,
        planType,
        status: 'inactive',
        amount: tier.price,
        jobPostingsLimit: tier.jobPostingsLimit,
        razorpayOrderId: order.id
      });
      await sub.save();
  // Removed duplicate controller exports below
  console.log('Upgrade order created:', order.id);
  res.json({ success: true, order });
    } catch (err) {
      console.error('upgradePlan error:', err);
      res.status(500).json({ success: false, error: 'Failed to upgrade plan' });
    }
  },

  async checkJobPostingLimit(req, res) {
    try {
      const sub = await Subscription.findOne({ userId: req.user._id, status: 'active' });
      const tier = sub ? TIERS[sub.planType] : TIERS['free'];
  const limit = tier.jobPostingsLimit;
  const used = sub ? sub.jobPostingsUsed : 0;
  const canPost = (limit === null) || (used < limit);
      res.json({ success: true, canPost, limit, used });
    } catch (err) {
      console.error('checkJobPostingLimit error:', err);
      res.status(500).json({ success: false, error: 'Failed to check posting limit' });
    }
  },

  async incrementJobPostingCount(req, res) {
    try {
      const sub = await Subscription.findOne({ userId: req.user._id, status: 'active' });
      if (!sub) return res.status(404).json({ success: false, error: 'No active subscription' });
  sub.jobPostingsUsed = (sub.jobPostingsUsed || 0) + 1;
  await sub.save();
  console.log('Job posting count incremented:', sub._id, sub.jobPostingsUsed);
      res.json({ success: true, jobPostingsUsed: sub.jobPostingsUsed });
    } catch (err) {
      console.error('incrementJobPostingCount error:', err);
      res.status(500).json({ success: false, error: 'Failed to increment posting count' });
    }
  }
};
/**
 * Payment Controller
 * Handles subscription payments and webhook events
 */

exports.createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan || !TIERS[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    // Here you would integrate with Razorpay/Stripe to create an order
    // For now, return mock order
    res.json({
      success: true,
      order: {
        id: 'order_mock_id',
        amount: TIERS[plan].price * 100,
        currency: 'INR',
        plan
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    // Here you would verify payment with Razorpay/Stripe
    // For now, assume success and update subscription
    const { userId, plan } = req.body;
    if (!userId || !plan || !TIERS[plan]) {
      return res.status(400).json({ error: 'Missing userId or plan' });
    }
    let subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      subscription = new Subscription({ userId, plan });
    }
    subscription.plan = plan;
    subscription.status = 'active';
    subscription.startDate = new Date();
    subscription.renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await subscription.save();
    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};
