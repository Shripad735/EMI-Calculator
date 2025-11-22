const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { 
  signupValidation, 
  loginValidation, 
  checkValidation 
} = require('../middleware/validators');

/**
 * Authentication routes
 */

/**
 * POST /auth/signup
 * Register a new user
 */
router.post('/signup', signupValidation, checkValidation, signup);

/**
 * POST /auth/login
 * Login an existing user
 */
router.post('/login', loginValidation, checkValidation, login);

module.exports = router;
