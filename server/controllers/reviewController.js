const mongoose = require('mongoose');
const Review = require('../models/Review');
const User = require('../models/User');
const Application = require('../models/Application');
const { calculateAverageRating } = require('../utils/ratingCalculator');

/**
 * Submit a new review
 * POST /api/reviews
 */
async function submitReview(req, res) {
    try {
        const { rating, comment, reviewedEntityId, reviewedEntityType } = req.body;
        const reviewerId = req.user._id || req.user.id; // Works with both
        const reviewerType = req.user.userType;

        // Validation: Check if all required fields are present
        if (!rating || !comment || !reviewedEntityId || !reviewedEntityType) {
            return res.status(400).json({
                error: 'All fields are required: rating, comment, reviewedEntityId, reviewedEntityType'
            });
        }

        // Access Control: Teachers can only review Institutions
        if (reviewerType === 'teacher' && reviewedEntityType !== 'Institution') {
            return res.status(403).json({
                error: 'Teachers can only review institutions'
            });
        }

        // Access Control: Institutions can only review Teachers
        if (reviewerType === 'institution' && reviewedEntityType !== 'Teacher') {
            return res.status(403).json({
                error: 'Institutions can only review teachers'
            });
        }

        // For institutions reviewing teachers: verify hiring relationship
        if (reviewerType === 'institution') {
            const hasHired = await Application.findOne({
                institutionId: reviewerId,
                teacherId: reviewedEntityId,
                status: 'accepted'
            });

            if (!hasHired) {
                return res.status(403).json({
                    error: 'You can only review teachers you have hired'
                });
            }
        }

        // Check for existing review (duplicate prevention)
        const existingReview = await Review.findOne({
            reviewerId,
            reviewedEntityId
        });

        if (existingReview) {
            return res.status(400).json({
                error: 'You have already reviewed this entity. Use update instead.'
            });
        }

        // Create the review
        const review = new Review({
            rating,
            comment,
            reviewerId,
            reviewedEntityId,
            reviewedEntityType
        });

        await review.save();

        // Calculate and update average rating
        await calculateAverageRating(reviewedEntityId, reviewedEntityType);

        // Populate reviewer details for response
        await review.populate('reviewerId', 'name email');

        res.status(201).json({
            message: 'Review submitted successfully',
            review
        });

    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                error: 'You have already reviewed this entity'
            });
        }

        console.error('Error submitting review:', error);
        res.status(500).json({
            error: 'Failed to submit review',
            details: error.message
        });
    }
}

/**
 * Get all reviews for a specific entity
 * GET /api/reviews/:entityType/:entityId
 */
async function getReviews(req, res) {
    try {
        const { entityType, entityId } = req.params;
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

        // Validate entity type
        if (!['Teacher', 'Institution'].includes(entityType)) {
            return res.status(400).json({
                error: 'Invalid entity type. Must be Teacher or Institution'
            });
        }

        const reviews = await Review.find({
            reviewedEntityId: entityId,
            reviewedEntityType: entityType,
            status: 'approved'
        })
            .populate('reviewerId', 'name email userType')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const count = await Review.countDocuments({
            reviewedEntityId: entityId,
            reviewedEntityType: entityType,
            status: 'approved'
        });

        // Get rating statistics using proper ObjectId conversion
        const stats = await Review.aggregate([
            {
                $match: {
                    reviewedEntityId: new mongoose.Types.ObjectId(entityId),
                    reviewedEntityType: entityType,
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    distribution: {
                        $push: '$rating'
                    }
                }
            }
        ]);

        const statistics = stats.length > 0 ? {
            averageRating: Math.round(stats.averageRating * 10) / 10,
            totalReviews: stats.totalReviews
        } : {
            averageRating: 0,
            totalReviews: 0
        };

        res.status(200).json({
            reviews,
            statistics,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalReviews: count
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            error: 'Failed to fetch reviews',
            details: error.message
        });
    }
}

/**
 * Get reviews written by the logged-in user
 * GET /api/reviews/my-reviews
 */
async function getMyReviews(req, res) {
    try {
        const reviewerId = req.user._id || req.user.id; // Works with both

        const reviews = await Review.find({ reviewerId })
            .populate('reviewedEntityId')
            .sort('-createdAt');

        res.status(200).json({
            reviews,
            total: reviews.length
        });

    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({
            error: 'Failed to fetch your reviews'
        });
    }
}

/**
 * Update a review
 * PUT /api/reviews/:id
 */
async function updateReview(req, res) {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id || req.user.id;

        // Find the review
        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // Check ownership
        if (review.reviewerId.toString() !== userId.toString()) {
            return res.status(403).json({
                error: 'You can only update your own reviews'
            });
        }

        // Update fields
        if (rating) review.rating = rating;
        if (comment) review.comment = comment;

        await review.save();

        // Recalculate average rating
        await calculateAverageRating(review.reviewedEntityId, review.reviewedEntityType);

        await review.populate('reviewerId', 'name email');

        res.status(200).json({
            message: 'Review updated successfully',
            review
        });

    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            error: 'Failed to update review'
        });
    }
}

/**
 * Delete a review
 * DELETE /api/reviews/:id
 */
async function deleteReview(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user._id || req.user.id;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // Check ownership
        if (review.reviewerId.toString() !== userId.toString()) {
            return res.status(403).json({
                error: 'You can only delete your own reviews'
            });
        }

        const entityId = review.reviewedEntityId;
        const entityType = review.reviewedEntityType;

        await Review.findByIdAndDelete(id);

        // Recalculate average rating after deletion
        await calculateAverageRating(entityId, entityType);

        res.status(200).json({
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            error: 'Failed to delete review'
        });
    }
}

// CORRECT EXPORT - All functions are defined above
module.exports = {
    submitReview,
    getReviews,
    getMyReviews,
    updateReview,
    deleteReview
};
