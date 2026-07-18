import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
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

export default function MyEventsScreen() {
  const events = useEventStore((s) => s.events);
  const isLoading = useEventStore((s) => s.isLoading);
  const error = useEventStore((s) => s.error);
  const fetchMyEvents = useEventStore((s) => s.fetchMyEvents);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const handleRetry = useCallback(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const handleEventPress = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  // ─── Render: Event Card ───

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(item._id)}
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

  // ─── Render: Empty State ───

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No Events Yet</Text>
        <Text style={styles.emptySubtitle}>
          Create your first event to start hiring staff
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/(organizer)/create-event')}
          activeOpacity={0.85}
        >
          <Text style={styles.createButtonText}>+ Create Event</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ─── Render: Error State ───

  if (error && !isLoading && events.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1B2547" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Events</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Failed to load events</Text>
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

  // ─── Main Render ───

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1B2547" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Events</Text>
      </View>

      {isLoading && events.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={renderEventCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D0D1A' },

  /* Header */
  header: {
    backgroundColor: '#1B2547',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3350',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* List */
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },

  /* Event Card */
  eventCard: {
    backgroundColor: '#1C2340',
    borderRadius: 14,
    padding: 16,
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
    fontSize: 16,
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
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  createButtonText: { color: '#A5B4FC', fontSize: 14, fontWeight: '600' },
});
