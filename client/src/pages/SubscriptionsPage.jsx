import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  List,
  Badge,
  Spin,
  message,
  Modal,
  Typography,
  Divider,
  Tag,
} from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { paymentAPI } from '../services/api';

/**
 * Subscription Tiers Configuration
 */
const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    duration: '90 days',
    jobPostings: 3,
    color: '#d9d9d9',
    features: [
      { name: 'Basic job search', included: true },
      { name: 'Up to 3 job postings', included: true },
      { name: 'Limited applications', included: true },
      { name: 'Email support', included: true },
      { name: 'Priority support', included: false },
      { name: 'Unlimited postings', included: false },
    ],
  },
  basic: {
    name: 'Basic',
    price: 99,
    duration: '30 days',
    jobPostings: 10,
    color: '#1890ff',
    features: [
      { name: 'Unlimited applications', included: true },
      { name: 'Up to 10 job postings', included: true },
      { name: 'Profile boost', included: true },
      { name: 'Email support', included: true },
      { name: 'Priority support', included: false },
      { name: 'Unlimited postings', included: false },
    ],
  },
  professional: {
    name: 'Professional',
    price: 299,
    duration: '30 days',
    jobPostings: 30,
    color: '#52c41a',
    features: [
      { name: 'Everything in Basic', included: true },
      { name: 'Up to 30 job postings', included: true },
      { name: 'Dedicated support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Priority support', included: true },
      { name: 'Unlimited postings', included: false },
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 999,
    duration: '30 days',
    jobPostings: 'Unlimited',
    color: '#722ed1',
    features: [
      { name: 'Unlimited job postings', included: true },
      { name: 'Priority support 24/7', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: 'Custom branding', included: true },
    ],
  },
};

const FAQS = [
  {
    q: 'What happens when my plan expires?',
    a: 'Your account will be downgraded to the Free plan and you will lose access to premium features.',
  },
  {
    q: 'Can I upgrade my plan anytime?',
    a: 'Yes! You can upgrade to any higher plan at any time. Changes take effect immediately.',
  },
  {
    q: 'Is payment secure?',
    a: 'All payments are processed securely through Razorpay with industry-standard encryption.',
  },
  {
    q: 'Do I get a refund if I cancel?',
    a: 'Refunds are not provided for unused subscription periods. You can downgrade anytime.',
  },
];

const { Title, Paragraph } = Typography;

/**
 * SubscriptionsPage Component
 */
const SubscriptionsPage = () => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);

  /**
   * Fetch current subscription on component mount
   */
  useEffect(() => {
    fetchCurrentSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Fetch current subscription details from API
   */
  async function fetchCurrentSubscription() {
    try {
      setLoading(true);
      const response = await paymentAPI.getCurrentSubscription();
      const planType = response.data?.subscription?.planType || 'free';
      setCurrentPlan(planType);
      console.log('✓ Current subscription:', planType);
    } catch (error) {
      console.error('❌ Failed to fetch subscription:', error);
      setCurrentPlan('free');
      message.error('Failed to load subscription info. Showing Free plan.');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle subscription upgrade
   */
  async function handleSubscribe(planType) {
    if (planType === currentPlan) {
      message.info('You are already on this plan');
      return;
    }

    setProcessingPlan(planType);
    try {
      console.log('📤 Creating order for plan:', planType);
      const response = await paymentAPI.createOrder(planType);

      const order = response.data?.order;
      if (!order) {
        throw new Error('No order received from server');
      }

      console.log('✓ Order created:', order.id);
      openRazorpayModal(order);
    } catch (error) {
      console.error('❌ Error creating order:', error);
      message.error(error.response?.data?.error || 'Failed to initiate payment');
      setProcessingPlan(null);
    }
  }

  /**
   * Open Razorpay payment modal
   */
  function openRazorpayModal(order) {
    if (!window.Razorpay) {
      message.error('Razorpay SDK not loaded. Please refresh the page.');
      setProcessingPlan(null);
      return;
    }

    const plan = SUBSCRIPTION_TIERS[order.plan];
    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'Eduhire',
      description: `${plan.name} Plan - ${plan.duration}`,
      order_id: order.orderId,
      prefill: {
        name: order.user?.name || '',
        email: order.user?.email || '',
        contact: order.user?.contact || '',
      },
      handler: (response) => {
        console.log('✓ Payment handler called:', response);
        verifyPayment(response);
      },
      theme: {
        color: plan.color,
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('❌ Error opening Razorpay:', error);
      message.error('Failed to open payment modal');
      setProcessingPlan(null);
    }
  }

  /**
   * Verify payment after Razorpay callback
   */
  async function verifyPayment(response) {
    try {
      console.log('🔍 Verifying payment...');
      const verifyResponse = await paymentAPI.verifyPayment({
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });

      if (verifyResponse.data?.success) {
        console.log('✓ Payment verified successfully');
        message.success('Payment successful! Your plan has been upgraded.');
        setProcessingPlan(null);
        // Refresh subscription details
        setTimeout(() => {
          fetchCurrentSubscription();
        }, 1000);
      } else {
        throw new Error(verifyResponse.data?.error || 'Verification failed');
      }
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      message.error('Payment verification failed. Please contact support.');
      setProcessingPlan(null);
    }
  }

  /**
   * Check if a plan is the current active plan
   */
  function isCurrentPlan(planKey) {
    return planKey === currentPlan;
  }

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <Spin size="large" tip="Loading subscription details..." />
      </div>
    );
  }

  /**
   * Render component
   */
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
      {/* Current Plan Banner */}
      {currentPlan && currentPlan !== 'free' && (
        <Card
          style={{
            marginBottom: '32px',
            background: `linear-gradient(135deg, ${SUBSCRIPTION_TIERS[currentPlan].color}22, #fff)`,
            border: `2px solid ${SUBSCRIPTION_TIERS[currentPlan].color}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <Title level={3} style={{ margin: '0 0 8px 0' }}>
                🎯 Current Plan: {SUBSCRIPTION_TIERS[currentPlan].name}
              </Title>
              <Paragraph style={{ margin: 0, color: '#666' }}>
                You have an active {SUBSCRIPTION_TIERS[currentPlan].name} subscription
              </Paragraph>
            </div>
            <Tag color={SUBSCRIPTION_TIERS[currentPlan].color} style={{ padding: '8px 16px' }}>
              Active
            </Tag>
          </div>
        </Card>
      )}

      {/* Pricing Cards */}
      <div style={{ marginBottom: '48px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>
          Choose Your Plan
        </Title>
        <Row gutter={[24, 24]}>
          {Object.entries(SUBSCRIPTION_TIERS).map(([key, plan]) => (
            <Col xs={24} sm={12} lg={6} key={key}>
              <Badge.Ribbon
                text={isCurrentPlan(key) ? '✓ Current' : ''}
                color={isCurrentPlan(key) ? '#52c41a' : '#1890ff'}
              >
                <Card
                  hoverable={!isCurrentPlan(key)}
                  style={{
                    border: `2px solid ${plan.color}`,
                    minHeight: '550px',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: isCurrentPlan(key) ? 1 : 0.9,
                  }}
                >
                  {/* Plan Header */}
                  <div style={{ marginBottom: '16px' }}>
                    <Title level={4} style={{ color: plan.color, margin: '0 0 8px 0' }}>
                      {plan.name}
                    </Title>
                    <Tag color={plan.color}>{plan.duration}</Tag>
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: plan.color }}>
                      ₹{plan.price}
                    </div>
                    {plan.price > 0 && (
                      <Paragraph style={{ margin: '4px 0 0 0', color: '#999', fontSize: '12px' }}>
                        per month
                      </Paragraph>
                    )}
                  </div>

                  {/* Job Postings */}
                  <div style={{ marginBottom: '24px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                    <b>Job Postings:</b> {plan.jobPostings}
                  </div>

                  {/* Features */}
                  <List
                    dataSource={plan.features}
                    renderItem={(feature) => (
                      <List.Item style={{ padding: '8px 0', borderBottom: 'none' }}>
                        {feature.included ? (
                          <CheckOutlined style={{ color: '#52c41a', marginRight: '8px', fontWeight: 'bold' }} />
                        ) : (
                          <CloseOutlined style={{ color: '#d9d9d9', marginRight: '8px' }} />
                        )}
                        <span style={{ color: feature.included ? '#333' : '#bfbfbf' }}>
                          {feature.name}
                        </span>
                      </List.Item>
                    )}
                    style={{ flex: 1 }}
                  />

                  {/* Button */}
                  <Button
                    type={isCurrentPlan(key) ? 'default' : 'primary'}
                    block
                    size="large"
                    style={{ marginTop: '16px', background: isCurrentPlan(key) ? '#fff' : plan.color }}
                    disabled={isCurrentPlan(key)}
                    loading={processingPlan === key}
                    onClick={() => handleSubscribe(key)}
                  >
                    {isCurrentPlan(key) ? '✓ Current Plan' : 'Upgrade Now'}
                  </Button>
                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      </div>

      {/* FAQ Section */}
      <Divider style={{ margin: '48px 0' }} />
      <div>
        <Title level={2} style={{ marginBottom: '24px' }}>
          Frequently Asked Questions
        </Title>
        <Row gutter={[24, 24]}>
          {FAQS.map((faq, index) => (
            <Col xs={24} sm={12} lg={12} key={index}>
              <Card bordered={false} style={{ background: '#fafafa', height: '100%' }}>
                <Title level={5} style={{ margin: '0 0 12px 0', color: '#1890ff' }}>
                  Q: {faq.q}
                </Title>
                <Paragraph style={{ margin: 0, color: '#666', lineHeight: '1.6' }}>
                  {faq.a}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
