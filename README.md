# Financial Calculator Suite

A comprehensive full-stack mobile application for financial calculations including EMI, SIP, FD, RD, PPF, TVM, and GST calculators - all optimized for Indian users.

## 🚀 Quick Start

**Want to test the app on your phone right now?**

Complete setup in 20 minutes:
- Deploy backend to Vercel (free)
- Test app on your Android phone
- Get everything running quickly

## Project Structure

This project consists of two main components:

### 1. Backend (`emi-calculator-backend/`)
Node.js/Express REST API with MongoDB Atlas and Firebase Authentication.

**Technologies:**
- Node.js & Express
- MongoDB & Mongoose
- Firebase Admin SDK for Authentication
- Jest & Supertest for testing
- fast-check for property-based testing

### 2. Frontend (`emi-calculator-app/`)
React Native mobile application built with Expo.

**Technologies:**
- React Native & Expo
- React Navigation
- Firebase Authentication (Phone Auth)
- AsyncStorage
- Axios
- Jest & React Native Testing Library
- fast-check for property-based testing

## Features

### 📱 Multiple Calculators

1. **EMI Calculator** - Calculate loan installments for home, personal, and vehicle loans
2. **SIP Calculator** - Systematic Investment Plan returns calculator
3. **FD Calculator** - Fixed Deposit maturity calculator
4. **RD Calculator** - Recurring Deposit maturity calculator
5. **PPF Calculator** - Public Provident Fund maturity calculator
6. **TVM Calculator** - Time Value of Money calculator (PV, FV, PMT, Rate, N)
7. **GST Calculator** - Calculate GST inclusive/exclusive amounts

### 🔐 Authentication & User Features

- **Phone Authentication**: Secure OTP-based login using Firebase
- **Guest Mode**: Use all calculators without authentication
- **User Profiles**: Manage your account and preferences
- **Save Plans**: Save EMI calculations for future reference (EMI only)
- **Calculation History**: View and manage past calculations across all calculators

### 💰 Indian-Focused Features

- **Indian Currency Format**: All amounts in Indian Rupee notation (₹)
- **Lakhs & Crores**: Proper Indian numbering system
- **GST Calculator**: India-specific tax calculations
- **PPF Calculator**: India's popular savings scheme

### 🎨 User Experience

- **Clean UI**: Modern, intuitive interface
- **Calculate Button**: No real-time calculations - enter values freely, then calculate
- **Decimal Input Support**: Smooth decimal entry for interest rates (e.g., 6.5%)
- **Input Validation**: Clear error messages on invalid inputs
- **Reset Functionality**: Quick reset to default values
- **Responsive Design**: Optimized for mobile devices

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
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `FIREBASE_PRIVATE_KEY`: Your Firebase private key
   - `FIREBASE_CLIENT_EMAIL`: Your Firebase client email
   - `ALLOWED_ORIGINS`: Frontend URLs (e.g., `http://localhost:19000,http://localhost:19006`)

5. Set up Firebase:
   - Create a Firebase project at console.firebase.google.com
   - Enable Phone Authentication
   - Download service account key (serviceAccountKey.json)
   - Place in backend root directory

6. Start the server:
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
   - `FIREBASE_API_KEY`: Your Firebase API key
   - `FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `FIREBASE_APP_ID`: Your Firebase app ID

5. Start the Expo development server:
```bash
npm start
```

6. Run on Android:
```bash
npm run android
```

## Testing on Mobile Device

To test the app on your Android phone:

1. Install Expo Go from Google Play Store
2. Start backend: `cd emi-calculator-backend && npm run dev`
3. Start frontend: `cd emi-calculator-app && npm start`
4. Scan QR code with Expo Go app
5. Make sure your phone and computer are on the same network

**Note:** Update API_URL in frontend .env to use your computer's local IP address (e.g., `http://192.168.1.100:5000`)

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

### Authentication
- `POST /auth/verify-token` - Verify Firebase authentication token

### Plans (Protected - EMI only)
- `GET /plans` - Get all user's saved EMI plans
- `POST /plans` - Save a new EMI calculation
- `DELETE /plans/:id` - Delete a saved plan

### Calculation History (Protected)
- `GET /calculations` - Get all user's calculation history
- `POST /calculations` - Save a calculation to history
- `DELETE /calculations/:id` - Delete a calculation from history

Supported calculation types: `emi`, `sip`, `fd`, `rd`, `ppf`, `tvm`, `gst`

## Calculator Details

### EMI Calculator
Calculate monthly installments for:
- Home Loans
- Personal Loans
- Vehicle Loans

**Inputs:** Loan amount, interest rate, tenure (months/years)
**Outputs:** Monthly EMI, total interest, total amount payable

### SIP Calculator
Calculate returns on Systematic Investment Plans

**Inputs:** Monthly investment, expected return rate, investment period (years)
**Outputs:** Future value, total investment, estimated returns

### FD Calculator
Calculate Fixed Deposit maturity amount

**Inputs:** Principal amount, interest rate, tenure (months)
**Outputs:** Maturity amount, principal, interest earned

### RD Calculator
Calculate Recurring Deposit maturity amount

**Inputs:** Monthly deposit, interest rate, tenure (months)
**Outputs:** Maturity amount, total deposit, interest earned

### PPF Calculator
Calculate Public Provident Fund maturity

**Inputs:** Annual deposit (₹500-₹1,50,000), interest rate, duration (15-30 years)
**Outputs:** Maturity amount, total investment, interest earned

### TVM Calculator
Time Value of Money calculations - solve for any variable:
- Present Value (PV)
- Future Value (FV)
- Payment (PMT)
- Number of periods (N)
- Interest Rate

**Features:** Compounding frequency, payment timing (beginning/end)

### GST Calculator
Calculate GST amounts for Indian tax rates

**Inputs:** Amount, GST rate, calculation type (inclusive/exclusive)
**Outputs:** Original amount, GST amount, total amount

## Environment Configuration

### Backend Environment Variables

Create `emi-calculator-backend/.env`:

```env
# MongoDB connection string (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/emi-calculator

# Firebase Configuration (REQUIRED)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Server configuration
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:19000,http://localhost:19006
```

**Security Notes:**
- Never commit `.env` files or `serviceAccountKey.json` to version control
- Use different Firebase projects for development and production
- Keep Firebase private keys secure

### Frontend Environment Variables

Create `emi-calculator-app/.env`:

```env
# Backend API URL
API_URL=http://localhost:5000

# Firebase Configuration (REQUIRED)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_APP_ID=1:123456789:android:abcdef

# Environment
NODE_ENV=development
```

**Note:** Update `API_URL` to match your backend server URL. For production, use your deployed backend URL.

### Verify Configuration

After setting up environment variables, run the verification script:

```bash
node verify-env.js
```

## Requirements

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (for backend database)
- Firebase project (for authentication)
- Expo CLI (for mobile development)
- Android Studio or physical Android device (for testing)

## Deployment

### Backend Deployment (Vercel/Railway/Heroku)

1. **Deploy Backend:**
   ```bash
   cd emi-calculator-backend
   # For Railway
   railway init
   railway up
   
   # For Heroku
   heroku create
   git push heroku main
   
   # For Vercel
   vercel
   ```

2. **Configure Environment Variables:**
   - Set all required environment variables on your deployment platform
   - Update `ALLOWED_ORIGINS` to include your Expo app URL
   - Add Firebase credentials securely

3. **Verify Deployment:**
   - Test API endpoints
   - Check authentication flow
   - Verify database connectivity

### Frontend Deployment (EAS Build)

1. **Build Frontend:**
   ```bash
   cd emi-calculator-app
   eas login
   eas build:configure
   # Update .env with production API_URL
   eas build --platform android --profile production
   ```

2. **Test Production Build:**
   - Download APK from EAS dashboard
   - Install on Android device
   - Verify all calculators work
   - Test authentication flow
   - Check calculation history

## Recent Updates

### Calculate Button Implementation
All calculators now use a Calculate button approach instead of real-time calculations. This provides:
- Better decimal input handling
- No interference while typing
- Clear validation feedback
- Consistent user experience

### Decimal Input Fix
Fixed decimal input across all calculators. Users can now:
- Type decimal values naturally (e.g., 6.5)
- Enter partial decimals (e.g., 6.)
- Delete and retype without issues
- See validation only on Calculate

### Slider Removal
Removed all custom sliders to avoid native module complications. All inputs now use text fields with:
- Clear range hints
- Better mobile keyboard support
- Improved accessibility

## Known Issues & Solutions

### Decimal Input
If you experience issues entering decimal values:
- Make sure you're using the latest version
- The decimal point should now be preserved while typing
- Validation happens only when you click Calculate

### Mobile Testing
If the app doesn't connect to backend:
- Check that both devices are on the same network
- Use your computer's local IP address in API_URL
- Ensure backend is running and accessible
- Check firewall settings

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
