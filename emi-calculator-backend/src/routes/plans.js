const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createPlanValidation, checkValidation } = require('../middleware/validators');
const { getPlans, createPlan, deletePlan } = require('../controllers/plansController');

/**
 * Plans Routes
 * All routes require authentication
 */

/**
 * @route   GET /plans
 * @desc    Get all plans for authenticated user
 * @access  Private
 */
router.get('/', authMiddleware, getPlans);

/**
 * @route   POST /plans
 * @desc    Create a new plan
 * @access  Private
 */
router.post('/', authMiddleware, createPlanValidation, checkValidation, createPlan);

/**
 * @route   DELETE /plans/:id
 * @desc    Delete a plan by ID
 * @access  Private
 */
router.delete('/:id', authMiddleware, deletePlan);

module.exports = router;
