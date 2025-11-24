import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { calculateGST } from '../utils/gstCalculator';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/colors';
import { saveToHistory } from '../utils/historyStorage';

export default function GSTCalculatorScreen({ navigation }) {
  const [amount, setAmount] = useState('10000');
  const [gstRate, setGstRate] = useState('18');
  const [isAddGST, setIsAddGST] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (amount && gstRate) {
      const calculated = calculateGST({
        amount: parseFloat(amount),
        gstRate: parseFloat(gstRate),
        isAddGST,
      });
      setResult(calculated);
    }
  }, [amount, gstRate, isAddGST]);

  const gstRates = [5, 12, 18, 28];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>GST Calculator</Text>
        </View>

        <View style={styles.calculatorCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Initial Amount</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rate of GST (%)</Text>
            <TextInput
              style={styles.input}
              value={gstRate}
              onChangeText={setGstRate}
              keyboardType="decimal-pad"
              placeholder="Enter GST rate"
            />
            <View style={styles.quickRates}>
              {gstRates.map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={[styles.rateButton, gstRate === rate.toString() && styles.rateButtonActive]}
                  onPress={() => setGstRate(rate.toString())}
                >
                  <Text style={[styles.rateButtonText, gstRate === rate.toString() && styles.rateButtonTextActive]}>
                    {rate}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, isAddGST && styles.toggleButtonActive]}
              onPress={() => setIsAddGST(true)}
            >
              <Text style={[styles.toggleText, isAddGST && styles.toggleTextActive]}>Add GST +</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isAddGST && styles.toggleButtonActive]}
              onPress={() => setIsAddGST(false)}
            >
              <Text style={[styles.toggleText, !isAddGST && styles.toggleTextActive]}>Remove GST -</Text>
            </TouchableOpacity>
          </View>
        </View>

        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>GST Breakdown</Text>

            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Net Amount:</Text>
                <Text style={styles.resultValue}>₹{result.netAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.resultDivider} />
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>GST Amount ({result.gstRate}%):</Text>
                <Text style={[styles.resultValue, styles.gstValue]}>₹{result.gstAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.resultDivider} />
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total Amount:</Text>
                <Text style={[styles.resultValue, styles.totalValue]}>₹{result.totalAmount.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={async () => {
                await saveToHistory({ type: 'gst', data: { amount, gstRate, isAddGST }, result });
                alert('Saved to history!');
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
  inputGroup: { marginBottom: spacing.lg },
  label: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text, marginBottom: spacing.sm },
  input: { backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.base, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontSize: typography.fontSize.lg, color: colors.text },
  quickRates: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  rateButton: { flex: 1, backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.base, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.sm, alignItems: 'center' },
  rateButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  rateButtonText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary },
  rateButtonTextActive: { color: colors.background },
  toggleContainer: { flexDirection: 'row', borderRadius: borderRadius.base, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
  toggleButton: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
  toggleButtonActive: { backgroundColor: colors.primary },
  toggleText: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary },
  toggleTextActive: { color: colors.background },
  resultContainer: { marginBottom: spacing.xl },
  resultTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text, marginBottom: spacing.base },
  resultCard: { backgroundColor: colors.background, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.base, ...shadows.base },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  resultLabel: { fontSize: typography.fontSize.base, color: colors.textSecondary, fontWeight: typography.fontWeight.medium },
  resultValue: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text },
  gstValue: { color: '#06b6d4' },
  totalValue: { color: colors.primary, fontSize: typography.fontSize.xl },
  resultDivider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.xs },
  saveButton: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center', ...shadows.sm },
  saveButtonText: { color: colors.background, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
});
