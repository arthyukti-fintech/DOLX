import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useEventStore } from '../../../stores/eventStore';
import { Job } from '../../../types';

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

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return '#22C55E';
    case 'completed':
      return '#6366F1';
    case 'draft':
      return '#F59E0B';
    case 'cancelled':
      return '#EF4444';
    case 'open':
      return '#22C55E';
    case 'closed':
      return '#9CA3AF';
    default:
      return '#9CA3AF';
  }
}

function getStatusBg(status: string): string {
  switch (status) {
    case 'active':
      return '#052E16';
    case 'completed':
      return '#1E1B4B';
    case 'draft':
      return '#451A03';
    case 'cancelled':
      return '#450A0A';
    case 'open':
      return '#052E16';
    case 'closed':
      return '#1C2340';
    default:
      return '#1C2340';
  }
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
      <View style={styles.jobCard}>
        <View style={styles.jobCardHeader}>
          <Text style={styles.jobRole} numberOfLines={1}>
            {item.role}
          </Text>
          <View
            style={[
              styles.jobStatusBadge,
              { backgroundColor: getStatusBg(item.status) },
            ]}
          >
            <Text
              style={[
                styles.jobStatusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status}
            </Text>
          </View>
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
      </View>
    );
  };

  // ─── Render: Error State ───

  if (error && !isLoading && !currentEvent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1B2547" />
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
        <StatusBar barStyle="light-content" backgroundColor="#1B2547" />
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
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentEvent) return null;

  // ─── Main Render ───

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1B2547" />

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
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusBg(currentEvent.status) },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(currentEvent.status) },
                ]}
              >
                {currentEvent.status.charAt(0).toUpperCase() +
                  currentEvent.status.slice(1)}
              </Text>
            </View>
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
  safeArea: { flex: 1, backgroundColor: '#0D0D1A' },

  /* Header */
  header: {
    backgroundColor: '#1B2547',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3350',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C2340',
    borderWidth: 1,
    borderColor: '#2A3350',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 20, color: '#FFFFFF', lineHeight: 24 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },

  /* Scroll content */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },

  /* Info Card */
  infoCard: {
    backgroundColor: '#1C2340',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A3350',
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  infoBody: { gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoIcon: { fontSize: 14, marginTop: 1 },
  infoLabel: { fontSize: 13, color: '#9CA3AF', flex: 1 },

  /* Section */
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },

  /* Jobs List */
  jobsList: { gap: 10 },
  jobCard: {
    backgroundColor: '#1C2340',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A3350',
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  jobRole: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  jobStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  jobStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  jobCardBody: { gap: 6 },
  jobRow: { flexDirection: 'row', alignItems: 'center' },
  jobLabel: { fontSize: 12, color: '#6B7280', width: 70 },
  jobValue: { fontSize: 13, color: '#D1D5DB', fontWeight: '500' },
  jobValueFilled: { color: '#22C55E' },

  /* Empty Jobs */
  emptyJobs: {
    backgroundColor: '#1C2340',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3350',
  },
  emptyJobsText: { fontSize: 13, color: '#6B7280' },

  /* Complete Button */
  completeButton: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonDisabled: { opacity: 0.7 },

  /* Complete Error */
  completeErrorBox: {
    backgroundColor: '#3B1A1A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  completeErrorText: { fontSize: 13, color: '#FCA5A5' },

  /* Loading */
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14, color: '#9CA3AF' },

  /* Error */
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  errorIcon: { fontSize: 40, marginBottom: 8 },
  errorTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  errorMessage: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  retryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
