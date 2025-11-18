import React, { useState } from 'react';
import './StarRating.css';

const StarRating = ({ 
  rating = 0, 
  onChange, 
  readOnly = false,
  size = 'medium',
  showValue = true 
}) => {
  const [hover, setHover] = useState(0);
  
  const sizes = {
    small: '16px',
    medium: '24px',
    large: '32px'
  };

  const handleClick = (value) => {
    if (!readOnly && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readOnly) {
      setHover(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHover(0);
    }
  };

  return (
    <div className="star-rating-container">
      <div 
        className={`star-rating ${readOnly ? 'read-only' : 'interactive'}`}
        aria-label={`Rating: ${rating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((value) => {
          const isFilled = (hover || rating) >= value;
          
          return (
            <span
              key={value}
              className={`star ${isFilled ? 'filled' : 'empty'}`}
              onClick={() => handleClick(value)}
              onMouseEnter={() => handleMouseEnter(value)}
              onMouseLeave={handleMouseLeave}
              style={{ fontSize: sizes[size], cursor: readOnly ? 'default' : 'pointer' }}
              role={readOnly ? 'img' : 'button'}
              aria-label={`${value} star${value !== 1 ? 's' : ''}`}
            >
              {isFilled ? '★' : '☆'}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="rating-value">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
