const bcrypt = require('bcryptjs');

/**
 * Password hashing utility functions
 */

/**
 * Hash a plaintext password
 * @param {string} password - The plaintext password
 * @returns {Promise<string>} The hashed password
 */
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a plaintext password against a hash
 * @param {string} password - The plaintext password
 * @param {string} hash - The hashed password
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

module.exports = {
  hashPassword,
  verifyPassword
};
