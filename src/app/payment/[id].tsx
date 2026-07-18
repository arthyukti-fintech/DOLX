import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { isApiError } from '../../services/api';
import { usePaymentStore } from '../../stores/paymentStore';
import { Payment, PaymentStatus } from '../../types';

// ─── Helpers ───

function formatAmount(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusColor(status: PaymentStatus): string {
  switch (status) {
    case 'pending':
      return '#ff9800';
    case 'held':
      return '#1a73e8';
    case 'released':
      return '#2e7d32';
    case 'refunded':
      return '#9c27b0';
    case 'failed':
      return '#d32f2f';
    default:
      return '#666';
  }
}

function getStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'held':
      return 'Escrow Held';
    case 'released':
      return 'Released';
    case 'refunded':
      return 'Refunded';
    case 'failed':
      return 'Failed';
    default:
      return status;
  }
}

// ─── Component ───

export default function PaymentFlowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { transactions, isLoading, error, fundEscrow, confirmEscrow, releasePayment, fetchTransactions } =
    usePaymentStore();

  const [isFunding, setIsFunding] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Find the payment from store transactions
  const payment: Payment | undefined = transactions.find((t) => t._id === id);

  useEffect(() => {
    // Fetch transactions to ensure we have the latest data
    fetchTransactions();
  }, [fetchTransactions]);

  // ─── Fund Escrow → Razorpay Checkout ───
  const handleFundEscrow = useCallback(async () => {
    if (!id || isFunding) return;

    setIsFunding(true);
    setLocalError(null);
    setSuccessMessage(null);

    const result = await fundEscrow(id);

    if (isApiError(result)) {
      // Fund request failed — show error, don't launch Razorpay
      setLocalError(result.message);
      setIsFunding(false);
      return;
    }

    // Fund request succeeded — open Razorpay checkout with order details
    const order = result;

    try {
      const razorpayOptions = {
        description: 'DOLX Escrow Payment',
        currency: order.currency,
        key: order.keyId,
        amount: order.amount, // Amount in paise from backend
        order_id: order.orderId,
        name: 'DOLX',
        theme: { color: '#1a73e8' },
      };

      const razorpayResponse = await RazorpayCheckout.open(razorpayOptions);

      // Razorpay success callback — call confirmEscrow
      const confirmResult = await confirmEscrow(id, {
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature,
      });

      if (confirmResult) {
        // confirmEscrow returned an error
        setLocalError(confirmResult.message);
      } else {
        setSuccessMessage('Payment confirmed! Funds are now held in escrow.');
        // Refresh transactions to get updated status
        fetchTransactions();
      }
    } catch (razorpayError: any) {
      // Razorpay failure/cancel — show error, don't call confirm
      const errorMessage =
        razorpayError?.description ||
        razorpayError?.error?.description ||
        'Payment was not completed. Please try again.';
      setLocalError(errorMessage);
    } finally {
      setIsFunding(false);
    }
  }, [id, isFunding, fundEscrow, confirmEscrow, fetchTransactions]);

  // ─── Release Payment ───
  const handleReleasePayment = useCallback(async () => {
    if (!id || isReleasing) return;

    setIsReleasing(true);
    setLocalError(null);
    setSuccessMessage(null);

    const result = await releasePayment(id);

    if (result) {
      // Release failed
      setLocalError(result.message);
    } else {
      setSuccessMessage('Payment released to worker successfully!');
      // Refresh transactions to get updated status
      fetchTransactions();
    }

    setIsReleasing(false);
  }, [id, isReleasing, releasePayment, fetchTransactions]);

  // ─── Loading State ───
  if (isLoading && !payment) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Loading payment details...</Text>
        </View>
      </View>
    );
  }

  // ─── Error State (store-level) ───
  if (error && !payment) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => fetchTransactions()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ─── Payment Not Found ───
  if (!payment) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Payment not found</Text>
          <Pressable onPress={() => router.back()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ─── Derive display values ───
  const jobName = typeof payment.job === 'object' ? payment.job.role : 'Job';
  const eventName = typeof payment.event === 'object' ? payment.event.title : 'Event';
  const canFund = payment.status === 'pending';
  const canRelease = payment.status === 'held';

  return (
    <View style={styles.container}>
      {/* Dark Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Details</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Job Role</Text>
            <Text style={styles.infoValue}>{jobName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Event</Text>
            <Text style={styles.infoValue}>{eventName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Amount</Text>
            <Text style={[styles.infoValue, styles.amountText]}>
              {formatAmount(payment.amount)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Worker Payout</Text>
            <Text style={styles.infoValue}>{formatAmount(payment.workerPayout)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Commission</Text>
            <Text style={styles.infoValue}>
              {formatAmount(payment.commissionAmount)} ({payment.commissionPercent}%)
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(payment.status)}15` },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                {getStatusLabel(payment.status)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>{formatDate(payment.createdAt)}</Text>
          </View>

          {payment.escrowHeldAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Escrow Held</Text>
              <Text style={styles.infoValue}>{formatDate(payment.escrowHeldAt)}</Text>
            </View>
          )}

          {payment.releasedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Released</Text>
              <Text style={styles.infoValue}>{formatDate(payment.releasedAt)}</Text>
            </View>
          )}
        </View>

        {/* Messages */}
        {localError && (
          <View style={styles.messageContainer}>
            <Text style={styles.errorMessage}>{localError}</Text>
          </View>
        )}

        {successMessage && (
          <View style={styles.successContainer}>
            <Text style={styles.successMessage}>{successMessage}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {canFund && (
            <Pressable
              style={[styles.actionButton, styles.fundButton, isFunding && styles.buttonDisabled]}
              onPress={handleFundEscrow}
              disabled={isFunding}
            >
              {isFunding ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.actionButtonText}>Fund Escrow</Text>
              )}
            </Pressable>
          )}

          {canRelease && (
            <Pressable
              style={[
                styles.actionButton,
                styles.releaseButton,
                isReleasing && styles.buttonDisabled,
              ]}
              onPress={handleReleasePayment}
              disabled={isReleasing}
            >
              {isReleasing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.actionButtonText}>Release Payment</Text>
              )}
            </Pressable>
          )}

          {payment.status === 'released' && (
            <View style={styles.completedContainer}>
              <Text style={styles.completedText}>✓ Payment completed</Text>
            </View>
          )}

          {payment.status === 'failed' && (
            <View style={styles.failedContainer}>
              <Text style={styles.failedText}>Payment failed</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a1a2e',
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backText: {
    color: '#ffffff',
    fontSize: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 15,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a2e',
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  messageContainer: {
    backgroundColor: '#fce4ec',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  errorMessage: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  successMessage: {
    color: '#2e7d32',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionsSection: {
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  fundButton: {
    backgroundColor: '#1a73e8',
  },
  releaseButton: {
    backgroundColor: '#2e7d32',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  completedContainer: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  completedText: {
    color: '#2e7d32',
    fontSize: 15,
    fontWeight: '600',
  },
  failedContainer: {
    backgroundColor: '#fce4ec',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  failedText: {
    color: '#c62828',
    fontSize: 15,
    fontWeight: '600',
  },
});
