import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import CustomSlider from '../components/CustomSlider';
import { calculateEMI } from '../utils/emiCalculator';
import { formatIndianCurrency } from '../utils/currencyFormatter';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { savePlan } from '../utils/api';
import Button from '../components/Button';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  
  // Form state with slider values
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(12);
  const [tenureUnit, setTenureUnit] = useState('months');
  const [loanType, setLoanType] = useState('Personal');

  // Result state
  const [result, setResult] = useState(null);

  // Save state
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  // Loan type options with icons
  const loanTypes = [
    { value: 'Home', label: 'Home Loan', icon: '🏠' },
    { value: 'Personal', label: 'Personal Loan', icon: '💰' },
    { value: 'Vehicle', label: 'Vehicle Loan', icon: '🚗' },
  ];

  // Calculate EMI automatically
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const tenureMonths = tenureUnit === 'years' ? tenure * 12 : tenure;
      const calculatedResult = calculateEMI({
        principal: loanAmount,
        annualRate: interestRate,
        tenureMonths,
      });
      setResult(calculatedResult);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [loanAmount, interestRate, tenure, tenureUnit]);

  // Handle tenure unit toggle
  const handleTenureUnitChange = (newUnit) => {
    if (tenureUnit === 'months' && newUnit === 'years') {
      setTenure(Math.round(tenure / 12));
    } else if (tenureUnit === 'years' && newUnit === 'months') {
      setTenure(tenure * 12);
    }
    setTenureUnit(newUnit);
  };

  // Handle save plan
  const handleSavePlan = async () => {
    if (!result) return;

    setSaveMessage(null);
    setSaveError(null);
    setSaveLoading(true);

    try {
      const tenureMonths = tenureUnit === 'years' ? tenure * 12 : tenure;
      const planData = {
        loanAmount,
        interestRate,
        tenure: tenureMonths,
        loanType,
        emi: result.emi,
        totalInterest: result.totalInterest,
        totalAmountPayable: result.totalAmount,
      };

      await savePlan(planData);
      setSaveMessage('Plan saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      if (error.requiresLogin || error.isAuthError) {
        setSaveError('Your session has expired. Please login again.');
        setTimeout(async () => {
          try {
            await logout();
          } catch (logoutError) {
            console.error('Error during logout:', logoutError);
          }
        }, 2000);
      } else if (error.isNetworkError) {
        setSaveError('Unable to connect to server. Please check your internet connection.');
      } else {
        setSaveError(error.message || 'Failed to save plan. Please try again.');
      }
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>EMI Calculator </Text>  
            <Text style={styles.subtitle}>
              {user ? `Welcome${user.name ? `, ${user.name}` : ''}!` : 'Calculate your loan EMI'}
            </Text>
          </View>
          
          {/* Auth Buttons */}
          {user ? (
            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.savedPlansButton}
                onPress={() => navigation.navigate('SavedPlans')}
              >
                <Text style={styles.savedPlansButtonText}>📋 My Plans</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <Text style={styles.profileButtonText}>👤</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>Login with Phone</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Calculator Card */}
        <View style={styles.calculatorCard}>
          {/* Loan Type Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Loan Type</Text>
            <View style={styles.loanTypeContainer}>
              {loanTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.loanTypeCard,
                    loanType === type.value && styles.loanTypeCardActive,
                  ]}
                  onPress={() => setLoanType(type.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loanTypeIcon}>{type.icon}</Text>
                  <Text
                    style={[
                      styles.loanTypeLabel,
                      loanType === type.value && styles.loanTypeLabelActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Loan Amount Slider */}
          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Loan Amount</Text>
              <TouchableOpacity 
                style={styles.valueInputContainer}
                onPress={() => {}}
              >
                <TextInput
                  style={styles.valueInput}
                  value={loanAmount.toString()}
                  onChangeText={(text) => {
                    if (text === '') {
                      setLoanAmount(0);
                      return;
                    }
                    const numValue = parseFloat(text.replace(/,/g, '')) || 0;
                    if (numValue <= 10000000) {
                      setLoanAmount(numValue);
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="Enter amount"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.formattedValue}>{formatIndianCurrency(loanAmount)}</Text>
            <CustomSlider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10000000}
              step={10000}
              value={loanAmount}
              onValueChange={setLoanAmount}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>₹0</Text>
              <Text style={styles.sliderLabelText}>₹1Cr</Text>
            </View>
          </View>

          {/* Interest Rate Slider */}
          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Interest Rate</Text>
              <TouchableOpacity 
                style={styles.valueInputContainer}
                onPress={() => {}}
              >
                <TextInput
                  style={styles.valueInput}
                  value={interestRate.toString()}
                  onChangeText={(text) => {
                    if (text === '') {
                      setInterestRate(0);
                      return;
                    }
                    const numValue = parseFloat(text) || 0;
                    if (numValue <= 30) {
                      setInterestRate(numValue);
                    }
                  }}
                  keyboardType="decimal-pad"
                  placeholder="Enter rate"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.formattedValue}>{interestRate.toFixed(1)}% per annum</Text>
            <CustomSlider
              style={styles.slider}
              minimumValue={0}
              maximumValue={30}
              step={0.1}
              value={interestRate}
              onValueChange={setInterestRate}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>0%</Text>
              <Text style={styles.sliderLabelText}>30%</Text>
            </View>
          </View>

          {/* Tenure Slider with Unit Toggle */}
          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Loan Tenure</Text>
              <TouchableOpacity 
                style={styles.valueInputContainer}
                onPress={() => {}}
              >
                <TextInput
                  style={styles.valueInput}
                  value={tenure.toString()}
                  onChangeText={(text) => {
                    if (text === '') {
                      setTenure(0);
                      return;
                    }
                    const numValue = parseInt(text) || 0;
                    const maxValue = tenureUnit === 'months' ? 360 : 30;
                    if (numValue <= maxValue) {
                      setTenure(numValue);
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="Enter tenure"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.formattedValue}>
              {tenure} {tenureUnit === 'months' ? 'Months' : 'Years'}
            </Text>
            
            {/* Tenure Unit Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  tenureUnit === 'months' && styles.toggleButtonActive,
                ]}
                onPress={() => handleTenureUnitChange('months')}
              >
                <Text
                  style={[
                    styles.toggleText,
                    tenureUnit === 'months' && styles.toggleTextActive,
                  ]}
                >
                  Months
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  tenureUnit === 'years' && styles.toggleButtonActive,
                ]}
                onPress={() => handleTenureUnitChange('years')}
              >
                <Text
                  style={[
                    styles.toggleText,
                    tenureUnit === 'years' && styles.toggleTextActive,
                  ]}
                >
                  Years
                </Text>
              </TouchableOpacity>
            </View>

            <CustomSlider
              style={styles.slider}
              minimumValue={0}
              maximumValue={tenureUnit === 'months' ? 360 : 30}
              step={1}
              value={tenure}
              onValueChange={setTenure}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>0</Text>
              <Text style={styles.sliderLabelText}>
                {tenureUnit === 'months' ? '360 Months' : '30 Years'}
              </Text>
            </View>
          </View>
        </View>

        {/* Results Display */}
        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Your EMI Breakdown</Text>

            {/* EMI Card - Highlighted */}
            <View style={styles.emiCard}>
              <Text style={styles.emiLabel}>Monthly EMI</Text>
              <Text style={styles.emiValue}>{formatIndianCurrency(result.emi)}</Text>
            </View>

            {/* Other Details */}
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Principal Amount</Text>
                <Text style={styles.detailValue}>{formatIndianCurrency(loanAmount)}</Text>
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Interest</Text>
                <Text style={styles.detailValue}>{formatIndianCurrency(result.totalInterest)}</Text>
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Amount</Text>
                <Text style={[styles.detailValue, styles.detailValueTotal]}>
                  {formatIndianCurrency(result.totalAmount)}
                </Text>
              </View>
            </View>

            {/* Save Button - Only show when user is logged in */}
            {user && (
              <Button
                title="💾 Save this plan"
                onPress={handleSavePlan}
                variant="success"
                size="large"
                fullWidth
                loading={saveLoading}
                style={styles.saveButton}
              />
            )}

            {/* Success Message */}
            {saveMessage && (
              <View style={styles.successMessage}>
                <Text style={styles.successMessageText}>✓ {saveMessage}</Text>
              </View>
            )}

            {/* Error Message */}
            {saveError && (
              <View style={styles.errorMessage}>
                <Text style={styles.errorMessageText}>✕ {saveError}</Text>
              </View>
            )}
          </View>
        )}

        {/* Other Calculators Section */}
        <View style={styles.otherCalculatorsSection}>
          <Text style={styles.otherCalculatorsTitle}>More Financial Tools</Text>
          <View style={styles.calculatorGrid}>
            <TouchableOpacity
              style={styles.calculatorGridCard}
              onPress={() => navigation.navigate('TVMCalculator')}
              activeOpacity={0.7}
            >
              <View style={[styles.calculatorGridIcon, { backgroundColor: '#f97316' + '20' }]}>
                <Text style={styles.calculatorGridIconText}>⏰</Text>
              </View>
              <Text style={styles.calculatorGridTitle}>TVM Calculator</Text>
              <Text style={styles.calculatorGridDescription}>Time Value of Money</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.calculatorGridCard}
              onPress={() => navigation.navigate('PPFCalculator')}
              activeOpacity={0.7}
            >
              <View style={[styles.calculatorGridIcon, { backgroundColor: '#14b8a6' + '20' }]}>
                <Text style={styles.calculatorGridIconText}>🏛️</Text>
              </View>
              <Text style={styles.calculatorGridTitle}>PPF Calculator</Text>
              <Text style={styles.calculatorGridDescription}>Public Provident Fund</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.calculatorGridCard}
              onPress={() => navigation.navigate('Dashboard')}
              activeOpacity={0.7}
            >
              <View style={[styles.calculatorGridIcon, { backgroundColor: colors.primary + '20' }]}>
                <Text style={styles.calculatorGridIconText}>📊</Text>
              </View>
              <Text style={styles.calculatorGridTitle}>All Calculators</Text>
              <Text style={styles.calculatorGridDescription}>View all tools</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    padding: spacing.base,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing['3xl'],
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
    marginBottom: spacing.base,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.sm,
  },
  loginButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  userActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  savedPlansButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  savedPlansButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  profileButton: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileButtonText: {
    fontSize: 20,
  },
  calculatorCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.base,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  loanTypeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  loanTypeCard: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  loanTypeCardActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    ...shadows.sm,
  },
  loanTypeIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  loanTypeLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loanTypeLabelActive: {
    color: colors.background,
    fontWeight: typography.fontWeight.bold,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  valueInputContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 100,
  },
  valueInput: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    textAlign: 'right',
  },
  formattedValue: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sliderLabelText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    borderRadius: borderRadius.base,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.background,
  },
  resultContainer: {
    marginBottom: spacing.xl,
  },
  resultTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.base,
  },
  emiCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.base,
    ...shadows.md,
  },
  emiLabel: {
    fontSize: typography.fontSize.base,
    color: colors.background,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  emiValue: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
  },
  detailsCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.base,
    ...shadows.base,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  detailValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  detailValueTotal: {
    color: colors.primary,
    fontSize: typography.fontSize.xl,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
  successMessage: {
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.success,
  },
  successMessageText: {
    color: colors.successDark,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  errorMessage: {
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorMessageText: {
    color: colors.errorDark,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  otherCalculatorsSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  otherCalculatorsTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.base,
  },
  calculatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  calculatorGridCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    width: '47%',
    alignItems: 'center',
    ...shadows.base,
  },
  calculatorGridIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  calculatorGridIconText: {
    fontSize: 28,
  },
  calculatorGridTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  calculatorGridDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    textAlign: 'center',
  },
});
