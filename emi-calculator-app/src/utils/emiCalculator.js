/**
 * EMI Calculator Utility
 * Calculates Equated Monthly Installment (EMI) for loans using the standard formula:
 * EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]
 * Where:
 * P = Principal loan amount
 * R = Monthly interest rate (Annual Rate / 12 / 100)
 * N = Tenure in months
 */

/**
 * Calculate EMI and related values for a loan
 * @param {import('../types').EMIInput} input - Loan parameters
 * @returns {import('../types').EMIResult} Calculated EMI, total interest, and total amount
 */
export function calculateEMI({ principal, annualRate, tenureMonths }) {
  // Convert annual rate to monthly rate (as decimal)
  const monthlyRate = annualRate / 12 / 100;

  // Handle edge case: 0% interest rate
  if (monthlyRate === 0) {
    const emi = principal / tenureMonths;
    return {
      emi: Math.round(emi * 100) / 100,
      totalInterest: 0,
      totalAmount: principal,
    };
  }

  // Calculate EMI using standard formula
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
  const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
  const emi = numerator / denominator;

  // Calculate total amount and interest
  const totalAmount = emi * tenureMonths;
  const totalInterest = totalAmount - principal;

  return {
    emi: Math.round(emi * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}
