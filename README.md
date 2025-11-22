# EMI Calculator

A full-stack mobile application for calculating Equated Monthly Installments (EMI) for various types of loans in India.

## 🚀 Quick Start

**Want to test the app on your phone right now?**

👉 **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Complete setup in 20 minutes!

This guide will help you:
- Deploy backend to Vercel (free)
- Test app on your Android phone
- Get everything running quickly

## Project Structure

This project consists of two main components:

### 1. Backend (`emi-calculator-backend/`)
Node.js/Express REST API with MongoDB Atlas for data persistence.

**Technologies:**
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Jest & Supertest for testing
- fast-check for property-based testing

### 2. Frontend (`emi-calculator-app/`)
React Native mobile application built with Expo.

**Technologies:**
- React Native & Expo
- React Navigation
- AsyncStorage
- Axios
- Jest & React Native Testing Library
- fast-check for property-based testing

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd emi-calculator-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A strong random secret (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `ALLOWED_ORIGINS`: Frontend URLs (e.g., `http://localhost:19000,http://localhost:19006`)
   - See [Backend README](./emi-calculator-backend/README.md) for detailed configuration

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd emi-calculator-app
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
   - `API_URL`: Backend API URL (e.g., `http://localhost:5000` for local development)
   - See [Frontend README](./emi-calculator-app/README.md) for detailed configuration

5. Start the Expo development server:
```bash
npm start
```

6. Run on Android:
```bash
npm run android
```

## Features

- **EMI Calculation**: Calculate monthly installments for loans
- **Indian Currency Format**: All amounts in Indian Rupee notation (₹)
- **Guest Mode**: Use calculator without authentication
- **User Authentication**: Sign up and log in
- **Save Plans**: Save EMI calculations for future reference
- **Manage Plans**: View and delete saved calculations

## Testing on Mobile Device

Want to test the app on your Android phone? See the [Mobile Testing Guide](./MOBILE_TESTING_GUIDE.md) for step-by-step instructions.

**Quick Start:**
1. Install Expo Go on your phone
2. Start backend: `cd emi-calculator-backend && npm run dev`
3. Start frontend: `cd emi-calculator-app && npm start`
4. Scan QR code with Expo Go

For detailed instructions, see [MOBILE_TESTING_GUIDE.md](./MOBILE_TESTING_GUIDE.md)

## Automated Testing

Both frontend and backend include comprehensive test suites:

**Backend:**
```bash
cd emi-calculator-backend
npm test
```

**Frontend:**
```bash
cd emi-calculator-app
npm test
```

## API Endpoints

For comprehensive API documentation with detailed request/response examples, see [API Documentation](./emi-calculator-backend/API_DOCUMENTATION.md).

### Quick Reference

**Authentication:**
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Authenticate user

**Plans (Protected):**
- `GET /plans` - Get all user's saved plans
- `POST /plans` - Save a new EMI calculation
- `DELETE /plans/:id` - Delete a saved plan

## Environment Configuration

Both the frontend and backend require environment variables for proper operation. Each component has a `.env.example` file that serves as a template.

### Backend Environment Variables

Create `emi-calculator-backend/.env` with the following required variables:

```env
# MongoDB connection string (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/emi-calculator

# JWT secret for authentication (REQUIRED - use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server configuration
PORT=5000
NODE_ENV=development
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:19000,http://localhost:19006
```

**Security Notes:**
- Generate a secure JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Never commit `.env` files to version control
- Use different secrets for development and production
- See [Backend README](./emi-calculator-backend/README.md) for detailed security requirements

### Frontend Environment Variables

Create `emi-calculator-app/.env` with:

```env
# Backend API URL
API_URL=http://localhost:5000

# Environment
NODE_ENV=development
```

**Note:** Update `API_URL` to match your backend server URL. For production, use your deployed backend URL.

### Verify Configuration

After setting up environment variables, run the verification script to check your configuration:

```bash
node verify-env.js
```

This script will verify that all required environment variables are properly configured.

## Requirements

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (for backend database)
- Expo CLI (for mobile development)
- Android Studio or physical Android device (for testing)

## Documentation

For detailed setup and development instructions, see:
- [Environment Configuration Guide](./ENVIRONMENT_SETUP.md) - Comprehensive guide for setting up environment variables
- [Backend README](./emi-calculator-backend/README.md) - Backend-specific documentation
- [Frontend README](./emi-calculator-app/README.md) - Frontend-specific documentation

## Deployment

This application can be deployed to production using various platforms.

### Quick Deployment Overview

**Backend:** Deploy to Vercel, Railway, or Heroku
**Frontend:** Build with EAS (Expo Application Services)
**Database:** MongoDB Atlas (already cloud-hosted)

### 🚀 Quick Start: Testing & Deployment

For the fastest way to test on mobile and deploy to Vercel, see:
**[QUICK_START_TESTING_AND_DEPLOYMENT.md](./QUICK_START_TESTING_AND_DEPLOYMENT.md)** ⭐

This guide covers:
- Testing on mobile with Expo Go (5 minutes)
- Deploying backend to Vercel (10 minutes)
- Building production APK (optional)

### Deployment Documentation

For detailed deployment instructions, see:
- **[Mobile Testing Guide](./MOBILE_TESTING_GUIDE.md)** - Test app on your Android device
- **[Vercel Deployment Guide](./VERCEL_DEPLOYMENT_GUIDE.md)** - Deploy backend to Vercel
- [Deployment Quick Start](./DEPLOYMENT_QUICKSTART.md) - Fast-track deployment guide (Railway/Heroku)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete step-by-step deployment instructions
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Checklist to ensure all steps are completed

### Quick Deployment Steps

1. **Deploy Backend:**
   ```bash
   cd emi-calculator-backend
   # For Railway
   railway init
   railway up
   
   # For Heroku
   heroku create
   git push heroku main
   ```

2. **Configure Environment Variables:**
   - Set all required environment variables on your deployment platform
   - Update `ALLOWED_ORIGINS` to include your Expo app URL
   - Generate a strong `JWT_SECRET` for production

3. **Build Frontend:**
   ```bash
   cd emi-calculator-app
   eas login
   eas build:configure
   # Update .env with production API_URL
   eas build --platform android --profile production
   ```

4. **Test Production Build:**
   - Download APK from EAS dashboard
   - Install on Android device
   - Verify all functionality works

See the [Deployment Guide](./DEPLOYMENT_GUIDE.md) for detailed instructions, troubleshooting, and security considerations.

