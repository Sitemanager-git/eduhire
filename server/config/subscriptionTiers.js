// Subscription Tiers Config


// Subscription Tiers for Eduhire
module.exports = {
  free: {
    price: 0,
    durationDays: 90,
    jobPostingsLimit: 3,
    features: [
      'Basic job search',
      'Limited applications',
      'Up to 3 job postings',
      'Valid for 90 days'
    ]
  },
  basic: {
    price: 99,
    currency: 'INR',
    durationDays: 30,
    jobPostingsLimit: 10,
    features: [
      'Unlimited applications',
      'Profile boost',
      'Up to 10 job postings',
      'Valid for 30 days'
    ]
  },
  professional: {
    price: 299,
    currency: 'INR',
    durationDays: 30,
    jobPostingsLimit: 30,
    features: [
      'Everything in Basic',
      'Up to 30 job postings',
      'Dedicated support',
      'Valid for 30 days'
    ]
  },
  enterprise: {
    price: 999,
    currency: 'INR',
    durationDays: 30,
    jobPostingsLimit: null,
    features: [
      'Unlimited job postings',
      'Priority support',
      'Custom integrations',
      'Valid for 30 days'
    ]
  }
};
