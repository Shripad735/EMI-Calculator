const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getCalculations, createCalculation, deleteCalculation } = require('../controllers/calculationsController');

/**
 * Calculations Routes
 * All routes require authentication
 */

/**
 * @route   GET /calculations
 * @desc    Get all calculations for authenticated user (optionally filter by type)
 * @access  Private
 */
router.get('/', authMiddleware, getCalculations);

/**
 * @route   POST /calculations
 * @desc    Create a new calculation
 * @access  Private
 */
router.post('/', authMiddleware, createCalculation);

/**
 * @route   DELETE /calculations/:id
 * @desc    Delete a calculation by ID
 * @access  Private
 */
router.delete('/:id', authMiddleware, deleteCalculation);

module.exports = router;
