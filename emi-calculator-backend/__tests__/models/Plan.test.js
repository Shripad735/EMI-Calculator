const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Plan = require('../../src/models/Plan');
const User = require('../../src/models/User');

let mongoServer;
let testUserId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Create a test user for plan associations
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hashedpassword'
  });
  testUserId = user._id;
});

afterEach(async () => {
  await Plan.deleteMany({});
  await User.deleteMany({});
});

describe('Plan Model', () => {
  test('should create a valid plan', async () => {
    const planData = {
      userId: testUserId,
      loanAmount: 1000000,
      interestRate: 8.5,
      tenure: 240,
      loanType: 'Home',
      emi: 7675.50,
      totalInterest: 842120.00,
      totalAmountPayable: 1842120.00
    };

    const plan = await Plan.create(planData);

    expect(plan._id).toBeDefined();
    expect(plan.userId.toString()).toBe(testUserId.toString());
    expect(plan.loanAmount).toBe(planData.loanAmount);
    expect(plan.interestRate).toBe(planData.interestRate);
    expect(plan.tenure).toBe(planData.tenure);
    expect(plan.loanType).toBe(planData.loanType);
    expect(plan.emi).toBe(planData.emi);
    expect(plan.totalInterest).toBe(planData.totalInterest);
    expect(plan.totalAmountPayable).toBe(planData.totalAmountPayable);
    expect(plan.createdAt).toBeDefined();
  });

  test('should enforce required fields', async () => {
    const plan = new Plan({});

    let error;
    try {
      await plan.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.userId).toBeDefined();
    expect(error.errors.loanAmount).toBeDefined();
    expect(error.errors.interestRate).toBeDefined();
    expect(error.errors.tenure).toBeDefined();
    expect(error.errors.emi).toBeDefined();
    expect(error.errors.totalInterest).toBeDefined();
    expect(error.errors.totalAmountPayable).toBeDefined();
  });

  test('should use default loan type', async () => {
    const planData = {
      userId: testUserId,
      loanAmount: 500000,
      interestRate: 10.5,
      tenure: 60,
      emi: 10624.00,
      totalInterest: 137440.00,
      totalAmountPayable: 637440.00
    };

    const plan = await Plan.create(planData);

    expect(plan.loanType).toBe('Personal');
  });

  test('should validate loan type enum', async () => {
    const planData = {
      userId: testUserId,
      loanAmount: 500000,
      interestRate: 10.5,
      tenure: 60,
      loanType: 'InvalidType',
      emi: 10624.00,
      totalInterest: 137440.00,
      totalAmountPayable: 637440.00
    };

    let error;
    try {
      await Plan.create(planData);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.loanType).toBeDefined();
  });

  test('should reject negative loan amount', async () => {
    const planData = {
      userId: testUserId,
      loanAmount: -1000,
      interestRate: 10.5,
      tenure: 60,
      emi: 10624.00,
      totalInterest: 137440.00,
      totalAmountPayable: 637440.00
    };

    let error;
    try {
      await Plan.create(planData);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.loanAmount).toBeDefined();
  });

  test('should reject negative interest rate', async () => {
    const planData = {
      userId: testUserId,
      loanAmount: 500000,
      interestRate: -5,
      tenure: 60,
      emi: 10624.00,
      totalInterest: 137440.00,
      totalAmountPayable: 637440.00
    };

    let error;
    try {
      await Plan.create(planData);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.interestRate).toBeDefined();
  });

  test('should reject interest rate over 100%', async () => {
    const planData = {
      userId: testUserId,
      loanAmount: 500000,
      interestRate: 150,
      tenure: 60,
      emi: 10624.00,
      totalInterest: 137440.00,
      totalAmountPayable: 637440.00
    };

    let error;
    try {
      await Plan.create(planData);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.interestRate).toBeDefined();
  });

  test('should reject tenure less than 1', async () => {
    const planData = {
      userId: testUserId,
      loanAmount: 500000,
      interestRate: 10.5,
      tenure: 0,
      emi: 10624.00,
      totalInterest: 137440.00,
      totalAmountPayable: 637440.00
    };

    let error;
    try {
      await Plan.create(planData);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.tenure).toBeDefined();
  });

  test('should have userId index', () => {
    const indexes = Plan.schema.indexes();
    const userIdIndex = indexes.find(index => index[0].userId === 1);

    expect(userIdIndex).toBeDefined();
  });

  test('should have compound index on userId and createdAt', () => {
    const indexes = Plan.schema.indexes();
    const compoundIndex = indexes.find(
      index => index[0].userId === 1 && index[0].createdAt === -1
    );

    expect(compoundIndex).toBeDefined();
  });

  test('should not return __v in JSON', () => {
    const plan = new Plan({
      userId: testUserId,
      loanAmount: 500000,
      interestRate: 10.5,
      tenure: 60,
      emi: 10624.00,
      totalInterest: 137440.00,
      totalAmountPayable: 637440.00
    });

    const planJSON = plan.toJSON();

    expect(planJSON.__v).toBeUndefined();
    expect(planJSON.loanAmount).toBe(500000);
  });
});
