import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { app, firebaseConfig } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/colors';

export default function LoginScreen({ navigation }) {
  const { sendOTP, verifyOTP, updateProfile } = useAuth();
  const recaptchaVerifier = useRef(null);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState('phone'); // 'phone', 'otp', 'name'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  // Log Firebase app status on mount
  useEffect(() => {
    console.log('LoginScreen mounted, Firebase app:', app?.name);
  }, []);

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await sendOTP(phoneNumber, recaptchaVerifier.current);
      if (result.success) {
        setConfirmation(result.confirmation);
        setStep('otp');
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyOTP(otp, confirmation);
      if (result.success) {
        setStep('name');
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    setLoading(true);
    
    if (name.trim()) {
      await updateProfile(name.trim());
    }
    
    setLoading(false);
    navigation.navigate('Dashboard');
  };

  const handleSkipName = () => {
    navigation.navigate('Dashboard');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification={true}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {step === 'phone' && 'Login with Phone'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'name' && 'Your Profile'}
          </Text>
        </View>

        {/* Phone Number Step */}
        {step === 'phone' && (
          <View style={styles.formContainer}>
            <Text style={styles.subtitle}>
              Enter your mobile number to receive a verification code
            </Text>

            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text.replace(/[^0-9]/g, '').slice(0, 10));
                  setError('');
                }}
                placeholder="Enter mobile number"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <View style={styles.formContainer}>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to +91 {phoneNumber}
            </Text>

            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={(text) => {
                setOtp(text.replace(/[^0-9]/g, '').slice(0, 6));
                setError('');
              }}
              placeholder="Enter OTP"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => {
                setStep('phone');
                setOtp('');
                setError('');
              }}
            >
              <Text style={styles.resendText}>Change phone number</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Name Step (Optional) */}
        {step === 'name' && (
          <View style={styles.formContainer}>
            <View style={styles.successIcon}>
              <Text style={styles.successEmoji}>✓</Text>
            </View>
            <Text style={styles.successText}>Phone verified successfully!</Text>
            
            <Text style={styles.subtitle}>
              Add your name (optional)
            </Text>

            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSaveName}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.buttonText}>
                  {name.trim() ? 'Save & Continue' : 'Continue'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipName}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  backButton: {
    marginRight: spacing.md,
  },
  backIcon: {
    fontSize: 28,
    color: colors.text,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  formContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.base,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  countryCode: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  countryCodeText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.lg,
    color: colors.text,
  },
  otpInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    fontSize: typography.fontSize['2xl'],
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 10,
    marginBottom: spacing.lg,
  },
  nameInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.lg,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.background,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  resendButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  resendText: {
    color: colors.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  successEmoji: {
    fontSize: 40,
    color: colors.background,
  },
  successText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  skipButton: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  skipText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.base,
  },
});
