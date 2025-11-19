// server/middleware/adminAuth.js
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

/**
 * Verify admin JWT token
 */
exports.authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'No authorization header',
        message: 'Admin access denied'
      });
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        error: 'Invalid token format',
        message: 'Authorization header must be: Bearer <token>'
      });
    }
    
    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify this is an admin token
    if (decoded.userType !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'This endpoint requires admin privileges'
      });
    }
    
    // Get admin user
    const admin = await AdminUser.findById(decoded.id).select('-password');
    
    if (!admin) {
      return res.status(401).json({
        error: 'Admin not found',
        message: 'Invalid admin credentials'
      });
    }
    
    if (!admin.isActive) {
      return res.status(403).json({
        error: 'Account disabled',
        message: 'Your admin account has been deactivated'
      });
    }
    
    req.admin = admin;
    next();
    
  } catch (err) {
    console.error('Admin auth error:', err.message);
    
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
    
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Unable to authenticate admin'
    });
  }
};

/**
 * Check specific permission
 */
exports.requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'Admin authentication required'
      });
    }
    
    if (!req.admin.permissions[permission]) {
      return res.status(403).json({
        error: 'Permission denied',
        message: `You don't have permission: ${permission}`
      });
    }
    
    next();
  };
};

/**
 * Check if superadmin
 */
exports.requireSuperAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      error: 'Not authenticated'
    });
  }
  
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({
      error: 'Superadmin access required'
    });
  }
  
  next();
};
