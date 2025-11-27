import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert } from 'react-native';

import { calculateSIP } from '../utils/sipCalculator';
import { formatIndianCurrency } from '../utils/currencyFormatter';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/colors';
import { saveToHistory } from '../utils/historyStorage';
import { useAuth } from '../context/AuthContext';

export default function SIPCalculatorScreen({ navigation }) {
  const { user } = useAuth();
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState('12');
  const [tenureYears, setTenureYears] = useState(10);
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const returnNum = parseFloat(expectedReturn);
    
    // Validate inputs
    if (monthlyInvestment <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid monthly investment amount');
      return;
    }
    if (isNaN(returnNum) || returnNum < 0 || returnNum > 30) {
      Alert.alert('Invalid Input', 'Expected return must be between 0% and 30%');
      return;
    }
    if (tenureYears < 1 || tenureYears > 40) {
      Alert.alert('Invalid Input', 'Investment period must be between 1 and 40 years');
      return;
    }

    const calculated = calculateSIP({ monthlyInvestment, expectedReturn: returnNum, tenureYears });
    setResult(calculated);
  };

  const handleReset = () => {
    setMonthlyInvestment(5000);
    setExpectedReturn('12');
    setTenureYears(10);
    setResult(null);
  };

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
              <TextInput style={styles.valueInput} value={monthlyInvestment.toString()} onChangeText={(text) => { if (text === '') { setMonthlyInvestment(0); return; } const num = parseFloat(text); if (!isNaN(num)) { setMonthlyInvestment(num); } }} keyboardType="numeric" />
            </View>
            <Text style={styles.formattedValue}>{formatIndianCurrency(monthlyInvestment)}</Text>
            <Text style={styles.rangeHint}>Range: ₹500 - ₹1 Lakh</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Expected Return</Text>
              <TextInput 
                style={styles.valueInput} 
                value={expectedReturn} 
                onChangeText={(text) => { 
                  // Allow empty string
                  if (text === '') { 
                    setExpectedReturn(''); 
                    return; 
                  } 
                  // Allow decimal input up to 2 decimal places
                  if (/^\d*\.?\d{0,2}$/.test(text)) { 
                    setExpectedReturn(text); 
                  } 
                }} 
                keyboardType="decimal-pad" 
                placeholder="0.0"
              />
            </View>
            <Text style={styles.formattedValue}>
              {expectedReturn ? `${parseFloat(expectedReturn).toFixed(1)}% per annum` : '0.0% per annum'}
            </Text>
            <Text style={styles.rangeHint}>Range: 0% - 30%</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Investment Period</Text>
              <TextInput style={styles.valueInput} value={tenureYears.toString()} onChangeText={(text) => { if (text === '') { setTenureYears(0); return; } const num = parseInt(text); if (!isNaN(num)) { setTenureYears(num); } }} keyboardType="numeric" />
            </View>
            <Text style={styles.formattedValue}>{tenureYears} Years</Text>
            <Text style={styles.rangeHint}>Range: 1 - 40 Years</Text>
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
            <TouchableOpacity style={styles.saveButton} onPress={async () => {
              if (!user) {
                Alert.alert('Login Required', 'Please login to save your calculations to history.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Login', onPress: () => navigation.navigate('Login') }
                ]);
                return;
              }
              try {
                await saveToHistory({ type: 'sip', data: { monthlyInvestment, expectedReturn, tenureYears }, result });
                Alert.alert('Success', 'Saved to history successfully!');
              } catch (error) {
                Alert.alert('Error', 'Failed to save to history. Please try again.');
              }
            }}>
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
  formattedValue: { fontSize: typography.fontSize.sm, color: colors.textLight, marginBottom: spacing.xs, textAlign: 'center' },
  rangeHint: { fontSize: typography.fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
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
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.base },
  resetButton: { flex: 1, backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.md, paddingVertical: spacing.md, marginRight: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  resetButtonText: { color: colors.text, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
  calculateButton: { flex: 1, backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md, marginLeft: spacing.sm, alignItems: 'center', ...shadows.sm },
  calculateButtonText: { color: colors.background, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
  saveButton: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center', ...shadows.sm },
  saveButtonText: { color: colors.background, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
});
