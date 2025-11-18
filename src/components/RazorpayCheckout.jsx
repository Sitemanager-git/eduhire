import React from 'react';
import { Button, message } from 'antd';

const RazorpayCheckout = ({ plan }) => {
  const handlePayment = async () => {
    // Here you would integrate Razorpay checkout
    // For now, just mock success
    message.success(`Payment for ${plan} plan successful!`);
  };

  return (
    <Button type="primary" onClick={handlePayment}>
      Pay with Razorpay
    </Button>
  );
};

export default RazorpayCheckout;
