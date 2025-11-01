const Review = require('../models/Review');
const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const InstitutionProfile = require('../models/InstitutionProfile');

/**
 * Calculate and update average rating for an entity
 * @param {ObjectId} entityId - The ID of the entity (teacher or institution)
 * @param {String} entityType - 'Teacher' or 'Institution'
 */
exports.calculateAverageRating = async (entityId, entityType) => {
  try {
    // Aggregate ratings using MongoDB pipeline
    const stats = await Review.aggregate([
      {
        $match: {
          reviewedEntityId: entityId,
          reviewedEntityType: entityType,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$reviewedEntityId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Calculate rating distribution (1-star, 2-star, etc.)
    let distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    if (stats.length > 0) {
      const ratings = stats[0].ratingDistribution;
      ratings.forEach(rating => {
        distribution[rating] = (distribution[rating] || 0) + 1;
      });

      const updateData = {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
        ratingDistribution: distribution
      };

      // Update the appropriate model
      if (entityType === 'Teacher') {
        await TeacherProfile.findOneAndUpdate(
          { userId: entityId },
          updateData,
          { new: true }
        );
      } else if (entityType === 'Institution') {
        await InstitutionProfile.findOneAndUpdate(
          { userId: entityId },
          updateData,
          { new: true }
        );
      }

      return updateData;
    } else {
      // No reviews found - reset to defaults
      const defaultData = {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: distribution
      };

      if (entityType === 'Teacher') {
        await TeacherProfile.findOneAndUpdate(
          { userId: entityId },
          defaultData
        );
      } else if (entityType === 'Institution') {
        await InstitutionProfile.findOneAndUpdate(
          { userId: entityId },
          defaultData
        );
      }

      return defaultData;
    }
  } catch (error) {
    console.error('Error calculating average rating:', error);
    throw error;
  }
};
