const express = require('express');
const router = express.Router();
const { signup, login, loginWithPhone, updateProfile } = require('../controllers/authController');
const { 
  signupValidation, 
  loginValidation, 
  checkValidation 
} = require('../middleware/validators');
const authenticate = require('../middleware/auth');

/**
 * Authentication routes
 */

/**
 * POST /auth/signup
 * Register a new user with email/password
 */
router.post('/signup', signupValidation, checkValidation, signup);

/**
 * POST /auth/login
 * Login an existing user with email/password
 */
router.post('/login', loginValidation, checkValidation, login);

/**
 * POST /auth/login-phone
 * Login with phone number using Firebase token
 */
router.post('/login-phone', loginWithPhone);

/**
 * PUT /auth/profile
 * Update user profile (requires authentication)
 */
router.put('/profile', authenticate, updateProfile);

module.exports = router;
