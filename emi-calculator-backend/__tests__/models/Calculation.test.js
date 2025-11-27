/**
 * Tests for Calculation Model
 */

const mongoose = require('mongoose');
const Calculation = require('../../src/models/Calculation');
const { connectDB, closeDB, clearDB } = require('../config/database.test');

describe('Calculation Model', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  describe('Valid calculation types', () => {
    const userId = new mongoose.Types.ObjectId();

    it('should accept fd calculation type', async () => {
      const calculation = new Calculation({
        userId,
        type: 'fd',
        data: { principal: 100000, rate: 7, tenure: 12 },
        result: { maturityAmount: 107000 }
      });

      const saved = await calculation.save();
      expect(saved.type).toBe('fd');
    });

    it('should accept rd calculation type', async () => {
      const calculation = new Calculation({
        userId,
        type: 'rd',
        data: { monthlyDeposit: 5000, rate: 7, tenure: 12 },
        result: { maturityAmount: 62000 }
      });

      const saved = await calculation.save();
      expect(saved.type).toBe('rd');
    });

    it('should accept sip calculation type', async () => {
      const calculation = new Calculation({
        userId,
        type: 'sip',
        data: { monthlyInvestment: 5000, expectedReturn: 12, tenure: 60 },
        result: { totalValue: 410000 }
      });

      const saved = await calculation.save();
      expect(saved.type).toBe('sip');
    });

    it('should accept gst calculation type', async () => {
      const calculation = new Calculation({
        userId,
        type: 'gst',
        data: { amount: 10000, gstRate: 18 },
        result: { gstAmount: 1800, totalAmount: 11800 }
      });

      const saved = await calculation.save();
      expect(saved.type).toBe('gst');
    });

    it('should accept tvm calculation type', async () => {
      const calculation = new Calculation({
        userId,
        type: 'tvm',
        data: { 
          calculateVariable: 'PV',
          futureValue: 100000,
          paymentPerPeriod: 1000,
          numberOfPeriods: 10,
          interestRate: 8
        },
        result: { calculatedValue: 50000 }
      });

      const saved = await calculation.save();
      expect(saved.type).toBe('tvm');
      expect(saved.data.calculateVariable).toBe('PV');
    });

    it('should accept ppf calculation type', async () => {
      const calculation = new Calculation({
        userId,
        type: 'ppf',
        data: { 
          annualDeposit: 50000,
          interestRate: 7.1,
          durationYears: 15
        },
        result: { 
          totalInvestment: 750000,
          interestEarned: 450000,
          maturityAmount: 1200000
        }
      });

      const saved = await calculation.save();
      expect(saved.type).toBe('ppf');
      expect(saved.data.annualDeposit).toBe(50000);
    });
  });

  describe('Invalid calculation types', () => {
    const userId = new mongoose.Types.ObjectId();

    it('should reject invalid calculation type', async () => {
      const calculation = new Calculation({
        userId,
        type: 'invalid',
        data: { test: 'data' },
        result: { test: 'result' }
      });

      let error;
      try {
        await calculation.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.type).toBeDefined();
    });
  });

  describe('Required fields', () => {
    const userId = new mongoose.Types.ObjectId();

    it('should require userId', async () => {
      const calculation = new Calculation({
        type: 'tvm',
        data: { test: 'data' },
        result: { test: 'result' }
      });

      let error;
      try {
        await calculation.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.userId).toBeDefined();
    });

    it('should require type', async () => {
      const calculation = new Calculation({
        userId,
        data: { test: 'data' },
        result: { test: 'result' }
      });

      let error;
      try {
        await calculation.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.type).toBeDefined();
    });

    it('should require data', async () => {
      const calculation = new Calculation({
        userId,
        type: 'tvm',
        result: { test: 'result' }
      });

      let error;
      try {
        await calculation.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.data).toBeDefined();
    });

    it('should require result', async () => {
      const calculation = new Calculation({
        userId,
        type: 'tvm',
        data: { test: 'data' }
      });

      let error;
      try {
        await calculation.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.result).toBeDefined();
    });
  });
});
