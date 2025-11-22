const { body, validationResult } = require('express-validator');

/**
 * Validation middleware for authentication endpoints
 */

/**
 * Validation rules for signup
 */
const signupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for creating a plan
 */
const createPlanValidation = [
  body('loanAmount')
    .notEmpty()
    .withMessage('Loan amount is required')
    .isFloat({ min: 0 })
    .withMessage('Loan amount must be a positive number'),
  
  body('interestRate')
    .notEmpty()
    .withMessage('Interest rate is required')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Interest rate must be between 0 and 100'),
  
  body('tenure')
    .notEmpty()
    .withMessage('Tenure is required')
    .isInt({ min: 1 })
    .withMessage('Tenure must be at least 1 month'),
  
  body('loanType')
    .optional()
    .isIn(['Home', 'Personal', 'Vehicle'])
    .withMessage('Loan type must be Home, Personal, or Vehicle'),
  
  body('emi')
    .notEmpty()
    .withMessage('EMI is required')
    .isFloat({ min: 0 })
    .withMessage('EMI must be a positive number'),
  
  body('totalInterest')
    .notEmpty()
    .withMessage('Total interest is required')
    .isFloat({ min: 0 })
    .withMessage('Total interest must be a positive number'),
  
  body('totalAmountPayable')
    .notEmpty()
    .withMessage('Total amount payable is required')
    .isFloat({ min: 0 })
    .withMessage('Total amount payable must be a positive number')
];

/**
 * Middleware to check validation results
 */
function checkValidation(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = {};
    errors.array().forEach(error => {
      errorMessages[error.path] = error.msg;
    });
    
    return res.status(400).json({
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
}

module.exports = {
  signupValidation,
  loginValidation,
  createPlanValidation,
  checkValidation
};
