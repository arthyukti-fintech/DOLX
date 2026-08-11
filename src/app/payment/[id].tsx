import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RazorpayCheckout from 'react-native-razorpay';
import { Button, Card, ScreenHeader, StatusPill, Text } from '../../components/ui';
import { isApiError } from '../../services/api';
import { usePaymentStore } from '../../stores/paymentStore';
import { colors, radius, spacing } from '../../theme';
import { Payment } from '../../types';

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

function InfoRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text variant="bodySm" color={colors.textFaint} style={styles.infoLabel}>
        {label}
      </Text>
      <Text
        variant={emphasis ? 'body' : 'bodySm'}
        weight={emphasis ? 'bold' : 'medium'}
        style={styles.infoValue}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── Component ───

export default function PaymentFlowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    transactions,
    isLoading,
    error,
    fundEscrow,
    confirmEscrow,
    releasePayment,
    fetchTransactions,
  } = usePaymentStore();

  const [isFunding, setIsFunding] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const payment: Payment | undefined = transactions.find((t) => t._id === id);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // ─── Fund escrow → Razorpay checkout ───
  const handleFundEscrow = useCallback(async () => {
    if (!id || isFunding) return;

    setIsFunding(true);
    setLocalError(null);
    setSuccessMessage(null);

    const result = await fundEscrow(id);

    if (isApiError(result)) {
      // The order was never created, so there is nothing to check out against.
      setLocalError(result.message);
      setIsFunding(false);
      return;
    }

    const order = result;

    try {
      const razorpayResponse = await RazorpayCheckout.open({
        description: 'DOLX Escrow Payment',
        currency: order.currency,
        key: order.keyId,
        amount: order.amount,
        order_id: order.orderId,
        name: 'DOLX',
        theme: { color: colors.primary },
      });

      const confirmResult = await confirmEscrow(id, {
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature,
      });

      if (confirmResult) {
        setLocalError(confirmResult.message);
      } else {
        setSuccessMessage('Payment confirmed. Funds are now held in escrow.');
        fetchTransactions();
      }
    } catch (razorpayError: any) {
      // Covers both gateway failures and the user dismissing checkout.
      setLocalError(
        razorpayError?.description ||
          razorpayError?.error?.description ||
          'Payment was not completed. Please try again.'
      );
    } finally {
      setIsFunding(false);
    }
  }, [id, isFunding, fundEscrow, confirmEscrow, fetchTransactions]);

  // ─── Release ───
  const handleReleasePayment = useCallback(async () => {
    if (!id || isReleasing) return;

    setIsReleasing(true);
    setLocalError(null);
    setSuccessMessage(null);

    const result = await releasePayment(id);

    if (result) {
      setLocalError(result.message);
    } else {
      setSuccessMessage('Payment released to the worker.');
      fetchTransactions();
    }

    setIsReleasing(false);
  }, [id, isReleasing, releasePayment, fetchTransactions]);

  // ─── Loading / error / missing ───
  if (isLoading && !payment) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ScreenHeader title="Payment" />
        <View style={styles.centered}>
          <Text variant="bodySm" color={colors.textMuted}>
            Loading payment details…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!payment) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ScreenHeader title="Payment" />
        <View style={styles.centered}>
          <Text style={styles.stateGlyph}>⚠️</Text>
          <Text variant="bodySm" color={colors.textMuted} center style={styles.stateCopy}>
            {error || 'Payment not found'}
          </Text>
          <Button
            label={error ? 'Retry' : 'Go Back'}
            variant={error ? 'primary' : 'outline'}
            onPress={error ? () => fetchTransactions() : () => router.back()}
            size="sm"
            fullWidth={false}
          />
        </View>
      </SafeAreaView>
    );
  }

  const jobName = typeof payment.job === 'object' ? payment.job.role : 'Job';
  const eventName = typeof payment.event === 'object' ? payment.event.title : 'Event';
  const canFund = payment.status === 'pending';
  const canRelease = payment.status === 'held';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader title="Payment" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Amount hero ── */}
        <View style={styles.hero}>
          <Text variant="caption" color="rgba(249,244,244,0.7)">
            Total Amount
          </Text>
          <Text variant="hero" weight="bold" color={colors.textOnPrimary} style={styles.heroAmount}>
            {formatAmount(payment.amount)}
          </Text>
          <StatusPill status={payment.status} />
        </View>

        {/* ── Breakdown ── */}
        <Card style={styles.card}>
          <Text variant="h3" weight="semibold" style={styles.cardTitle}>
            Payment Details
          </Text>
          <InfoRow label="Job role" value={jobName} />
          <InfoRow label="Event" value={eventName} />
          <InfoRow label="Amount" value={formatAmount(payment.amount)} />
          <InfoRow
            label="Commission"
            value={`${formatAmount(payment.commissionAmount)} (${payment.commissionPercent}%)`}
          />
          <InfoRow label="Worker payout" value={formatAmount(payment.workerPayout)} emphasis />
          <InfoRow label="Created" value={formatDate(payment.createdAt)} />
          {payment.escrowHeldAt ? (
            <InfoRow label="Escrow held" value={formatDate(payment.escrowHeldAt)} />
          ) : null}
          {payment.releasedAt ? (
            <InfoRow label="Released" value={formatDate(payment.releasedAt)} />
          ) : null}
        </Card>

        {/* ── Messages ── */}
        {localError ? (
          <View style={[styles.banner, styles.bannerError]}>
            <Text variant="bodySm" color={colors.danger} center>
              {localError}
            </Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={[styles.banner, styles.bannerSuccess]}>
            <Text variant="bodySm" weight="semibold" color={colors.success} center>
              {successMessage}
            </Text>
          </View>
        ) : null}

        {/* ── Actions ── */}
        <View style={styles.actions}>
          {canFund ? (
            <Button label="Fund Escrow" onPress={handleFundEscrow} loading={isFunding} />
          ) : null}

          {canRelease ? (
            <Button
              label="Release Payment"
              onPress={handleReleasePayment}
              loading={isReleasing}
            />
          ) : null}

          {payment.status === 'released' ? (
            <View style={[styles.banner, styles.bannerSuccess]}>
              <Text variant="bodySm" weight="semibold" color={colors.success} center>
                ✓ Payment completed
              </Text>
            </View>
          ) : null}

          {payment.status === 'failed' ? (
            <View style={[styles.banner, styles.bannerError]}>
              <Text variant="bodySm" weight="semibold" color={colors.danger} center>
                Payment failed
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingBottom: 40 },

  hero: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xxl,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    marginBottom: spacing.xl,
  },
  heroAmount: { marginBottom: spacing.sm },

  card: { marginBottom: spacing.lg },
  cardTitle: { marginBottom: spacing.md },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { width: 120 },
  infoValue: { flex: 1, textAlign: 'right' },

  banner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  bannerError: { backgroundColor: colors.dangerBg },
  bannerSuccess: { backgroundColor: colors.successBg },

  actions: { marginTop: spacing.sm, gap: spacing.md },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxxl,
  },
  stateGlyph: { fontSize: 38 },
  stateCopy: { marginBottom: spacing.xs },
});
