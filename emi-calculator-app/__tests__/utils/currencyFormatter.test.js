/**
 * Tests for Indian Currency Formatter utility
 */

import { formatIndianCurrency } from '../../src/utils/currencyFormatter';

describe('formatIndianCurrency', () => {
  test('formats small amounts correctly', () => {
    expect(formatIndianCurrency(100)).toBe('₹100.00');
    expect(formatIndianCurrency(999)).toBe('₹999.00');
  });

  test('formats thousands correctly', () => {
    expect(formatIndianCurrency(1000)).toBe('₹1,000.00');
    expect(formatIndianCurrency(10000)).toBe('₹10,000.00');
    expect(formatIndianCurrency(99999)).toBe('₹99,999.00');
  });

  test('formats lakhs correctly (Indian numbering)', () => {
    expect(formatIndianCurrency(100000)).toBe('₹1,00,000.00');
    expect(formatIndianCurrency(1000000)).toBe('₹10,00,000.00');
    expect(formatIndianCurrency(9999999)).toBe('₹99,99,999.00');
  });

  test('formats crores correctly (Indian numbering)', () => {
    expect(formatIndianCurrency(10000000)).toBe('₹1,00,00,000.00');
    expect(formatIndianCurrency(100000000)).toBe('₹10,00,00,000.00');
  });

  test('rounds decimals to 2 places', () => {
    expect(formatIndianCurrency(1234.567)).toBe('₹1,234.57');
    expect(formatIndianCurrency(1234.564)).toBe('₹1,234.56');
    expect(formatIndianCurrency(1234.5)).toBe('₹1,234.50');
  });

  test('handles zero correctly', () => {
    expect(formatIndianCurrency(0)).toBe('₹0.00');
  });

  test('handles negative numbers correctly', () => {
    expect(formatIndianCurrency(-1000)).toBe('-₹1,000.00');
    expect(formatIndianCurrency(-100000)).toBe('-₹1,00,000.00');
  });

  test('includes rupee symbol', () => {
    const formatted = formatIndianCurrency(50000);
    expect(formatted).toContain('₹');
  });
});
