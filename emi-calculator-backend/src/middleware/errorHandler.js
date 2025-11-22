/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent error responses
 * Handles validation errors, auth errors, and server errors
 * Logs errors without exposing internals to clients
 */

/**
 * Error handler middleware
 * Must be registered after all routes
 * 
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  // Log error details for debugging (server-side only)
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred';
  let errors = err.errors || undefined;

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = {};
    
    // Extract field-specific error messages
    Object.keys(err.errors).forEach(key => {
      errors[key] = err.errors[key].message;
    });
  }

  // Handle Mongoose duplicate key errors (e.g., unique email)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Validation failed';
    errors = {};
    
    // Extract the field that caused the duplicate error
    const field = Object.keys(err.keyPattern)[0];
    errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Handle Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    // For plan ID in URL params, use more user-friendly message
    if (err.path === '_id') {
      message = 'Invalid plan ID format';
    } else {
      message = `Invalid ${err.path} format`;
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please log in again.';
  }

  // Handle MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    statusCode = 503;
    message = 'Service temporarily unavailable. Please try again later.';
  }

  // For 500 errors, don't expose internal error details to client
  if (statusCode === 500) {
    message = 'An unexpected error occurred. Please try again later.';
    // Don't send errors object for 500 errors to avoid exposing internals
    errors = undefined;
  }

  // Send consistent error response
  const response = {
    message
  };

  // Only include errors object if it exists and has properties
  if (errors && Object.keys(errors).length > 0) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
}

/**
 * 404 Not Found handler
 * Handles requests to undefined routes
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Route ${req.method} ${req.path} not found`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
