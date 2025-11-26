const mongoose = require('mongoose');

/**
 * OTP Schema
 * Stores OTP codes for phone verification
 * Auto-deletes after 3 minutes using TTL index
 */
const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5, // Max verification attempts
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 180, // Auto-delete after 3 minutes (180 seconds)
  },
});

// Index for faster lookups and TTL
otpSchema.index({ phone: 1, createdAt: -1 });
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
