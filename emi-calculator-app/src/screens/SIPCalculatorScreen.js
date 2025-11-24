import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { calculateSIP } from '../utils/sipCalculator';
import { formatIndianCurrency } from '../utils/currencyFormatter';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/colors';
import { saveToHistory } from '../utils/historyStorage';

export default function SIPCalculatorScreen({ navigation }) {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [tenureYears, setTenureYears] = useState(10);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const calculated = calculateSIP({ monthlyInvestment, expectedReturn, tenureYears });
    setResult(calculated);
  }, [monthlyInvestment, expectedReturn, tenureYears]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>SIP Calculator</Text>
        </View>

        <View style={styles.calculatorCard}>
          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Monthly Investment</Text>
              <TextInput style={styles.valueInput} value={monthlyInvestment.toString()} onChangeText={(text) => { const num = parseFloat(text) || 0; if (num >= 500 && num <= 100000) setMonthlyInvestment(num); }} keyboardType="numeric" />
            </View>
            <Text style={styles.formattedValue}>{formatIndianCurrency(monthlyInvestment)}</Text>
            <Slider style={styles.slider} minimumValue={500} maximumValue={100000} step={500} value={monthlyInvestment} onValueChange={setMonthlyInvestment} minimumTrackTintColor={colors.primary} maximumTrackTintColor={colors.border} thumbTintColor={colors.primary} />
            <View style={styles.sliderLabels}><Text style={styles.sliderLabelText}>₹500</Text><Text style={styles.sliderLabelText}>₹1L</Text></View>
          </View>

          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Expected Return</Text>
              <TextInput style={styles.valueInput} value={expectedReturn.toString()} onChangeText={(text) => { const num = parseFloat(text) || 0; if (num >= 1 && num <= 30) setExpectedReturn(num); }} keyboardType="decimal-pad" />
            </View>
            <Text style={styles.formattedValue}>{expectedReturn.toFixed(1)}% per annum</Text>
            <Slider style={styles.slider} minimumValue={1} maximumValue={30} step={0.5} value={expectedReturn} onValueChange={setExpectedReturn} minimumTrackTintColor={colors.primary} maximumTrackTintColor={colors.border} thumbTintColor={colors.primary} />
            <View style={styles.sliderLabels}><Text style={styles.sliderLabelText}>1%</Text><Text style={styles.sliderLabelText}>30%</Text></View>
          </View>

          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Investment Period</Text>
              <TextInput style={styles.valueInput} value={tenureYears.toString()} onChangeText={(text) => { const num = parseInt(text) || 0; if (num >= 1 && num <= 40) setTenureYears(num); }} keyboardType="numeric" />
            </View>
            <Text style={styles.formattedValue}>{tenureYears} Years</Text>
            <Slider style={styles.slider} minimumValue={1} maximumValue={40} step={1} value={tenureYears} onValueChange={setTenureYears} minimumTrackTintColor={colors.primary} maximumTrackTintColor={colors.border} thumbTintColor={colors.primary} />
            <View style={styles.sliderLabels}><Text style={styles.sliderLabelText}>1Y</Text><Text style={styles.sliderLabelText}>40Y</Text></View>
          </View>
        </View>

        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Investment Summary</Text>
            <View style={styles.maturityCard}>
              <Text style={styles.maturityLabel}>Future Value</Text>
              <Text style={styles.maturityValue}>{formatIndianCurrency(result.futureValue)}</Text>
            </View>
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Total Investment</Text><Text style={styles.detailValue}>{formatIndianCurrency(result.totalInvestment)}</Text></View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Estimated Returns</Text><Text style={[styles.detailValue, styles.interestValue]}>{formatIndianCurrency(result.estimatedReturns)}</Text></View>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={async () => { await saveToHistory({ type: 'sip', data: { monthlyInvestment, expectedReturn, tenureYears }, result }); alert('Saved to history!'); }}>
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
  maturityCard: { backgroundColor: '#ec4899', borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.base, ...shadows.md },
  maturityLabel: { fontSize: typography.fontSize.base, color: colors.background, opacity: 0.9, marginBottom: spacing.xs },
  maturityValue: { fontSize: typography.fontSize['4xl'], fontWeight: typography.fontWeight.bold, color: colors.background },
  detailsCard: { backgroundColor: colors.background, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.base, ...shadows.base },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  detailLabel: { fontSize: typography.fontSize.base, color: colors.textSecondary, fontWeight: typography.fontWeight.medium },
  detailValue: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text },
  interestValue: { color: '#ec4899' },
  detailDivider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.xs },
  saveButton: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center', ...shadows.sm },
  saveButtonText: { color: colors.background, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
});
