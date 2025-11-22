const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../src/models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('User Model', () => {
  test('should create a valid user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashedpassword123'
    };

    const user = await User.create(userData);

    expect(user._id).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.passwordHash).toBe(userData.passwordHash);
    expect(user.createdAt).toBeDefined();
  });

  test('should enforce required fields', async () => {
    const user = new User({});

    let error;
    try {
      await user.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.passwordHash).toBeDefined();
  });

  test('should enforce unique email constraint', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashedpassword123'
    };

    await User.create(userData);

    let error;
    try {
      await User.create(userData);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error
  });

  test('should convert email to lowercase', async () => {
    const userData = {
      name: 'John Doe',
      email: 'JOHN@EXAMPLE.COM',
      passwordHash: 'hashedpassword123'
    };

    const user = await User.create(userData);

    expect(user.email).toBe('john@example.com');
  });

  test('should validate email format', async () => {
    const userData = {
      name: 'John Doe',
      email: 'invalid-email',
      passwordHash: 'hashedpassword123'
    };

    let error;
    try {
      await User.create(userData);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });

  test('should not return passwordHash in JSON', () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashedpassword123'
    });

    const userJSON = user.toJSON();

    expect(userJSON.passwordHash).toBeUndefined();
    expect(userJSON.name).toBe('John Doe');
    expect(userJSON.email).toBe('john@example.com');
  });

  test('should have email index', () => {
    const indexes = User.schema.indexes();
    const emailIndex = indexes.find(index => index[0].email === 1);

    expect(emailIndex).toBeDefined();
    expect(emailIndex[1].unique).toBe(true);
  });
});
