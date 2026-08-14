import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Icon, IconLabel, ImagePlaceholder, SkeletonList, StatusPill, Text } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
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

  const activeEvents = events.filter((e) => e.status === 'active');
  const organizerName = user?.name ?? 'Organizer';
  const companyName = user?.organizerProfile?.companyName;

  const renderEventCard = (item: Event) => (
    <Card
      key={item._id}
      style={styles.eventCard}
      padded={false}
      onPress={() => router.push(`/event/${item._id}`)}
    >
      <ImagePlaceholder
        seed={item.eventType}
        icon="calendar"
        rounded="md"
        style={styles.eventThumb}
      />
      <View style={styles.eventBody}>
        <View style={styles.eventTop}>
          <Text variant="body" weight="semibold" numberOfLines={1} style={styles.eventTitle}>
            {item.title}
          </Text>
          <StatusPill status={item.status} />
        </View>
        <IconLabel icon="calendar" label={formatDate(item.date)} color={colors.textMuted} variant="caption" />
        <IconLabel icon="tag" label={item.eventType} color={colors.textMuted} variant="caption" />
        {item.location?.city ? (
          <IconLabel icon="location" label={item.location.city} color={colors.textMuted} variant="caption" />
        ) : null}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Navy header ── */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text variant="h2" weight="bold" color={colors.textOnPrimary}>
                Welcome back, {organizerName}
              </Text>
              {companyName ? (
                <Text variant="bodySm" color="rgba(249,244,244,0.7)" style={styles.headerSub}>
                  {companyName}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.headerIcon}
              activeOpacity={0.7}
              onPress={() => router.push('/(organizer)/profile')}
              accessibilityRole="button"
              accessibilityLabel="Profile"
            >
              <Text style={styles.headerGlyph}>{organizerName.charAt(0).toUpperCase()}</Text>
            </TouchableOpacity>
          </View>

          {/* ── Stats ── */}
          <View style={styles.statsRow}>
            <View style={styles.statTile}>
              <Text variant="h1" weight="bold" color={colors.textOnPrimary}>
                {activeEvents.length}
              </Text>
              <Text variant="caption" color="rgba(249,244,244,0.7)">
                Active Events
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statTile}>
              <Text variant="h1" weight="bold" color={colors.textOnPrimary}>
                {events.length}
              </Text>
              <Text variant="caption" color="rgba(249,244,244,0.7)">
                Total Events
              </Text>
            </View>
          </View>
        </View>

        {/* ── Quick actions ── */}
        <View style={styles.section}>
          <View style={styles.actionRow}>
            <Button
              label="Create Event"
              onPress={() => router.push('/(organizer)/create-event')}
              size="md"
              style={styles.actionBtn}
            />
            <Button
              label="View All"
              variant="outline"
              size="md"
              onPress={() => router.push('/(organizer)/events')}
              style={styles.actionBtn}
            />
          </View>
        </View>

        {/* ── Active events ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="h3" weight="semibold">
              Active Events
            </Text>
            {events.length > 0 ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/(organizer)/events')}
              >
                <Text variant="bodySm" weight="semibold" color={colors.secondary}>
                  See All
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {isLoading && !hasFetched ? (
            <SkeletonList />
          ) : error && events.length === 0 ? (
            <Card elevation="flat" style={styles.stateCard}>
              <Text variant="bodySm" color={colors.danger} center style={styles.stateCopy}>
                {error}
              </Text>
              <Button label="Retry" onPress={handleRetry} size="sm" fullWidth={false} />
            </Card>
          ) : activeEvents.length === 0 ? (
            <Card elevation="flat" style={styles.stateCard}>
              <Icon name="calendar" size={32} color={colors.textFaint} />
              <Text variant="body" weight="semibold" center>
                No active events
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
          ) : (
            activeEvents.map(renderEventCard)
          )}
        </View>

        <Text variant="hero" weight="bold" color={colors.surface} center style={styles.watermark}>
          DOLX
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },
  scroll: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xxxl },

  /* ── Header ── */
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flex: 1, marginRight: spacing.md },
  headerSub: { marginTop: 2 },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerGlyph: { fontSize: 16, color: colors.textOnPrimary },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statTile: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, height: 34, backgroundColor: 'rgba(255,255,255,0.15)' },

  /* ── Sections ── */
  section: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  actionBtn: { flex: 1 },

  /* ── Event cards ── */
  eventCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  eventThumb: { width: 72, height: 72 },
  eventBody: { flex: 1, gap: 2 },
  eventTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 2,
  },
  eventTitle: { flex: 1 },

  /* ── States ── */
  stateCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  stateCopy: { marginBottom: spacing.xs },
  emptyGlyph: { fontSize: 32 },

  watermark: { marginTop: spacing.xxxl, letterSpacing: 4 },
});
