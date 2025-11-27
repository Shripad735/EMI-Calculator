/**
 * TVM (Time Value of Money) Calculator Utility
 * Implements the fundamental TVM equation:
 * PV(1+r)^n + PMT[(1+r)^n - 1]/r = FV
 * 
 * Where:
 * PV = Present Value
 * FV = Future Value
 * PMT = Payment per Period
 * r = Interest rate per period
 * n = Number of periods
 * 
 * Payment timing:
 * - 0 = End of period (ordinary annuity)
 * - 1 = Beginning of period (annuity due)
 */

/**
 * Adjust rate and periods based on compounding frequency
 * @param {number} annualRate - Annual interest rate (as percentage)
 * @param {number} years - Number of years
 * @param {string} frequency - Compounding frequency
 * @returns {Object} Adjusted rate per period and number of periods
 */
function adjustForCompounding(annualRate, years, frequency) {
  const rateDecimal = annualRate / 100;
  
  const frequencyMap = {
    'Monthly': 12,
    'Quarterly': 4,
    'Semi-Annually': 2,
    'Annually': 1
  };
  
  const periodsPerYear = frequencyMap[frequency] || 1;
  const ratePerPeriod = rateDecimal / periodsPerYear;
  const totalPeriods = years * periodsPerYear;
  
  return {
    ratePerPeriod,
    totalPeriods,
    periodsPerYear
  };
}

/**
 * Calculate Present Value (PV)
 * Formula: PV = [FV / (1+r)^n] - [PMT * ((1 - (1+r)^-n) / r)]
 * 
 * @param {number} fv - Future Value
 * @param {number} pmt - Payment per Period
 * @param {number} rate - Interest rate per period (as decimal)
 * @param {number} n - Number of periods
 * @param {number} timing - Payment timing (0=end, 1=beginning)
 * @returns {number} Present Value
 */
export function calculatePV(fv, pmt, rate, n, timing = 0) {
  // Handle edge case: 0% interest rate
  if (rate === 0) {
    return fv - (pmt * n);
  }
  
  const timingMultiplier = timing === 1 ? (1 + rate) : 1;
  
  // PV from FV
  const pvFromFV = fv / Math.pow(1 + rate, n);
  
  // PV from PMT (present value of annuity)
  const pvFromPMT = pmt * ((1 - Math.pow(1 + rate, -n)) / rate) * timingMultiplier;
  
  return pvFromFV - pvFromPMT;
}

/**
 * Calculate Future Value (FV)
 * Formula: FV = PV(1+r)^n + PMT[((1+r)^n - 1) / r]
 * 
 * @param {number} pv - Present Value
 * @param {number} pmt - Payment per Period
 * @param {number} rate - Interest rate per period (as decimal)
 * @param {number} n - Number of periods
 * @param {number} timing - Payment timing (0=end, 1=beginning)
 * @returns {number} Future Value
 */
export function calculateFV(pv, pmt, rate, n, timing = 0) {
  // Handle edge case: 0% interest rate
  if (rate === 0) {
    return pv + (pmt * n);
  }
  
  const timingMultiplier = timing === 1 ? (1 + rate) : 1;
  
  // FV from PV
  const fvFromPV = pv * Math.pow(1 + rate, n);
  
  // FV from PMT (future value of annuity)
  const fvFromPMT = pmt * ((Math.pow(1 + rate, n) - 1) / rate) * timingMultiplier;
  
  return fvFromPV + fvFromPMT;
}

/**
 * Calculate Payment per Period (PMT)
 * Derived from TVM equation: PMT = [FV - PV(1+r)^n] / [((1+r)^n - 1) / r]
 * 
 * @param {number} pv - Present Value
 * @param {number} fv - Future Value
 * @param {number} rate - Interest rate per period (as decimal)
 * @param {number} n - Number of periods
 * @param {number} timing - Payment timing (0=end, 1=beginning)
 * @returns {number} Payment per Period
 */
export function calculatePMT(pv, fv, rate, n, timing = 0) {
  // Handle edge case: 0% interest rate
  if (rate === 0) {
    return (fv - pv) / n;
  }
  
  const timingMultiplier = timing === 1 ? (1 + rate) : 1;
  
  // Using the TVM equation: PV(1+r)^n + PMT[((1+r)^n - 1)/r] = FV
  // Solving for PMT: PMT = [FV - PV(1+r)^n] / [((1+r)^n - 1)/r]
  
  const factor = Math.pow(1 + rate, n);
  const numerator = (fv - pv * factor) * rate;
  const denominator = (factor - 1) * timingMultiplier;
  
  return numerator / denominator;
}

/**
 * Calculate Number of Periods (N)
 * Uses iterative numerical method (bisection) to solve for n
 * 
 * @param {number} pv - Present Value
 * @param {number} fv - Future Value
 * @param {number} pmt - Payment per Period
 * @param {number} rate - Interest rate per period (as decimal)
 * @param {number} timing - Payment timing (0=end, 1=beginning)
 * @returns {number} Number of periods
 */
export function calculateN(pv, fv, pmt, rate, timing = 0) {
  // Handle edge case: 0% interest rate
  if (rate === 0) {
    if (pmt === 0) {
      return null; // No solution
    }
    return (fv - pv) / pmt;
  }
  
  // Special case: no payments, just PV to FV
  if (pmt === 0) {
    if (pv === 0) {
      return null; // No solution
    }
    // Handle negative PV (loan) to positive FV (payoff)
    const ratio = Math.abs(fv / pv);
    if (ratio <= 0) {
      return null; // No solution
    }
    return Math.log(ratio) / Math.log(1 + rate);
  }
  
  // Use bisection method to find n
  let nLow = 0.01;
  let nHigh = 1000; // Maximum periods to search
  const tolerance = 0.01;
  const maxIterations = 100;
  
  for (let i = 0; i < maxIterations; i++) {
    const nMid = (nLow + nHigh) / 2;
    const calculatedFV = calculateFV(pv, pmt, rate, nMid, timing);
    const difference = calculatedFV - fv;
    
    if (Math.abs(difference) < tolerance) {
      return nMid;
    }
    
    if (difference < 0) {
      nLow = nMid;
    } else {
      nHigh = nMid;
    }
    
    // Check if we've converged
    if (nHigh - nLow < 0.001) {
      return nMid;
    }
  }
  
  // Return best approximation
  return (nLow + nHigh) / 2;
}

/**
 * Calculate Interest Rate (Rate)
 * Uses Newton-Raphson method to solve for rate
 * 
 * @param {number} pv - Present Value
 * @param {number} fv - Future Value
 * @param {number} pmt - Payment per Period
 * @param {number} n - Number of periods
 * @param {number} timing - Payment timing (0=end, 1=beginning)
 * @returns {number} Interest rate per period (as decimal)
 */
export function calculateRate(pv, fv, pmt, n, timing = 0) {
  // Special case: no payments, just PV to FV
  if (pmt === 0) {
    if (pv === 0) {
      return null; // No solution
    }
    // Handle negative PV (loan) to positive FV (payoff)
    const ratio = Math.abs(fv / pv);
    if (ratio <= 0) {
      return null; // No solution
    }
    return Math.pow(ratio, 1 / n) - 1;
  }
  
  // Initial guess based on simple approximation
  let rate = 0.1; // 10%
  const tolerance = 0.00001;
  const maxIterations = 100;
  
  // Newton-Raphson iteration
  for (let i = 0; i < maxIterations; i++) {
    // Calculate f(rate) = calculated FV - target FV
    const calculatedFV = calculateFV(pv, pmt, rate, n, timing);
    const f = calculatedFV - fv;
    
    if (Math.abs(f) < tolerance) {
      return rate;
    }
    
    // Calculate derivative f'(rate) using numerical approximation
    const h = 0.00001;
    const fPlusH = calculateFV(pv, pmt, rate + h, n, timing) - fv;
    const derivative = (fPlusH - f) / h;
    
    // Avoid division by zero
    if (Math.abs(derivative) < 0.00001) {
      // Try bisection method as fallback
      return calculateRateBisection(pv, fv, pmt, n, timing);
    }
    
    // Newton-Raphson update
    let newRate = rate - f / derivative;
    
    // Ensure rate stays in reasonable bounds
    if (newRate < -0.99) {
      newRate = -0.99; // Prevent rates below -99%
    } else if (newRate > 10) {
      newRate = 10; // Cap at 1000%
    }
    
    // Check for convergence
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }
    
    rate = newRate;
  }
  
  return rate;
}

/**
 * Calculate rate using bisection method (fallback)
 * @private
 */
function calculateRateBisection(pv, fv, pmt, n, timing) {
  let rateLow = -0.99;
  let rateHigh = 10;
  const tolerance = 0.00001;
  const maxIterations = 100;
  
  for (let i = 0; i < maxIterations; i++) {
    const rateMid = (rateLow + rateHigh) / 2;
    const calculatedFV = calculateFV(pv, pmt, rateMid, n, timing);
    const difference = calculatedFV - fv;
    
    if (Math.abs(difference) < tolerance) {
      return rateMid;
    }
    
    if (difference < 0) {
      rateLow = rateMid;
    } else {
      rateHigh = rateMid;
    }
    
    if (rateHigh - rateLow < tolerance) {
      return rateMid;
    }
  }
  
  return (rateLow + rateHigh) / 2;
}

/**
 * Main TVM calculator function
 * Calculates the missing variable given the other four
 * 
 * @param {Object} params - TVM parameters
 * @param {string} params.calculateVariable - Variable to calculate ('PV', 'FV', 'PMT', 'N', 'Rate')
 * @param {number} params.presentValue - Present Value
 * @param {number} params.futureValue - Future Value
 * @param {number} params.paymentPerPeriod - Payment per Period
 * @param {number} params.numberOfPeriods - Number of periods (in years)
 * @param {number} params.interestRate - Annual interest rate (as percentage)
 * @param {string} params.compoundingFrequency - Compounding frequency
 * @param {string} params.paymentTiming - Payment timing ('End' or 'Beginning')
 * @returns {Object} Calculation result
 */
export function calculateTVM({
  calculateVariable,
  presentValue,
  futureValue,
  paymentPerPeriod,
  numberOfPeriods,
  interestRate,
  compoundingFrequency = 'Annually',
  paymentTiming = 'End'
}) {
  // Adjust for compounding frequency
  const { ratePerPeriod, totalPeriods } = adjustForCompounding(
    interestRate,
    numberOfPeriods,
    compoundingFrequency
  );
  
  // Convert payment timing to numeric
  const timing = paymentTiming === 'Beginning' ? 1 : 0;
  
  let result;
  
  switch (calculateVariable) {
    case 'PV':
      result = calculatePV(futureValue, paymentPerPeriod, ratePerPeriod, totalPeriods, timing);
      break;
      
    case 'FV':
      result = calculateFV(presentValue, paymentPerPeriod, ratePerPeriod, totalPeriods, timing);
      break;
      
    case 'PMT':
      result = calculatePMT(presentValue, futureValue, ratePerPeriod, totalPeriods, timing);
      break;
      
    case 'N':
      const periodsResult = calculateN(presentValue, futureValue, paymentPerPeriod, ratePerPeriod, timing);
      // Convert back to years
      const { periodsPerYear } = adjustForCompounding(interestRate, 1, compoundingFrequency);
      result = periodsResult / periodsPerYear;
      break;
      
    case 'Rate':
      const rateResult = calculateRate(presentValue, futureValue, paymentPerPeriod, totalPeriods, timing);
      // Convert back to annual percentage
      const { periodsPerYear: ppy } = adjustForCompounding(interestRate, 1, compoundingFrequency);
      result = rateResult * ppy * 100;
      break;
      
    default:
      throw new Error(`Invalid calculateVariable: ${calculateVariable}`);
  }
  
  return {
    calculatedValue: Math.round(result * 100) / 100,
    calculatedVariable: calculateVariable,
    inputs: {
      presentValue,
      futureValue,
      paymentPerPeriod,
      numberOfPeriods,
      interestRate,
      compoundingFrequency,
      paymentTiming
    }
  };
}
