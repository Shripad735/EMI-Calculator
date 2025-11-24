/**
 * Calculate GST amount
 * @param {number} amount - Initial amount
 * @param {number} gstRate - GST rate (percentage)
 * @param {boolean} isAddGST - true to add GST, false to remove GST
 * @returns {Object} GST calculation results
 */
export const calculateGST = ({ amount, gstRate, isAddGST }) => {
  const rate = gstRate / 100;
  
  let netAmount, gstAmount, totalAmount;
  
  if (isAddGST) {
    // Add GST to the amount
    gstAmount = amount * rate;
    netAmount = amount;
    totalAmount = amount + gstAmount;
  } else {
    // Remove GST from the amount (amount includes GST)
    totalAmount = amount;
    netAmount = amount / (1 + rate);
    gstAmount = amount - netAmount;
  }
  
  return {
    netAmount: Math.round(netAmount * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    gstRate,
    isAddGST,
  };
};
