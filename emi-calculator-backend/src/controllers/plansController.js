const Plan = require('../models/Plan');

/**
 * Plans Controller
 * Handles CRUD operations for EMI calculation plans
 */

/**
 * Get all plans for the authenticated user
 * @route GET /plans
 * @access Private
 */
async function getPlans(req, res, next) {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }
    
    // Retrieve all plans for this user, sorted by creation date (newest first)
    const plans = await Plan.find({ userId }).sort({ createdAt: -1 }).catch(err => {
      console.error('Database error fetching plans:', err);
      throw new Error('Failed to retrieve plans. Please try again later.');
    });
    
    res.status(200).json({
      plans
    });
  } catch (error) {
    // Log error for debugging without exposing to client
    console.error('Get plans error:', {
      message: error.message,
      userId: req.userId,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    next(error);
  }
}

/**
 * Create a new plan
 * @route POST /plans
 * @access Private
 */
async function createPlan(req, res, next) {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }
    
    const {
      loanAmount,
      interestRate,
      tenure,
      loanType,
      emi,
      totalInterest,
      totalAmountPayable
    } = req.body;
    
    // Validate required fields
    if (!loanAmount || !interestRate || !tenure || !emi || !totalInterest || !totalAmountPayable) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: {
          ...((!loanAmount) && { loanAmount: 'Loan amount is required' }),
          ...((!interestRate) && { interestRate: 'Interest rate is required' }),
          ...((!tenure) && { tenure: 'Tenure is required' }),
          ...((!emi) && { emi: 'EMI is required' }),
          ...((!totalInterest) && { totalInterest: 'Total interest is required' }),
          ...((!totalAmountPayable) && { totalAmountPayable: 'Total amount payable is required' })
        }
      });
    }
    
    // Create new plan with user association
    const plan = new Plan({
      userId,
      loanAmount,
      interestRate,
      tenure,
      loanType,
      emi,
      totalInterest,
      totalAmountPayable
    });
    
    // Save to database
    await plan.save().catch(err => {
      console.error('Database error saving plan:', err);
      throw new Error('Failed to save plan. Please try again.');
    });
    
    res.status(201).json({
      plan
    });
  } catch (error) {
    // Log error for debugging without exposing to client
    console.error('Create plan error:', {
      message: error.message,
      userId: req.userId,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    next(error);
  }
}

/**
 * Delete a plan by ID
 * @route DELETE /plans/:id
 * @access Private
 */
async function deletePlan(req, res, next) {
  try {
    const userId = req.userId;
    const planId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }
    
    if (!planId) {
      return res.status(400).json({
        message: 'Plan ID is required'
      });
    }
    
    // Find the plan
    const plan = await Plan.findById(planId).catch(err => {
      console.error('Database error finding plan:', err);
      // Check if it's a CastError (invalid ObjectId format)
      if (err.name === 'CastError') {
        throw err; // Let the error handler deal with it
      }
      throw new Error('Failed to find plan. Please try again.');
    });
    
    // Check if plan exists
    if (!plan) {
      return res.status(404).json({
        message: 'Plan not found'
      });
    }
    
    // Check if the plan belongs to the authenticated user
    if (plan.userId.toString() !== userId) {
      return res.status(403).json({
        message: 'Unauthorized to delete this plan'
      });
    }
    
    // Delete the plan
    await Plan.findByIdAndDelete(planId).catch(err => {
      console.error('Database error deleting plan:', err);
      throw new Error('Failed to delete plan. Please try again.');
    });
    
    res.status(200).json({
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    // Log error for debugging without exposing to client
    console.error('Delete plan error:', {
      message: error.message,
      userId: req.userId,
      planId: req.params.id,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    next(error);
  }
}

module.exports = {
  getPlans,
  createPlan,
  deletePlan
};
