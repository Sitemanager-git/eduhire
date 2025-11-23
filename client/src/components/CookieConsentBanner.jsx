import React, { useState, useEffect } from 'react';
import { Button, Space, Checkbox } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import '../styles/cookie-banner.css';

/**
 * Cookie Consent Banner Component
 * Displays cookie consent notice and allows users to accept/reject cookies
 */
const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always enabled
    analytics: false,
    marketing: false,
    personalization: false
  });

  // Check if user has already made a choice
  useEffect(() => {
    const hasConsent = localStorage.getItem('cookieConsent');
    if (!hasConsent) {
      setVisible(true);
    } else {
      const savedPreferences = JSON.parse(hasConsent);
      setPreferences(savedPreferences);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    setVisible(false);
    
    // Load analytics if accepted
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted'
      });
    }
  };

  const handleRejectAll = () => {
    const rejected = {
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookieConsent', JSON.stringify(rejected));
    setPreferences(rejected);
    setVisible(false);
    
    // Disable analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied'
      });
    }
  };

  const handleSavePreferences = () => {
    const customPreferences = {
      ...preferences,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookieConsent', JSON.stringify(customPreferences));
    setVisible(false);
    
    // Update consent based on preferences
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': preferences.analytics ? 'granted' : 'denied',
        'ad_storage': preferences.marketing ? 'granted' : 'denied'
      });
    }
  };

  const handlePreferenceChange = (cookieType) => {
    if (cookieType === 'essential') return; // Essential cannot be disabled
    setPreferences(prev => ({
      ...prev,
      [cookieType]: !prev[cookieType]
    }));
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner-overlay">
      <div className="cookie-banner">
        <button
          className="cookie-close-btn"
          onClick={handleRejectAll}
          aria-label="Close cookie banner"
        >
          <CloseOutlined />
        </button>

        <div className="cookie-content">
          <h3>🍪 We Value Your Privacy</h3>
          
          <p className="cookie-description">
            We use cookies to enhance your experience, analyze site traffic, and personalize content. 
            By clicking "Accept All," you consent to all types of cookies.
          </p>

          <div className="cookie-preferences">
            <div className="preference-item">
              <Checkbox
                checked={preferences.essential}
                disabled
                className="preference-essential"
              >
                <span>
                  <strong>Essential Cookies</strong>
                  <br />
                  <small>Required for site functionality (always enabled)</small>
                </span>
              </Checkbox>
            </div>

            <div className="preference-item">
              <Checkbox
                checked={preferences.analytics}
                onChange={() => handlePreferenceChange('analytics')}
              >
                <span>
                  <strong>Analytics Cookies</strong>
                  <br />
                  <small>Help us understand how you use our site</small>
                </span>
              </Checkbox>
            </div>

            <div className="preference-item">
              <Checkbox
                checked={preferences.marketing}
                onChange={() => handlePreferenceChange('marketing')}
              >
                <span>
                  <strong>Marketing Cookies</strong>
                  <br />
                  <small>Used for personalized advertising and retargeting</small>
                </span>
              </Checkbox>
            </div>

            <div className="preference-item">
              <Checkbox
                checked={preferences.personalization}
                onChange={() => handlePreferenceChange('personalization')}
              >
                <span>
                  <strong>Personalization Cookies</strong>
                  <br />
                  <small>Remember your preferences and settings</small>
                </span>
              </Checkbox>
            </div>
          </div>

          <p className="cookie-info">
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
              Learn more about our privacy practices
            </a>
          </p>

          <Space className="cookie-buttons" wrap>
            <Button
              type="primary"
              size="large"
              onClick={handleAcceptAll}
              className="cookie-accept-all"
            >
              Accept All
            </Button>
            <Button
              size="large"
              onClick={handleRejectAll}
              className="cookie-reject-all"
            >
              Reject Non-Essential
            </Button>
            <Button
              type="default"
              size="large"
              onClick={handleSavePreferences}
              className="cookie-save-preferences"
            >
              Save Preferences
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
