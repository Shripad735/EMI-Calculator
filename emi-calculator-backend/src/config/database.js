const mongoose = require('mongoose');

// Cache the database connection for serverless environments
let cachedConnection = null;

/**
 * Connect to MongoDB Atlas database
 * Optimized for serverless environments (Vercel)
 * @returns {Promise<void>}
 */
const connectDatabase = async () => {
  try {
    // Check if MONGODB_URI is provided
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // If already connected, reuse the connection
    if (cachedConnection && mongoose.connection.readyState === 1) {
      console.log('Using cached MongoDB connection');
      return cachedConnection;
    }

    // If connection exists but not ready, wait for it
    if (mongoose.connection.readyState === 2) {
      console.log('MongoDB connection in progress, waiting...');
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve);
      });
      return cachedConnection;
    }

    // Configure mongoose for serverless
    mongoose.set('strictQuery', false);
    mongoose.set('bufferCommands', false); // Disable buffering for serverless
    mongoose.set('bufferTimeoutMS', 30000); // Increase timeout

    // Connect to MongoDB with serverless-optimized options
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });

    cachedConnection = connection;
    console.log('MongoDB connected successfully');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', {
        message: err.message,
        code: err.code,
        timestamp: new Date().toISOString()
      });
      cachedConnection = null; // Clear cache on error
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected at', new Date().toISOString());
      cachedConnection = null; // Clear cache on disconnect
    });

    return cachedConnection;

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    cachedConnection = null; // Clear cache on error
    throw error;
  }
};

module.exports = { connectDatabase };
