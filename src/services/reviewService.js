import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const reviewService = {
    // Submit a new review
    submitReview: async (reviewData) => {
        const response = await axios.post(
            `${API_BASE_URL}/reviews`,
            reviewData,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Get reviews for an entity
    getReviews: async (entityType, entityId, params = {}) => {
        const response = await axios.get(
            `${API_BASE_URL}/reviews/${entityType}/${entityId}`,
            { params }
        );
        return response.data;
    },

    // Get user's own reviews
    getMyReviews: async () => {
        const response = await axios.get(
            `${API_BASE_URL}/reviews/my-reviews`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Update a review
    updateReview: async (reviewId, updateData) => {
        const response = await axios.put(
            `${API_BASE_URL}/reviews/${reviewId}`,
            updateData,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Delete a review
    deleteReview: async (reviewId) => {
        const response = await axios.delete(
            `${API_BASE_URL}/reviews/${reviewId}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    }
};

export default reviewService;
