import { useAuthStore } from '@/stores/authStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { Payment } from '@/types';
import React, { useCallback, useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const accentColor = isCredit ? '#35B74B' : isPending ? '#B8860B' : '#F44336';
  const iconBg = isCredit ? '#DFF4E2' : isPending ? '#FDF3DC' : '#FCE2E2';
  const title = getEventOrJobName(payment);
  const dateTime = formatDateTime(payment.createdAt);
  const amount = getDisplayAmount(payment, userRole);
  const sign = isCredit ? '+' : isPending ? '' : '-';
  const badgeLabel = isCredit ? 'Credit' : isPending ? 'Pending' : 'Debit';

  return (
    <View style={cardStyles.card}>
      <View style={[cardStyles.iconContainer, { backgroundColor: iconBg }]}>
        <Text style={[cardStyles.arrow, { color: accentColor }]}>
          {isCredit ? '↓' : isPending ? '⏳' : '↑'}
        </Text>
      </View>

      <View style={cardStyles.content}>
        <Text style={cardStyles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={cardStyles.metaRow}>
          <Text style={cardStyles.metaIcon}>🕐</Text>
          <Text style={cardStyles.metaText}>{dateTime}</Text>
          <View style={cardStyles.badge}>
            <Text style={cardStyles.badgeText}>{badgeLabel}</Text>
          </View>
        </View>
      </View>

      <Text style={[cardStyles.amount, { color: accentColor }]}>
        {sign}₹{formatAmount(amount)}
      </Text>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  arrow: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  metaIcon: {
    fontSize: 10,
    marginRight: 3,
    color: '#888888',
  },
  metaText: {
    fontSize: 10,
    color: '#666666',
    marginRight: 8,
    flexShrink: 1,
  },
  badge: {
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9,
    color: '#555555',
    fontWeight: '600',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 0,
  },
});

// ─── Header ───

interface WalletHeaderProps {
  totalAmount: number;
  userRole: 'worker' | 'organizer' | 'admin';
}

const WalletHeader: React.FC<WalletHeaderProps> = ({ totalAmount, userRole }) => {
  const totalLabel = userRole === 'worker' ? 'Total Earned' : 'Total Spent';

  return (
    <View style={headerStyles.container}>
      <Text style={headerStyles.heading}>My Wallet</Text>
      <View style={headerStyles.totalCard}>
        <Text style={headerStyles.totalLabel}>{totalLabel}</Text>
        <Text style={headerStyles.totalAmount}>₹{formatAmount(totalAmount)}</Text>
      </View>
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: '#1B2547',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 20,
    height: 200,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  totalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 6,
  },
  totalAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
});

// ─── Main Wallet Screen Component ───

const WalletScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { transactions, isLoading, error, fetchTransactions } = usePaymentStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [timedOut, setTimedOut] = React.useState(false);

  const userRole = user?.role ?? 'worker';

  useEffect(() => {
    fetchTransactions();

    // Set up 15s timeout
    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
    }, FETCH_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Clear timeout when loading finishes
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

    // Reset timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
    }, FETCH_TIMEOUT_MS);
  }, [fetchTransactions]);

  const totalAmount = computeTotal(transactions, userRole);

  const renderTransaction = useCallback(
    ({ item }: { item: Payment }) => (
      <TransactionCard payment={item} userRole={userRole} />
    ),
    [userRole]
  );

  const keyExtractor = useCallback((item: Payment) => item._id, []);

  // Error or timeout state
  const showError = error || (timedOut && isLoading);

  if (showError && transactions.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#1B2547" />
        <WalletHeader totalAmount={0} userRole={userRole} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorMessage}>
            {error || 'Unable to load transactions. Please try again.'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (isLoading && transactions.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#1B2547" />
        <WalletHeader totalAmount={0} userRole={userRole} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B2547" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💰</Text>
        <Text style={styles.emptyTitle}>No transactions yet</Text>
        <Text style={styles.emptyMessage}>
          Your transaction history will appear here once you have payments.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1B2547" />
      <WalletHeader totalAmount={totalAmount} userRole={userRole} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transactions</Text>

        <FlatList
          data={transactions}
          keyExtractor={keyExtractor}
          renderItem={renderTransaction}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
        />
      </View>
    </SafeAreaView>
  );
};

export default WalletScreen;

// ─── Styles ───

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 15,
    color: '#444444',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#1B2547',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
