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
import Slider from '@react-native-community/slider';
import { calculateRD } from '../utils/rdCalculator';
import { formatIndianCurrency } from '../utils/currencyFormatter';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/colors';
import { saveToHistory } from '../utils/historyStorage';
import { useAuth } from '../context/AuthContext';

export default function RDCalculatorScreen({ navigation }) {
  const { user } = useAuth();
  const [monthlyDeposit, setMonthlyDeposit] = useState(5000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [tenure, setTenure] = useState(12);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const calculated = calculateRD({
      monthlyDeposit,
      annualRate: interestRate,
      tenureMonths: tenure,
    });
    setResult(calculated);
  }, [monthlyDeposit, interestRate, tenure]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>RD Calculator</Text>
        </View>

        <View style={styles.calculatorCard}>
          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Monthly Deposit</Text>
              <TextInput
                style={styles.valueInput}
                value={monthlyDeposit.toString()}
                onChangeText={(text) => {
                  const num = parseFloat(text) || 0;
                  if (num >= 500 && num <= 100000) setMonthlyDeposit(num);
                }}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.formattedValue}>{formatIndianCurrency(monthlyDeposit)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={500}
              maximumValue={100000}
              step={500}
              value={monthlyDeposit}
              onValueChange={setMonthlyDeposit}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>₹500</Text>
              <Text style={styles.sliderLabelText}>₹1L</Text>
            </View>
          </View>

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

          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Tenure (Multiples of 3)</Text>
              <TextInput
                style={styles.valueInput}
                value={tenure.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  if (num >= 3 && num <= 120 && num % 3 === 0) setTenure(num);
                }}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.formattedValue}>{tenure} Months</Text>
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

        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Maturity Details</Text>

            <View style={styles.maturityCard}>
              <Text style={styles.maturityLabel}>Maturity Amount</Text>
              <Text style={styles.maturityValue}>{formatIndianCurrency(result.maturityAmount)}</Text>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Deposit</Text>
                <Text style={styles.detailValue}>{formatIndianCurrency(result.totalDeposit)}</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Interest Earned</Text>
                <Text style={[styles.detailValue, styles.interestValue]}>
                  {formatIndianCurrency(result.interestEarned)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={async () => {
                if (!user) {
                  Alert.alert('Login Required', 'Please login to save your calculations to history.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => navigation.navigate('Login') }
                  ]);
                  return;
                }
                try {
                  await saveToHistory({ type: 'rd', data: { monthlyDeposit, interestRate, tenure }, result });
                  Alert.alert('Success', 'Saved to history successfully!');
                } catch (error) {
                  Alert.alert('Error', 'Failed to save to history. Please try again.');
                }
              }}
            >
              <Text style={styles.saveButtonText}>💾 Save to History</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: spacing.base, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: spacing['3xl'] },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  backButton: { marginRight: spacing.md },
  backIcon: { fontSize: 28, color: colors.text },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text },
  calculatorCard: { backgroundColor: colors.background, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.base },
  section: { marginBottom: spacing.xl },
  sectionLabel: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  valueInput: { backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.base, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minWidth: 100, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.primary, textAlign: 'right' },
  formattedValue: { fontSize: typography.fontSize.sm, color: colors.textLight, marginBottom: spacing.sm, textAlign: 'center' },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  sliderLabelText: { fontSize: typography.fontSize.xs, color: colors.textMuted },
  resultContainer: { marginBottom: spacing.xl },
  resultTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text, marginBottom: spacing.base },
  maturityCard: { backgroundColor: '#8b5cf6', borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.base, ...shadows.md },
  maturityLabel: { fontSize: typography.fontSize.base, color: colors.background, opacity: 0.9, marginBottom: spacing.xs },
  maturityValue: { fontSize: typography.fontSize['4xl'], fontWeight: typography.fontWeight.bold, color: colors.background },
  detailsCard: { backgroundColor: colors.background, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.base, ...shadows.base },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  detailLabel: { fontSize: typography.fontSize.base, color: colors.textSecondary, fontWeight: typography.fontWeight.medium },
  detailValue: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text },
  interestValue: { color: '#8b5cf6' },
  detailDivider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.xs },
  saveButton: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center', ...shadows.sm },
  saveButtonText: { color: colors.background, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
});
