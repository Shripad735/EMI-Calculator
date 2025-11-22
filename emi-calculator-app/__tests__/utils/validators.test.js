/**
 * Tests for Input Validation utility
 */

import { validateEMIInputs, convertTenure } from '../../src/utils/validators';

describe('validateEMIInputs', () => {
  test('accepts valid inputs', () => {
    const result = validateEMIInputs('100000', '8.5', '12');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  test('rejects empty loan amount', () => {
    const result = validateEMIInputs('', '8.5', '12');
    expect(result.isValid).toBe(false);
    expect(result.errors.loanAmount).toBeDefined();
  });

  test('rejects negative loan amount', () => {
    const result = validateEMIInputs('-1000', '8.5', '12');
    expect(result.isValid).toBe(false);
    expect(result.errors.loanAmount).toBeDefined();
  });

  test('rejects zero loan amount', () => {
    const result = validateEMIInputs('0', '8.5', '12');
    expect(result.isValid).toBe(false);
    expect(result.errors.loanAmount).toBeDefined();
  });

  test('rejects non-numeric loan amount', () => {
    const result = validateEMIInputs('abc', '8.5', '12');
    expect(result.isValid).toBe(false);
    expect(result.errors.loanAmount).toBeDefined();
  });

  test('rejects empty interest rate', () => {
    const result = validateEMIInputs('100000', '', '12');
    expect(result.isValid).toBe(false);
    expect(result.errors.interestRate).toBeDefined();
  });

  test('rejects negative interest rate', () => {
    const result = validateEMIInputs('100000', '-5', '12');
    expect(result.isValid).toBe(false);
    expect(result.errors.interestRate).toBeDefined();
  });

  test('rejects interest rate over 100%', () => {
    const result = validateEMIInputs('100000', '101', '12');
    expect(result.isValid).toBe(false);
    expect(result.errors.interestRate).toBeDefined();
  });

  test('accepts zero interest rate', () => {
    const result = validateEMIInputs('100000', '0', '12');
    expect(result.isValid).toBe(true);
  });

  test('rejects empty tenure', () => {
    const result = validateEMIInputs('100000', '8.5', '');
    expect(result.isValid).toBe(false);
    expect(result.errors.tenure).toBeDefined();
  });

  test('rejects negative tenure', () => {
    const result = validateEMIInputs('100000', '8.5', '-12');
    expect(result.isValid).toBe(false);
    expect(result.errors.tenure).toBeDefined();
  });

  test('rejects zero tenure', () => {
    const result = validateEMIInputs('100000', '8.5', '0');
    expect(result.isValid).toBe(false);
    expect(result.errors.tenure).toBeDefined();
  });

  test('rejects non-integer tenure', () => {
    const result = validateEMIInputs('100000', '8.5', '12.5');
    expect(result.isValid).toBe(false);
    expect(result.errors.tenure).toBeDefined();
  });

  test('rejects whitespace-only inputs', () => {
    const result = validateEMIInputs('  ', '  ', '  ');
    expect(result.isValid).toBe(false);
    expect(result.errors.loanAmount).toBeDefined();
    expect(result.errors.interestRate).toBeDefined();
    expect(result.errors.tenure).toBeDefined();
  });

  test('returns multiple errors for multiple invalid inputs', () => {
    const result = validateEMIInputs('-1000', '150', '0');
    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors).length).toBe(3);
  });
});

describe('convertTenure', () => {
  test('converts years to months', () => {
    expect(convertTenure(2, 'years', 'months')).toBe(24);
    expect(convertTenure(5, 'years', 'months')).toBe(60);
  });

  test('converts months to years', () => {
    expect(convertTenure(24, 'months', 'years')).toBe(2);
    expect(convertTenure(60, 'months', 'years')).toBe(5);
  });

  test('returns same value when units are the same', () => {
    expect(convertTenure(12, 'months', 'months')).toBe(12);
    expect(convertTenure(5, 'years', 'years')).toBe(5);
  });

  test('handles fractional years', () => {
    expect(convertTenure(1.5, 'years', 'months')).toBe(18);
  });

  test('handles fractional months to years', () => {
    expect(convertTenure(18, 'months', 'years')).toBe(1.5);
  });
});
