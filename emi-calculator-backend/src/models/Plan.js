const mongoose = require('mongoose');

/**
 * Plan Schema
 * Stores saved EMI calculation plans for users
 */
const planSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  loanAmount: {
    type: Number,
    required: [true, 'Loan amount is required'],
    min: [0, 'Loan amount cannot be negative']
  },
  interestRate: {
    type: Number,
    required: [true, 'Interest rate is required'],
    min: [0, 'Interest rate cannot be negative'],
    max: [100, 'Interest rate cannot exceed 100%']
  },
  tenure: {
    type: Number,
    required: [true, 'Tenure is required'],
    min: [1, 'Tenure must be at least 1 month']
  },
  loanType: {
    type: String,
    enum: {
      values: ['Home', 'Personal', 'Vehicle'],
      message: '{VALUE} is not a valid loan type'
    },
    default: 'Personal'
  },
  emi: {
    type: Number,
    required: [true, 'EMI is required']
  },
  totalInterest: {
    type: Number,
    required: [true, 'Total interest is required']
  },
  totalAmountPayable: {
    type: Number,
    required: [true, 'Total amount payable is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient user-specific queries
planSchema.index({ userId: 1, createdAt: -1 });

// Remove __v from JSON responses
planSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
