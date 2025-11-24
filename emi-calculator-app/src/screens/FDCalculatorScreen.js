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
import Slider from '@react-native-community/slider';
import { calculateFD } from '../utils/fdCalculator';
import { formatIndianCurrency } from '../utils/currencyFormatter';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/colors';
import { saveToHistory } from '../utils/historyStorage';

export default function FDCalculatorScreen({ navigation }) {
  const [principal, setPrincipal] = useState(100000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [tenure, setTenure] = useState(12);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const calculated = calculateFD({
      principal,
      annualRate: interestRate,
      tenureMonths: tenure,
    });
    setResult(calculated);
  }, [principal, interestRate, tenure]);

  const handleSaveToHistory = async () => {
    try {
      await saveToHistory({
        type: 'fd',
        data: { principal, interestRate, tenure },
        result,
      });
      alert('Saved to history!');
    } catch (error) {
      console.error('Error saving to history:', error);
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
                  const num = parseFloat(text) || 0;
                  if (num >= 1000 && num <= 10000000) setPrincipal(num);
                }}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.formattedValue}>{formatIndianCurrency(principal)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={1000}
              maximumValue={10000000}
              step={1000}
              value={principal}
              onValueChange={setPrincipal}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>₹1K</Text>
              <Text style={styles.sliderLabelText}>₹1Cr</Text>
            </View>
          </View>

          {/* Interest Rate */}
          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Interest Rate</Text>
              <TextInput
                style={styles.valueInput}
                value={interestRate.toString()}
                onChangeText={(text) => {
                  const num = parseFloat(text) || 0;
                  if (num >= 1 && num <= 15) setInterestRate(num);
                }}
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.formattedValue}>{interestRate.toFixed(1)}% per annum</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={15}
              step={0.1}
              value={interestRate}
              onValueChange={setInterestRate}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>1%</Text>
              <Text style={styles.sliderLabelText}>15%</Text>
            </View>
          </View>

          {/* Tenure */}
          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Tenure</Text>
              <TextInput
                style={styles.valueInput}
                value={tenure.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  if (num >= 3 && num <= 120) setTenure(num);
                }}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.formattedValue}>{tenure} Months ({(tenure / 12).toFixed(1)} Years)</Text>
            <Slider
              style={styles.slider}
              minimumValue={3}
              maximumValue={120}
              step={3}
              value={tenure}
              onValueChange={setTenure}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>3M</Text>
              <Text style={styles.sliderLabelText}>10Y</Text>
            </View>
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
