const { supabase } = require('../config/supabase');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

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
 * Send OTP to phone number using Supabase (which uses Twilio)
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

    // Use Supabase to send OTP via Twilio
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (error) {
      console.error('Supabase OTP error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to send OTP',
      });
    }

    console.log('OTP sent successfully via Supabase/Twilio');

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your phone',
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
    console.log('Verifying OTP for:', formattedPhone);

    // Verify OTP with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms',
    });

    if (error) {
      console.error('Supabase verify error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid OTP. Please try again.',
      });
    }

    console.log('OTP verified successfully');

    // Find or create user in our MongoDB
    let user = await User.findOne({ phone: formattedPhone });

    if (!user) {
      // Create new user
      user = new User({
        name: name || '',
        phone: formattedPhone,
        authProvider: 'phone',
        supabaseId: data.user?.id,
      });
      await user.save();
      console.log('New user created:', user._id);
    } else {
      // Update supabaseId if not set
      if (!user.supabaseId && data.user?.id) {
        user.supabaseId = data.user.id;
        await user.save();
      }
      // Update name if provided and user has no name
      if (name && !user.name) {
        user.name = name;
        await user.save();
      }
    }

    // Generate our own JWT token for the app
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
    console.log('Resending OTP to:', formattedPhone);

    // Use Supabase to resend OTP
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (error) {
      console.error('Supabase resend error:', error);
      
      // Check for rate limiting
      if (error.message?.includes('rate') || error.status === 429) {
        return res.status(429).json({
          success: false,
          message: 'Please wait before requesting a new OTP.',
        });
      }
      
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to resend OTP',
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
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
