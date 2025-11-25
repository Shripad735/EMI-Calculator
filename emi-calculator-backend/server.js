require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { connectDatabase } = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// 🔹 SIMPLE, SAFE CORS CONFIG (no credentials, allow all origins for now)
app.use(
  cors({
    origin: '*', // allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    optionsSuccessStatus: 200, // for older browsers, but fine generally
    credentials: false,        // ⛔ important: must be false if origin is '*'
  })
);

// ❌ REMOVE this line completely (it's causing the non-OK status):
// app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to ensure database connection for each request (serverless)
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    res.status(503).json({ 
      error: 'Service temporarily unavailable. Please try again.' 
    });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'EMI Calculator Backend is running',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/auth', require('./src/routes/auth'));
app.use('/plans', require('./src/routes/plans'));
app.use('/calculations', require('./src/routes/calculations'));

const { notFoundHandler, errorHandler } = require('./src/middleware/errorHandler');
app.use(notFoundHandler);
app.use(errorHandler);

// Start server (only in local development)
if (require.main === module) {
  connectDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log('Database connected');
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    });
}

module.exports = app;

