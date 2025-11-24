/**
 * Calculate Recurring Deposit (RD) returns
 * @param {number} monthlyDeposit - Monthly deposit amount
 * @param {number} annualRate - Annual interest rate (percentage)
 * @param {number} tenureMonths - Tenure in months
 * @returns {Object} RD calculation results
 */
export const calculateRD = ({ monthlyDeposit, annualRate, tenureMonths }) => {
  const rate = annualRate / 100;
  const monthlyRate = rate / 12;
  
  // RD formula: M = P * [(1 + r)^n - 1] / r * (1 + r)
  // Where: M = Maturity amount, P = Monthly deposit, r = Monthly rate, n = Number of months
  const maturityAmount = monthlyDeposit * 
    (Math.pow(1 + monthlyRate, tenureMonths) - 1) / monthlyRate * 
    (1 + monthlyRate);
  
  const totalDeposit = monthlyDeposit * tenureMonths;
  const interestEarned = maturityAmount - totalDeposit;
  
  return {
    monthlyDeposit,
    maturityAmount: Math.round(maturityAmount),
    totalDeposit: Math.round(totalDeposit),
    interestEarned: Math.round(interestEarned),
    tenureMonths,
    annualRate,
  };
};
