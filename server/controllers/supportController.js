/**
 * Support Controller - Contract-Enforced (API_CONTRACTS.json)
 * Manages support tickets and FAQ
 * Version: 1.0 (November 14, 2025 - Contract-driven)
 */

const SupportTicket = require('../models/SupportTicket');
const FAQ = require('../models/FAQ');

/**
 * @desc    Create support ticket
 * @route   POST /api/support/create-ticket
 * @access  Private
 * @contract Request: { subject, description, category, priority, contactMethod }
 * @contract Response: { _id, ticketId, status, createdAt }
 */
exports.createTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, description, category, priority, contactMethod } = req.body;

    console.log('🎫 [Support] Creating ticket for user:', userId);

    // Validation
    if (!subject || subject.length < 5) {
      return res.status(400).json({
        error: 'Invalid subject',
        message: 'Subject must be at least 5 characters long'
      });
    }

    if (!description || description.length < 20) {
      return res.status(400).json({
        error: 'Invalid description',
        message: 'Description must be at least 20 characters long'
      });
    }

    const validCategories = ['technical', 'payment', 'account', 'jobs', 'subscription', 'other'];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({
        error: 'Invalid category',
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!priority || !validPriorities.includes(priority)) {
      return res.status(400).json({
        error: 'Invalid priority',
        message: `Priority must be one of: ${validPriorities.join(', ')}`
      });
    }

    // Create ticket
    const ticketId = 'TKT-' + userId.substring(0, 6).toUpperCase() + '-' + Math.random().toString(36).substring(7).toUpperCase();

    const ticket = new SupportTicket({
      userId,
      ticketId,
      subject: subject.trim(),
      description: description.trim(),
      category,
      priority,
      contactMethod: contactMethod || 'email',
      status: 'open'
    });

    await ticket.save();

    console.log('✓ Ticket created:', ticketId);

    res.status(201).json({
      _id: ticket._id,
      ticketId: ticket.ticketId,
      status: ticket.status,
      createdAt: ticket.createdAt
    });

  } catch (error) {
    console.error('❌ Error in createTicket:', error.message);
    res.status(500).json({
      error: 'Failed to create support ticket',
      message: error.message
    });
  }
};

/**
 * @desc    Get FAQs
 * @route   GET /api/faq
 * @access  Private
 * @contract Response: [{ _id, question, answer, category }]
 */
exports.getFAQ = async (req, res) => {
  try {
    console.log('📚 [Support] Fetching FAQs');

    const { category } = req.query;
    const query = category ? { category } : {};

    const faqs = await FAQ.find(query).sort({ createdAt: -1 });

    console.log(`✓ Found ${faqs.length} FAQs`);

    // Return as array directly per contract
    const faqArray = faqs.map(faq => ({
      _id: faq._id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category
    }));

    res.json(faqArray);

  } catch (error) {
    console.error('❌ Error in getFAQ:', error.message);
    res.status(500).json({
      error: 'Failed to fetch FAQ',
      message: error.message
    });
  }
};

module.exports = exports;
