/**
 * InstitutionProfileGuard - Protects routes requiring institution profile
 * Checks if institution has completed their profile
 * Redirects to profile completion if not
 */

import React, { useState, useEffect } from 'react';
import { Spin, Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { institutionAPI } from '../../services/api';

const InstitutionProfileGuard = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        // Only check for institutions
        if (!isAuthenticated || user?.userType !== 'institution') {
          setLoading(false);
          return;
        }

        console.log('🔍 Checking institution profile...');
        
        // Call new endpoint
        const response = await institutionAPI.checkProfileStatus();
        
        console.log('Profile check result:', response.data);

        if (response.data.success) {
          if (response.data.hasProfile && response.data.isComplete) {
            console.log('✓ Institution profile is complete');
            setHasProfile(true);
          } else {
            console.warn('⚠️ Institution profile incomplete');
            setHasProfile(false);
            setProfileError({
              message: 'Complete Your Institution Profile',
              description: 'You need to complete your institution profile before accessing this feature.'
            });
          }
        }
      } catch (error) {
        console.error('Profile check error:', error);
        setProfileError({
          message: 'Unable to Verify Profile',
          description: 'There was an error checking your profile. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [isAuthenticated, user?.userType]);

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <Spin tip="Checking profile..." size="large" />
      </div>
    );
  }

  // Profile incomplete
  if (profileError) {
    return (
      <Result
        status="info"
        title={profileError.message}
        subTitle={profileError.description}
        extra={
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/create-institution-profile')}
          >
            Complete Profile Now
          </Button>
        }
      />
    );
  }

  // Profile complete - show children
  if (hasProfile) {
    return children;
  }

  // Default - no profile
  return null;
};

export default InstitutionProfileGuard;