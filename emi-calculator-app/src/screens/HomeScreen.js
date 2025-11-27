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
  const [interestRate, setInterestRate] = useState('8.5');
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

  // Handle Calculate button
  const handleCalculate = () => {
    const rateNum = parseFloat(interestRate);
    
    // Validate inputs
    if (loanAmount <= 0) {
      alert('Please enter a valid loan amount');
      return;
    }
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 30) {
      alert('Interest rate must be between 0% and 30%');
      return;
    }
    if (tenure < 1) {
      alert('Tenure must be at least 1 ' + (tenureUnit === 'months' ? 'month' : 'year'));
      return;
    }

    const tenureMonths = tenureUnit === 'years' ? tenure * 12 : tenure;
    const calculatedResult = calculateEMI({
      principal: loanAmount,
      annualRate: rateNum,
      tenureMonths,
    });
    setResult(calculatedResult);
  };

  // Handle Reset button
  const handleReset = () => {
    setLoanAmount(500000);
    setInterestRate('8.5');
    setTenure(12);
    setTenureUnit('months');
    setLoanType('Personal');
    setResult(null);
  };

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
        interestRate: parseFloat(interestRate),
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
                    const numValue = parseFloat(text.replace(/,/g, ''));
                    if (!isNaN(numValue)) {
                      setLoanAmount(numValue);
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="Enter amount"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.formattedValue}>{formatIndianCurrency(loanAmount)}</Text>
            <Text style={styles.rangeHint}>Range: ₹0 - ₹1 Crore</Text>
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
                  value={interestRate}
                  onChangeText={(text) => {
                    // Allow empty string
                    if (text === '') {
                      setInterestRate('');
                      return;
                    }
                    // Allow decimal input up to 2 decimal places
                    if (/^\d*\.?\d{0,2}$/.test(text)) {
                      setInterestRate(text);
                    }
                  }}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.formattedValue}>
              {interestRate ? `${parseFloat(interestRate).toFixed(1)}% per annum` : '0.0% per annum'}
            </Text>
            <Text style={styles.rangeHint}>Range: 0% - 30%</Text>
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
                    const numValue = parseInt(text);
                    if (!isNaN(numValue)) {
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
            <Text style={styles.rangeHint}>
              Range: 1 - {tenureUnit === 'months' ? '360 Months' : '30 Years'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
              <Text style={styles.calculateButtonText}>Calculate</Text>
            </TouchableOpacity>
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
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  rangeHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.base,
  },
  resetButton: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginRight: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  calculateButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginLeft: spacing.sm,
    alignItems: 'center',
    ...shadows.sm,
  },
  calculateButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
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
