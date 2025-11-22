# EMI Calculator India - Mobile App

React Native mobile application built with Expo for calculating EMI (Equated Monthly Installments) for various types of loans in India.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your backend API URL

4. Start the development server:
```bash
npm start
```

5. Run on Android:
```bash
npm run android
```

6. Run tests:
```bash
npm test
```

## Environment Variables

The application uses environment variables for configuration. Create a `.env` file in the root directory based on `.env.example`.

### Required Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `API_URL` | Backend API base URL | `http://localhost:5000` | `http://localhost:5000` (dev)<br/>`https://api.example.com` (prod) |
| `NODE_ENV` | Environment mode | `development` | `development` or `production` |

### Configuration for Different Environments

**Development:**
```env
API_URL=http://localhost:5000
NODE_ENV=development
```

**Production:**
```env
API_URL=https://your-backend-api.com
NODE_ENV=production
```

**Note:** Make sure the `API_URL` matches your backend server URL. For local development with Expo, use `http://localhost:5000`. For production, use your deployed backend URL.

## Features

- **Guest Mode**: Calculate EMI without authentication
- **User Authentication**: Sign up and log in to access advanced features
- **Save Calculations**: Save EMI calculations for future reference
- **View Saved Plans**: Access all your saved EMI calculations
- **Delete Plans**: Remove plans you no longer need
- **Indian Currency Format**: All amounts displayed in Indian Rupee notation

## Project Structure

```
emi-calculator-app/
├── src/
│   ├── navigation/     # React Navigation setup
│   ├── screens/        # Screen components
│   ├── components/     # Reusable UI components
│   ├── context/        # React Context (Auth)
│   ├── utils/          # Utility functions
│   ├── constants/      # App constants
│   └── types/          # Type definitions
├── __tests__/          # Test files
├── assets/             # Images and icons
├── App.js              # Entry point
└── package.json
```

## Technologies

- React Native
- Expo SDK
- React Navigation
- AsyncStorage
- Axios
- Jest & React Native Testing Library
- fast-check (Property-based testing)

## Building for Production

This app uses EAS (Expo Application Services) for building production-ready APKs and AABs.

### Prerequisites

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure your project:
```bash
eas build:configure
```

### Build Profiles

The project includes three build profiles in `eas.json`:

- **development**: For development builds with debugging enabled
- **preview**: For internal testing (APK format)
- **production**: For production release

### Building an APK

**For testing (Preview build):**
```bash
eas build --platform android --profile preview
```

**For production:**
```bash
eas build --platform android --profile production
```

### Before Building

1. Update `.env` with your production backend URL:
```env
API_URL=https://your-backend-url.railway.app
NODE_ENV=production
```

2. Update `app.json`:
   - Ensure `expo.extra.eas.projectId` is set (done automatically by `eas build:configure`)
   - Update version number if needed
   - Verify package name: `com.emicalculator.india`

3. Ensure backend CORS is configured to allow your Expo app URL

### Testing the Build

1. Download the APK from the EAS dashboard after build completes
2. Transfer to your Android device
3. Enable "Install from Unknown Sources" in device settings
4. Install and test all functionality:
   - EMI calculation
   - User signup/login
   - Save/view/delete plans
   - Error handling

### Deployment to Play Store

To deploy to Google Play Store:

1. Build an AAB (Android App Bundle):
```bash
eas build --platform android --profile production
```

2. Create a Google Play Developer account ($25 one-time fee)

3. Submit through Google Play Console:
```bash
eas submit --platform android
```

For detailed deployment instructions, see the [Deployment Guide](../DEPLOYMENT_GUIDE.md) in the root directory.

## Troubleshooting

**Build fails:**
- Run `eas build:configure` again
- Ensure all dependencies are in `package.json`
- Check EAS build logs for specific errors

**App can't connect to backend:**
- Verify `API_URL` in `.env` is correct
- Check backend is running and accessible
- Ensure CORS is configured on backend

**Authentication issues:**
- Clear app data and try again
- Check backend JWT configuration
- Verify AsyncStorage is working
