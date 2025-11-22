const mongoose = require('mongoose');
const { connectDatabase } = require('../../src/config/database');

describe('Database Connection', () => {
  afterEach(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  test('should throw error when MONGODB_URI is not defined', async () => {
    const originalUri = process.env.MONGODB_URI;
    delete process.env.MONGODB_URI;

    await expect(connectDatabase()).rejects.toThrow(
      'MONGODB_URI environment variable is not defined'
    );

    process.env.MONGODB_URI = originalUri;
  });

  test('should connect successfully with valid URI', async () => {
    // Use a mock URI for testing
    const originalUri = process.env.MONGODB_URI;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

    // Mock mongoose.connect to avoid actual connection
    const originalConnect = mongoose.connect;
    mongoose.connect = jest.fn().mockResolvedValue(true);

    await connectDatabase();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGODB_URI);

    // Restore original
    mongoose.connect = originalConnect;
    process.env.MONGODB_URI = originalUri;
  });

  test('should throw error when connection fails', async () => {
    const originalUri = process.env.MONGODB_URI;
    process.env.MONGODB_URI = 'mongodb://invalid:27017/test';

    // Mock mongoose.connect to simulate failure
    const originalConnect = mongoose.connect;
    mongoose.connect = jest.fn().mockRejectedValue(new Error('Connection failed'));

    await expect(connectDatabase()).rejects.toThrow('Connection failed');

    // Restore original
    mongoose.connect = originalConnect;
    process.env.MONGODB_URI = originalUri;
  });
});
