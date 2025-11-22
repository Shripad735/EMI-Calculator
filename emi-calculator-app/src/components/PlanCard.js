import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatIndianCurrency } from '../utils/currencyFormatter';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/colors';

/**
 * Reusable PlanCard component for displaying saved plans
 * @param {Object} props
 * @param {Object} props.plan - Plan object with loan details
 * @param {string} props.plan._id - Plan ID
 * @param {number} props.plan.loanAmount - Loan amount
 * @param {number} props.plan.interestRate - Interest rate
 * @param {number} props.plan.tenure - Tenure in months
 * @param {string} props.plan.loanType - Type of loan
 * @param {number} props.plan.emi - Monthly EMI
 * @param {number} props.plan.totalInterest - Total interest payable
 * @param {number} props.plan.totalAmountPayable - Total amount payable
 * @param {string} props.plan.createdAt - Creation date
 * @param {number} props.index - Plan index for badge display
 * @param {Function} props.onDelete - Delete handler
 * @param {Object} props.style - Additional styles
 */
export default function PlanCard({ plan, index, onDelete, style }) {
  return (
    <View style={[styles.planCard, style]}>
      {/* Plan Header */}
      <View style={styles.planHeader}>
        <View style={styles.planHeaderLeft}>
          <Text style={styles.planType}>
            {plan.loanType || 'Personal'} Loan
          </Text>
          <Text style={styles.planDate}>
            Saved on {new Date(plan.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.planHeaderRight}>
          {index !== undefined && (
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>#{index + 1}</Text>
            </View>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(plan._id, plan.loanType)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Plan Details */}
      <View style={styles.planDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Loan Amount</Text>
          <Text style={styles.detailValue}>
            {formatIndianCurrency(plan.loanAmount)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Interest Rate</Text>
          <Text style={styles.detailValue}>{plan.interestRate}% p.a.</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tenure</Text>
          <Text style={styles.detailValue}>
            {plan.tenure} months ({Math.floor(plan.tenure / 12)} years{' '}
            {plan.tenure % 12 > 0 ? `${plan.tenure % 12} months` : ''})
          </Text>
        </View>

        <View style={styles.divider} />

        {/* EMI Result */}
        <View style={styles.emiSection}>
          <View style={styles.emiRow}>
            <Text style={styles.emiLabel}>Monthly EMI</Text>
            <Text style={styles.emiValue}>
              {formatIndianCurrency(plan.emi)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Interest</Text>
            <Text style={styles.detailValue}>
              {formatIndianCurrency(plan.totalInterest)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount Payable</Text>
            <Text style={[styles.detailValue, styles.totalAmount]}>
              {formatIndianCurrency(plan.totalAmountPayable)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  planCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.base,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
  },
  planHeaderLeft: {
    flex: 1,
  },
  planHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  planType: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  planDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
  planBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  planBadgeText: {
    color: colors.background,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  deleteButton: {
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.base,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteButtonText: {
    fontSize: typography.fontSize.lg,
  },
  planDetails: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    fontWeight: typography.fontWeight.medium,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  emiSection: {
    backgroundColor: colors.resultBackground,
    borderRadius: borderRadius.base,
    padding: spacing.md,
    gap: spacing.sm,
  },
  emiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  emiLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  emiValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  totalAmount: {
    color: colors.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
});
