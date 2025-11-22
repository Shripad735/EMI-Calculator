const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../src/models/User');
const Plan = require('../../src/models/Plan');

describe('Plans Integration Tests', () => {
  let mongoServer;
  let authToken;
  let userId;

  beforeAll(async () => {
    // Set JWT_SECRET for tests
    process.env.JWT_SECRET = 'test-secret-key';
    
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections before each test
    await User.deleteMany({});
    await Plan.deleteMany({});
    
    // Create a test user and get auth token
    const signupResponse = await request(app)
      .post('/auth/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = signupResponse.body.token;
    userId = signupResponse.body.user._id;
  });

  describe('POST /plans', () => {
    it('should create a new plan with valid data', async () => {
      const planData = {
        loanAmount: 1000000,
        interestRate: 8.5,
        tenure: 240,
        loanType: 'Home',
        emi: 7675.50,
        totalInterest: 842120.00,
        totalAmountPayable: 1842120.00
      };

      const response = await request(app)
        .post('/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(planData)
        .expect(201);

      expect(response.body).toHaveProperty('plan');
      expect(response.body.plan.loanAmount).toBe(planData.loanAmount);
      expect(response.body.plan.interestRate).toBe(planData.interestRate);
      expect(response.body.plan.tenure).toBe(planData.tenure);
      expect(response.body.plan.loanType).toBe(planData.loanType);
      expect(response.body.plan.emi).toBe(planData.emi);
      expect(response.body.plan.userId).toBe(userId);
      expect(response.body.plan).toHaveProperty('_id');
      expect(response.body.plan).toHaveProperty('createdAt');
    });

    it('should reject plan creation without authentication', async () => {
      const planData = {
        loanAmount: 500000,
        interestRate: 10.5,
        tenure: 60,
        emi: 10624.00,
        totalInterest: 137440.00,
        totalAmountPayable: 637440.00
      };

      const response = await request(app)
        .post('/plans')
        .send(planData)
        .expect(401);

      expect(response.body.message).toContain('Authentication required');
    });

    it('should reject plan with missing required fields', async () => {
      const planData = {
        loanAmount: 500000,
        interestRate: 10.5
        // Missing tenure, emi, totalInterest, totalAmountPayable
      };

      const response = await request(app)
        .post('/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(planData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should reject plan with negative loan amount', async () => {
      const planData = {
        loanAmount: -1000,
        interestRate: 10.5,
        tenure: 60,
        emi: 10624.00,
        totalInterest: 137440.00,
        totalAmountPayable: 637440.00
      };

      const response = await request(app)
        .post('/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(planData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /plans', () => {
    it('should retrieve all plans for authenticated user', async () => {
      // Create multiple plans
      const plan1 = {
        loanAmount: 1000000,
        interestRate: 8.5,
        tenure: 240,
        loanType: 'Home',
        emi: 7675.50,
        totalInterest: 842120.00,
        totalAmountPayable: 1842120.00
      };

      const plan2 = {
        loanAmount: 500000,
        interestRate: 10.5,
        tenure: 60,
        loanType: 'Personal',
        emi: 10624.00,
        totalInterest: 137440.00,
        totalAmountPayable: 637440.00
      };

      await request(app)
        .post('/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(plan1);

      await request(app)
        .post('/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(plan2);

      const response = await request(app)
        .get('/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('plans');
      expect(response.body.plans).toHaveLength(2);
      expect(response.body.plans[0].userId).toBe(userId);
      expect(response.body.plans[1].userId).toBe(userId);
    });

    it('should return empty array when user has no plans', async () => {
      const response = await request(app)
        .get('/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('plans');
      expect(response.body.plans).toHaveLength(0);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/plans')
        .expect(401);

      expect(response.body.message).toContain('Authentication required');
    });

    it('should only return plans for the authenticated user', async () => {
      // Create a second user
      const user2Response = await request(app)
        .post('/auth/signup')
        .send({
          name: 'User Two',
          email: 'user2@example.com',
          password: 'password123'
        });

      const user2Token = user2Response.body.token;

      // Create plan for first user
      await request(app)
        .post('/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          loanAmount: 1000000,
          interestRate: 8.5,
          tenure: 240,
          emi: 7675.50,
          totalInterest: 842120.00,
          totalAmountPayable: 1842120.00
        });

      // Create plan for second user
      await request(app)
        .post('/plans')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          loanAmount: 500000,
          interestRate: 10.5,
          tenure: 60,
          emi: 10624.00,
          totalInterest: 137440.00,
          totalAmountPayable: 637440.00
        });

      // Get plans for first user
      const response = await request(app)
        .get('/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.plans).toHaveLength(1);
      expect(response.body.plans[0].userId).toBe(userId);
    });
  });

  describe('DELETE /plans/:id', () => {
    let planId;

    beforeEach(async () => {
      // Create a plan to delete
      const response = await request(app)
        .post('/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          loanAmount: 1000000,
          interestRate: 8.5,
          tenure: 240,
          emi: 7675.50,
          totalInterest: 842120.00,
          totalAmountPayable: 1842120.00
        });

      planId = response.body.plan._id;
    });

    it('should delete a plan owned by the user', async () => {
      const response = await request(app)
        .delete(`/plans/${planId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Plan deleted successfully');

      // Verify plan is deleted
      const getResponse = await request(app)
        .get('/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.plans).toHaveLength(0);
    });

    it('should reject deletion without authentication', async () => {
      const response = await request(app)
        .delete(`/plans/${planId}`)
        .expect(401);

      expect(response.body.message).toContain('Authentication required');
    });

    it('should reject deletion of non-existent plan', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/plans/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe('Plan not found');
    });

    it('should reject deletion of plan owned by another user', async () => {
      // Create a second user
      const user2Response = await request(app)
        .post('/auth/signup')
        .send({
          name: 'User Two',
          email: 'user2@example.com',
          password: 'password123'
        });

      const user2Token = user2Response.body.token;

      // Try to delete first user's plan with second user's token
      const response = await request(app)
        .delete(`/plans/${planId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);

      expect(response.body.message).toBe('Unauthorized to delete this plan');
    });

    it('should reject deletion with invalid plan ID format', async () => {
      const response = await request(app)
        .delete('/plans/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.message).toBe('Invalid plan ID format');
    });
  });
});
