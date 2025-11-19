/**
 * Admin Payment Controller
 * Handles payment and subscription management
 */

const Subscription = require('../models/Subscription');
const User = require('../models/User');

module.exports = {
  // GET /api/admin/payments
  async getPayments(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const skip = (page - 1) * limit;
      
      let query = {};
      if (status) query.status = status;
      
      const payments = await Subscription.find(query)
        .populate('userId', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      const total = await Subscription.countDocuments(query);
      
      res.json({
        success: true,
        payments,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch payments' });
    }
  },

  // GET /api/admin/payments/:id
  async getPaymentDetails(req, res) {
    try {
      const { id } = req.params;
      const payment = await Subscription.findById(id).populate('userId', 'name email');
      
      if (!payment) {
        return res.status(404).json({ success: false, error: 'Payment not found' });
      }
      
      res.json({ success: true, payment });
    } catch (error) {
      console.error('Error fetching payment details:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch payment details' });
    }
  },

  // POST /api/admin/payments/:id/refund
  async refundPayment(req, res) {
    try {
      const { id } = req.params;
      const subscription = await Subscription.findById(id);
      
      if (!subscription) {
        return res.status(404).json({ success: false, error: 'Payment not found' });
      }
      
      // Update subscription status
      subscription.status = 'refunded';
      await subscription.save();
      
      res.json({ success: true, message: 'Payment refunded successfully', subscription });
    } catch (error) {
      console.error('Error refunding payment:', error);
      res.status(500).json({ success: false, error: 'Failed to refund payment' });
    }
  }
};
