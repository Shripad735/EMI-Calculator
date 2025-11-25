const User = require('../models/User');
const { hashPassword, verifyPassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { verifyFirebaseToken } = require('../config/firebase');

/**
 * Authentication controller
 * Handles user signup, login, and phone authentication
 */

/**
 * Signup a new user
 * POST /auth/signup
 */
async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: {
          ...((!name) && { name: 'Name is required' }),
          ...((!email) && { email: 'Email is required' }),
          ...((!password) && { password: 'Password is required' })
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email }).catch(err => {
      console.error('Database error checking existing user:', err);
      throw new Error('Database error. Please try again later.');
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: {
          email: 'Email already exists'
        }
      });
    }

    // Hash the password
    const passwordHash = await hashPassword(password).catch(err => {
      console.error('Error hashing password:', err);
      throw new Error('Failed to process password. Please try again.');
    });

    // Create new user
    const user = new User({
      name,
      email,
      passwordHash
    });

    await user.save().catch(err => {
      console.error('Database error saving user:', err);
      throw new Error('Failed to create user. Please try again.');
    });

    // Generate JWT token
    const token = generateToken(user._id.toString());

    // Return user data and token
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    // Log error for debugging without exposing to client
    console.error('Signup error:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    next(error);
  }
}

/**
 * Login an existing user
 * POST /auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: {
          ...((!email) && { email: 'Email is required' }),
          ...((!password) && { password: 'Password is required' })
        }
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).catch(err => {
      console.error('Database error finding user:', err);
      throw new Error('Database error. Please try again later.');
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash).catch(err => {
      console.error('Error verifying password:', err);
      throw new Error('Authentication error. Please try again.');
    });

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    // Return user data and token
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    // Log error for debugging without exposing to client
    console.error('Login error:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    next(error);
  }
}

/**
 * Login with phone number using Firebase token
 * POST /auth/login-phone
 */
async function loginWithPhone(req, res, next) {
  try {
    const { firebaseToken, name } = req.body;

    // Validate required fields
    if (!firebaseToken) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: {
          firebaseToken: 'Firebase token is required',
        },
      });
    }

    // Verify Firebase token
    const tokenResult = await verifyFirebaseToken(firebaseToken);

    if (!tokenResult.success) {
      return res.status(401).json({
        message: 'Invalid or expired token',
        error: tokenResult.error,
      });
    }

    const { uid, phoneNumber } = tokenResult;

    if (!phoneNumber) {
      return res.status(400).json({
        message: 'Phone number not found in token',
      });
    }

    // Find existing user by phone or Firebase UID
    let user = await User.findOne({
      $or: [{ phone: phoneNumber }, { firebaseUid: uid }],
    }).catch((err) => {
      console.error('Database error finding user:', err);
      throw new Error('Database error. Please try again later.');
    });

    // Create new user if not exists
    if (!user) {
      user = new User({
        name: name || '',
        phone: phoneNumber,
        firebaseUid: uid,
        authProvider: 'phone',
      });

      await user.save().catch((err) => {
        console.error('Database error saving user:', err);
        throw new Error('Failed to create user. Please try again.');
      });
    } else {
      // Update Firebase UID if not set
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        await user.save();
      }
      // Update name if provided and user has no name
      if (name && !user.name) {
        user.name = name;
        await user.save();
      }
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    // Return user data and token
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Phone login error:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    next(error);
  }
}

/**
 * Update user profile
 * PUT /auth/profile
 */
async function updateProfile(req, res, next) {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
}

module.exports = {
  signup,
  login,
  loginWithPhone,
  updateProfile,
};
