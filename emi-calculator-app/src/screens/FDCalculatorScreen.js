import React, { useState, useEffect } from 'react';
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

import { calculateFD } from '../utils/fdCalculator';
import { formatIndianCurrency } from '../utils/currencyFormatter';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/colors';
import { saveToHistory } from '../utils/historyStorage';
import { useAuth } from '../context/AuthContext';

export default function FDCalculatorScreen({ navigation }) {
  const { user } = useAuth();
  const [principal, setPrincipal] = useState(100000);
  const [interestRate, setInterestRate] = useState('6.5');
  const [tenure, setTenure] = useState(12);
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const rateNum = parseFloat(interestRate);
    
    // Validate inputs
    if (principal <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid principal amount');
      return;
    }
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 15) {
      Alert.alert('Invalid Input', 'Interest rate must be between 0% and 15%');
      return;
    }
    if (tenure < 1 || tenure > 120) {
      Alert.alert('Invalid Input', 'Tenure must be between 1 and 120 months');
      return;
    }

    const calculated = calculateFD({
      principal,
      annualRate: rateNum,
      tenureMonths: tenure,
    });
    setResult(calculated);
  };

  const handleReset = () => {
    setPrincipal(100000);
    setInterestRate('6.5');
    setTenure(12);
    setResult(null);
  };

  const handleSaveToHistory = async () => {
    // Check if user is logged in
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
        type: 'fd',
        data: { principal, interestRate, tenure },
        result,
      });
      Alert.alert('Success', 'Saved to history successfully!');
    } catch (error) {
      console.error('Error saving to history:', error);
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
          <Text style={styles.title}>FD Calculator</Text>
        </View>

        {/* Calculator Card */}
        <View style={styles.calculatorCard}>
          {/* Principal Amount */}
          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Principal Amount</Text>
              <TextInput
                style={styles.valueInput}
                value={principal.toString()}
                onChangeText={(text) => {
                  if (text === '') {
                    setPrincipal(0);
                    return;
                  }
                  const num = parseFloat(text);
                  if (!isNaN(num)) {
                    setPrincipal(num);
                  }
                }}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.formattedValue}>{formatIndianCurrency(principal)}</Text>
            <Text style={styles.rangeHint}>Range: ₹1,000 - ₹1 Crore</Text>
          </View>

          {/* Interest Rate */}
          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Interest Rate</Text>
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
            </View>
            <Text style={styles.formattedValue}>
              {interestRate ? `${parseFloat(interestRate).toFixed(1)}% per annum` : '0.0% per annum'}
            </Text>
            <Text style={styles.rangeHint}>Range: 0% - 15%</Text>
          </View>

          {/* Tenure */}
          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Tenure</Text>
              <TextInput
                style={styles.valueInput}
                value={tenure.toString()}
                onChangeText={(text) => {
                  if (text === '') {
                    setTenure(0);
                    return;
                  }
                  const num = parseInt(text);
                  if (!isNaN(num)) {
                    setTenure(num);
                  }
                }}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.formattedValue}>{tenure} Months ({(tenure / 12).toFixed(1)} Years)</Text>
            <Text style={styles.rangeHint}>Range: 1 - 120 Months</Text>
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
                <Text style={styles.detailLabel}>Principal Amount</Text>
                <Text style={styles.detailValue}>{formatIndianCurrency(result.principal)}</Text>
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
    backgroundColor: colors.success,
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
    color: colors.success,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
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
