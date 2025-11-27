const Calculation = require('../models/Calculation');

/**
 * Get all calculations for authenticated user
 * GET /calculations
 * Optional query param: type (fd, rd, sip, gst, tvm, ppf)
 */
async function getCalculations(req, res, next) {
  try {
    const userId = req.userId;
    const { type } = req.query;

    const query = { userId };
    if (type) {
      query.type = type;
    }

    const calculations = await Calculation.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      calculations,
      count: calculations.length
    });
  } catch (error) {
    console.error('Error fetching calculations:', error);
    next(error);
  }
}

/**
 * Create a new calculation
 * POST /calculations
 */
async function createCalculation(req, res, next) {
  try {
    const userId = req.userId;
    const { type, data, result } = req.body;

    // Validate required fields
    if (!type || !data || !result) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: {
          ...(!type && { type: 'Calculation type is required' }),
          ...(!data && { data: 'Calculation data is required' }),
          ...(!result && { result: 'Calculation result is required' })
        }
      });
    }

    // Validate type
    const validTypes = ['fd', 'rd', 'sip', 'gst', 'tvm', 'ppf'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: {
          type: `Type must be one of: ${validTypes.join(', ')}`
        }
      });
    }

    const calculation = new Calculation({
      userId,
      type,
      data,
      result
    });

    await calculation.save();

    res.status(201).json({
      message: 'Calculation saved successfully',
      calculation
    });
  } catch (error) {
    console.error('Error creating calculation:', error);
    next(error);
  }
}

/**
 * Delete a calculation by ID
 * DELETE /calculations/:id
 */
async function deleteCalculation(req, res, next) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const calculation = await Calculation.findOne({ _id: id, userId });

    if (!calculation) {
      return res.status(404).json({
        message: 'Calculation not found'
      });
    }

    await Calculation.deleteOne({ _id: id });

    res.status(200).json({
      message: 'Calculation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting calculation:', error);
    next(error);
  }
}

module.exports = {
  getCalculations,
  createCalculation,
  deleteCalculation
};
