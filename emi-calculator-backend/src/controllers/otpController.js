const OTP = require('../models/OTP');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Format phone number to standard format
 */
function formatPhoneNumber(phone) {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 91 and is 12 digits, it's already formatted
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return '+' + cleaned;
  }
  
  // If 10 digits, add +91
  if (cleaned.length === 10) {
    return '+91' + cleaned;
  }
  
  // Return as-is with + prefix if not already
  return phone.startsWith('+') ? phone : '+' + cleaned;
}

/**
 * Send OTP to phone number
 * POST /auth/send-otp
 */
async function sendOTP(req, res, next) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    const formattedPhone = formatPhoneNumber(phone);
    console.log('Sending OTP to:', formattedPhone);

    // Delete any existing OTPs for this phone
    await OTP.deleteMany({ phone: formattedPhone });

    // Generate new OTP
    const otpCode = generateOTP();
    console.log('Generated OTP:', otpCode); // For testing - remove in production

    // Save OTP to database
    const otpDoc = new OTP({
      phone: formattedPhone,
      otp: otpCode,
    });
    await otpDoc.save();

    // In production, you would send SMS here using Supabase or another service
    // For now, we'll just return success and log the OTP
    // TODO: Integrate with SMS service (Twilio, MSG91, etc.)

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // Remove this in production - only for testing
      ...(process.env.NODE_ENV !== 'production' && { otp: otpCode }),
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    next(error);
  }
}

/**
 * Verify OTP and login/register user
 * POST /auth/verify-otp
 */
async function verifyOTP(req, res, next) {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
    }

    const formattedPhone = formatPhoneNumber(phone);

    // Find the OTP record
    const otpDoc = await OTP.findOne({ 
      phone: formattedPhone,
      verified: false,
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found. Please request a new OTP.',
      });
    }

    // Check max attempts
    if (otpDoc.attempts >= 5) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.',
      });
    }

    // Verify OTP
    if (otpDoc.otp !== otp) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.',
        attemptsRemaining: 5 - otpDoc.attempts,
      });
    }

    // OTP verified - mark as verified and delete
    await OTP.deleteOne({ _id: otpDoc._id });

    // Find or create user
    let user = await User.findOne({ phone: formattedPhone });

    if (!user) {
      // Create new user
      user = new User({
        name: name || '',
        phone: formattedPhone,
        authProvider: 'phone',
      });
      await user.save();
      console.log('New user created:', user._id);
    } else if (name && !user.name) {
      // Update name if provided and user has no name
      user.name = name;
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Phone verified successfully',
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
    console.error('Verify OTP error:', error);
    next(error);
  }
}

/**
 * Resend OTP
 * POST /auth/resend-otp
 */
async function resendOTP(req, res, next) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    const formattedPhone = formatPhoneNumber(phone);

    // Check if there's a recent OTP (within last 30 seconds)
    const recentOTP = await OTP.findOne({
      phone: formattedPhone,
      createdAt: { $gt: new Date(Date.now() - 30000) },
    });

    if (recentOTP) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 30 seconds before requesting a new OTP.',
      });
    }

    // Delete existing OTPs and generate new one
    await OTP.deleteMany({ phone: formattedPhone });

    const otpCode = generateOTP();
    console.log('Resent OTP:', otpCode); // For testing

    const otpDoc = new OTP({
      phone: formattedPhone,
      otp: otpCode,
    });
    await otpDoc.save();

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      ...(process.env.NODE_ENV !== 'production' && { otp: otpCode }),
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    next(error);
  }
}

module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP,
};
