// authMiddleware.js - Alias file for authentication middleware
// This file acts as an adapter/bridge between old naming (auth.js)
// and new naming convention (authMiddleware.js with protect function)

const { authenticate } = require('./auth');

/**
 * protect middleware - alias for authenticate
 * Used in new route files for Day 10-13 features
 * Maintains backward compatibility with existing code
 */
const protect = authenticate;

// Export both names for flexibility
module.exports = {
  authenticate,  // For existing code using auth.js
  protect        // For new code using authMiddleware.js
};
