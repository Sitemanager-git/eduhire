/**
 * Subscriptions Controller - Contract-Enforced (API_CONTRACTS.json)
 * Manages user subscriptions, billing, and plan upgrades
 * Version: 1.0 (November 14, 2025 - Contract-driven)
 */

const Subscription = require('../models/Subscription');
const User = require('../models/User');

const PLANS = {
  Free: { price: 0, features: ['Basic job search', 'Limited applications'] },
  Premium: { price: 499, features: ['Unlimited applications', 'Profile boost'] },
  Professional: { price: 999, features: ['Everything in Premium', 'Dedicated support'] }
};

/**
 * @desc    Get current subscription
 * @route   GET /api/subscriptions/my-subscription
 * @access  Private
 * @contract Response: { plan, renewalDate, status }
 */
exports.getCurrent = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📖 [Subscriptions] Getting subscription for user:', userId);

    let subscription = await Subscription.findOne({ userId });

    // If no subscription exists, create a Free plan
    if (!subscription) {
      subscription = new Subscription({
        userId,
        plan: 'Free',
        status: 'active',
        renewalDate: null
      });
      await subscription.save();
      console.log('✨ Created default Free subscription');
    }

    const response = {
      plan: subscription.plan || 'Free',
      renewalDate: subscription.renewalDate,
      status: subscription.status || 'active'
    };

    console.log('✓ Subscription retrieved:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ Error in getCurrent:', error.message);
    res.status(500).json({
      error: 'Failed to fetch subscription',
      message: error.message
    });
  }
};

/**
 * @desc    Upgrade subscription
 * @route   POST /api/subscriptions/upgrade
 * @access  Private
 * @contract Request: { plan }
 * @contract Response: { message, plan, renewalDate }
 */
exports.upgrade = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan } = req.body;

    console.log('⬆️ [Subscriptions] Upgrading to plan:', plan);

    if (!plan || !PLANS[plan]) {
      return res.status(400).json({
        error: 'Invalid plan',
        message: `Plan must be one of: ${Object.keys(PLANS).join(', ')}`
      });
    }

    let subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      subscription = new Subscription({ userId, plan: 'Free' });
    }

    subscription.plan = plan;
    subscription.status = 'active';
    subscription.startDate = new Date();
    subscription.renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await subscription.save();

    console.log('✓ Subscription upgraded to:', plan);

    res.json({
      message: `Subscription upgraded to ${plan}`,
      plan: subscription.plan,
      renewalDate: subscription.renewalDate
    });

  } catch (error) {
    console.error('❌ Error in upgrade:', error.message);
    res.status(500).json({
      error: 'Failed to upgrade subscription',
      message: error.message
    });
  }
};

/**
 * @desc    Cancel subscription
 * @route   POST /api/subscriptions/cancel
 * @access  Private
 * @contract Response: { message, plan, status }
 */
exports.cancel = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('❌ [Subscriptions] Cancelling subscription for user:', userId);

    let subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      return res.status(404).json({
        error: 'Subscription not found',
        message: 'No active subscription found'
      });
    }

    subscription.plan = 'Free';
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    subscription.renewalDate = null;

    await subscription.save();

    console.log('✓ Subscription cancelled, reverted to Free');

    res.json({
      message: 'Subscription cancelled',
      plan: 'Free',
      status: 'cancelled'
    });

  } catch (error) {
    console.error('❌ Error in cancel:', error.message);
    res.status(500).json({
      error: 'Failed to cancel subscription',
      message: error.message
    });
  }
};

/**
 * @desc    Get billing history
 * @route   GET /api/subscriptions/billing-history
 * @access  Private
 * @contract Response: [{ _id, invoiceId, amount, date, status }]
 */
exports.getBillingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📊 [Subscriptions] Getting billing history for user:', userId);

    // Mock billing history (in production, fetch from payment provider)
    const billingHistory = [
      {
        _id: '1',
        invoiceId: 'INV-' + userId.substring(0, 8).toUpperCase() + '-001',
        amount: 499,
        date: new Date(),
        status: 'paid'
      }
    ];

    console.log('✓ Billing history retrieved');
    res.json(billingHistory);

  } catch (error) {
    console.error('❌ Error in getBillingHistory:', error.message);
    res.status(500).json({
      error: 'Failed to fetch billing history',
      message: error.message
    });
  }
};

module.exports = exports;
