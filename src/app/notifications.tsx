import api, { isApiError } from '@/services/api';
import { useNotificationStore } from '@/stores/notificationStore';
import { Notification } from '@/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

// ─── Constants ───

const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
  application: '📋',
  payment: '💰',
  event: '📅',
  job: '💼',
  review: '⭐',
  system: '🔔',
};

// ─── Helper Functions ───

function getTypeIcon(type: string): string {
  const normalized = type.toLowerCase();
  for (const key of Object.keys(NOTIFICATION_TYPE_ICONS)) {
    if (normalized.includes(key)) {
      return NOTIFICATION_TYPE_ICONS[key];
    }
  }
  return '🔔';
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// ─── Notification Item Component ───

interface NotificationItemProps {
  notification: Notification;
  onPress: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        itemStyles.container,
        !notification.isRead && itemStyles.unreadContainer,
      ]}
      onPress={() => onPress(notification._id)}
    >
      {/* Unread indicator dot */}
      {!notification.isRead && <View style={itemStyles.unreadDot} />}

      {/* Type icon */}
      <View style={itemStyles.iconContainer}>
        <Text style={itemStyles.icon}>{getTypeIcon(notification.type)}</Text>
      </View>

      {/* Content */}
      <View style={itemStyles.content}>
        <Text style={[itemStyles.title, !notification.isRead && itemStyles.unreadTitle]} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={itemStyles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={itemStyles.timestamp}>
          {formatTimestamp(notification.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const itemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F3',
    position: 'relative',
  },
  unreadContainer: {
    backgroundColor: '#F0F4FF',
  },
  unreadDot: {
    position: 'absolute',
    top: 20,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1B2547',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#1B2547',
  },
  message: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#999999',
  },
});

// ─── Header Component ───

interface NotificationsHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
  isMarkingAll: boolean;
  onBack: () => void;
}

const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({
  unreadCount,
  onMarkAllRead,
  isMarkingAll,
  onBack,
}) => {
  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.topRow}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={headerStyles.backButton}>
          <Text style={headerStyles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={headerStyles.heading}>Notifications</Text>
        <View style={headerStyles.spacer} />
      </View>

      {unreadCount > 0 && (
        <View style={headerStyles.actionRow}>
          <Text style={headerStyles.unreadBadge}>
            {unreadCount} unread
          </Text>
          <TouchableOpacity
            style={headerStyles.markAllButton}
            onPress={onMarkAllRead}
            disabled={isMarkingAll}
            activeOpacity={0.7}
          >
            {isMarkingAll ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={headerStyles.markAllText}>Mark All Read</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: '#1B2547',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    paddingRight: 12,
    paddingVertical: 4,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  spacer: {
    width: 34,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unreadBadge: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
  },
  markAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  markAllText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

// ─── Main Screen ───

const NotificationCenterScreen: React.FC = () => {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [error, setError] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Fetch notifications on mount
  useEffect(() => {
    loadNotifications(true);
  }, []);

  const loadNotifications = useCallback(
    async (reset: boolean) => {
      setError(null);
      await fetchNotifications(reset);
      const state = useNotificationStore.getState();
      // If reset fetch resulted in 0 notifications AND we weren't already at 0,
      // or if isLoading ended but nothing changed on a fresh load — could be error.
      // We detect error by checking if a direct API test returns an error.
      if (reset && state.notifications.length === 0 && !state.isLoading) {
        // Try a direct API check to distinguish "empty" from "error"
        const testResult = await api.get<{ notifications: Notification[] }>(
          '/api/notifications',
          { page: 1, limit: 1 }
        );
        if (isApiError(testResult)) {
          setError(testResult.message);
        }
      }
    },
    [fetchNotifications]
  );

  // Handle notification tap — mark as read
  const handleNotificationPress = useCallback(
    async (id: string) => {
      const notification = notifications.find((n) => n._id === id);
      if (notification && !notification.isRead) {
        await markAsRead(id);
      }
    },
    [notifications, markAsRead]
  );

  // Handle mark all read
  const handleMarkAllRead = useCallback(async () => {
    setIsMarkingAll(true);
    await markAllAsRead();
    setIsMarkingAll(false);
  }, [markAllAsRead]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, [router]);

  // Handle retry
  const handleRetry = useCallback(() => {
    loadNotifications(true);
  }, [loadNotifications]);

  // Load more on reaching end
  const handleEndReached = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchNotifications(false);
    }
  }, [isLoading, hasMore, fetchNotifications]);

  // Render notification item
  const renderItem = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationItem notification={item} onPress={handleNotificationPress} />
    ),
    [handleNotificationPress]
  );

  // Key extractor
  const keyExtractor = useCallback((item: Notification) => item._id, []);

  // Footer component
  const renderFooter = () => {
    if (isLoading && notifications.length > 0) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color="#1B2547" />
          <Text style={styles.footerText}>Loading more...</Text>
        </View>
      );
    }

    if (!hasMore && notifications.length > 0) {
      return (
        <View style={styles.endIndicator}>
          <Text style={styles.endIndicatorText}>No more notifications</Text>
        </View>
      );
    }

    return null;
  };

  // Empty state
  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔔</Text>
        <Text style={styles.emptyTitle}>No notifications</Text>
        <Text style={styles.emptyMessage}>
          You're all caught up! New notifications will appear here.
        </Text>
      </View>
    );
  };

  // Error state (only when no notifications loaded)
  if (error && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#1B2547" />
        <NotificationsHeader
          unreadCount={unreadCount}
          onMarkAllRead={handleMarkAllRead}
          isMarkingAll={isMarkingAll}
          onBack={handleBack}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1B2547" />
      <NotificationsHeader
        unreadCount={unreadCount}
        onMarkAllRead={handleMarkAllRead}
        isMarkingAll={isMarkingAll}
        onBack={handleBack}
      />

      {/* Initial loading state */}
      {isLoading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B2547" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationCenterScreen;

// ─── Screen Styles ───

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 15,
    color: '#444444',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#1B2547',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLoading: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666666',
  },
  endIndicator: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  endIndicatorText: {
    fontSize: 13,
    color: '#999999',
    fontStyle: 'italic',
  },
});
