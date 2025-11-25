const mongoose = require('mongoose');

/**
 * User Schema
 * Stores user account information with authentication credentials
 * Supports both email/password and phone number authentication
 * Updated: Allow empty name for phone auth users
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    default: '',
    // Allow empty string for phone auth users who haven't set a name yet
    validate: {
      validator: function(v) {
        // Allow empty string or strings with at least 2 characters
        return v === '' || v.length >= 2;
      },
      message: 'Name must be either empty or at least 2 characters long'
    }
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true, // Allow null/undefined for phone-only users
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address',
    ],
  },
  passwordHash: {
    type: String,
    // Not required for phone auth users
  },
  phone: {
    type: String,
    trim: true,
    sparse: true, // Allow null/undefined for email-only users
  },
  firebaseUid: {
    type: String,
    sparse: true, // Firebase UID for phone auth users
  },
  authProvider: {
    type: String,
    enum: ['email', 'phone'],
    default: 'email',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for faster lookups
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });

// Ensure password hash is never returned in JSON responses
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
