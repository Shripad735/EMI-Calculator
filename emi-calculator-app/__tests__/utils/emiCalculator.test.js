/**
 * Tests for EMI Calculator utility
 */

import { calculateEMI } from '../../src/utils/emiCalculator';

describe('calculateEMI', () => {
  test('calculates EMI correctly for standard home loan', () => {
    // Test case: ₹10,00,000 at 8.5% for 20 years (240 months)
    const result = calculateEMI({
      principal: 1000000,
      annualRate: 8.5,
      tenureMonths: 240,
    });

    // Expected EMI ≈ ₹8,678.23
    expect(result.emi).toBeCloseTo(8678.23, 1);
    expect(result.totalAmount).toBeGreaterThan(result.emi * 240 - 1);
    expect(result.totalAmount).toBeLessThan(result.emi * 240 + 1);
    expect(result.totalInterest).toBeCloseTo(result.totalAmount - 1000000, 1);
  });

  test('handles zero interest rate correctly', () => {
    const result = calculateEMI({
      principal: 120000,
      annualRate: 0,
      tenureMonths: 12,
    });

    expect(result.emi).toBe(10000);
    expect(result.totalInterest).toBe(0);
    expect(result.totalAmount).toBe(120000);
  });

  test('calculates EMI for personal loan', () => {
    // Test case: ₹5,00,000 at 10.5% for 5 years (60 months)
    const result = calculateEMI({
      principal: 500000,
      annualRate: 10.5,
      tenureMonths: 60,
    });

    expect(result.emi).toBeGreaterThan(0);
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.totalAmount).toBeCloseTo(result.emi * 60, 1);
  });

  test('returns values rounded to 2 decimal places', () => {
    const result = calculateEMI({
      principal: 100000,
      annualRate: 7.5,
      tenureMonths: 24,
    });

    // Check that values have at most 2 decimal places
    expect(result.emi).toBe(Math.round(result.emi * 100) / 100);
    expect(result.totalInterest).toBe(Math.round(result.totalInterest * 100) / 100);
    expect(result.totalAmount).toBe(Math.round(result.totalAmount * 100) / 100);
  });
});
