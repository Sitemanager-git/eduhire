import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import StarRating from './StarRating';
import reviewService from '../services/reviewService';
import './WriteReview.css';

const WriteReview = ({ 
  visible, 
  onClose, 
  entityId, 
  entityType, 
  entityName,
  onSuccess 
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (rating === 0) {
      message.error('Please select a rating');
      return;
    }

    if (comment.length < 10) {
      message.error('Comment must be at least 10 characters long');
      return;
    }

    if (comment.length > 1000) {
      message.error('Comment cannot exceed 1000 characters');
      return;
    }

    setLoading(true);

    try {
      const reviewData = {
        rating,
        comment,
        reviewedEntityId: entityId,
        reviewedEntityType: entityType
      };

      await reviewService.submitReview(reviewData);
      
      message.success('Review submitted successfully!');
      
      // Reset form
      setRating(0);
      setComment('');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to submit review';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <Modal
      title={`Write a Review for ${entityName}`}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading}
          onClick={handleSubmit}
        >
          Submit Review
        </Button>
      ]}
      width={600}
    >
      <div className="write-review-content">
        <div className="rating-section">
          <label className="review-label">Your Rating *</label>
          <StarRating 
            rating={rating}
            onChange={setRating}
            size="large"
            showValue={false}
          />
        </div>

        <div className="comment-section">
          <label className="review-label">Your Review *</label>
          <textarea
            className="review-textarea"
            placeholder="Share your experience... (minimum 10 characters)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={6}
            maxLength={1000}
          />
          <div className="character-count">
            {comment.length} / 1000 characters
          </div>
        </div>

        <div className="review-guidelines">
          <p className="guidelines-title">Review Guidelines:</p>
          <ul>
            <li>Be honest and constructive</li>
            <li>Focus on your experience</li>
            <li>Minimum 10 characters required</li>
            <li>No offensive language or personal attacks</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default WriteReview;
