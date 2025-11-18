import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WriteReview from '../WriteReview';
import reviewService from '../../services/reviewService';

jest.mock('../../services/reviewService');

describe('WriteReview Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders review form when visible', () => {
    render(
      <WriteReview
        visible={true}
        onClose={mockOnClose}
        entityId="123"
        entityType="Institution"
        entityName="Test School"
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText(/Write a Review/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Share your experience/i)).toBeInTheDocument();
  });

  test('does not render form when not visible', () => {
    render(
      <WriteReview
        visible={false}
        onClose={mockOnClose}
        entityId="123"
        entityType="Institution"
        entityName="Test School"
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText(/Write a Review/i)).not.toBeInTheDocument();
  });

  test('validates minimum comment length', async () => {
    render(
      <WriteReview
        visible={true}
        onClose={mockOnClose}
        entityId="123"
        entityType="Institution"
        entityName="Test School"
        onSuccess={mockOnSuccess}
      />
    );

    const textarea = screen.getByPlaceholderText(/Share your experience/i);
    const submitBtn = screen.getByText(/Submit Review/i);

    fireEvent.change(textarea, { target: { value: 'short' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  test('requires rating before submission', async () => {
    render(
      <WriteReview
        visible={true}
        onClose={mockOnClose}
        entityId="123"
        entityType="Institution"
        entityName="Test School"
        onSuccess={mockOnSuccess}
      />
    );

    const textarea = screen.getByPlaceholderText(/Share your experience/i);
    const submitBtn = screen.getByText(/Submit Review/i);

    fireEvent.change(textarea, { target: { value: 'This is a valid comment for testing' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Please select a rating/i)).toBeInTheDocument();
    });
  });

  test('submits review successfully', async () => {
    reviewService.submitReview.mockResolvedValue({ success: true });

    render(
      <WriteReview
        visible={true}
        onClose={mockOnClose}
        entityId="123"
        entityType="Institution"
        entityName="Test School"
        onSuccess={mockOnSuccess}
      />
    );

    // Select rating (click 4th star for 4 stars)
    const stars = screen.getAllByRole('button').filter(btn => btn.className.includes('star'));
    fireEvent.click(stars);

    // Enter comment
    const textarea = screen.getByPlaceholderText(/Share your experience/i);
    fireEvent.change(textarea, { target: { value: 'Excellent institution with great facilities' } });

    // Submit
    const submitBtn = screen.getByText(/Submit Review/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(reviewService.submitReview).toHaveBeenCalledWith({
        rating: 4,
        comment: 'Excellent institution with great facilities',
        reviewedEntityId: '123',
        reviewedEntityType: 'Institution'
      });
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
