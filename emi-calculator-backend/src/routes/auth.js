const express = require('express');
const router = express.Router();
const { signup, login, loginWithPhone, updateProfile } = require('../controllers/authController');
const { sendOTP, verifyOTP, resendOTP } = require('../controllers/otpController');
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
 * Login with phone number using Firebase token (legacy)
 */
router.post('/login-phone', loginWithPhone);

/**
 * POST /auth/send-otp
 * Send OTP to phone number
 */
router.post('/send-otp', sendOTP);

/**
 * POST /auth/verify-otp
 * Verify OTP and login/register user
 */
router.post('/verify-otp', verifyOTP);

/**
 * POST /auth/resend-otp
 * Resend OTP to phone number
 */
router.post('/resend-otp', resendOTP);

/**
 * PUT /auth/profile
 * Update user profile (requires authentication)
 */
router.put('/profile', authenticate, updateProfile);

module.exports = router;
