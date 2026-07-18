import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useEventStore } from '../../stores/eventStore';
import { Event, EventStatus } from '../../types';

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

function getStatusColor(status: EventStatus): string {
  switch (status) {
    case 'active':
      return '#22C55E';
    case 'completed':
      return '#6366F1';
    case 'draft':
      return '#F59E0B';
    case 'cancelled':
      return '#EF4444';
    default:
      return '#9CA3AF';
  }
}

function getStatusBg(status: EventStatus): string {
  switch (status) {
    case 'active':
      return '#052E16';
    case 'completed':
      return '#1E1B4B';
    case 'draft':
      return '#451A03';
    case 'cancelled':
      return '#450A0A';
    default:
      return '#1C2340';
  }
}

// ─── Component ───

export default function OrganizerHomeScreen() {
  const user = useAuthStore((s) => s.user);
  const events = useEventStore((s) => s.events);
  const isLoading = useEventStore((s) => s.isLoading);
  const error = useEventStore((s) => s.error);
  const fetchMyEvents = useEventStore((s) => s.fetchMyEvents);

  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    fetchMyEvents().then(() => setHasFetched(true));
  }, [fetchMyEvents]);

  const handleRetry = useCallback(() => {
    setHasFetched(false);
    fetchMyEvents().then(() => setHasFetched(true));
  }, [fetchMyEvents]);

  // ─── Derived data ───

  const activeEvents = events.filter((e) => e.status === 'active');
  const activeCount = activeEvents.length;
  const totalCount = events.length;

  // ─── Header with organizer name ───

  const organizerName = user?.name ?? 'Organizer';
  const companyName = user?.organizerProfile?.companyName;

  // ─── Render: Event Card (compact) ───

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => router.push(`/event/${item._id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusBg(item.status) },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.cardIcon}>📅</Text>
          <Text style={styles.cardLabel}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardIcon}>🏷️</Text>
          <Text style={styles.cardLabel}>{item.eventType}</Text>
        </View>
        {item.location?.city ? (
          <View style={styles.cardRow}>
            <Text style={styles.cardIcon}>📍</Text>
            <Text style={styles.cardLabel}>{item.location.city}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  // ─── Render: Error State ───

  if (error && !isLoading && hasFetched && events.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1B2547" />
        <View style={styles.headerSection}>
          <Text style={styles.welcomeText}>
            Welcome back, {organizerName}
          </Text>
          {companyName ? (
            <Text style={styles.companyText}>{companyName}</Text>
          ) : null}
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Failed to load data</Text>
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

  if (isLoading && !hasFetched) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1B2547" />
        <View style={styles.headerSection}>
          <Text style={styles.welcomeText}>
            Welcome back, {organizerName}
          </Text>
          {companyName ? (
            <Text style={styles.companyText}>{companyName}</Text>
          ) : null}
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render: Empty State ───

  const renderEmptyEvents = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No Events Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first event to start hiring staff
      </Text>
    </View>
  );

  // ─── Main Render ───

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1B2547" />

      <FlatList
        data={activeEvents.slice(0, 5)}
        keyExtractor={(item) => item._id}
        renderItem={renderEventCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={hasFetched ? renderEmptyEvents : null}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.headerSection}>
              <Text style={styles.welcomeText}>
                Welcome back, {organizerName}
              </Text>
              {companyName ? (
                <Text style={styles.companyText}>{companyName}</Text>
              ) : null}
            </View>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{activeCount}</Text>
                <Text style={styles.statLabel}>Active Events</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{totalCount}</Text>
                <Text style={styles.statLabel}>Total Events</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/(organizer)/create-event')}
                activeOpacity={0.85}
              >
                <Text style={styles.actionIcon}>✨</Text>
                <Text style={styles.actionText}>Create Event</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButtonOutline}
                onPress={() => router.push('/(organizer)/events')}
                activeOpacity={0.85}
              >
                <Text style={styles.actionIcon}>📋</Text>
                <Text style={styles.actionTextOutline}>View All Events</Text>
              </TouchableOpacity>
            </View>

            {/* Section Title */}
            {activeEvents.length > 0 ? (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Events</Text>
                {activeEvents.length > 5 ? (
                  <TouchableOpacity
                    onPress={() => router.push('/(organizer)/events')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </>
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D0D1A' },

  /* Header */
  headerSection: {
    backgroundColor: '#1B2547',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  companyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },

  /* Stats Row */
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1C2340',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3350',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#A5B4FC',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 4,
  },

  /* Quick Actions */
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonOutline: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#6366F1',
    backgroundColor: 'transparent',
  },
  actionIcon: { fontSize: 16 },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionTextOutline: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A5B4FC',
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 13,
    color: '#A5B4FC',
    fontWeight: '500',
  },

  /* List content */
  listContent: {
    paddingBottom: 32,
  },

  /* Event Card */
  eventCard: {
    backgroundColor: '#1C2340',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A3350',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
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
  cardBody: { gap: 6 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardIcon: { fontSize: 14 },
  cardLabel: { fontSize: 13, color: '#9CA3AF' },

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

  /* Empty */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
