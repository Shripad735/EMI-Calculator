const jwt = require('jsonwebtoken');

/**
 * JWT token utility functions
 */

/**
 * Generate a JWT token for a user
 * @param {string} userId - The user's ID
 * @returns {string} The JWT token
 */
function generateToken(userId) {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  const payload = {
    userId: userId
  };

  const options = {
    expiresIn: '7d' // Token expires in 7 days
  };

  return jwt.sign(payload, secret, options);
}

/**
 * Verify and decode a JWT token
 * @param {string} token - The JWT token
 * @returns {object} The decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.verify(token, secret);
}

module.exports = {
  generateToken,
  verifyToken
};
