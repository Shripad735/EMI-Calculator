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
import { calculateTVM } from '../utils/tvmCalculator';
import { formatIndianCurrency } from '../utils/currencyFormatter';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/colors';
import { saveToHistory } from '../utils/historyStorage';
import { useAuth } from '../context/AuthContext';

export default function TVMCalculatorScreen({ navigation }) {
  const { user } = useAuth();
  
  // State for which variable to calculate
  const [calculateVariable, setCalculateVariable] = useState('FV');
  
  // State for input values
  const [presentValue, setPresentValue] = useState('0');
  const [futureValue, setFutureValue] = useState('0');
  const [paymentPerPeriod, setPaymentPerPeriod] = useState('5000');
  const [numberOfPeriods, setNumberOfPeriods] = useState('10');
  const [interestRate, setInterestRate] = useState('8');
  
  // State for options
  const [compoundingFrequency, setCompoundingFrequency] = useState('Annually');
  const [paymentTiming, setPaymentTiming] = useState('End');
  
  // State for result
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Variable options
  const variables = [
    { value: 'PV', label: 'Present Value', icon: '💰' },
    { value: 'FV', label: 'Future Value', icon: '🎯' },
    { value: 'PMT', label: 'Payment', icon: '💵' },
    { value: 'N', label: 'Periods', icon: '📅' },
    { value: 'Rate', label: 'Rate', icon: '📈' },
  ];

  // Compounding frequency options
  const frequencies = ['Monthly', 'Quarterly', 'Semi-Annually', 'Annually'];

  // Payment timing options
  const timings = ['End', 'Beginning'];

  // Get input fields based on selected variable
  const getInputFields = () => {
    const fields = {
      PV: { label: 'Present Value', value: presentValue, setter: setPresentValue, disabled: true },
      FV: { label: 'Future Value', value: futureValue, setter: setFutureValue, disabled: calculateVariable === 'FV' },
      PMT: { label: 'Payment per Period', value: paymentPerPeriod, setter: setPaymentPerPeriod, disabled: calculateVariable === 'PMT' },
      N: { label: 'Number of Periods (Years)', value: numberOfPeriods, setter: setNumberOfPeriods, disabled: calculateVariable === 'N' },
      Rate: { label: 'Interest Rate (% p.a.)', value: interestRate, setter: setInterestRate, disabled: calculateVariable === 'Rate' },
    };

    return Object.entries(fields).map(([key, field]) => ({
      key,
      ...field,
      disabled: calculateVariable === key,
    }));
  };

  // Validate inputs
  const validateInputs = () => {
    const inputs = {
      PV: parseFloat(presentValue) || 0,
      FV: parseFloat(futureValue) || 0,
      PMT: parseFloat(paymentPerPeriod) || 0,
      N: parseFloat(numberOfPeriods) || 0,
      Rate: parseFloat(interestRate) || 0,
    };

    // Check that we have at least some non-zero values
    const nonCalculatedValues = Object.entries(inputs)
      .filter(([key]) => key !== calculateVariable)
      .map(([, value]) => value);

    if (nonCalculatedValues.every(v => v === 0)) {
      return 'Please enter at least one non-zero value';
    }

    // Validate number of periods
    if (calculateVariable !== 'N' && inputs.N <= 0) {
      return 'Number of periods must be greater than 0';
    }

    // Validate interest rate
    if (calculateVariable !== 'Rate' && inputs.Rate < 0) {
      return 'Interest rate cannot be negative';
    }

    return null;
  };

  // Handle calculate
  const handleCalculate = () => {
    setError(null);
    setResult(null);

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const calculationResult = calculateTVM({
        calculateVariable,
        presentValue: parseFloat(presentValue) || 0,
        futureValue: parseFloat(futureValue) || 0,
        paymentPerPeriod: parseFloat(paymentPerPeriod) || 0,
        numberOfPeriods: parseFloat(numberOfPeriods) || 0,
        interestRate: parseFloat(interestRate) || 0,
        compoundingFrequency,
        paymentTiming,
      });

      setResult(calculationResult);
    } catch (err) {
      setError(err.message || 'Calculation failed. Please check your inputs.');
    }
  };

  // Handle reset
  const handleReset = () => {
    setPresentValue('0');
    setFutureValue('0');
    setPaymentPerPeriod('5000');
    setNumberOfPeriods('10');
    setInterestRate('8');
    setCompoundingFrequency('Annually');
    setPaymentTiming('End');
    setResult(null);
    setError(null);
  };

  // Handle save to history
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
        type: 'tvm',
        data: {
          calculateVariable,
          presentValue: parseFloat(presentValue) || 0,
          futureValue: parseFloat(futureValue) || 0,
          paymentPerPeriod: parseFloat(paymentPerPeriod) || 0,
          numberOfPeriods: parseFloat(numberOfPeriods) || 0,
          interestRate: parseFloat(interestRate) || 0,
          compoundingFrequency,
          paymentTiming,
        },
        result,
      });
      Alert.alert('Success', 'Saved to history successfully!');
    } catch (error) {
      console.error('Error saving to history:', error);
      Alert.alert('Error', 'Failed to save to history. Please try again.');
    }
  };

  // Format result value based on variable type
  const formatResultValue = (value, variable) => {
    if (variable === 'Rate') {
      return `${value.toFixed(2)}%`;
    } else if (variable === 'N') {
      return `${value.toFixed(2)} years`;
    } else {
      return formatIndianCurrency(value);
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
          <Text style={styles.title}>TVM Calculator</Text>
        </View>

        {/* Calculator Card */}
        <View style={styles.calculatorCard}>
          {/* Variable Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Calculate</Text>
            <View style={styles.variableGrid}>
              {variables.map((variable) => (
                <TouchableOpacity
                  key={variable.value}
                  style={[
                    styles.variableCard,
                    calculateVariable === variable.value && styles.variableCardActive,
                  ]}
                  onPress={() => setCalculateVariable(variable.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.variableIcon}>{variable.icon}</Text>
                  <Text
                    style={[
                      styles.variableLabel,
                      calculateVariable === variable.value && styles.variableLabelActive,
                    ]}
                  >
                    {variable.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Input Fields */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Input Values</Text>
            {getInputFields().map((field) => (
              <View key={field.key} style={styles.inputRow}>
                <Text style={styles.inputLabel}>{field.label}</Text>
                <TextInput
                  style={[
                    styles.input,
                    field.disabled && styles.inputDisabled,
                  ]}
                  value={field.value}
                  onChangeText={field.setter}
                  keyboardType="decimal-pad"
                  editable={!field.disabled}
                  placeholder={field.disabled ? 'Calculated' : '0'}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            ))}
          </View>

          {/* Compounding Frequency */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Compounding Frequency</Text>
            <View style={styles.optionGrid}>
              {frequencies.map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.optionButton,
                    compoundingFrequency === freq && styles.optionButtonActive,
                  ]}
                  onPress={() => setCompoundingFrequency(freq)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      compoundingFrequency === freq && styles.optionTextActive,
                    ]}
                  >
                    {freq}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Timing */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Payment Timing</Text>
            <View style={styles.toggleContainer}>
              {timings.map((timing) => (
                <TouchableOpacity
                  key={timing}
                  style={[
                    styles.toggleButton,
                    paymentTiming === timing && styles.toggleButtonActive,
                  ]}
                  onPress={() => setPaymentTiming(timing)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      paymentTiming === timing && styles.toggleTextActive,
                    ]}
                  >
                    {timing}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>🔄 Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.calculateButton]}
              onPress={handleCalculate}
            >
              <Text style={styles.calculateButtonText}>🧮 Calculate</Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}
        </View>

        {/* Results */}
        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Calculation Result</Text>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>
                {variables.find(v => v.value === calculateVariable)?.label}
              </Text>
              <Text style={styles.resultValue}>
                {formatResultValue(result.calculatedValue, calculateVariable)}
              </Text>
            </View>

            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>Input Summary</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Compounding</Text>
                <Text style={styles.detailValue}>{compoundingFrequency}</Text>
              </View>
              
              <View style={styles.detailDivider} />
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Timing</Text>
                <Text style={styles.detailValue}>{paymentTiming}</Text>
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
    marginBottom: spacing.md,
  },
  variableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  variableCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '30%',
    flex: 1,
    minHeight: 80,
  },
  variableCardActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    ...shadows.sm,
  },
  variableIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  variableLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  variableLabelActive: {
    color: colors.background,
    fontWeight: typography.fontWeight.bold,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    flex: 1,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 120,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: 'right',
  },
  inputDisabled: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    color: colors.primary,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.background,
  },
  toggleContainer: {
    flexDirection: 'row',
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
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  resetButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  calculateButton: {
    backgroundColor: colors.primary,
  },
  calculateButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.errorDark,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
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
  resultCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.base,
    ...shadows.md,
  },
  resultLabel: {
    fontSize: typography.fontSize.base,
    color: colors.background,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  resultValue: {
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
  detailsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
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
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
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
