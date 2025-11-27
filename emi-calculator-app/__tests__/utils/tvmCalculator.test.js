/**
 * TVM Calculator Tests
 * Tests for Time Value of Money calculations
 */

import {
  calculatePV,
  calculateFV,
  calculatePMT,
  calculateN,
  calculateRate,
  calculateTVM
} from '../../src/utils/tvmCalculator';

describe('TVM Calculator - Basic Functions', () => {
  describe('calculatePV', () => {
    test('calculates present value correctly with known values', () => {
      // FV = 10000, PMT = 0, rate = 5% per year, n = 10 years
      // PV = 10000 / (1.05)^10 = 6139.13
      const pv = calculatePV(10000, 0, 0.05, 10, 0);
      expect(pv).toBeCloseTo(6139.13, 2);
    });

    test('handles zero interest rate', () => {
      const pv = calculatePV(10000, 100, 0, 10, 0);
      expect(pv).toBe(10000 - (100 * 10));
    });
  });

  describe('calculateFV', () => {
    test('calculates future value correctly with known values', () => {
      // PV = 5000, PMT = 0, rate = 5% per year, n = 10 years
      // FV = 5000 * (1.05)^10 = 8144.47
      const fv = calculateFV(5000, 0, 0.05, 10, 0);
      expect(fv).toBeCloseTo(8144.47, 2);
    });

    test('handles zero interest rate', () => {
      const fv = calculateFV(5000, 100, 0, 10, 0);
      expect(fv).toBe(5000 + (100 * 10));
    });
  });

  describe('calculatePMT', () => {
    test('calculates payment correctly with known values', () => {
      // Loan: PV = 100000, FV = 0, rate = 0.5% per month, n = 60 months
      // Using standard loan formula: PMT = PV * r * (1+r)^n / ((1+r)^n - 1)
      // PMT = 100000 * 0.005 * (1.005)^60 / ((1.005)^60 - 1) = 1933.28
      const pmt = calculatePMT(100000, 0, 0.005, 60, 0);
      expect(Math.abs(pmt)).toBeCloseTo(1933.28, 2);
    });

    test('handles zero interest rate', () => {
      const pmt = calculatePMT(10000, 0, 0, 10, 0);
      expect(pmt).toBe(-1000);
    });
  });

  describe('calculateN', () => {
    test('calculates number of periods correctly', () => {
      // PV = -1000, FV = 2000, PMT = 0, rate = 7% per year
      // n = ln(2000/1000) / ln(1.07) = 10.24 years
      const n = calculateN(-1000, 2000, 0, 0.07, 0);
      expect(n).toBeCloseTo(10.24, 1);
    });

    test('handles zero interest rate', () => {
      // With zero interest: n = (FV - PV) / PMT = (2000 - (-1000)) / 100 = 30
      const n = calculateN(-1000, 2000, 100, 0, 0);
      expect(n).toBe(30);
    });
  });

  describe('calculateRate', () => {
    test('calculates interest rate correctly', () => {
      // PV = -1000, FV = 1500, PMT = 0, n = 5 years
      // rate = (1500/1000)^(1/5) - 1 = 0.0845 or 8.45%
      const rate = calculateRate(-1000, 1500, 0, 5, 0);
      expect(rate).toBeCloseTo(0.0845, 3);
    });
  });
});

describe('TVM Calculator - Payment Timing', () => {
  test('beginning of period produces different result than end', () => {
    const fvEnd = calculateFV(1000, 100, 0.05, 10, 0);
    const fvBeginning = calculateFV(1000, 100, 0.05, 10, 1);
    
    // Beginning should be higher due to extra period of interest
    expect(fvBeginning).toBeGreaterThan(fvEnd);
  });
});

describe('TVM Calculator - Main Function', () => {
  test('calculates PV using main function', () => {
    const result = calculateTVM({
      calculateVariable: 'PV',
      presentValue: 0,
      futureValue: 10000,
      paymentPerPeriod: 0,
      numberOfPeriods: 10,
      interestRate: 5,
      compoundingFrequency: 'Annually',
      paymentTiming: 'End'
    });
    
    expect(result.calculatedValue).toBeCloseTo(6139.13, 0);
    expect(result.calculatedVariable).toBe('PV');
  });

  test('calculates FV using main function', () => {
    const result = calculateTVM({
      calculateVariable: 'FV',
      presentValue: 5000,
      futureValue: 0,
      paymentPerPeriod: 0,
      numberOfPeriods: 10,
      interestRate: 5,
      compoundingFrequency: 'Annually',
      paymentTiming: 'End'
    });
    
    expect(result.calculatedValue).toBeCloseTo(8144.47, 0);
    expect(result.calculatedVariable).toBe('FV');
  });

  test('handles monthly compounding', () => {
    const result = calculateTVM({
      calculateVariable: 'FV',
      presentValue: 1000,
      futureValue: 0,
      paymentPerPeriod: 0,
      numberOfPeriods: 1,
      interestRate: 12,
      compoundingFrequency: 'Monthly',
      paymentTiming: 'End'
    });
    
    // With monthly compounding: (1 + 0.12/12)^12 = 1.1268
    expect(result.calculatedValue).toBeCloseTo(1126.83, 0);
  });
});
