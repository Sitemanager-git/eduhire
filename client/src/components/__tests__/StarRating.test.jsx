import { render, screen, fireEvent } from '@testing-library/react';
import StarRating from '../StarRating';

describe('StarRating Component', () => {
  test('renders 5 stars', () => {
    render(<StarRating rating={0} onChange={jest.fn()} />);
    
    const stars = screen.getAllByRole('button');
    expect(stars).toHaveLength(5);
  });

  test('displays rating value', () => {
    render(<StarRating rating={4} onChange={jest.fn()} showValue={true} />);
    
    expect(screen.getByText(/4.0/i)).toBeInTheDocument();
  });

  test('allows clicking to select rating', () => {
    const mockOnChange = jest.fn();
    render(<StarRating rating={0} onChange={mockOnChange} />);

    const stars = screen.getAllByRole('button');
    fireEvent.click(stars); // Click 4th star

    expect(mockOnChange).toHaveBeenCalledWith(4);
  });

  test('shows filled stars up to rating', () => {
    const { container } = render(<StarRating rating={3} readOnly={true} />);
    
    const filledStars = container.querySelectorAll('.star.filled');
    expect(filledStars).toHaveLength(3);
  });

  test('does not allow clicking when read-only', () => {
    const mockOnChange = jest.fn();
    render(<StarRating rating={4} onChange={mockOnChange} readOnly={true} />);

    const stars = screen.getAllByRole('button');
    fireEvent.click(stars);

    // onChange should not be called
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
