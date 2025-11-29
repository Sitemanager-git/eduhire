import React, { useEffect, useState } from 'react';
import { Alert, Button, Progress, Space } from 'antd';
import { CheckCircleOutlined, ExclamationOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

/**
 * ProfileCompletionAlert Component
 * Shows a friendly notification to new users to complete their profile
 * Calculates completion percentage based on user data
 */
const ProfileCompletionAlert = ({ user, userType }) => {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Debug: Log user data changes
  useEffect(() => {
    console.log('🔍 ProfileCompletionAlert received user update:', {
      email: user?.email,
      profileComplete: user?.profileComplete,
      profileCompleted: user?.profileCompleted,
      fullName: user?.fullName,
      resume: user?.resume,
      profilePicture: user?.profilePicture
    });

    // Also check localStorage for latest data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        console.log('💾 localStorage user data:', {
          profileComplete: parsed.profileComplete,
          profileCompleted: parsed.profileCompleted
        });
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
  }, [user]);

  if (!user || !userType) return null;

  // Get the most current user data - prefer context but check localStorage as fallback
  const getCurrentUserData = () => {
    let currentUser = user;
    
    // If user object doesn't have completion flags, try to get from localStorage
    if (!currentUser.profileComplete && !currentUser.profileCompleted) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.profileComplete || parsed.profileCompleted) {
            console.log('📥 Using profileComplete flag from localStorage');
            currentUser = { ...currentUser, ...parsed };
          }
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
    }

    return currentUser;
  };

  const currentUser = getCurrentUserData();

  // Calculate profile completion percentage
  const getCompletionPercentage = () => {
    // First check if backend has marked profile as complete
    if (currentUser.profileComplete || currentUser.profileCompleted) {
      console.log('✓ Profile complete flag detected:', { profileComplete: currentUser.profileComplete, profileCompleted: currentUser.profileCompleted });
      return 100;
    }

    if (userType === 'teacher') {
      const fields = [
        currentUser.fullName,
        currentUser.subject,
        currentUser.experience !== undefined && currentUser.experience !== null,
        currentUser.qualifications,
        currentUser.resume || currentUser.profilePicture
      ];
      const completed = fields.filter(Boolean).length;
      return Math.round((completed / fields.length) * 100);
    } else if (userType === 'institution') {
      const fields = [
        currentUser.institutionName,
        currentUser.city,
        currentUser.country,
        currentUser.description
      ];
      const completed = fields.filter(Boolean).length;
      return Math.round((completed / fields.length) * 100);
    }
    return 0;
  };

  const completionPercentage = getCompletionPercentage();
  const isProfileComplete = completionPercentage === 100;

  if (isProfileComplete) {
    return (
      <Alert
        message="✅ Profile Complete"
        description="Great! Your profile is fully set up. You're all set to start exploring opportunities."
        type="success"
        icon={<CheckCircleOutlined />}
        showIcon
        style={{ marginBottom: '16px' }}
        closable
      />
    );
  }

  const profileRoute = userType === 'teacher' 
    ? '/create-teacher-profile' 
    : '/create-institution-profile';

  return (
    <Alert
      message="📋 Complete Your Profile"
      description={
        <div>
          <p style={{ marginBottom: '12px' }}>
            Your profile is {completionPercentage}% complete. Finish setting it up to unlock all features!
          </p>
          <Progress 
            percent={completionPercentage} 
            status={completionPercentage < 100 ? 'active' : 'success'}
            style={{ marginBottom: '12px' }}
          />
          <Space>
            <Button 
              type="primary" 
              size="small"
              onClick={() => navigate(profileRoute)}
            >
              Complete Profile
            </Button>
            <span style={{ fontSize: '12px', color: '#666' }}>
              {100 - completionPercentage}% to go!
            </span>
          </Space>
        </div>
      }
      type="warning"
      icon={<ExclamationOutlined />}
      showIcon
      style={{ marginBottom: '16px' }}
      closable
    />
  );
};

export default ProfileCompletionAlert;
