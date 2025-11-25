const mongoose = require('mongoose');

/**
 * Calculation Schema
 * Stores saved calculations from various calculators (FD, RD, SIP, GST)
 */
const calculationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    enum: {
      values: ['fd', 'rd', 'sip', 'gst'],
      message: '{VALUE} is not a valid calculation type'
    },
    required: [true, 'Calculation type is required']
  },
  // Input data (varies by calculator type)
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Calculation data is required']
  },
  // Result data (varies by calculator type)
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Calculation result is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient user-specific queries
calculationSchema.index({ userId: 1, type: 1, createdAt: -1 });

// Remove __v from JSON responses
calculationSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const Calculation = mongoose.model('Calculation', calculationSchema);

module.exports = Calculation;
