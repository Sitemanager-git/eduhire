import React, { useState } from 'react';
import { Skeleton } from 'antd';

const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '',
  ...props 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div style={{ position: 'relative', width, height }}>
      {loading && (
        <Skeleton.Image 
          active 
          style={{ width: '100%', height: '100%' }} 
        />
      )}
      {error ? (
        <div 
          style={{ 
            width, 
            height, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#f0f0f0',
            color: '#999'
          }}
        >
          Failed to load
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          style={{ 
            display: loading ? 'none' : 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
