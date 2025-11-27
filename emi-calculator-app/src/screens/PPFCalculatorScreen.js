import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import CustomSlider from '../components/CustomSlider';
import { calculatePPF } from '../utils/ppfCalculator';
import { formatIndianCurrency } from '../utils/currencyFormatter';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/colors';
import { saveToHistory } from '../utils/historyStorage';
import { useAuth } from '../context/AuthContext';

export default function PPFCalculatorScreen({ navigation }) {
  const { user } = useAuth();
  
  // State management
  const [depositAmount, setDepositAmount] = useState(50000);
  const [interestRate, setInterestRate] = useState(7.1);
  const [investmentDate, setInvestmentDate] = useState(new Date());
  const [durationYears, setDurationYears] = useState(15);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  // Format date as DD MMM YYYY
  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Validate inputs
  const validateInputs = () => {
    const newErrors = {};

    // Validate deposit amount (₹500 to ₹1,50,000)
    if (depositAmount < 500) {
      newErrors.depositAmount = 'Minimum deposit is ₹500';
    } else if (depositAmount > 150000) {
      newErrors.depositAmount = 'Maximum deposit is ₹1,50,000';
    }

    // Validate interest rate (up to 50%)
    if (interestRate <= 0) {
      newErrors.interestRate = 'Interest rate must be greater than 0';
    } else if (interestRate > 50) {
      newErrors.interestRate = 'Maximum interest rate is 50%';
    }

    // Validate duration (15 to 30 years)
    if (durationYears < 15) {
      newErrors.durationYears = 'Minimum duration is 15 years';
    } else if (durationYears > 30) {
      newErrors.durationYears = 'Maximum duration is 30 years';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Calculate button
  const handleCalculate = () => {
    if (!validateInputs()) {
      Alert.alert('Invalid Input', 'Please check your inputs and try again.');
      return;
    }

    const calculated = calculatePPF({
      annualDeposit: depositAmount,
      annualRate: interestRate,
      years: durationYears,
    });
    setResult(calculated);
  };

  // Handle Reset button
  const handleReset = () => {
    setDepositAmount(50000);
    setInterestRate(7.1);
    setInvestmentDate(new Date());
    setDurationYears(15);
    setResult(null);
    setErrors({});
  };

  // Handle Save to History
  const handleSaveToHistory = async () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to save your calculations to history.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    try {
      await saveToHistory({
        type: 'ppf',
        data: { 
          annualDeposit: depositAmount, 
          interestRate, 
          investmentDate: investmentDate.toISOString(), 
          durationYears 
        },
        result,
      });
      Alert.alert('Success', 'Saved to history successfully!');
    } catch (error) {
      console.error('Error', error);
      Alert.alert('Error', 'Failed to save to history. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>PPF Calculator</Text>
        </View>

        {/* Calculator Card */}
        <View style={styles.calculatorCard}>
          {/* Deposit Amount */}
          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Annual Deposit</Text>
              <TextInput
                style={[styles.valueInput, errors.depositAmount && styles.inputError]}
                value={depositAmount.toString()}
                onChangeText={(text) => {
                  const num = parseFloat(text) || 0;
                  setDepositAmount(num);
                  setErrors({ ...errors, depositAmount: null });
                }}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.formattedValue}>{formatIndianCurrency(depositAmount)}</Text>
            {errors.depositAmount && (
              <Text style={styles.errorText}>{errors.depositAmount}</Text>
            )}
            <CustomSlider
              style={styles.slider}
              minimumValue={500}
              maximumValue={150000}
              step={500}
              value={depositAmount}
              onValueChange={(value) => {
                setDepositAmount(value);
                setErrors({ ...errors, depositAmount: null });
              }}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>₹500</Text>
              <Text style={styles.sliderLabelText}>₹1.5L</Text>
            </View>
          </View>

          {/* Interest Rate */}
          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Interest Rate</Text>
              <TextInput
                style={[styles.valueInput, errors.interestRate && styles.inputError]}
                value={interestRate.toString()}
                onChangeText={(text) => {
                  const num = parseFloat(text) || 0;
                  setInterestRate(num);
                  setErrors({ ...errors, interestRate: null });
                }}
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.formattedValue}>{interestRate.toFixed(1)}% per annum</Text>
            {errors.interestRate && (
              <Text style={styles.errorText}>{errors.interestRate}</Text>
            )}
            <CustomSlider
              style={styles.slider}
              minimumValue={0.1}
              maximumValue={50}
              step={0.1}
              value={interestRate}
              onValueChange={(value) => {
                setInterestRate(value);
                setErrors({ ...errors, interestRate: null });
              }}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>0.1%</Text>
              <Text style={styles.sliderLabelText}>50%</Text>
            </View>
          </View>

          {/* Investment Date */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Investment Date</Text>
            <View style={styles.datePickerContainer}>
              <Text style={styles.dateText}>{formatDate(investmentDate)}</Text>
              <Text style={styles.dateNote}>Starting date of investment</Text>
            </View>
          </View>

          {/* Duration */}
          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Investment Duration</Text>
              <TextInput
                style={[styles.valueInput, errors.durationYears && styles.inputError]}
                value={durationYears.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  setDurationYears(num);
                  setErrors({ ...errors, durationYears: null });
                }}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.formattedValue}>{durationYears} Years</Text>
            {errors.durationYears && (
              <Text style={styles.errorText}>{errors.durationYears}</Text>
            )}
            <CustomSlider
              style={styles.slider}
              minimumValue={15}
              maximumValue={30}
              step={1}
              value={durationYears}
              onValueChange={(value) => {
                setDurationYears(value);
                setErrors({ ...errors, durationYears: null });
              }}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>15Y</Text>
              <Text style={styles.sliderLabelText}>30Y</Text>
            </View>
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

        {/* Results */}
        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Maturity Details</Text>

            <View style={styles.maturityCard}>
              <Text style={styles.maturityLabel}>Maturity Amount</Text>
              <Text style={styles.maturityValue}>{formatIndianCurrency(result.maturityAmount)}</Text>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Investment</Text>
                <Text style={styles.detailValue}>{formatIndianCurrency(result.totalInvestment)}</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Interest Earned</Text>
                <Text style={[styles.detailValue, styles.interestValue]}>
                  {formatIndianCurrency(result.interestEarned)}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveToHistory}>
              <Text style={styles.saveButtonText}>💾 Save to History</Text>
            </TouchableOpacity>
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  valueInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 100,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    textAlign: 'right',
  },
  inputError: {
    borderColor: colors.error,
  },
  formattedValue: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
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
  datePickerContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  dateText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  dateNote: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
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
  resultContainer: {
    marginBottom: spacing.xl,
  },
  resultTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.base,
  },
  maturityCard: {
    backgroundColor: '#8b5cf6',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.base,
    ...shadows.md,
  },
  maturityLabel: {
    fontSize: typography.fontSize.base,
    color: colors.background,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  maturityValue: {
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
  interestValue: {
    color: '#8b5cf6',
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});
