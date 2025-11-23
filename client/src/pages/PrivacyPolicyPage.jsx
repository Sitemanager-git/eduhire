import React, { useEffect } from 'react';
import { Button, Divider } from 'antd';
import useSEO from '../hooks/useSEO';
import '../styles/legal.css';

const PrivacyPolicyPage = () => {
  useSEO({
    title: 'Privacy Policy',
    description: 'Eduhire Privacy Policy - Learn how we collect, use, and protect your data in compliance with DPDP Act and Indian regulations.',
    keywords: 'privacy policy, data protection, personal information, DPDP Act',
    canonicalUrl: 'https://eduhire.com/privacy-policy'
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page privacy-policy-page">
      <div className="legal-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: November 20, 2025</p>

        <div className="legal-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Eduhire ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our website and services (the "Service").
            </p>
            <p>
              This Privacy Policy is designed to help you understand our privacy practices and your rights under the Digital Personal Data Protection Act (DPDP Act), 2023, and other applicable Indian data protection laws.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>

            <h3>2.1 Information You Provide Directly</h3>
            <ul>
              <li><strong>Account Registration:</strong> Name, email address, phone number, password, profile picture</li>
              <li><strong>Profile Information:</strong> Education, experience, qualifications, resume, job preferences, institution details</li>
              <li><strong>Application Information:</strong> Cover letters, job preferences, application history</li>
              <li><strong>Payment Information:</strong> Credit/debit card details, UPI ID (processed through Razorpay)</li>
              <li><strong>Communication:</strong> Messages, feedback, support inquiries, survey responses</li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <ul>
              <li><strong>Device Information:</strong> Browser type, IP address, device type, operating system</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent, clicks, searches, interactions</li>
              <li><strong>Cookies:</strong> Persistent identifiers for authentication and preferences</li>
              <li><strong>Location Data:</strong> General location (city/state) based on IP address</li>
            </ul>

            <h3>2.3 Information from Third Parties</h3>
            <ul>
              <li>Social media profiles (if you link your account)</li>
              <li>Verification services and background check providers</li>
              <li>Analytics and advertising partners</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use your personal data for the following purposes:</p>
            <ul>
              <li>Providing and improving our Service</li>
              <li>Creating and managing your account</li>
              <li>Processing payments and subscriptions</li>
              <li>Matching teachers with job opportunities</li>
              <li>Sending notifications and updates</li>
              <li>Responding to your inquiries</li>
              <li>Personalizing your experience</li>
              <li>Compliance with legal obligations</li>
              <li>Fraud detection and security</li>
              <li>Analytics and improvement</li>
              <li>Marketing communications (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2>4. Legal Basis for Processing (DPDP Act)</h2>
            <p>Under the Digital Personal Data Protection Act, 2023, we process your data based on:</p>
            <ul>
              <li><strong>Consent:</strong> You have explicitly given consent for data processing</li>
              <li><strong>Contract:</strong> Processing is necessary to fulfill our service contract with you</li>
              <li><strong>Legal Obligation:</strong> We are required by law to process certain data</li>
              <li><strong>Legitimate Interest:</strong> We have legitimate business interests that don't override your rights</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Retention</h2>
            <ul>
              <li><strong>Account Information:</strong> Retained while your account is active and for 2 years after deletion</li>
              <li><strong>Payment Records:</strong> Retained for 7 years (as required by Indian tax laws)</li>
              <li><strong>Application History:</strong> Retained for 2 years</li>
              <li><strong>Support Communications:</strong> Retained for 1 year</li>
              <li><strong>Cookies:</strong> Retained for up to 2 years</li>
            </ul>
          </section>

          <section>
            <h2>6. Data Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Educational Institutions:</strong> Your profile and application information (with your consent)</li>
              <li><strong>Service Providers:</strong> Payment processors, email services, hosting providers</li>
              <li><strong>Analytics Partners:</strong> Google Analytics, social media platforms</li>
              <li><strong>Legal Requirements:</strong> Law enforcement, courts, government agencies</li>
              <li><strong>Business Partners:</strong> Only with your explicit consent</li>
            </ul>
            <p><strong>Note:</strong> We do NOT sell your personal data to third parties.</p>
          </section>

          <section>
            <h2>7. Your Rights Under DPDP Act</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
              <li><strong>Grievance Redressal:</strong> File a complaint with our Data Protection Officer</li>
              <li><strong>Portability:</strong> Request your data in a portable format</li>
            </ul>
            <p>To exercise these rights, contact us at <a href="mailto:privacy@eduhire.com">privacy@eduhire.com</a></p>
          </section>

          <section>
            <h2>8. Data Security</h2>
            <p>We implement industry-standard security measures including:</p>
            <ul>
              <li>SSL/TLS encryption for data in transit</li>
              <li>AES-256 encryption for data at rest</li>
              <li>Regular security audits and penetration testing</li>
              <li>Access controls and authentication</li>
              <li>Secure password hashing (bcrypt)</li>
              <li>Regular security updates and patches</li>
              <li>Employee confidentiality agreements</li>
            </ul>
            <p><strong>Note:</strong> No method of transmission is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2>9. Cookies and Tracking Technologies</h2>
            <p>We use cookies for:</p>
            <ul>
              <li>Authentication and session management</li>
              <li>Remembering your preferences</li>
              <li>Analytics and performance monitoring</li>
              <li>Advertising and retargeting</li>
            </ul>
            <p>You can control cookie settings through your browser preferences.</p>
          </section>

          <section>
            <h2>10. Third-Party Links</h2>
            <p>
              Our Service may contain links to third-party websites. We are not responsible for the privacy practices of external sites. Please review their privacy policies before sharing your information.
            </p>
          </section>

          <section>
            <h2>11. Children's Privacy</h2>
            <p>
              Eduhire is not intended for children under 18 years old. We do not knowingly collect data from children. If we become aware of such collection, we will delete the data immediately.
            </p>
          </section>

          <section>
            <h2>12. International Data Transfer</h2>
            <p>
              Your data is stored in India and processed in compliance with Indian law. If we transfer data internationally, we ensure adequate safeguards are in place.
            </p>
          </section>

          <section>
            <h2>13. Data Protection Officer</h2>
            <p>
              For privacy-related inquiries, grievances, or to exercise your rights under the DPDP Act:
            </p>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:privacy@eduhire.com">privacy@eduhire.com</a></li>
              <li><strong>Address:</strong> Eduhire India, 123 Education Street, Bangalore 560001</li>
              <li><strong>Response Time:</strong> We will respond within 30 days</li>
            </ul>
          </section>

          <section>
            <h2>14. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Continued use of Eduhire constitutes your acceptance of the revised Privacy Policy.
            </p>
          </section>

          <section>
            <h2>15. Contact Us</h2>
            <p>For questions about this Privacy Policy, please contact:</p>
            <div className="contact-info">
              <p><strong>Eduhire Privacy Team</strong></p>
              <p>Email: <a href="mailto:privacy@eduhire.com">privacy@eduhire.com</a></p>
              <p>Phone: <a href="tel:+919876543210">+91 9876 543 210</a></p>
              <p>Address: 123 Education Street, Bangalore, India 560001</p>
            </div>
          </section>

          <Divider />
          <p className="policy-footer">
            This Privacy Policy is compliant with the Digital Personal Data Protection Act, 2023, and other applicable Indian data protection laws.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
