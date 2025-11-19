// server/controllers/adminReviewController.js
/**
 * Admin Review Moderation Controller
 * Handles review approval, flagging, and moderation
 * Version: 1.0 (November 2025)
 */

const Review = require('../models/Review');
const User = require('../models/User');
const { sendMail, renderTemplate } = require('../utils/emailService');

/**
 * Get all reviews for moderation
 * GET /api/admin/reviews
 */
exports.getReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'all',
      entityType = 'all',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    console.log('📋 [Admin] Getting reviews for moderation');
    
    // Build query
    const query = {};
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (entityType !== 'all') {
      query.reviewedEntityType = entityType;
    }
    
    if (search && search.trim()) {
      query.$or = [
        { comment: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    
    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    
    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get reviews
    const reviews = await Review.find(query)
      .populate('reviewerId', 'email userType profile')
      .populate('reviewedEntityId')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const totalReviews = await Review.countDocuments(query);
    const totalPages = Math.ceil(totalReviews / limitNum);
    
    // Get stats
    const stats = {
      total: await Review.countDocuments(),
      pending: await Review.countDocuments({ status: 'pending' }),
      approved: await Review.countDocuments({ status: 'approved' }),
      flagged: await Review.countDocuments({ status: 'flagged' })
    };
    
    console.log(`✓ Found ${reviews.length} reviews`);
    
    res.json({
      success: true,
      reviews,
      stats,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalReviews,
        limit: limitNum
      }
    });
    
  } catch (error) {
    console.error('❌ Get reviews error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch reviews',
      message: error.message
    });
  }
};

/**
 * Get single review details
 * GET /api/admin/reviews/:id
 */
exports.getReviewDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('📋 [Admin] Getting review details:', id);
    
    const review = await Review.findById(id)
      .populate('reviewerId', 'email userType profile')
      .populate('reviewedEntityId')
      .lean();
    
    if (!review) {
      return res.status(404).json({
        error: 'Review not found'
      });
    }
    
    // Get reviewer's other reviews
    const otherReviews = await Review.find({
      reviewerId: review.reviewerId._id,
      _id: { $ne: review._id }
    })
    .select('rating comment status createdAt')
    .limit(5)
    .lean();
    
    console.log('✓ Review details retrieved');
    
    res.json({
      success: true,
      review: {
        ...review,
        reviewerHistory: otherReviews
      }
    });
    
  } catch (error) {
    console.error('❌ Get review details error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch review details',
      message: error.message
    });
  }
};

/**
 * Approve review
 * PUT /api/admin/reviews/:id/approve
 */
exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    console.log('✅ [Admin] Approving review:', id);
    
    const review = await Review.findById(id)
      .populate('reviewerId', 'email')
      .populate('reviewedEntityId');
    
    if (!review) {
      return res.status(404).json({
        error: 'Review not found'
      });
    }
    
    // Update status
    review.status = 'approved';
    await review.save();
    
    console.log('✓ Review approved:', review._id);
    
    // Optional: Send email notification to reviewer
    if (sendMail && review.reviewerId) {
      setImmediate(async () => {
        try {
          await sendMail({
            to: review.reviewerId.email,
            subject: '✅ Your Review Has Been Approved - Eduhire',
            html: `
              <h2>Review Approved</h2>
              <p>Your review has been approved and is now visible on the platform.</p>
              ${notes ? `<p><strong>Admin Notes:</strong> ${notes}</p>` : ''}
              <p>Thank you for contributing to our community!</p>
              <br>
              <p>Best regards,<br>The Eduhire Team</p>
            `,
            text: `Your review has been approved. ${notes ? `Notes: ${notes}` : ''}`
          });
          
          console.log('✓ Approval email sent to reviewer');
        } catch (emailError) {
          console.error('⚠️  Failed to send approval email:', emailError.message);
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Review approved successfully',
      review: {
        id: review._id,
        status: review.status,
        rating: review.rating
      }
    });
    
  } catch (error) {
    console.error('❌ Approve review error:', error.message);
    res.status(500).json({
      error: 'Failed to approve review',
      message: error.message
    });
  }
};

/**
 * Flag/reject review
 * PUT /api/admin/reviews/:id/flag
 */
exports.flagReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, action = 'flag' } = req.body; // action: 'flag' or 'delete'
    
    console.log(`⚠️  [Admin] Flagging review:`, id);
    
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        error: 'Reason required',
        message: 'Please provide a detailed reason (minimum 10 characters)'
      });
    }
    
    const review = await Review.findById(id)
      .populate('reviewerId', 'email')
      .populate('reviewedEntityId');
    
    if (!review) {
      return res.status(404).json({
        error: 'Review not found'
      });
    }
    
    if (action === 'delete') {
      // Permanently delete review
      await Review.findByIdAndDelete(id);
      console.log('✓ Review deleted:', review._id);
    } else {
      // Flag review (still visible but marked)
      review.status = 'flagged';
      await review.save();
      console.log('✓ Review flagged:', review._id);
    }
    
    // Send email notification to reviewer
    if (sendMail && review.reviewerId) {
      setImmediate(async () => {
        try {
          const actionText = action === 'delete' ? 'removed' : 'flagged';
          
          await sendMail({
            to: review.reviewerId.email,
            subject: `⚠️ Your Review Has Been ${actionText.charAt(0).toUpperCase() + actionText.slice(1)} - Eduhire`,
            html: `
              <h2>Review ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}</h2>
              <p>Your review has been ${actionText} by our moderation team.</p>
              <p><strong>Reason:</strong> ${reason}</p>
              ${action === 'delete' 
                ? '<p>The review has been removed from the platform.</p>' 
                : '<p>The review is currently hidden pending further review.</p>'
              }
              <p>If you believe this was done in error, please contact our support team.</p>
              <br>
              <p>Best regards,<br>The Eduhire Team</p>
            `,
            text: `Your review has been ${actionText}. Reason: ${reason}`
          });
          
          console.log(`✓ ${actionText} email sent to reviewer`);
        } catch (emailError) {
          console.error('⚠️  Failed to send email:', emailError.message);
        }
      });
    }
    
    res.json({
      success: true,
      message: `Review ${action === 'delete' ? 'deleted' : 'flagged'} successfully`,
      review: {
        id: review._id,
        action: action
      }
    });
    
  } catch (error) {
    console.error('❌ Flag review error:', error.message);
    res.status(500).json({
      error: 'Failed to flag review',
      message: error.message
    });
  }
};

/**
 * Bulk approve reviews
 * POST /api/admin/reviews/bulk-approve
 */
exports.bulkApproveReviews = async (req, res) => {
  try {
    const { reviewIds } = req.body;
    
    console.log('✅ [Admin] Bulk approving reviews:', reviewIds.length);
    
    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'reviewIds array is required'
      });
    }
    
    // Update all reviews
    const result = await Review.updateMany(
      { _id: { $in: reviewIds } },
      { status: 'approved' }
    );
    
    console.log(`✓ Approved ${result.modifiedCount} reviews`);
    
    res.json({
      success: true,
      message: `${result.modifiedCount} reviews approved successfully`,
      count: result.modifiedCount
    });
    
  } catch (error) {
    console.error('❌ Bulk approve error:', error.message);
    res.status(500).json({
      error: 'Failed to bulk approve reviews',
      message: error.message
    });
  }
};

/**
 * Bulk flag reviews
 * POST /api/admin/reviews/bulk-flag
 */
exports.bulkFlagReviews = async (req, res) => {
  try {
    const { reviewIds, reason } = req.body;
    
    console.log('⚠️  [Admin] Bulk flagging reviews:', reviewIds.length);
    
    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'reviewIds array is required'
      });
    }
    
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        error: 'Reason required',
        message: 'Please provide a detailed reason (minimum 10 characters)'
      });
    }
    
    // Update all reviews
    const result = await Review.updateMany(
      { _id: { $in: reviewIds } },
      { status: 'flagged' }
    );
    
    console.log(`✓ Flagged ${result.modifiedCount} reviews`);
    
    res.json({
      success: true,
      message: `${result.modifiedCount} reviews flagged successfully`,
      count: result.modifiedCount
    });
    
  } catch (error) {
    console.error('❌ Bulk flag error:', error.message);
    res.status(500).json({
      error: 'Failed to bulk flag reviews',
      message: error.message
    });
  }
};

/**
 * Get review statistics
 * GET /api/admin/reviews/statistics
 */
exports.getReviewStatistics = async (req, res) => {
  try {
    console.log('📊 [Admin] Getting review statistics');
    
    // Get counts by status
    const statusCounts = await Review.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get counts by entity type
    const entityTypeCounts = await Review.aggregate([
      {
        $group: {
          _id: '$reviewedEntityType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get average ratings by entity type
    const avgRatings = await Review.aggregate([
      {
        $match: { status: 'approved' }
      },
      {
        $group: {
          _id: '$reviewedEntityType',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get recent review trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTrend = await Review.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get top reviewers
    const topReviewers = await Review.aggregate([
      {
        $group: {
          _id: '$reviewerId',
          reviewCount: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { reviewCount: -1 } },
      { $limit: 10 }
    ]);
    
    // Populate reviewer details
    await Review.populate(topReviewers, {
      path: '_id',
      select: 'email userType'
    });
    
    console.log('✓ Review statistics calculated');
    
    res.json({
      success: true,
      statistics: {
        byStatus: statusCounts,
        byEntityType: entityTypeCounts,
        averageRatings: avgRatings,
        recentTrend,
        topReviewers
      }
    });
    
  } catch (error) {
    console.error('❌ Get statistics error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch review statistics',
      message: error.message
    });
  }
};

module.exports = exports;
