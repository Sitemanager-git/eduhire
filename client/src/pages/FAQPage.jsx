import React, { useState } from 'react';
import { Collapse, Button, Space, message } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import useSEO from '../hooks/useSEO';
import '../styles/faq.css';

const FAQPage = () => {
  useSEO({
    title: 'FAQ - Frequently Asked Questions',
    description: 'Find answers to common questions about Eduhire - how to post jobs, apply for positions, subscriptions, and more.',
    keywords: 'FAQ, frequently asked questions, help, support, how to use Eduhire',
    canonicalUrl: 'https://eduhire.com/faq'
  });

  const [expandedKeys, setExpandedKeys] = useState(['1']);

  const faqItems = [
    {
      key: '1',
      label: 'For Teachers',
      children: [
        {
          title: 'How do I create my profile on Eduhire?',
          content: 'Sign up with your email, fill in your qualifications, experience, and subject expertise. Upload your profile photo and resume to make your profile more attractive to institutions.'
        },
        {
          title: 'How do I search and apply for jobs?',
          content: 'Use the Jobs section to filter by location, subject, experience level, and job type. Click on a job posting to view details and submit your application with a cover letter.'
        },
        {
          title: 'What are subscription plans and why do I need them?',
          content: 'While basic features are free, premium subscriptions unlock unlimited applications, priority profile visibility, and exclusive job alerts. Choose the plan that fits your needs.'
        },
        {
          title: 'How do I save jobs for later?',
          content: 'Click the heart icon on any job listing to save it. Access your saved jobs from your dashboard at any time.'
        },
        {
          title: 'Can I set job alerts?',
          content: 'Yes! Save your search criteria and get notified when new jobs matching your preferences are posted.'
        },
        {
          title: 'How is my application reviewed?',
          content: 'Institutions review applications and may contact you directly or through Eduhire. Check your notifications regularly for updates.'
        }
      ]
    },
    {
      key: '2',
      label: 'For Institutions',
      children: [
        {
          title: 'How do I post a job on Eduhire?',
          content: 'Create an institution account, complete your profile, and use the "Post Job" feature. Fill in job details, requirements, and salary. Jobs are reviewed before going live.'
        },
        {
          title: 'What information should I include in a job posting?',
          content: 'Include job title, subject, experience required, salary range, location, job description, qualifications needed, and application deadline. More details attract better candidates.'
        },
        {
          title: 'How much does it cost to post jobs?',
          content: 'Job posting costs depend on your subscription tier. Check our pricing page for details. Premium plans offer unlimited postings.'
        },
        {
          title: 'Can I edit a job posting after publishing?',
          content: 'Yes, you can edit job details at any time from your dashboard. Changes take effect immediately.'
        },
        {
          title: 'How do I review applications?',
          content: 'Visit your dashboard to see all applications. Review candidate profiles, resumes, and cover letters. You can shortlist, reject, or message candidates directly.'
        },
        {
          title: 'Can I delete a job posting?',
          content: 'Yes, you can close or delete job postings anytime. Closed jobs won\'t appear in search but you can still view applications.'
        }
      ]
    },
    {
      key: '3',
      label: 'Account & Security',
      children: [
        {
          title: 'How do I reset my password?',
          content: 'Click "Forgot Password" on the login page. Enter your email, and we\'ll send you a reset link. Follow the instructions to set a new password.'
        },
        {
          title: 'Is my personal information secure?',
          content: 'Yes, we use industry-standard encryption and security measures to protect your data. See our Privacy Policy for details.'
        },
        {
          title: 'Can I delete my account?',
          content: 'Yes, you can request account deletion from your settings. This will remove all your personal data and postings within 30 days.'
        },
        {
          title: 'How do I update my profile information?',
          content: 'Go to your profile settings to edit your name, email, qualifications, experience, and other details. Changes are saved immediately.'
        },
        {
          title: 'What should I do if I forgot my username?',
          content: 'Use the "Forgot Password" option - you can reset it using your registered email address. Your username is typically your email.'
        }
      ]
    },
    {
      key: '4',
      label: 'Payments & Subscriptions',
      children: [
        {
          title: 'What payment methods do you accept?',
          content: 'We accept all major credit/debit cards and UPI payments through Razorpay. Your payment information is secure and encrypted.'
        },
        {
          title: 'Can I upgrade my subscription plan?',
          content: 'Yes, you can upgrade anytime from your subscription settings. You\'ll get a pro-rata credit for your current plan.'
        },
        {
          title: 'Can I cancel my subscription?',
          content: 'Yes, cancel anytime from your subscription page. Your premium features remain active until the end of your billing period.'
        },
        {
          title: 'Will I get a refund if I cancel?',
          content: 'Refunds are issued based on our refund policy. Non-used portion of your subscription may be eligible for refund.'
        },
        {
          title: 'How will I be charged for my subscription?',
          content: 'Subscriptions renew automatically on the same date each month/year. You\'ll receive email confirmation before each charge.'
        }
      ]
    },
    {
      key: '5',
      label: 'Technical Issues',
      children: [
        {
          title: 'The website is not loading properly. What should I do?',
          content: 'Try clearing your browser cache and cookies, then refresh the page. If the issue persists, try a different browser or device.'
        },
        {
          title: 'I didn\'t receive my confirmation email.',
          content: 'Check your spam folder first. If not found, go to your settings and resend the verification email. Contact support if the issue continues.'
        },
        {
          title: 'Can I use Eduhire on my mobile phone?',
          content: 'Yes, Eduhire is fully responsive and works on all devices. You can also access features through our progressive web app.'
        },
        {
          title: 'What browser should I use?',
          content: 'Eduhire works best on Chrome, Firefox, Safari, and Edge (latest versions). For mobile, use your device\'s default browser or our app.'
        }
      ]
    },
    {
      key: '6',
      label: 'Community & Support',
      children: [
        {
          title: 'How do I report a problem or bug?',
          content: 'Use the Contact Us page or email support@eduhire.com with details about the issue. Include screenshots if possible.'
        },
        {
          title: 'Can I give feedback or suggest features?',
          content: 'Yes! We love feedback. Use the Contact Us page to share your ideas and suggestions.'
        },
        {
          title: 'Is there a user community or forum?',
          content: 'We\'re building our community! Follow us on social media for updates and join our mailing list for tips and resources.'
        },
        {
          title: 'How quickly will I get a response from support?',
          content: 'We aim to respond to all inquiries within 24 hours. Premium members get priority support.'
        }
      ]
    }
  ];

  const handleChange = (keys) => {
    setExpandedKeys(keys);
  };

  return (
    <div className="faq-page">
      <div className="faq-container">
        {/* Header */}
        <div className="faq-header">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about using Eduhire</p>
        </div>

        {/* FAQ Sections */}
        <div className="faq-content">
          <Collapse
            items={faqItems.map(section => ({
              key: section.key,
              label: <h3 className="faq-section-title">{section.label}</h3>,
              children: (
                <div className="faq-items">
                  {section.children.map((item, idx) => (
                    <div key={idx} className="faq-item">
                      <h4>{item.title}</h4>
                      <p>{item.content}</p>
                    </div>
                  ))}
                </div>
              )
            }))}
            defaultActiveKey={expandedKeys}
            onChange={handleChange}
            accordion={false}
          />
        </div>

        {/* Contact Section */}
        <div className="faq-contact">
          <h2>Still have questions?</h2>
          <p>Can't find what you're looking for? We're here to help!</p>
          <Space direction="horizontal" wrap size="large">
            <Button type="primary" size="large" icon={<MailOutlined />}>
              Email Us
            </Button>
            <Button size="large" icon={<PhoneOutlined />}>
              Call Support
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
