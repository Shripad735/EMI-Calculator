const { verifyToken } = require('../utils/jwt');

/**
 * Authentication middleware to verify JWT tokens
 * Extracts user ID from token and attaches to request
 * Handles missing, invalid, and expired tokens
 */
function authMiddleware(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        message: 'Authentication required. No token provided.'
      });
    }

    // Check if header follows Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Invalid token format. Expected "Bearer <token>".'
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({
        message: 'Authentication required. No token provided.'
      });
    }

    // Verify token and extract payload
    const decoded = verifyToken(token);
    
    // Attach user ID to request object for use in route handlers
    req.userId = decoded.userId;
    
    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Log error for debugging without exposing to client
    console.error('Auth middleware error:', {
      message: error.message,
      name: error.name,
      path: req.path,
      method: req.method,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Handle JWT-specific errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token. Please log in again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token has expired. Please log in again.'
      });
    }
    
    // Handle other errors
    return res.status(401).json({
      message: 'Authentication failed. Please log in again.'
    });
  }
}

module.exports = authMiddleware;

