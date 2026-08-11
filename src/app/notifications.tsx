import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Text } from '../components/ui';
import api, { isApiError } from '../services/api';
import { colors, radius, spacing } from '../theme';

/**
 * Figma's Notifications screen.
 *
 * The endpoints have existed since the backend was built but nothing in the
 * app ever called them, so notifications were being created and never seen.
 */

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Each notification type gets a glyph so the list is scannable without
// reading every line.
const TYPE_GLYPH: Record<string, string> = {
  new_job_alert: '💼',
  application_received: '📥',
  application_accepted: '✅',
  application_rejected: '❌',
  job_status_update: '🔄',
  payment_held: '🔒',
  payment_released: '💰',
  dispute_update: '⚖️',
  admin_announcement: '📢',
  booking_confirmed: '📅',
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await api.get<{ notifications: NotificationItem[] }>('/api/notifications', {
      limit: 50,
    });

    if (isApiError(result)) {
      setError(result.message);
      setIsLoading(false);
      return;
    }

    setNotifications(result.data.notifications ?? []);
    setUnreadCount((result.meta as { unreadCount?: number })?.unreadCount ?? 0);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    // Optimistic - the badge should clear immediately.
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    const result = await api.put('/api/notifications/read-all', {});
    if (isApiError(result)) fetchNotifications();
  };

  const handleTapOne = async (item: NotificationItem) => {
    if (item.isRead) return;

    setNotifications((prev) =>
      prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    const result = await api.put(`/api/notifications/${item._id}/read`, {});
    if (isApiError(result)) fetchNotifications();
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <Card
      style={[styles.card, !item.isRead && styles.cardUnread]}
      padded={false}
      onPress={() => handleTapOne(item)}
    >
      <View style={styles.iconWrap}>
        <Text style={styles.glyph}>{TYPE_GLYPH[item.type] ?? '🔔'}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text variant="bodySm" weight="semibold" numberOfLines={1} style={styles.title}>
            {item.title}
          </Text>
          <Text variant="caption" color={colors.textFaint}>
            {formatWhen(item.createdAt)}
          </Text>
        </View>
        <Text variant="caption" color={colors.textMuted} numberOfLines={2}>
          {item.message}
        </Text>
      </View>

      {!item.isRead ? <View style={styles.dot} /> : null}
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <Text variant="h2" weight="bold" color={colors.textOnPrimary}>
            Notifications
          </Text>

          <View style={styles.backBtnSpacer} />
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity
            style={styles.markAll}
            onPress={handleMarkAllRead}
            activeOpacity={0.7}
          >
            <Text variant="caption" color="rgba(249,244,244,0.75)">
              {unreadCount} unread
            </Text>
            <Text variant="caption" weight="semibold" color={colors.secondary}>
              Mark all read
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.content}>
        {isLoading && notifications.length === 0 ? (
          <Card elevation="flat" style={styles.stateCard}>
            <ActivityIndicator color={colors.primary} />
            <Text variant="bodySm" color={colors.textMuted} center>
              Loading notifications…
            </Text>
          </Card>
        ) : error ? (
          <Card elevation="flat" style={styles.stateCard}>
            <Text style={styles.stateGlyph}>⚠️</Text>
            <Text variant="bodySm" color={colors.textMuted} center>
              {error}
            </Text>
            <Button label="Retry" onPress={fetchNotifications} size="sm" fullWidth={false} />
          </Card>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(n) => n._id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Card elevation="flat" style={styles.stateCard}>
                <Text style={styles.stateGlyph}>🔔</Text>
                <Text variant="body" weight="semibold" center>
                  No notifications yet
                </Text>
                <Text variant="bodySm" color={colors.textMuted} center>
                  Job alerts and updates will show up here.
                </Text>
              </Card>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnSpacer: { width: 36 },
  backArrow: { fontSize: 17, color: colors.textOnPrimary },
  markAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },

  content: { flex: 1, backgroundColor: colors.background },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardUnread: { backgroundColor: colors.surface },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: { fontSize: 17 },
  body: { flex: 1, gap: 2 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: { flex: 1 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },

  stateCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxxl,
    marginTop: spacing.xl,
  },
  stateGlyph: { fontSize: 34 },
});
