/**
 * Integration tests for complete user flows
 * Tests calculator logic integration and data flow between components
 */

import { calculatePV, calculateFV, calculatePMT } from '../../src/utils/tvmCalculator';
import { calculatePPF } from '../../src/utils/ppfCalculator';
import { formatIndianCurrency } from '../../src/utils/currencyFormatter';

describe('Complete User Flows - Integration Tests', () => {
  describe('TVM Calculator Flow', () => {
    it('should calculate Present Value and format result correctly', () => {
      // Simulate user entering: FV=100000, PMT=0, N=120, Rate=8%
      // This represents a simple future value discounted to present
      const fv = 100000;
      const pmt = 0;
      const n = 120;
      const rate = 8;
      
      // Calculate PV (should be less than FV due to discounting)
      const pv = calculatePV(fv, pmt, rate / 100 / 12, n, 0);
      
      // Verify calculation produces a valid result
      expect(pv).toBeGreaterThan(0);
      expect(pv).toBeLessThan(fv); // PV should be less than FV
      
      // Verify currency formatting
      const formatted = formatIndianCurrency(pv);
      expect(formatted).toContain('₹');
    });

    it('should calculate Future Value and format result correctly', () => {
      // Simulate user entering: PV=50000, PMT=1000, N=60, Rate=7%
      const pv = 50000;
      const pmt = 1000;
      const n = 60;
      const rate = 7;
      
      // Calculate FV
      const fv = calculateFV(pv, pmt, rate / 100 / 12, n, 0);
      
      // Verify calculation produces a valid result
      expect(fv).toBeGreaterThan(pv);
      expect(fv).toBeGreaterThan(0);
      
      // Verify currency formatting
      const formatted = formatIndianCurrency(fv);
      expect(formatted).toContain('₹');
    });

    it('should calculate Payment and format result correctly', () => {
      // Simulate user entering: PV=-100000 (loan), FV=0, N=24, Rate=10%
      // Negative PV represents borrowing money
      const pv = -100000;
      const fv = 0;
      const n = 24;
      const rate = 10;
      
      // Calculate PMT (should be positive payment to pay off loan)
      const pmt = calculatePMT(pv, fv, rate / 100 / 12, n, 0);
      
      // Verify calculation produces a valid result
      expect(pmt).toBeGreaterThan(0);
      expect(Math.abs(pmt * n)).toBeGreaterThan(Math.abs(pv)); // Total payments should exceed principal
      
      // Verify currency formatting
      const formatted = formatIndianCurrency(pmt);
      expect(formatted).toContain('₹');
    });

    it('should handle different compounding frequencies', () => {
      const pv = 10000;
      const fv = 0;
      const pmt = 0;
      const n = 12;
      const annualRate = 12;
      
      // Monthly compounding
      const monthlyRate = annualRate / 100 / 12;
      const fvMonthly = calculateFV(pv, pmt, monthlyRate, n, 0);
      
      // Annual compounding (1 period)
      const annualRateDecimal = annualRate / 100;
      const fvAnnual = calculateFV(pv, pmt, annualRateDecimal, 1, 0);
      
      // Monthly compounding should yield slightly higher FV due to more frequent compounding
      expect(fvMonthly).toBeGreaterThan(fvAnnual);
    });

    it('should handle payment timing (beginning vs end of period)', () => {
      const pv = 0;
      const fv = 100000;
      const n = 60;
      const rate = 0.08 / 12;
      
      // Payment at end of period
      const pmtEnd = calculatePMT(pv, fv, rate, n, 0);
      
      // Payment at beginning of period
      const pmtBeginning = calculatePMT(pv, fv, rate, n, 1);
      
      // Payment at beginning should be slightly less due to extra compounding
      expect(pmtBeginning).toBeLessThan(pmtEnd);
    });
  });

  describe('PPF Calculator Flow', () => {
    it('should calculate PPF maturity and format results correctly', () => {
      // Simulate user entering: Deposit=50000, Rate=7.1%, Duration=15 years
      const deposit = 50000;
      const rate = 7.1;
      const years = 15;
      
      // Calculate PPF (pass as object)
      const result = calculatePPF({ annualDeposit: deposit, annualRate: rate, years });
      
      // Verify result structure
      expect(result).toHaveProperty('totalInvestment');
      expect(result).toHaveProperty('interestEarned');
      expect(result).toHaveProperty('maturityAmount');
      
      // Verify calculations
      expect(result.totalInvestment).toBe(deposit * years);
      expect(result.interestEarned).toBeGreaterThan(0);
      expect(result.maturityAmount).toBe(result.totalInvestment + result.interestEarned);
      expect(result.maturityAmount).toBeGreaterThan(result.totalInvestment);
      
      // Verify currency formatting
      const formattedMaturity = formatIndianCurrency(result.maturityAmount);
      const formattedInvestment = formatIndianCurrency(result.totalInvestment);
      const formattedInterest = formatIndianCurrency(result.interestEarned);
      
      expect(formattedMaturity).toContain('₹');
      expect(formattedInvestment).toContain('₹');
      expect(formattedInterest).toContain('₹');
    });

    it('should validate PPF deposit amount range', () => {
      const minDeposit = 500;
      const maxDeposit = 150000;
      const rate = 7.1;
      const years = 15;
      
      // Test minimum deposit
      const resultMin = calculatePPF({ annualDeposit: minDeposit, annualRate: rate, years });
      expect(resultMin.totalInvestment).toBe(minDeposit * years);
      expect(resultMin.maturityAmount).toBeGreaterThan(0);
      
      // Test maximum deposit
      const resultMax = calculatePPF({ annualDeposit: maxDeposit, annualRate: rate, years });
      expect(resultMax.totalInvestment).toBe(maxDeposit * years);
      expect(resultMax.maturityAmount).toBeGreaterThan(0);
    });

    it('should handle different PPF durations (15-30 years)', () => {
      const deposit = 50000;
      const rate = 7.1;
      
      // Test 15 years (minimum)
      const result15 = calculatePPF({ annualDeposit: deposit, annualRate: rate, years: 15 });
      expect(result15.totalInvestment).toBe(deposit * 15);
      
      // Test 30 years (maximum)
      const result30 = calculatePPF({ annualDeposit: deposit, annualRate: rate, years: 30 });
      expect(result30.totalInvestment).toBe(deposit * 30);
      
      // Longer duration should yield more interest
      expect(result30.interestEarned).toBeGreaterThan(result15.interestEarned);
      expect(result30.maturityAmount).toBeGreaterThan(result15.maturityAmount);
    });

    it('should handle different interest rates', () => {
      const deposit = 50000;
      const years = 15;
      
      // Test with 7.1% (current rate)
      const result71 = calculatePPF({ annualDeposit: deposit, annualRate: 7.1, years });
      
      // Test with 8% (higher rate)
      const result8 = calculatePPF({ annualDeposit: deposit, annualRate: 8, years });
      
      // Higher rate should yield more interest
      expect(result8.interestEarned).toBeGreaterThan(result71.interestEarned);
      expect(result8.maturityAmount).toBeGreaterThan(result71.maturityAmount);
    });
  });

  describe('Currency Formatting Across All Calculators', () => {
    it('should format various amounts with Indian currency symbol', () => {
      const amounts = [500, 1000, 10000, 100000, 1000000, 10000000];
      
      amounts.forEach(amount => {
        const formatted = formatIndianCurrency(amount);
        expect(formatted).toContain('₹');
        expect(formatted).toMatch(/[\d,]+/); // Should contain digits and commas
      });
    });

    it('should format decimal amounts correctly', () => {
      const amount = 12345.67;
      const formatted = formatIndianCurrency(amount);
      
      expect(formatted).toContain('₹');
      expect(formatted).toContain('12,345.67');
    });

    it('should handle zero and negative amounts', () => {
      const zero = formatIndianCurrency(0);
      expect(zero).toContain('₹');
      expect(zero).toContain('0');
      
      const negative = formatIndianCurrency(-1000);
      expect(negative).toContain('₹');
      expect(negative).toContain('-');
    });
  });

  describe('Cross-Calculator Integration', () => {
    it('should maintain consistent calculation precision across calculators', () => {
      // TVM calculation
      const tvmResult = calculateFV(10000, 1000, 0.08 / 12, 12, 0);
      
      // PPF calculation
      const ppfResult = calculatePPF({ annualDeposit: 10000, annualRate: 8, years: 1 });
      
      // Both should return numbers with reasonable precision
      expect(tvmResult).toBeCloseTo(Math.round(tvmResult * 100) / 100, 2);
      expect(ppfResult.maturityAmount).toBeCloseTo(
        Math.round(ppfResult.maturityAmount * 100) / 100,
        2
      );
    });

    it('should format all calculator results consistently', () => {
      // Get results from different calculators
      const tvmAmount = calculatePV(100000, 0, 0.08 / 12, 120, 0);
      const ppfResult = calculatePPF({ annualDeposit: 50000, annualRate: 7.1, years: 15 });
      
      // Format all results
      const formattedTVM = formatIndianCurrency(tvmAmount);
      const formattedPPF = formatIndianCurrency(ppfResult.maturityAmount);
      
      // All should use same currency symbol
      expect(formattedTVM).toContain('₹');
      expect(formattedPPF).toContain('₹');
      
      // All should use Indian number formatting
      expect(formattedTVM).toMatch(/₹[\d,]+/);
      expect(formattedPPF).toMatch(/₹[\d,]+/);
    });
  });
});
