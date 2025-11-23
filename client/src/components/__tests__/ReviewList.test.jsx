import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewList from '../ReviewList';
import reviewService from '../../services/reviewService';

jest.mock('../../services/reviewService');

describe('ReviewList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders review list header', async () => {
    reviewService.getReviews.mockResolvedValue({
      reviews: [],
      statistics: { averageRating: 0, totalReviews: 0 },
      totalPages: 1,
      currentPage: 1
    });

    render(<ReviewList entityType="Institution" entityId="507f1f77bcf86cd799439011" />);
    
    await waitFor(() => {
      expect(screen.getByText(/reviews/i)).toBeInTheDocument();
    });
  });

  test('displays average rating', async () => {
    reviewService.getReviews.mockResolvedValue({
      reviews: [
        {
          _id: '1',
          rating: 4,
          comment: 'Good school',
          reviewerId: { name: 'John', email: 'john@test.com' },
          createdAt: new Date()
        }
      ],
      statistics: { averageRating: 4, totalReviews: 1 },
      totalPages: 1,
      currentPage: 1
    });

    render(<ReviewList entityType="Institution" entityId="507f1f77bcf86cd799439011" />);
    
    await waitFor(() => {
      expect(screen.getByText(/4/i)).toBeInTheDocument();
    });
  });

  test('displays individual review', async () => {
    reviewService.getReviews.mockResolvedValue({
      reviews: [
        {
          _id: '1',
          rating: 5,
          comment: 'Excellent institution',
          reviewerId: { name: 'Teacher', email: 'teacher@test.com' },
          createdAt: new Date()
        }
      ],
      statistics: { averageRating: 5, totalReviews: 1 },
      totalPages: 1,
      currentPage: 1
    });

    render(<ReviewList entityType="Institution" entityId="507f1f77bcf86cd799439011" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Excellent institution/i)).toBeInTheDocument();
      expect(screen.getByText(/Teacher/i)).toBeInTheDocument();
    });
  });
});
