/**
 * Calculate SIP (Systematic Investment Plan) returns
 * @param {number} monthlyInvestment - Monthly investment amount
 * @param {number} expectedReturn - Expected annual return rate (percentage)
 * @param {number} tenureYears - Investment tenure in years
 * @returns {Object} SIP calculation results
 */
export const calculateSIP = ({ monthlyInvestment, expectedReturn, tenureYears }) => {
  const rate = expectedReturn / 100;
  const monthlyRate = rate / 12;
  const tenureMonths = tenureYears * 12;
  
  // SIP formula: FV = P * [((1 + r)^n - 1) / r] * (1 + r)
  // Where: FV = Future value, P = Monthly investment, r = Monthly rate, n = Number of months
  const futureValue = monthlyInvestment * 
    (Math.pow(1 + monthlyRate, tenureMonths) - 1) / monthlyRate * 
    (1 + monthlyRate);
  
  const totalInvestment = monthlyInvestment * tenureMonths;
  const estimatedReturns = futureValue - totalInvestment;
  
  return {
    monthlyInvestment,
    futureValue: Math.round(futureValue),
    totalInvestment: Math.round(totalInvestment),
    estimatedReturns: Math.round(estimatedReturns),
    tenureYears,
    expectedReturn,
  };
};
