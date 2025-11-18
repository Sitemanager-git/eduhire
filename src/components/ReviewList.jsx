import React, { useState, useEffect, useCallback } from 'react';
import { Card, Empty, Spin, Pagination, Select, message } from 'antd';
import StarRating from './StarRating';
import reviewService from '../services/reviewService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import './ReviewList.css';

dayjs.extend(relativeTime);

const { Option } = Select;

const ReviewList = ({ entityType, entityId }) => {
    const [reviews, setReviews] = useState([]);
    const [statistics, setStatistics] = useState({ averageRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState('-createdAt');
    const pageSize = 10;

    // FIXED: Wrap fetchReviews in useCallback
    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const data = await reviewService.getReviews(entityType, entityId, {
                page: currentPage,
                limit: pageSize,
                sort: sortBy
            });

            setReviews(data.reviews);
            setStatistics(data.statistics);
            setTotalPages(data.totalPages);
        } catch (error) {
            message.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }, [entityId, entityType, currentPage, sortBy]); // Include all dependencies

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]); // Now includes fetchReviews

    const handleSortChange = (value) => {
        setSortBy(value);
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="reviews-loading">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="review-list-container">
            {/* Rating Statistics */}
            <Card className="rating-statistics">
                <div className="stats-content">
                    <div className="overall-rating">
                        <div className="rating-number">{statistics.averageRating.toFixed(1)}</div>
                        <StarRating rating={statistics.averageRating} readOnly size="medium" showValue={false} />
                        <div className="total-reviews">{statistics.totalReviews} reviews</div>
                    </div>
                </div>
            </Card>

            {/* Sort Controls */}
            {reviews.length > 0 && (
                <div className="review-controls">
                    <Select
                        value={sortBy}
                        onChange={handleSortChange}
                        style={{ width: 200 }}
                    >
                        <Option value="-createdAt">Most Recent</Option>
                        <Option value="createdAt">Oldest First</Option>
                        <Option value="-rating">Highest Rating</Option>
                        <Option value="rating">Lowest Rating</Option>
                    </Select>
                </div>
            )}

            {/* Reviews List */}
            <div className="reviews-list">
                {reviews.length === 0 ? (
                    <Empty description="No reviews yet" />
                ) : (
                    reviews.map((review) => (
                        <Card key={review._id} className="review-card">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <div className="reviewer-name">{review.reviewerId?.name || 'Anonymous'}</div>
                                    <div className="review-date">{dayjs(review.createdAt).fromNow()}</div>
                                </div>
                                <StarRating rating={review.rating} readOnly size="small" showValue={false} />
                            </div>
                            <div className="review-comment">{review.comment}</div>
                        </Card>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="review-pagination">
                    <Pagination
                        current={currentPage}
                        total={statistics.totalReviews}
                        pageSize={pageSize}
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}
                    />
                </div>
            )}
        </div>
    );
};

export default ReviewList;
