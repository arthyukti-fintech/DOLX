import { useAuthStore } from '@/stores/authStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { Payment } from '@/types';
import React, { useCallback, useEffect, useRef } from 'react';
import {
    FlatList,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, FadeInItem, Icon, IconLabel, SkeletonList, Text, type IconName } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

// ─── Constants ───

const FETCH_TIMEOUT_MS = 15_000;

// ─── Helpers ───

function formatAmount(amount: number): string {
  return amount.toLocaleString('en-IN');
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getEventOrJobName(payment: Payment): string {
  if (typeof payment.event === 'object' && payment.event?.title) {
    return payment.event.title;
  }
  if (typeof payment.job === 'object' && payment.job?.role) {
    return payment.job.role;
  }
  return 'Payment';
}

function getTransactionType(
  payment: Payment,
  userRole: 'worker' | 'organizer' | 'admin'
): 'credit' | 'debit' | 'pending' {
  // For organizer: all payments are debits (money paid out), regardless of status
  if (userRole === 'organizer') {
    return 'debit';
  }
  // For worker: released = credit (actually received); anything else (held/pending/
  // refunded/failed) hasn't reached the worker yet, so it's pending, not a debit -
  // workers never pay out through this flow.
  if (payment.status === 'released') {
    return 'credit';
  }
  return 'pending';
}

// The worker's take-home is workerPayout (post-commission), not the gross amount
// the organizer funded - that gross amount is only what the organizer's side owes.
function getDisplayAmount(
  payment: Payment,
  userRole: 'worker' | 'organizer' | 'admin'
): number {
  return userRole === 'organizer' ? payment.amount : payment.workerPayout;
}

function computeTotal(
  transactions: Payment[],
  userRole: 'worker' | 'organizer' | 'admin'
): number {
  return transactions.reduce((sum, tx) => {
    const type = getTransactionType(tx, userRole);
    // Only realized money movement counts toward the total - pending/held payments
    // haven't been earned (worker) or charged (organizer) yet.
    if (type === 'pending') {
      return sum;
    }
    return sum + getDisplayAmount(tx, userRole);
  }, 0);
}

// ─── TransactionCard ───

interface TransactionCardProps {
  payment: Payment;
  userRole: 'worker' | 'organizer' | 'admin';
}

const TransactionCard: React.FC<TransactionCardProps> = ({ payment, userRole }) => {
  const type = getTransactionType(payment, userRole);
  const isCredit = type === 'credit';
  const isPending = type === 'pending';

  const accent = isCredit ? colors.success : isPending ? colors.warning : colors.danger;
  const iconBg = isCredit ? colors.successBg : isPending ? colors.warningBg : colors.dangerBg;
  const icon: IconName = isCredit ? 'arrowIn' : isPending ? 'hourglass' : 'arrowOut';
  const sign = isCredit ? '+' : isPending ? '' : '-';
  const badge = isCredit ? 'Credit' : isPending ? 'Pending' : 'Debit';

  return (
    <Card style={styles.txCard} padded={false}>
      <View style={[styles.txIcon, { backgroundColor: iconBg }]}>
        <Icon name={icon} size={17} color={accent} />
      </View>

      <View style={styles.txBody}>
        <Text variant="bodySm" weight="semibold" numberOfLines={1}>
          {getEventOrJobName(payment)}
        </Text>
        <View style={styles.txMeta}>
          <IconLabel icon="clock" label={formatDateTime(payment.createdAt)} color={colors.textFaint} variant="caption" />
          <View style={styles.txBadge}>
            <Text variant="caption" weight="medium" color={colors.textMuted}>
              {badge}
            </Text>
          </View>
        </View>
      </View>

      <Text variant="body" weight="bold" color={accent}>
        {sign}₹{formatAmount(getDisplayAmount(payment, userRole))}
      </Text>
    </Card>
  );
};

// ─── Main Wallet Screen ───

const WalletScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { transactions, isLoading, error, fetchTransactions } = usePaymentStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [timedOut, setTimedOut] = React.useState(false);

  const userRole = user?.role ?? 'worker';

  useEffect(() => {
    fetchTransactions();

    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
    }, FETCH_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoading && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setTimedOut(false);
    }
  }, [isLoading]);

  const handleRetry = useCallback(() => {
    setTimedOut(false);
    fetchTransactions();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
    }, FETCH_TIMEOUT_MS);
  }, [fetchTransactions]);

  const totalAmount = computeTotal(transactions, userRole);
  const totalLabel = userRole === 'worker' ? 'Total Earned' : 'Total Spent';

  const showError = error || (timedOut && isLoading);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text variant="h2" weight="bold" color={colors.textOnPrimary}>
        My Wallet
      </Text>

      <View style={styles.balanceCard}>
        <Text variant="caption" color="rgba(249,244,244,0.65)">
          {totalLabel}
        </Text>
        <Text variant="hero" weight="bold" color={colors.textOnPrimary} style={styles.balance}>
          ₹{formatAmount(totalAmount)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {renderHeader()}

      <View style={styles.body}>
        <Text variant="h3" weight="semibold" style={styles.sectionTitle}>
          Transactions
        </Text>

        {showError && transactions.length === 0 ? (
          <Card elevation="flat" style={styles.stateCard}>
            <Icon name="warning" size={34} color={colors.textFaint} />
            <Text variant="bodySm" color={colors.textMuted} center style={styles.stateCopy}>
              {error || 'Unable to load transactions. Please try again.'}
            </Text>
            <Button label="Retry" onPress={handleRetry} size="sm" fullWidth={false} />
          </Card>
        ) : isLoading && transactions.length === 0 ? (
          <SkeletonList />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <FadeInItem index={index}>
                <TransactionCard payment={item} userRole={userRole} />
              </FadeInItem>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              isLoading ? null : (
                <Card elevation="flat" style={styles.stateCard}>
                  <Icon name="wallet" size={34} color={colors.textFaint} />
                  <Text variant="body" weight="semibold" center>
                    No transactions yet
                  </Text>
                  <Text variant="bodySm" color={colors.textMuted} center>
                    Your payment history will appear here.
                  </Text>
                </Card>
              )
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default WalletScreen;

// ─── Styles ───

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },

  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  balanceCard: {
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  balance: { marginTop: spacing.xs },

  body: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.md },
  listContent: { paddingBottom: spacing.xxxl },

  /* ── Transaction card ── */
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  txIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txGlyph: { fontSize: 16, fontWeight: '700' },
  txBody: { flex: 1, gap: 3 },
  txMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  txBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },

  /* ── States ── */
  stateCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxxl },
  stateGlyph: { fontSize: 34 },
  stateCopy: { marginBottom: spacing.xs },
});
