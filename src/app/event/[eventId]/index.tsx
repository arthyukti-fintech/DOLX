import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusPill } from '../../../components/ui';
import { useEventStore } from '../../../stores/eventStore';
import { colors, fonts, radius, spacing } from '../../../theme';
import { Event, Job } from '../../../types';

// ─── Helpers ───

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatShiftTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function getDirectionsUrl(location: Event['location']): string {
  if (location.coordinates?.coordinates) {
    const [lng, lat] = location.coordinates.coordinates;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  const address = [location.address, location.city, location.state].filter(Boolean).join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

// ─── Component ───

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const currentEvent = useEventStore((s) => s.currentEvent);
  const isLoading = useEventStore((s) => s.isLoading);
  const error = useEventStore((s) => s.error);
  const fetchEventById = useEventStore((s) => s.fetchEventById);
  const completeEvent = useEventStore((s) => s.completeEvent);

  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchEventById(eventId);
    }
  }, [eventId, fetchEventById]);

  const handleRetry = useCallback(() => {
    if (eventId) {
      fetchEventById(eventId);
    }
  }, [eventId, fetchEventById]);

  // ─── Complete Event Logic ───

  const canComplete =
    currentEvent?.status === 'active' &&
    currentEvent.jobs.length > 0 &&
    currentEvent.jobs.every((job) => job.filledCount >= job.numberOfWorkers);

  const handleCompleteEvent = async () => {
    if (!eventId || !canComplete) return;

    setCompleteError(null);
    setCompleting(true);

    const result = await completeEvent(eventId);

    setCompleting(false);

    if (result) {
      setCompleteError(result.message);
    }
  };

  // ─── Render: Job Card ───

  const renderJobCard = ({ item }: { item: Job }) => {
    const isFilled = item.filledCount >= item.numberOfWorkers;

    return (
      <TouchableOpacity
        style={styles.jobCard}
        activeOpacity={0.7}
        onPress={() => router.push(`/event/${eventId}/job/${item._id}/applicants`)}
      >
        <View style={styles.jobCardHeader}>
          <Text style={styles.jobRole} numberOfLines={1}>
            {item.role}
          </Text>
          <StatusPill status={item.status} />
        </View>

        <View style={styles.jobCardBody}>
          {/* Filled count */}
          <View style={styles.jobRow}>
            <Text style={styles.jobLabel}>Positions:</Text>
            <Text
              style={[
                styles.jobValue,
                isFilled && styles.jobValueFilled,
              ]}
            >
              {item.filledCount}/{item.numberOfWorkers}
              {isFilled ? ' ✓' : ''}
            </Text>
          </View>

          {/* Pay rate */}
          <View style={styles.jobRow}>
            <Text style={styles.jobLabel}>Pay:</Text>
            <Text style={styles.jobValue}>
              ₹{item.payRate} / {item.payType}
            </Text>
          </View>

          {/* Shift times */}
          <View style={styles.jobRow}>
            <Text style={styles.jobLabel}>Shift:</Text>
            <Text style={styles.jobValue}>
              {formatShiftTime(item.shiftStart)} – {formatShiftTime(item.shiftEnd)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Render: Error State ───

  if (error && !isLoading && !currentEvent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Failed to load event</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            activeOpacity={0.85}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render: Loading State ───

  if (isLoading && !currentEvent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentEvent) return null;

  // ─── Main Render ───

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Event Details
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.eventTitle}>{currentEvent.title}</Text>
            <StatusPill status={currentEvent.status} />
          </View>

          <View style={styles.infoBody}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={styles.infoLabel}>{formatDate(currentEvent.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🏷️</Text>
              <Text style={styles.infoLabel}>{currentEvent.eventType}</Text>
            </View>
            {currentEvent.location?.city ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoLabel}>
                  {[
                    currentEvent.location.address,
                    currentEvent.location.city,
                    currentEvent.location.state,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
              </View>
            ) : null}
            {currentEvent.location?.city ? (
              <TouchableOpacity
                style={styles.directionsButton}
                onPress={() => Linking.openURL(getDirectionsUrl(currentEvent.location))}
                activeOpacity={0.7}
              >
                <Text style={styles.directionsButtonText}>Get Directions</Text>
              </TouchableOpacity>
            ) : null}
            {currentEvent.description ? (
              <View style={[styles.infoRow, { marginTop: 4 }]}>
                <Text style={styles.infoIcon}>📝</Text>
                <Text style={styles.infoLabel}>{currentEvent.description}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Jobs Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Attached Jobs ({currentEvent.jobs.length})
          </Text>
        </View>

        {currentEvent.jobs.length === 0 ? (
          <View style={styles.emptyJobs}>
            <Text style={styles.emptyJobsText}>
              No jobs attached to this event yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={currentEvent.jobs}
            keyExtractor={(item) => item._id}
            renderItem={renderJobCard}
            scrollEnabled={false}
            contentContainerStyle={styles.jobsList}
          />
        )}

        {/* Complete Error */}
        {completeError ? (
          <View style={styles.completeErrorBox}>
            <Text style={styles.completeErrorText}>{completeError}</Text>
          </View>
        ) : null}

        {/* Complete Event Button */}
        {canComplete ? (
          <TouchableOpacity
            style={[
              styles.completeButton,
              completing && styles.buttonDisabled,
            ]}
            onPress={handleCompleteEvent}
            disabled={completing}
            activeOpacity={0.85}
          >
            {completing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.completeButtonText}>Complete Event</Text>
            )}
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },

  /* Header */
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: colors.textOnPrimary, lineHeight: 22 },
  headerTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 17,
    color: colors.textOnPrimary,
    flex: 1,
    textAlign: 'center',
  },

  /* Scroll */
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 40,
  },

  /* Info card */
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  eventTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.text,
    flex: 1,
  },
  infoBody: { gap: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  infoIcon: { fontSize: 14, marginTop: 1 },
  infoLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textMuted,
    flex: 1,
  },
  directionsButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    marginLeft: 22,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  directionsButtonText: {
    fontFamily: fonts.displaySemiBold,
    color: colors.primary,
    fontSize: 12,
  },

  /* Section */
  sectionHeader: { marginBottom: spacing.md },
  sectionTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 16,
    color: colors.text,
  },

  /* Job cards */
  jobsList: { gap: spacing.md },
  jobCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  jobRole: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  jobCardBody: { gap: spacing.xs + 2 },
  jobRow: { flexDirection: 'row', alignItems: 'center' },
  jobLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textFaint,
    width: 72,
  },
  jobValue: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.text,
  },
  jobValueFilled: { color: colors.success },

  /* Empty jobs */
  emptyJobs: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyJobsText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textMuted,
  },

  /* Complete button */
  completeButton: {
    backgroundColor: colors.success,
    borderRadius: radius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  completeButtonText: {
    fontFamily: fonts.displaySemiBold,
    color: colors.textOnPrimary,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  buttonDisabled: { opacity: 0.6 },

  completeErrorBox: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  completeErrorText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.danger,
  },

  /* Loading / error */
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    gap: spacing.sm,
  },
  errorIcon: { fontSize: 40, marginBottom: spacing.sm },
  errorTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 18,
    color: colors.text,
  },
  errorMessage: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xxl + spacing.xs,
    paddingVertical: spacing.md,
  },
  retryButtonText: {
    fontFamily: fonts.displaySemiBold,
    color: colors.textOnPrimary,
    fontSize: 14,
  },
});