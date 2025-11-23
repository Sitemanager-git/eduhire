import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminReviews } from '../../services/adminAPI';
import '../../styles/admin.css';

const AdminReviewModeration = () => {
  const navigate = useNavigate();
  const { adminToken } = useAdminAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken, navigate]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await adminReviews.getAll({ token: adminToken });
      setReviews(response.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Review Moderation</h1>
          <p className="text-gray-600 mt-2">Manage and moderate user reviews</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {loading ? (
            <div className="text-center text-gray-500">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-gray-500">No reviews found</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{review.title}</h3>
                    <span className="text-sm text-gray-600">{review.rating}/5</span>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                  <p className="text-xs text-gray-500 mt-2">By {review.author}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviewModeration;
