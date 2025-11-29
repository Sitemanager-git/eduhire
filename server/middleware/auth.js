/**
 * Authentication Middleware - Production Ready & Fixed
 * Verifies JWT tokens and attaches user data to request
 * Version: 2.2 (November 9, 2025 - Day 14 Corrections)
 */

const jwt = require('jsonwebtoken');

/**
 * Authenticate Middleware
 * Verifies JWT token from Authorization header
 * Attaches decoded user data to req.user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticate = (req, res, next) => {
  try {
    console.log('🔐 [AUTH] Request to:', req.path);
    console.log('🔐 [AUTH] Method:', req.method);
    
    // Get token from Authorization header using Express method (case-insensitive)
    const authHeader = req.header('Authorization');
    
    console.log('🔐 [AUTH] Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'No authorization header provided',
        message: 'Token required for authentication'
      });
    }
    
    // Extract token from "Bearer TOKEN" format with proper validation
    const parts = authHeader.split(' ');
    
    // Validate Bearer prefix and token existence
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        error: 'Invalid token format',
        message: 'Authorization header must be: Bearer <token>'
      });
    }
    
    const token = parts[1];
    
    // Verify token is not empty or whitespace
    if (!token || token.trim() === '') {
      return res.status(401).json({ 
        error: 'No token provided',
        message: 'Token is required'
      });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      userType: decoded.userType
    };
    console.log('🔐 [AUTH] Token decoded successfully');
    console.log('🔐 [AUTH] User ID:', decoded.id);
    console.log('🔐 [AUTH] User type:', decoded.userType);
    
    // Attach user data to request
    // Contains: id, email, userType, iat (issued at), exp (expires)
    req.user = decoded;
    
    // Continue to next middleware
    next();
    
  } catch (err) {
    console.error('❌ [AUTH] Authentication error:', err.message);
    
    // Handle different JWT error types with specific messages
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Your session has expired. Please login again.'
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'The provided token is invalid.'
      });
    }
    
    // Generic authentication error
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Unable to authenticate. Please try logging in again.'
    });
  }
};

// CORRECT EXPORT - Named export (matches routes import)
module.exports = { authenticate };

/**
 * USAGE IN ROUTES:
 * const { authenticate } = require('../middleware/auth');
 * router.get('/protected', authenticate, controller.method);
 */