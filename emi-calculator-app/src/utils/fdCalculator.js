/**
 * Calculate Fixed Deposit (FD) returns
 * @param {number} principal - Principal amount
 * @param {number} annualRate - Annual interest rate (percentage)
 * @param {number} tenureMonths - Tenure in months
 * @returns {Object} FD calculation results
 */
export const calculateFD = ({ principal, annualRate, tenureMonths }) => {
  const rate = annualRate / 100;
  const years = tenureMonths / 12;
  
  // Compound interest formula: A = P(1 + r/n)^(nt)
  // For quarterly compounding (n=4)
  const n = 4; // Quarterly compounding
  const maturityAmount = principal * Math.pow(1 + rate / n, n * years);
  const interestEarned = maturityAmount - principal;
  
  return {
    principal,
    maturityAmount: Math.round(maturityAmount),
    interestEarned: Math.round(interestEarned),
    tenureMonths,
    annualRate,
  };
};
