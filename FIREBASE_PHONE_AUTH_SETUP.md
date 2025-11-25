# Firebase Phone Authentication Setup Guide

## Current Issue
Phone OTP is not being sent due to reCAPTCHA 401 error. This happens because Firebase requires reCAPTCHA verification for phone authentication on web/Expo.

## Quick Fix for Testing (5 minutes)

### Add Test Phone Numbers in Firebase Console

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/project/emi-calcy/authentication/providers

2. **Enable Phone Authentication**
   - Click on "Phone" under Sign-in providers
   - Make sure it's enabled (toggle should be ON)

3. **Add Test Phone Numbers**
   - Scroll down to "Phone numbers for testing" section
   - Click "Add phone number"
   - Add these test numbers:
     - Phone: `+919999999999` → Code: `123456`
     - Phone: `+911234567890` → Code: `654321`
   - Click "Save"

4. **Test in Your App**
   - Use phone number: `9999999999`
   - When prompted for OTP, enter: `123456`
   - This will bypass reCAPTCHA for testing

## Production Fix (Required for Real Users)

### Option 1: Configure reCAPTCHA v3 (Recommended)

1. **Get reCAPTCHA Keys**
   - Go to: https://www.google.com/recaptcha/admin
   - Click "+" to create a new site
   - Choose "reCAPTCHA v3"
   - Add your domains:
     - `localhost` (for testing)
     - `emi-calcy.firebaseapp.com`
     - Your production domain
   - Copy the Site Key and Secret Key

2. **Configure in Firebase**
   - Go to Firebase Console → Authentication → Settings
   - Scroll to "Phone authentication"
   - Add your reCAPTCHA site key
   - Save

3. **Update Your App**
   - No code changes needed if using `expo-firebase-recaptcha`
   - The library will automatically use the configured reCAPTCHA

### Option 2: Use Firebase App Check (Advanced)

1. **Enable App Check**
   - Go to Firebase Console → App Check
   - Register your app
   - Follow the setup instructions

2. **Configure in Your App**
   - Install: `npm install firebase/app-check`
   - Initialize App Check in your firebase config

## Why This Happens

- Firebase Phone Authentication requires verification to prevent abuse
- On web/Expo, this verification is done via reCAPTCHA
- The error `401 Unauthorized` means the reCAPTCHA key is invalid or not configured
- The key `6LcMZR0UAAAAALgPMcgHwga7gY5p8QMg1Hj-bmUv` is a test key from expo-firebase-recaptcha

## Current Status

✅ Firebase is initialized correctly
✅ Phone authentication is enabled
❌ reCAPTCHA is not configured (causing 401 error)
❌ OTP cannot be sent to real phone numbers

## Next Steps

1. **For immediate testing**: Add test phone numbers (see Quick Fix above)
2. **For production**: Configure reCAPTCHA v3 (see Production Fix above)
3. **Test thoroughly**: Try both test numbers and real numbers

## Troubleshooting

### If test phone numbers don't work:
- Make sure you're using the exact format: `+919999999999`
- Check that phone auth is enabled in Firebase Console
- Clear browser cache and try again

### If reCAPTCHA still shows 401:
- Verify your domain is added to reCAPTCHA allowed domains
- Check Firebase Console → Authentication → Settings → Authorized domains
- Make sure your domain is listed there

### If backend shows 500 error:
- This happens when Firebase token verification fails
- Make sure your backend Firebase Admin SDK is configured correctly
- Check backend logs for specific error messages

## Support

If you continue to face issues:
1. Check Firebase Console logs
2. Check browser console for detailed error messages
3. Verify all Firebase configuration keys are correct
4. Ensure billing is enabled on Firebase (required for phone auth in production)
