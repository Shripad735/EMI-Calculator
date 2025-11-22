/**
 * Input Validation Utility
 * Validates loan parameters for EMI calculation
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether all inputs are valid
 * @property {Object.<string, string>} errors - Field-specific error messages
 */

/**
 * Validate EMI calculation inputs
 * @param {string} loanAmount - Loan amount as string from input
 * @param {string} interestRate - Annual interest rate as string from input
 * @param {string} tenure - Tenure as string from input
 * @returns {ValidationResult} Validation result with errors if any
 */
export function validateEMIInputs(loanAmount, interestRate, tenure) {
  const errors = {};

  // Validate loan amount
  if (!loanAmount || loanAmount.trim() === '') {
    errors.loanAmount = 'Loan amount is required';
  } else {
    const amount = parseFloat(loanAmount);
    if (isNaN(amount)) {
      errors.loanAmount = 'Loan amount must be a valid number';
    } else if (amount <= 0) {
      errors.loanAmount = 'Loan amount must be greater than zero';
    } else if (amount > 1000000000) {
      errors.loanAmount = 'Loan amount is too large';
    }
  }

  // Validate interest rate
  if (!interestRate || interestRate.trim() === '') {
    errors.interestRate = 'Interest rate is required';
  } else {
    const rate = parseFloat(interestRate);
    if (isNaN(rate)) {
      errors.interestRate = 'Interest rate must be a valid number';
    } else if (rate < 0) {
      errors.interestRate = 'Interest rate cannot be negative';
    } else if (rate > 100) {
      errors.interestRate = 'Interest rate cannot exceed 100%';
    }
  }

  // Validate tenure
  if (!tenure || tenure.trim() === '') {
    errors.tenure = 'Tenure is required';
  } else {
    const tenureValue = parseFloat(tenure);
    if (isNaN(tenureValue)) {
      errors.tenure = 'Tenure must be a valid number';
    } else if (tenureValue <= 0) {
      errors.tenure = 'Tenure must be greater than zero';
    } else if (!Number.isInteger(tenureValue)) {
      errors.tenure = 'Tenure must be a whole number';
    } else if (tenureValue > 600) {
      errors.tenure = 'Tenure is too long (maximum 600 months)';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Convert tenure between months and years
 * @param {number} value - The tenure value
 * @param {string} fromUnit - Current unit ('months' or 'years')
 * @param {string} toUnit - Target unit ('months' or 'years')
 * @returns {number} Converted tenure value
 */
export function convertTenure(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) {
    return value;
  }

  if (fromUnit === 'years' && toUnit === 'months') {
    return value * 12;
  }

  if (fromUnit === 'months' && toUnit === 'years') {
    return value / 12;
  }

  return value;
}
