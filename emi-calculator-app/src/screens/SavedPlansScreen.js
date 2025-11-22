import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { getPlans, deletePlan } from '../utils/api';
import { formatIndianCurrency } from '../utils/currencyFormatter';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';

/**
 * @typedef {import('../types').Plan} Plan
 */

export default function SavedPlansScreen({ navigation }) {
  const { user, logout } = useAuth();
  
  // State management
  const [plans, setPlans] = useState(/** @type {Plan[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch plans on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  /**
   * Fetch all saved plans from the API
   */
  const fetchPlans = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPlans();
      setPlans(response.plans || []);
    } catch (err) {
      // Handle token expiration - redirect to login
      if (err.requiresLogin || err.isAuthError) {
        setError('Your session has expired. Please login again.');
        // Logout user after a short delay
        setTimeout(async () => {
          try {
            await logout();
          } catch (logoutError) {
            console.error('Error during logout:', logoutError);
          }
        }, 2000);
      } else if (err.isNetworkError) {
        setError('Unable to connect to server. Please check your internet connection.');
      } else if (err.isTimeout) {
        setError('Request timeout. Please try again.');
      } else {
        setError(err.message || 'Failed to load saved plans. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pull-to-refresh action
   */
  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);

    try {
      const response = await getPlans();
      setPlans(response.plans || []);
    } catch (err) {
      // Handle token expiration - redirect to login
      if (err.requiresLogin || err.isAuthError) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: async () => {
                try {
                  await logout();
                } catch (logoutError) {
                  console.error('Error during logout:', logoutError);
                }
              },
            },
          ]
        );
      } else if (err.isNetworkError) {
        Alert.alert(
          'Connection Error',
          'Unable to connect to server. Please check your internet connection.'
        );
      } else if (err.isTimeout) {
        Alert.alert('Timeout', 'Request timeout. Please try again.');
      } else {
        Alert.alert(
          'Refresh Failed',
          err.message || 'Failed to refresh plans. Please try again.'
        );
      }
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Handle plan deletion with confirmation
   * @param {string} planId - ID of the plan to delete
   * @param {string} loanType - Type of loan for display in confirmation
   */
  const handleDeletePlan = (planId, loanType) => {
    Alert.alert(
      'Delete Plan',
      `Are you sure you want to delete this ${loanType || 'Personal'} Loan plan?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDeletePlan(planId),
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Delete plan after confirmation
   * @param {string} planId - ID of the plan to delete
   */
  const confirmDeletePlan = async (planId) => {
    try {
      await deletePlan(planId);
      
      // Remove plan from local state
      setPlans((prevPlans) => prevPlans.filter((plan) => plan._id !== planId));
      
      // Show success message
      Alert.alert('Success', 'Plan deleted successfully');
    } catch (err) {
      // Handle token expiration - redirect to login
      if (err.requiresLogin || err.isAuthError) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: async () => {
                try {
                  await logout();
                } catch (logoutError) {
                  console.error('Error during logout:', logoutError);
                }
              },
            },
          ]
        );
      } else if (err.isNetworkError) {
        Alert.alert(
          'Connection Error',
          'Unable to connect to server. Please check your internet connection.'
        );
      } else if (err.isTimeout) {
        Alert.alert('Timeout', 'Request timeout. Please try again.');
      } else {
        Alert.alert(
          'Delete Failed',
          err.message || 'Failed to delete plan. Please try again.'
        );
      }
    }
  };

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <LoadingSpinner
        size="large"
        message="Loading your saved plans..."
        fullScreen
      />
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Try Again"
          onPress={fetchPlans}
          variant="primary"
          size="medium"
          style={styles.retryButton}
        />
        <Button
          title="Back to Calculator"
          onPress={() => navigation.navigate('Home')}
          variant="outline"
          size="medium"
          style={styles.backButton}
        />
      </View>
    );
  }

  /**
   * Render empty state
   */
  if (plans.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>My Saved Plans</Text>
              <Text style={styles.subtitle}>
                {user ? `Welcome, ${user.name}` : 'Your saved EMI calculations'}
              </Text>
            </View>
            
            {user && (
              <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Empty State */}
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateIcon}>📊</Text>
            <Text style={styles.emptyStateTitle}>No saved plans yet</Text>
            <Text style={styles.emptyStateText}>
              Calculate an EMI and save it to see your plans here
            </Text>
            <Button
              title="Calculate EMI"
              onPress={() => navigation.navigate('Home')}
              variant="primary"
              size="medium"
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  /**
   * Render plans list
   */
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Saved Plans</Text>
            <Text style={styles.subtitle}>
              {plans.length} {plans.length === 1 ? 'plan' : 'plans'} saved
            </Text>
          </View>
          
          {user && (
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Navigation Button */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.navButtonText}>← Back to Calculator</Text>
        </TouchableOpacity>

        {/* Plans List */}
        <View style={styles.plansList}>
          {plans.map((plan, index) => (
            <View key={plan._id} style={styles.planCard}>
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
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>#{index + 1}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePlan(plan._id, plan.loanType)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
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
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
    marginBottom: spacing.base,
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.base,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    ...shadows.sm,
  },
  logoutButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  errorTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  retryButton: {
    marginBottom: spacing.md,
  },
  backButton: {
    marginTop: spacing.sm,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: spacing.base,
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing['3xl'],
  },
  navButton: {
    marginBottom: spacing.lg,
  },
  navButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  plansList: {
    gap: spacing.base,
  },
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
