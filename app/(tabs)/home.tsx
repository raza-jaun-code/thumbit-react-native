import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Send, Download, CreditCard, ArrowUpRight, ArrowDownLeft, Bell, Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useUser } from '@/contexts/UserContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user, transactions } = useUser();
  const [showBalance, setShowBalance] = useState(true);

  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[COLORS.background, COLORS.surface]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image
                source={{ uri: user?.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User') + '&background=FF5A5F&color=fff' }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.greeting}>Welcome back</Text>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton}>
                <Bell size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.balanceCard}>
            <View style={styles.balanceGradient}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={styles.eyeButton}>
                  {showBalance ? (
                    <Eye size={20} color="rgba(255, 255, 255, 0.9)" />
                  ) : (
                    <EyeOff size={20} color="rgba(255, 255, 255, 0.9)" />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.balanceAmount}>
                {showBalance ? formatCurrency(user?.balance || 0) : '••••••'}
              </Text>
            </View>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/send')}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <LinearGradient
                  colors={['rgba(255, 90, 95, 0.2)', 'rgba(255, 90, 95, 0.1)']}
                  style={styles.actionIconGradient}
                >
                  <Send size={24} color={COLORS.primary} />
                </LinearGradient>
              </View>
              <Text style={styles.actionText}>Send</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/receive')}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <LinearGradient
                  colors={['rgba(74, 144, 255, 0.2)', 'rgba(74, 144, 255, 0.1)']}
                  style={styles.actionIconGradient}
                >
                  <Download size={24} color={COLORS.secondary} />
                </LinearGradient>
              </View>
              <Text style={styles.actionText}>Receive</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/loan')}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <LinearGradient
                  colors={['rgba(0, 217, 165, 0.2)', 'rgba(0, 217, 165, 0.1)']}
                  style={styles.actionIconGradient}
                >
                  <CreditCard size={24} color={COLORS.success} />
                </LinearGradient>
              </View>
              <Text style={styles.actionText}>Loan</Text>
            </TouchableOpacity>


          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.transactionsList}>
              {recentTransactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No transactions yet</Text>
                </View>
              ) : (
                recentTransactions.map((transaction,index) => (
                  <View key={transaction.id ?? index} style={styles.transactionItem}>
                    <View style={styles.transactionLeft}>
                      <View style={[
                        styles.transactionIcon,
                        { backgroundColor: transaction.type === 'send' ? 'rgba(255, 90, 95, 0.15)' : 'rgba(0, 217, 165, 0.15)' }
                      ]}>
                        {transaction.type === 'send' ? (
                          <ArrowUpRight size={20} color={COLORS.primary} />
                        ) : (
                          <ArrowDownLeft size={20} color={COLORS.success} />
                        )}
                      </View>
                      <View>
                        <Text style={styles.transactionName}>
                          {transaction.type === 'send' ? transaction.recipient : transaction.sender}
                        </Text>
                        <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      { color: transaction.type === 'send' ? COLORS.primary : COLORS.success }
                    ]}>
                      {transaction.type === 'send' ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  greeting: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  userName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  balanceGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  balanceLabel: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  eyeButton: {
    padding: SPACING.xs / 2,
  },
  balanceAmount: {
    ...TYPOGRAPHY.h1,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  actionIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  seeAllText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  transactionsList: {
    gap: SPACING.sm,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  transactionDate: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },
  transactionAmount: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
  },
});
