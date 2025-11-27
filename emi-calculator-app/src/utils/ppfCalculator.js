/**
 * PPF (Public Provident Fund) Calculator Utility
 * Calculates maturity amount for PPF investments using compound interest formula
 * with annual compounding.
 * 
 * Formula: A = P × [((1 + r)^n - 1) / r]
 * Where:
 * P = Annual deposit amount
 * r = Annual interest rate (as decimal)
 * n = Number of years
 * 
 * PPF Rules (India):
 * - Minimum deposit: ₹500 per year
 * - Maximum deposit: ₹1,50,000 per year
 * - Lock-in period: 15 years (extendable in 5-year blocks up to 30 years)
 * - Interest compounded annually
 */

/**
 * Calculate PPF maturity amount and returns
 * @param {number} annualDeposit - Annual deposit amount (₹500 to ₹1,50,000)
 * @param {number} annualRate - Annual interest rate (percentage)
 * @param {number} years - Investment duration in years (15 to 30)
 * @returns {Object} PPF calculation results with total investment, interest earned, and maturity amount
 */
export function calculatePPF({ annualDeposit, annualRate, years }) {
  // Convert annual rate to decimal
  const rate = annualRate / 100;

  // Handle edge case: 0% interest rate
  if (rate === 0) {
    const totalInvestment = annualDeposit * years;
    return {
      totalInvestment: Math.round(totalInvestment),
      interestEarned: 0,
      maturityAmount: Math.round(totalInvestment),
    };
  }

  // Calculate maturity amount using PPF formula
  // A = P × [((1 + r)^n - 1) / r]
  const maturityAmount = annualDeposit * ((Math.pow(1 + rate, years) - 1) / rate);

  // Calculate total investment and interest earned
  const totalInvestment = annualDeposit * years;
  const interestEarned = maturityAmount - totalInvestment;

  return {
    totalInvestment: Math.round(totalInvestment),
    interestEarned: Math.round(interestEarned),
    maturityAmount: Math.round(maturityAmount),
  };
}
