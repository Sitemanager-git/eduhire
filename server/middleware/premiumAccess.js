const Subscription = require("../models/Subscription");

// Check if institution has premium access
exports.requirePremium = (featureName) => {
  return async (req, res, next) => {
    try {
      const subscription = await Subscription.findOne({ 
        institution_id: req.user.id 
      });
      
      if (!subscription) {
        return res.status(403).json({ 
          error: "No subscription found",
          upgrade_required: true
        });
      }
      
      // Feature access mapping
      const featureAccess = {
        export: subscription.features.export_enabled,
        analytics: subscription.features.analytics_access,
        video_interviews: subscription.features.video_interviews,
        bulk_posting: subscription.features.bulk_posting,
        employer_branding: subscription.features.employer_branding
      };
      
      if (!featureAccess[featureName]) {
        return res.status(403).json({ 
          error: `This feature requires ${featureName} access`,
          message: "Please upgrade your subscription",
          upgrade_required: true,
          current_tier: subscription.tier
        });
      }
      
      next();
    } catch (err) {
      console.error("Premium check error:", err);
      res.status(500).json({ error: "Authorization failed" });
    }
  };
};

// Check tier level
exports.requireTier = (minTier) => {
  const tierLevels = {
    free: 0,
    professional: 1,
    premium: 2,
    enterprise: 3
  };
  
  return async (req, res, next) => {
    try {
      const subscription = await Subscription.findOne({ 
        institution_id: req.user.id 
      });
      
      if (!subscription || 
          tierLevels[subscription.tier] < tierLevels[minTier]) {
        return res.status(403).json({ 
          error: `This feature requires ${minTier} tier or higher`,
          current_tier: subscription?.tier || "none",
          upgrade_required: true
        });
      }
      
      req.subscription = subscription;
      next();
    } catch (err) {
      console.error("Tier check error:", err);
      res.status(500).json({ error: "Authorization failed" });
    }
  };
};

module.exports = exports;
