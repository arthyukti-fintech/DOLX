import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, ImagePlaceholder, ScreenHeader, StatusPill, Text } from '../../components/ui';
import api, { isApiError } from '../../services/api';
import { useJobStore } from '../../stores/jobStore';
import { colors, radius, spacing } from '../../theme';
import { Application, Event, Job } from '../../types';

// ─── Helpers ───

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatShift(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

function getEventData(job: Job): Event | null {
  if (typeof job.event === 'object' && job.event !== null) {
    return job.event as Event;
  }
  return null;
}

function getDirectionsUrl(location: Event['location']): string {
  if (location.coordinates?.coordinates) {
    const [lng, lat] = location.coordinates.coordinates;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  const address = [location.address, location.city, location.state].filter(Boolean).join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

// A label/value pair inside a detail card.
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text variant="bodySm" color={colors.textFaint} style={styles.infoLabel}>
        {label}
      </Text>
      <Text variant="bodySm" weight="medium" style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

// ─── Component ───

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { currentJob, isLoading, error, fetchJobById } = useJobStore();

  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const loadJob = useCallback(() => {
    if (id) {
      fetchJobById(id);
    }
  }, [id, fetchJobById]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const handleApply = useCallback(async () => {
    if (!id || isApplying) return;

    setIsApplying(true);
    setApplyError(null);

    const result = await api.post<Application>(`/api/applications/jobs/${id}/apply`);

    if (isApiError(result)) {
      // Connection failures get a retryable message; anything else (already
      // applied, job full) is a real backend rule worth showing verbatim.
      if (result.code === 'NETWORK_ERROR' || result.code === 'TIMEOUT_ERROR') {
        setApplyError('Unable to connect. Check your internet and try again.');
      } else {
        setApplyError(result.message);
      }
      setIsApplying(false);
    } else {
      setHasApplied(true);
      setApplySuccess(true);
      setIsApplying(false);
    }
  }, [id, isApplying]);

  // ─── Loading ───
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ScreenHeader title="Job Details" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="bodySm" color={colors.textMuted}>
            Loading job details…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Error / not found ───
  if (error || !currentJob) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ScreenHeader title="Job Details" />
        <View style={styles.centered}>
          <Text style={styles.stateGlyph}>⚠️</Text>
          <Text variant="bodySm" color={colors.textMuted} center style={styles.stateCopy}>
            {error || 'Job not found'}
          </Text>
          {error ? (
            <Button label="Retry" onPress={loadJob} size="sm" fullWidth={false} />
          ) : (
            <Button
              label="Go Back"
              variant="outline"
              onPress={() => router.back()}
              size="sm"
              fullWidth={false}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const event = getEventData(currentJob);
  const isPositionsFilled = currentJob.filledCount >= currentJob.numberOfWorkers;
  const canApply = currentJob.status === 'open' && !isPositionsFilled && !hasApplied;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader title="Job Details" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <ImagePlaceholder
            seed={currentJob.role}
            glyph="💼"
            rounded="lg"
            style={styles.heroImage}
          />
          <View style={styles.heroBody}>
            <Text variant="h2" weight="bold">
              {currentJob.role}
            </Text>
            <View style={styles.heroMeta}>
              <Text variant="h3" weight="bold" color={colors.secondary}>
                ₹{currentJob.payRate.toLocaleString('en-IN')}
              </Text>
              <Text variant="bodySm" color={colors.textMuted}>
                / {currentJob.payType === 'hourly' ? 'hr' : 'fixed'}
              </Text>
              <View style={styles.heroPill}>
                <StatusPill status={currentJob.status} />
              </View>
            </View>
            {currentJob.distanceKm !== undefined ? (
              <Text variant="bodySm" weight="semibold" color={colors.primary}>
                📍 {currentJob.distanceKm} km away
              </Text>
            ) : null}
          </View>
        </View>

        {/* ── Shift & staffing ── */}
        <Card style={styles.card}>
          <Text variant="h3" weight="semibold" style={styles.cardTitle}>
            Shift Details
          </Text>
          <InfoRow label="Date" value={formatDate(currentJob.shiftStart)} />
          <InfoRow
            label="Shift"
            value={formatShift(currentJob.shiftStart, currentJob.shiftEnd)}
          />
          <InfoRow label="Workers needed" value={String(currentJob.numberOfWorkers)} />
          <InfoRow
            label="Positions filled"
            value={`${currentJob.filledCount} / ${currentJob.numberOfWorkers}`}
          />
        </Card>

        {/* ── Event ── */}
        {event ? (
          <Card style={styles.card}>
            <Text variant="h3" weight="semibold" style={styles.cardTitle}>
              Event Details
            </Text>
            <InfoRow label="Title" value={event.title} />
            <InfoRow label="Date" value={formatDate(event.date)} />
            <InfoRow label="Category" value={event.eventType} />
            <InfoRow
              label="Location"
              value={[event.location.address, event.location.city, event.location.state]
                .filter(Boolean)
                .join(', ')}
            />

            <Button
              label="Get Directions"
              variant="outline"
              size="sm"
              onPress={() => Linking.openURL(getDirectionsUrl(event.location))}
              style={styles.directions}
            />
          </Card>
        ) : null}

        {/* ── Apply ── */}
        <View style={styles.applySection}>
          {isPositionsFilled ? (
            <View style={styles.filledBanner}>
              <Text variant="bodySm" weight="semibold" color={colors.textMuted} center>
                All positions have been filled
              </Text>
            </View>
          ) : hasApplied ? (
            <View>
              {applySuccess ? (
                <Text
                  variant="bodySm"
                  weight="semibold"
                  color={colors.success}
                  center
                  style={styles.applyMsg}
                >
                  Application submitted successfully
                </Text>
              ) : null}
              <Button label="Applied" onPress={() => {}} disabled />
            </View>
          ) : canApply ? (
            <View>
              {applyError ? (
                <Text
                  variant="bodySm"
                  color={colors.danger}
                  center
                  style={styles.applyMsg}
                >
                  {applyError}
                </Text>
              ) : null}
              <Button label="Apply for this Job" onPress={handleApply} loading={isApplying} />
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

  /* Hero */
  hero: { gap: spacing.lg, marginBottom: spacing.xl },
  heroImage: { width: '100%', height: 150 },
  heroBody: { gap: spacing.xs },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  heroPill: { marginLeft: 'auto' },

  /* Cards */
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
  infoLabel: { width: 118 },
  infoValue: { flex: 1, textAlign: 'right' },
  directions: { marginTop: spacing.lg },

  /* Apply */
  applySection: { marginTop: spacing.sm },
  applyMsg: { marginBottom: spacing.md },
  filledBanner: {
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  /* States */
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
