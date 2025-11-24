import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/colors';
import { getHistory, deleteFromHistory, clearHistory } from '../utils/historyStorage';
import { formatIndianCurrency } from '../utils/currencyFormatter';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete Calculation', 'Are you sure you want to delete this calculation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteFromHistory(id);
          loadHistory();
        },
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Clear All History', 'Are you sure you want to clear all calculation history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          loadHistory();
        },
      },
    ]);
  };

  const getCalculatorIcon = (type) => {
    const icons = {
      emi: '🏦',
      fd: '📊',
      rd: '📈',
      sip: '💹',
      gst: '🧾',
      compare: '⚖️',
    };
    return icons[type] || '📱';
  };

  const getCalculatorName = (type) => {
    const names = {
      emi: 'EMI Calculator',
      fd: 'FD Calculator',
      rd: 'RD Calculator',
      sip: 'SIP Calculator',
      gst: 'GST Calculator',
      compare: 'Compare Loans',
    };
    return names[type] || 'Calculator';
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderHistoryItem = (item) => {
    const { type, data, result } = item;

    return (
      <View key={item.id} style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={styles.historyTitleRow}>
            <Text style={styles.historyIcon}>{getCalculatorIcon(type)}</Text>
            <View>
              <Text style={styles.historyTitle}>{getCalculatorName(type)}</Text>
              <Text style={styles.historyDate}>{formatDate(item.timestamp)}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyDetails}>
          {type === 'emi' && (
            <>
              <Text style={styles.historyAmount}>{formatIndianCurrency(data.loanAmount)}</Text>
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel}>Rate: {data.interestRate}%</Text>
                <Text style={styles.historyLabel}>Period: {data.tenure} months</Text>
              </View>
              <View style={styles.historyResult}>
                <Text style={styles.resultLabel}>Monthly EMI</Text>
                <Text style={styles.resultValue}>{formatIndianCurrency(result.emi)}</Text>
              </View>
            </>
          )}

          {type === 'fd' && (
            <>
              <Text style={styles.historyAmount}>{formatIndianCurrency(data.principal)}</Text>
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel}>Rate: {data.interestRate}%</Text>
                <Text style={styles.historyLabel}>Period: {data.tenure} months</Text>
              </View>
              <View style={styles.historyResult}>
                <Text style={styles.resultLabel}>Maturity Amount</Text>
                <Text style={styles.resultValue}>{formatIndianCurrency(result.maturityAmount)}</Text>
              </View>
            </>
          )}

          {type === 'rd' && (
            <>
              <Text style={styles.historyAmount}>{formatIndianCurrency(data.monthlyDeposit)}/month</Text>
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel}>Rate: {data.interestRate}%</Text>
                <Text style={styles.historyLabel}>Period: {data.tenure} months</Text>
              </View>
              <View style={styles.historyResult}>
                <Text style={styles.resultLabel}>Maturity Amount</Text>
                <Text style={styles.resultValue}>{formatIndianCurrency(result.maturityAmount)}</Text>
              </View>
            </>
          )}

          {type === 'sip' && (
            <>
              <Text style={styles.historyAmount}>{formatIndianCurrency(data.monthlyInvestment)}/month</Text>
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel}>Return: {data.expectedReturn}%</Text>
                <Text style={styles.historyLabel}>Period: {data.tenureYears} years</Text>
              </View>
              <View style={styles.historyResult}>
                <Text style={styles.resultLabel}>Future Value</Text>
                <Text style={styles.resultValue}>{formatIndianCurrency(result.futureValue)}</Text>
              </View>
            </>
          )}

          {type === 'gst' && (
            <>
              <Text style={styles.historyAmount}>₹{data.amount}</Text>
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel}>GST: {data.gstRate}%</Text>
                <Text style={styles.historyLabel}>{data.isAddGST ? 'Add GST' : 'Remove GST'}</Text>
              </View>
              <View style={styles.historyResult}>
                <Text style={styles.resultLabel}>Net Amount</Text>
                <Text style={styles.resultValue}>₹{result.netAmount.toFixed(2)}</Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>History</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
              <Text style={styles.clearIcon}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {loading ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>No calculation history yet</Text>
              <Text style={styles.emptySubtext}>Your saved calculations will appear here</Text>
            </View>
          ) : (
            history.map(renderHistoryItem)
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { flex: 1, padding: spacing.base, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  backButton: { marginRight: spacing.md },
  backIcon: { fontSize: 28, color: colors.text },
  title: { flex: 1, fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text },
  clearButton: { padding: spacing.sm },
  clearIcon: { fontSize: 24 },
  scrollView: { flex: 1 },
  historyCard: { backgroundColor: colors.background, borderRadius: borderRadius.lg, padding: spacing.base, marginBottom: spacing.md, ...shadows.base },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  historyTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  historyIcon: { fontSize: 24, marginRight: spacing.sm },
  historyTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.text },
  historyDate: { fontSize: typography.fontSize.xs, color: colors.textMuted, marginTop: 2 },
  deleteButton: { padding: spacing.xs },
  deleteIcon: { fontSize: 20 },
  historyDetails: { marginTop: spacing.sm },
  historyAmount: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.primary, marginBottom: spacing.xs },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  historyLabel: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  historyResult: { backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.base, padding: spacing.sm, marginTop: spacing.xs, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  resultValue: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.text },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['4xl'] },
  emptyIcon: { fontSize: 64, marginBottom: spacing.base },
  emptyText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary, marginBottom: spacing.xs },
  emptySubtext: { fontSize: typography.fontSize.sm, color: colors.textMuted },
});
