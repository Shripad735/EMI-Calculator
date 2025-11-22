const authMiddleware = require('../../src/middleware/auth');
const { generateToken } = require('../../src/utils/jwt');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Mock request object
    req = {
      headers: {}
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Mock next function
    next = jest.fn();

    // Set JWT_SECRET for tests
    process.env.JWT_SECRET = 'test-secret-key-for-testing';
  });

  test('should pass through with valid token', () => {
    const userId = 'user123';
    const token = generateToken(userId);
    req.headers.authorization = `Bearer ${token}`;

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe(userId);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should return 401 when no authorization header', () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Authentication required. No token provided.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 when authorization header does not start with Bearer', () => {
    req.headers.authorization = 'InvalidFormat token123';

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid token format. Expected "Bearer <token>".'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 when token is empty after Bearer', () => {
    req.headers.authorization = 'Bearer ';

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Authentication required. No token provided.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 when token is invalid', () => {
    req.headers.authorization = 'Bearer invalid-token';

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid token. Please log in again.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 when token is expired', () => {
    // Create an expired token by using a past expiration
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign(
      { userId: 'user123' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' } // Already expired
    );
    req.headers.authorization = `Bearer ${expiredToken}`;

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token has expired. Please log in again.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should extract userId from token and attach to request', () => {
    const userId = 'test-user-id-456';
    const token = generateToken(userId);
    req.headers.authorization = `Bearer ${token}`;

    authMiddleware(req, res, next);

    expect(req.userId).toBe(userId);
    expect(next).toHaveBeenCalled();
  });
});

