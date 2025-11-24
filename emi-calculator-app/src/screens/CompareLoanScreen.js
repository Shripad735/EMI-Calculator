import React, { useState, useEffect } from 'react';
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
import Button from '../components/Button';

export default function CompareLoanScreen({ navigation }) {
  // Loan 1 state
  const [loan1Amount, setLoan1Amount] = useState('500000');
  const [loan1Rate, setLoan1Rate] = useState('8.5');
  const [loan1Tenure, setLoan1Tenure] = useState('12');

  // Loan 2 state
  const [loan2Amount, setLoan2Amount] = useState('500000');
  const [loan2Rate, setLoan2Rate] = useState('9.5');
  const [loan2Tenure, setLoan2Tenure] = useState('12');

  // Results
  const [loan1Result, setLoan1Result] = useState(null);
  const [loan2Result, setLoan2Result] = useState(null);

  // Calculate both loans
  useEffect(() => {
    if (loan1Amount && loan1Rate && loan1Tenure) {
      const result = calculateEMI({
        principal: parseFloat(loan1Amount),
        annualRate: parseFloat(loan1Rate),
        tenureMonths: parseInt(loan1Tenure),
      });
      setLoan1Result(result);
    }
  }, [loan1Amount, loan1Rate, loan1Tenure]);

  useEffect(() => {
    if (loan2Amount && loan2Rate && loan2Tenure) {
      const result = calculateEMI({
        principal: parseFloat(loan2Amount),
        annualRate: parseFloat(loan2Rate),
        tenureMonths: parseInt(loan2Tenure),
      });
      setLoan2Result(result);
    }
  }, [loan2Amount, loan2Rate, loan2Tenure]);

  const handleReset = () => {
    setLoan1Amount('500000');
    setLoan1Rate('8.5');
    setLoan1Tenure('12');
    setLoan2Amount('500000');
    setLoan2Rate('9.5');
    setLoan2Tenure('12');
  };

  const getBetterOption = () => {
    if (!loan1Result || !loan2Result) return null;
    return loan1Result.totalAmount < loan2Result.totalAmount ? 1 : 2;
  };

  const betterOption = getBetterOption();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Compare Loans</Text>
        </View>

        {/* Comparison Cards */}
        <View style={styles.comparisonContainer}>
          {/* Loan 1 */}
          <View style={[styles.loanCard, betterOption === 1 && styles.betterLoan]}>
            <Text style={styles.loanTitle}>Loan 1</Text>
            {betterOption === 1 && (
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>✓ Better Option</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loan Amount</Text>
              <TextInput
                style={styles.input}
                value={loan1Amount}
                onChangeText={setLoan1Amount}
                keyboardType="numeric"
                placeholder="120000"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Interest %</Text>
              <TextInput
                style={styles.input}
                value={loan1Rate}
                onChangeText={setLoan1Rate}
                keyboardType="decimal-pad"
                placeholder="8.9"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Period (Months)</Text>
              <TextInput
                style={styles.input}
                value={loan1Tenure}
                onChangeText={setLoan1Tenure}
                keyboardType="numeric"
                placeholder="36"
              />
            </View>

            {loan1Result && (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Monthly EMI</Text>
                <Text style={styles.resultValue}>{formatIndianCurrency(loan1Result.emi)}</Text>
                <Text style={styles.resultSubtext}>
                  Total: {formatIndianCurrency(loan1Result.totalAmount)}
                </Text>
              </View>
            )}
          </View>

          {/* Loan 2 */}
          <View style={[styles.loanCard, betterOption === 2 && styles.betterLoan]}>
            <Text style={styles.loanTitle}>Loan 2</Text>
            {betterOption === 2 && (
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>✓ Better Option</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loan Amount</Text>
              <TextInput
                style={styles.input}
                value={loan2Amount}
                onChangeText={setLoan2Amount}
                keyboardType="numeric"
                placeholder="120000"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Interest %</Text>
              <TextInput
                style={styles.input}
                value={loan2Rate}
                onChangeText={setLoan2Rate}
                keyboardType="decimal-pad"
                placeholder="5.6"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Period (Months)</Text>
              <TextInput
                style={styles.input}
                value={loan2Tenure}
                onChangeText={setLoan2Tenure}
                keyboardType="numeric"
                placeholder="12"
              />
            </View>

            {loan2Result && (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Monthly EMI</Text>
                <Text style={styles.resultValue}>{formatIndianCurrency(loan2Result.emi)}</Text>
                <Text style={styles.resultSubtext}>
                  Total: {formatIndianCurrency(loan2Result.totalAmount)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Comparison Summary */}
        {loan1Result && loan2Result && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Comparison Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>EMI Difference</Text>
              <Text style={styles.summaryValue}>
                {formatIndianCurrency(Math.abs(loan1Result.emi - loan2Result.emi))}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Interest Difference</Text>
              <Text style={styles.summaryValue}>
                {formatIndianCurrency(Math.abs(loan1Result.totalInterest - loan2Result.totalInterest))}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Savings</Text>
              <Text style={[styles.summaryValue, styles.savingsValue]}>
                {formatIndianCurrency(Math.abs(loan1Result.totalAmount - loan2Result.totalAmount))}
              </Text>
            </View>
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
  comparisonContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  loanCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.base,
  },
  betterLoan: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  loanTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  bestBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.base,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  bestBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  resultBox: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.background,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  resultValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
    marginBottom: spacing.xs,
  },
  resultSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.background,
    opacity: 0.8,
  },
  buttonContainer: {
    marginBottom: spacing.lg,
  },
  resetButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  resetButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  summaryCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.base,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.base,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  summaryLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  savingsValue: {
    color: colors.success,
    fontSize: typography.fontSize.lg,
  },
});
