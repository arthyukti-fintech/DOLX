import { create } from 'zustand';
import api, { isApiError } from '../services/api';
import { Notification } from '../types';

// ─── Constants ───

const DEFAULT_PAGE_SIZE = 20;

// ─── Types ───

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  fetchNotifications: (reset?: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

// ─── Store ───

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  page: 1,
  hasMore: true,
  isLoading: false,

  fetchNotifications: async (reset = false): Promise<void> => {
    const state = get();

    // Prevent duplicate fetches
    if (state.isLoading) return;

    // If not resetting and no more pages, skip
    if (!reset && !state.hasMore) return;

    const page = reset ? 1 : state.page;

    set({ isLoading: true });

    const params: Record<string, string | number | undefined> = {
      page,
      limit: DEFAULT_PAGE_SIZE,
    };

    const result = await api.get<{ notifications: Notification[] }>(
      '/api/notifications',
      params
    );

    if (isApiError(result)) {
      set({ isLoading: false });
      return;
    }

    const { notifications: fetched } = result.data;
    const meta = result.meta;

    // Extract unreadCount from meta if available
    const unreadCount =
      (meta as Record<string, unknown> | undefined)?.unreadCount != null
        ? Number((meta as Record<string, unknown>).unreadCount)
        : get().unreadCount;

    // Determine if there are more pages
    const totalFetched = reset
      ? fetched.length
      : state.notifications.length + fetched.length;
    const hasMore = meta
      ? totalFetched < meta.total
      : fetched.length === DEFAULT_PAGE_SIZE;

    if (reset) {
      set({
        notifications: fetched,
        unreadCount,
        page: 2,
        hasMore,
        isLoading: false,
      });
    } else {
      // Append results, filtering out duplicates
      const existingIds = new Set(state.notifications.map((n) => n._id));
      const newNotifications = fetched.filter((n) => !existingIds.has(n._id));

      set({
        notifications: [...state.notifications, ...newNotifications],
        unreadCount,
        page: page + 1,
        hasMore,
        isLoading: false,
      });
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    const result = await api.put<void>(`/api/notifications/${id}/read`);

    if (isApiError(result)) {
      return;
    }

    // Update local state: mark the notification as read and decrement unreadCount
    set((state) => {
      const notification = state.notifications.find((n) => n._id === id);
      // Only decrement if the notification was actually unread
      const shouldDecrement = notification && !notification.isRead;

      return {
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: shouldDecrement
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    });
  },

  markAllAsRead: async (): Promise<void> => {
    const result = await api.put<void>('/api/notifications/read-all');

    if (isApiError(result)) {
      return;
    }

    // Update local state: mark all notifications as read and set unreadCount to 0
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));
