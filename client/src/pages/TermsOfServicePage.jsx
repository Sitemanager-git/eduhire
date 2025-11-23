import React, { useEffect } from 'react';
import { Divider } from 'antd';
import useSEO from '../hooks/useSEO';
import '../styles/legal.css';

const TermsOfServicePage = () => {
  useSEO({
    title: 'Terms of Service',
    description: 'Eduhire Terms of Service - Read the terms and conditions for using our educational job platform.',
    keywords: 'terms of service, terms and conditions, user agreement, legal',
    canonicalUrl: 'https://eduhire.com/terms-of-service'
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page terms-page">
      <div className="legal-container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: November 20, 2025</p>
        <p className="legal-notice">Effective Date: November 20, 2025</p>

        <div className="legal-content">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Eduhire's website and services ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service. We reserve the right to modify these Terms at any time. Your continued use of the Service constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              Eduhire is an online platform that connects teachers and educational institutions. We facilitate job posting, job searching, and application submissions. We do not guarantee any employment outcomes or job placements.
            </p>
          </section>

          <section>
            <h2>3. User Eligibility</h2>
            <ul>
              <li>You must be at least 18 years old to use Eduhire</li>
              <li>You must have the legal right to work in India</li>
              <li>You cannot be a competitor of Eduhire</li>
              <li>You agree to provide accurate and complete information</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            </ul>
          </section>

          <section>
            <h2>4. User Accounts</h2>
            <h3>4.1 Account Creation</h3>
            <p>
              To use Eduhire, you must create an account with accurate information. You are responsible for all activities under your account.
            </p>
            <h3>4.2 Account Security</h3>
            <ul>
              <li>You are responsible for maintaining your password confidentiality</li>
              <li>You agree to notify us immediately of unauthorized access</li>
              <li>Eduhire is not liable for unauthorized account access due to your negligence</li>
            </ul>
            <h3>4.3 Account Suspension</h3>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms or our policies.
            </p>
          </section>

          <section>
            <h2>5. User Responsibilities</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Post false, misleading, or fraudulent information</li>
              <li>Harass, discriminate, or threaten other users</li>
              <li>Post sexually explicit or offensive content</li>
              <li>Attempt to hack or compromise platform security</li>
              <li>Scrape or bulk download data from the platform</li>
              <li>Use automated bots or scripts to access the Service</li>
              <li>Engage in illegal activities</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Spam or send unsolicited messages</li>
            </ul>
          </section>

          <section>
            <h2>6. Job Postings</h2>
            <h3>6.1 Institution Obligations</h3>
            <p>Institutions posting jobs agree to:</p>
            <ul>
              <li>Post only legitimate job opportunities</li>
              <li>Provide accurate job descriptions and requirements</li>
              <li>Comply with all employment laws</li>
              <li>Not discriminate based on protected characteristics</li>
              <li>Not collect payment from job applicants</li>
            </ul>
            <h3>6.2 Job Posting Removal</h3>
            <p>
              Eduhire reserves the right to remove any job posting that violates these Terms or applicable laws.
            </p>
          </section>

          <section>
            <h2>7. Applications and Submissions</h2>
            <h3>7.1 Teacher Obligations</h3>
            <p>Teachers agree to:</p>
            <ul>
              <li>Provide accurate and truthful information in applications</li>
              <li>Not submit false credentials or qualifications</li>
              <li>Not apply for positions they are unqualified for</li>
              <li>Respect the institutions' time and processes</li>
            </ul>
            <h3>7.2 Communication</h3>
            <p>
              Direct communication between teachers and institutions may occur. Eduhire is not liable for any disputes arising from these communications.
            </p>
          </section>

          <section>
            <h2>8. Payments and Subscriptions</h2>
            <h3>8.1 Payment Terms</h3>
            <ul>
              <li>All fees are in Indian Rupees (INR)</li>
              <li>Payments are processed through Razorpay (certified payment processor)</li>
              <li>All sales are final; refunds are subject to our Refund Policy</li>
            </ul>
            <h3>8.2 Subscription Auto-Renewal</h3>
            <ul>
              <li>Subscriptions automatically renew unless canceled</li>
              <li>You will receive email notification before each renewal</li>
              <li>Cancellation takes effect at the end of your billing period</li>
            </ul>
            <h3>8.3 Failed Payments</h3>
            <p>
              If payment fails, we will notify you. Your account access may be suspended if payment is not made within 5 days.
            </p>
          </section>

          <section>
            <h2>9. Intellectual Property Rights</h2>
            <p>
              All content on Eduhire (including logos, design, text, graphics) is owned by or licensed to Eduhire. You may not reproduce, distribute, or transmit this content without our permission.
            </p>
            <p>
              User-generated content (profiles, resumes, job posts) remain your property, but you grant Eduhire a non-exclusive license to use this content for platform operations.
            </p>
          </section>

          <section>
            <h2>10. Disclaimers</h2>
            <h3>10.1 No Employment Guarantee</h3>
            <p>
              Eduhire provides a platform for job matching but does not guarantee employment or job offers.
            </p>
            <h3>10.2 Accuracy</h3>
            <p>
              While we strive for accuracy, Eduhire does not guarantee that all information on the platform is accurate or complete.
            </p>
            <h3>10.3 Third-Party Content</h3>
            <p>
              Eduhire is not responsible for third-party content, links, or services.
            </p>
          </section>

          <section>
            <h2>11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Eduhire shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the Service.
            </p>
            <p>
              Our total liability is limited to the amount you paid us in the last 12 months.
            </p>
          </section>

          <section>
            <h2>12. Indemnification</h2>
            <p>
              You agree to indemnify and hold Eduhire harmless from any claims, damages, or legal fees arising from your violation of these Terms or any applicable law.
            </p>
          </section>

          <section>
            <h2>13. Dispute Resolution</h2>
            <h3>13.1 Governing Law</h3>
            <p>
              These Terms are governed by the laws of India, specifically the laws applicable in Bangalore, Karnataka.
            </p>
            <h3>13.2 Arbitration</h3>
            <p>
              Any disputes shall be resolved through arbitration in Bangalore, India, as per the Arbitration and Conciliation Act, 1996.
            </p>
          </section>

          <section>
            <h2>14. Termination</h2>
            <p>
              Eduhire may terminate or suspend your account immediately if you violate these Terms. Upon termination, your access to the Service will cease.
            </p>
          </section>

          <section>
            <h2>15. Privacy</h2>
            <p>
              Your use of Eduhire is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
            </p>
          </section>

          <section>
            <h2>16. Modifications to Service</h2>
            <p>
              Eduhire reserves the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice.
            </p>
          </section>

          <section>
            <h2>17. Severability</h2>
            <p>
              If any provision of these Terms is found to be invalid, the remaining provisions shall continue in full force and effect.
            </p>
          </section>

          <section>
            <h2>18. Contact Information</h2>
            <p>
              For questions about these Terms, please contact:
            </p>
            <div className="contact-info">
              <p><strong>Eduhire Legal Team</strong></p>
              <p>Email: <a href="mailto:legal@eduhire.com">legal@eduhire.com</a></p>
              <p>Address: 123 Education Street, Bangalore, India 560001</p>
            </div>
          </section>

          <Divider />
          <p className="policy-footer">
            By using Eduhire, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
