/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} name
 * @property {string} email
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Plan
 * @property {string} _id
 * @property {string} userId
 * @property {number} loanAmount
 * @property {number} interestRate
 * @property {number} tenure
 * @property {string} [loanType]
 * @property {number} emi
 * @property {number} totalInterest
 * @property {number} totalAmountPayable
 * @property {string} createdAt
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} token
 * @property {User} user
 */

/**
 * @typedef {Object} EMIInput
 * @property {number} principal
 * @property {number} annualRate
 * @property {number} tenureMonths
 */

/**
 * @typedef {Object} EMIResult
 * @property {number} emi
 * @property {number} totalInterest
 * @property {number} totalAmount
 */

export {};
