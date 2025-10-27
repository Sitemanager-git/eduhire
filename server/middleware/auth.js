/**
 * Authentication Middleware - Fixed Version
 * Properly exports authenticate function
 * Features: JWT verification, request user attachment, error handling
 */

const jwt = require('jsonwebtoken');

/**
 * Authenticate Middleware
 * Verifies JWT token from Authorization header
 * Attaches decoded user data to req.user
 */
const authenticate = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({
                error: 'No authorization header provided',
                message: 'Token required for authentication'
            });
        }

        // Extract token from "Bearer TOKEN" format
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                error: 'Invalid token format',
                message: 'Authorization header must be: Bearer <token>'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user data to request
        req.user = decoded; // Contains: { id, email, userType, iat, exp }

        // Continue to next middleware
        next();

    } catch (err) {
        console.error('Authentication error:', err.message);

        // Different error messages for different scenarios
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

        // Generic error
        res.status(401).json({
            error: 'Authentication failed',
            message: 'Unable to authenticate. Please try logging in again.'
        });
    }
};

// CORRECT EXPORT - Using named export
module.exports = { authenticate };

// Alternative: If you prefer default export instead, use:
// module.exports = authenticate;
