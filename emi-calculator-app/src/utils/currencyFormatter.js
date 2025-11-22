/**
 * Indian Currency Formatter Utility
 * Formats numbers according to Indian numbering system with rupee symbol
 * Uses lakhs (1,00,000) and crores (1,00,00,000) notation
 */

/**
 * Format a number as Indian Rupee currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., "₹1,00,000.00")
 */
export function formatIndianCurrency(amount) {
  // Handle negative numbers
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);

  // Round to 2 decimal places
  const rounded = Math.round(absoluteAmount * 100) / 100;

  // Split into integer and decimal parts
  const [integerPart, decimalPart = '00'] = rounded.toFixed(2).split('.');

  // Apply Indian numbering system
  // Format: last 3 digits, then groups of 2 digits separated by commas
  let formattedInteger = '';
  
  if (integerPart.length <= 3) {
    formattedInteger = integerPart;
  } else {
    // Get last 3 digits
    const lastThree = integerPart.slice(-3);
    // Get remaining digits
    const remaining = integerPart.slice(0, -3);
    
    // Add commas every 2 digits from right to left for remaining digits
    const remainingFormatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    
    formattedInteger = remainingFormatted + ',' + lastThree;
  }

  // Combine with rupee symbol and decimal part
  const formatted = `₹${formattedInteger}.${decimalPart}`;

  return isNegative ? `-${formatted}` : formatted;
}
