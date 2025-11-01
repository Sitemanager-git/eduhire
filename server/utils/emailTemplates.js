/**
 * Email Templates - Dynamic HTML email generation
 * Replace {{variables}} with actual data
 */

const renderTemplate = (templateName, data) => {
  const templates = {
    // 1. WELCOME EMAIL - TEACHER
    'welcome-teacher': `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Eduhire!</h1>
          </div>
          <div class="content">
            <h2>Hello {{name}},</h2>
            <p>Thank you for joining Eduhire - India's premier teacher recruitment platform!</p>
            <p>You've successfully registered as a teacher. Here's what you can do next:</p>
            <ul>
              <li>Complete your profile with qualifications and experience</li>
              <li>Browse thousands of teaching positions across India</li>
              <li>Apply to jobs with one click</li>
              <li>Track your applications in real-time</li>
            </ul>
            <a href="{{profileUrl}}" class="button">Complete Your Profile</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br><strong>The Eduhire Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Eduhire. All rights reserved.</p>
            <p>This email was sent to {{email}}</p>
          </div>
        </div>
      </body>
      </html>
    `,

    // 2. WELCOME EMAIL - INSTITUTION
    'welcome-institution': `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Eduhire!</h1>
          </div>
          <div class="content">
            <h2>Hello {{institutionName}},</h2>
            <p>Thank you for joining Eduhire as a recruiting institution!</p>
            <p>Your account has been successfully created. Get started by:</p>
            <ul>
              <li>Completing your institution profile</li>
              <li>Posting your first job opening</li>
              <li>Searching our database of qualified teachers</li>
              <li>Managing applications efficiently</li>
            </ul>
            <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
            <p>Need help? Our team is here to assist you.</p>
            <p>Best regards,<br><strong>The Eduhire Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Eduhire. All rights reserved.</p>
            <p>This email was sent to {{email}}</p>
          </div>
        </div>
      </body>
      </html>
    `,

    // 3. APPLICATION SUBMITTED - TEACHER
    'application-submitted': `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .job-details { background: white; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Application Submitted!</h1>
          </div>
          <div class="content">
            <h2>Hi {{teacherName}},</h2>
            <p>Your application has been successfully submitted!</p>
            <div class="job-details">
              <h3>{{jobTitle}}</h3>
              <p><strong>Institution:</strong> {{institutionName}}</p>
              <p><strong>Location:</strong> {{location}}</p>
              <p><strong>Submitted:</strong> {{submittedDate}}</p>
            </div>
            <p>The institution will review your application and contact you if selected. You can track your application status in your dashboard.</p>
            <a href="{{applicationsUrl}}" class="button">View My Applications</a>
            <p>Good luck!</p>
            <p>Best regards,<br><strong>The Eduhire Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Eduhire. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    // 4. APPLICATION RECEIVED - INSTITUTION
    'application-received': `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .applicant-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Application Received</h1>
          </div>
          <div class="content">
            <h2>Hello {{institutionName}},</h2>
            <p>You have received a new application for your job posting:</p>
            <div class="applicant-card">
              <h3>{{jobTitle}}</h3>
              <p><strong>Applicant:</strong> {{teacherName}}</p>
              <p><strong>Experience:</strong> {{experience}} years</p>
              <p><strong>Education:</strong> {{education}}</p>
              <p><strong>Applied on:</strong> {{appliedDate}}</p>
            </div>
            <p>Review the application and candidate profile in your dashboard.</p>
            <a href="{{reviewUrl}}" class="button">Review Application</a>
            <p>Best regards,<br><strong>The Eduhire Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Eduhire. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    // 5. PASSWORD RESET
    'password-reset': `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi {{name}},</h2>
            <p>We received a request to reset your password for your Eduhire account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="{{resetUrl}}" class="button">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong></p>
              <p>If you did not request this password reset, please ignore this email and your password will remain unchanged. Someone may have entered your email by mistake.</p>
            </div>
            <p>Best regards,<br><strong>The Eduhire Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Eduhire. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    // 6. PASSWORD CHANGED
    'password-changed': `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Password Changed</h1>
          </div>
          <div class="content">
            <h2>Hi {{name}},</h2>
            <p>Your password has been successfully changed.</p>
            <p><strong>Changed on:</strong> {{changedDate}}</p>
            <p>If you did not make this change, please contact our support team immediately.</p>
            <p>Best regards,<br><strong>The Eduhire Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Eduhire. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  let html = templates[templateName] || '<p>Template not found</p>';

  // Replace all {{variables}} with actual data
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, data[key] || '');
  });

  return html;
};

module.exports = { renderTemplate };
