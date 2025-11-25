import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();

  const calculators = [
    {
      id: 'emi',
      title: 'EMI Calculator',
      icon: '🏦',
      description: 'Calculate loan EMI',
      screen: 'Home',
      color: colors.primary,
    },
    {
      id: 'compare',
      title: 'Compare Loans',
      icon: '⚖️',
      description: 'Compare two loans',
      screen: 'CompareLoan',
      color: '#f59e0b',
      badge: 'NEW',
    },
  ];

  const financialTools = [
    {
      id: 'fd',
      title: 'FD Calculator',
      icon: '📊',
      description: 'Fixed Deposit returns',
      screen: 'FDCalculator',
      color: '#10b981',
    },
    {
      id: 'rd',
      title: 'RD Calculator',
      icon: '📈',
      description: 'Recurring Deposit',
      screen: 'RDCalculator',
      color: '#8b5cf6',
    },
    {
      id: 'sip',
      title: 'SIP Calculator',
      icon: '💹',
      description: 'Systematic Investment',
      screen: 'SIPCalculator',
      color: '#ec4899',
    },
    {
      id: 'gst',
      title: 'GST Calculator',
      icon: '🧾',
      description: 'GST calculation',
      screen: 'GSTCalculator',
      color: '#06b6d4',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Financial Calculators</Text>
            <Text style={styles.subtitle}>
              {user ? `Welcome${user.name ? `, ${user.name}` : ''}!` : 'All-in-one financial tools'}
            </Text>
          </View>

          {/* Auth Buttons */}
          {user ? (
            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.savedPlansButton}
                onPress={() => navigation.navigate('SavedPlans')}
              >
                <Text style={styles.savedPlansButtonText}>📋 My Plans</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <Text style={styles.profileButtonText}>👤</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>Login with Phone</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main Calculators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Calculators</Text>
          {calculators.map((calc) => (
            <TouchableOpacity
              key={calc.id}
              style={[styles.calculatorCard, { borderLeftColor: calc.color }]}
              onPress={() => navigation.navigate(calc.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.calculatorIcon}>
                <Text style={styles.iconText}>{calc.icon}</Text>
              </View>
              <View style={styles.calculatorInfo}>
                <View style={styles.calculatorTitleRow}>
                  <Text style={styles.calculatorTitle}>{calc.title}</Text>
                  {calc.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{calc.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.calculatorDescription}>{calc.description}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Financial Tools */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Financial Tools</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.toolsGrid}>
            {financialTools.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={styles.toolCard}
                onPress={() => navigation.navigate(tool.screen)}
                activeOpacity={0.7}
              >
                <View style={[styles.toolIcon, { backgroundColor: tool.color + '20' }]}>
                  <Text style={styles.toolIconText}>{tool.icon}</Text>
                </View>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolDescription}>{tool.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* History Button */}
        {user && (
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.historyIcon}>🕐</Text>
            <Text style={styles.historyText}>View Calculation History</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
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
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
    marginBottom: spacing.base,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.sm,
  },
  loginButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  userActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  savedPlansButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  savedPlansButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  profileButton: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileButtonText: {
    fontSize: 20,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.base,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  calculatorCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    ...shadows.base,
  },
  calculatorIcon: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 24,
  },
  calculatorInfo: {
    flex: 1,
  },
  calculatorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  calculatorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginRight: spacing.sm,
  },
  badge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
  },
  calculatorDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  arrow: {
    fontSize: 28,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  toolCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    width: '47%',
    alignItems: 'center',
    ...shadows.base,
  },
  toolIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  toolIconText: {
    fontSize: 28,
  },
  toolTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  toolDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    textAlign: 'center',
  },
  historyButton: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.base,
  },
  historyIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  historyText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
});
