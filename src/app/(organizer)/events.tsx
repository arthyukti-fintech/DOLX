import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, ImagePlaceholder, StatusPill, Text } from '../../components/ui';
import { useEventStore } from '../../stores/eventStore';
import { colors, radius, spacing } from '../../theme';
import { Event } from '../../types';

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

  const renderEventCard = ({ item }: { item: Event }) => (
    <Card style={styles.card} padded={false} onPress={() => router.push(`/event/${item._id}`)}>
      <ImagePlaceholder seed={item.eventType} glyph="🎪" rounded="md" style={styles.thumb} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text variant="body" weight="semibold" numberOfLines={1} style={styles.title}>
            {item.title}
          </Text>
          <StatusPill status={item.status} />
        </View>

        <Text variant="caption" color={colors.textMuted}>
          📅 {formatDate(item.date)}
        </Text>
        <Text variant="caption" color={colors.textMuted}>
          🏷️ {item.eventType}
        </Text>
        {item.location?.city ? (
          <Text variant="caption" color={colors.textMuted}>
            📍 {item.location.city}
          </Text>
        ) : null}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.header}>
        <Text variant="h2" weight="bold" color={colors.textOnPrimary}>
          My Events
        </Text>
        <Text variant="bodySm" color="rgba(249,244,244,0.7)" style={styles.headerSub}>
          {events.length} {events.length === 1 ? 'event' : 'events'} total
        </Text>
      </View>

      <View style={styles.content}>
        {error && !isLoading && events.length === 0 ? (
          <Card elevation="flat" style={styles.stateCard}>
            <Text style={styles.stateGlyph}>⚠️</Text>
            <Text variant="bodySm" color={colors.textMuted} center style={styles.stateCopy}>
              {error}
            </Text>
            <Button label="Retry" onPress={handleRetry} size="sm" fullWidth={false} />
          </Card>
        ) : isLoading && events.length === 0 ? (
          <Card elevation="flat" style={styles.stateCard}>
            <ActivityIndicator color={colors.primary} />
            <Text variant="bodySm" color={colors.textMuted} center style={styles.stateCopy}>
              Loading your events…
            </Text>
          </Card>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item._id}
            renderItem={renderEventCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Card elevation="flat" style={styles.stateCard}>
                <Text style={styles.stateGlyph}>📋</Text>
                <Text variant="body" weight="semibold" center>
                  No events yet
                </Text>
                <Text variant="bodySm" color={colors.textMuted} center style={styles.stateCopy}>
                  Create your first event to start hiring staff.
                </Text>
                <Button
                  label="Create Event"
                  onPress={() => router.push('/(organizer)/create-event')}
                  size="sm"
                  fullWidth={false}
                />
              </Card>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },

  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  headerSub: { marginTop: 2 },

  content: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl },
  listContent: { paddingTop: spacing.lg, paddingBottom: spacing.xxxl },

  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  thumb: { width: 72, height: 72 },
  body: { flex: 1, gap: 2 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 2,
  },
  title: { flex: 1 },

  stateCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxxl,
    marginTop: spacing.xl,
  },
  stateGlyph: { fontSize: 34 },
  stateCopy: { marginBottom: spacing.xs },
});
