import { Redirect, Slot, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../stores/authStore';

/**
 * Root layout with auth guard.
 *
 * Behavior:
 * - On mount: restores the session from secure storage.
 * - While loading: displays a loading indicator (splash-like screen).
 * - Unauthenticated: redirects to (auth) group (login/signup/verify).
 * - Authenticated as "worker": redirects to (worker) tab group.
 * - Authenticated as "organizer": redirects to (organizer) tab group.
 * - Authenticated with unknown role: redirects to role-selection.
 *
 * Shared screens (/job/[id], /event/[eventId], /notifications, /reviews,
 * /payment/[id]) remain at the top level and are accessible to any
 * authenticated user regardless of role.
 */
export default function RootLayout() {
  const { isLoading, isAuthenticated, user, restoreSession } = useAuthStore();
  const segments = useSegments();

  // Restore session on mount
  useEffect(() => {
    restoreSession();
  }, []);

  // Show loading screen while restoring session
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B2547" />
      </View>
    );
  }

  // Determine which segment group the user is currently in
  const inAuthGroup = segments[0] === '(auth)';
  const inWorkerGroup = segments[0] === '(worker)';
  const inOrganizerGroup = segments[0] === '(organizer)';

  // Shared authenticated screens accessible to any logged-in user
  const inSharedAuthenticatedRoute =
    segments[0] === 'job' ||
    segments[0] === 'event' ||
    segments[0] === 'notifications' ||
    segments[0] === 'reviews' ||
    segments[0] === 'payment';

  // ─── Auth Guard ───
  if (!isAuthenticated) {
    // User is not logged in — only allow (auth) group
    if (!inAuthGroup) {
      return <Redirect href="/(auth)/login" />;
    }
  } else {
    // User is authenticated
    const role = user?.role;

    if (role === 'worker') {
      // Worker should not be in (auth) or (organizer) groups
      if (inAuthGroup) {
        return <Redirect href="/(worker)/home" />;
      }
      if (inOrganizerGroup) {
        return <Redirect href="/(worker)/home" />;
      }
    } else if (role === 'organizer') {
      // Organizer should not be in (auth) or (worker) groups
      if (inAuthGroup) {
        return <Redirect href="/(organizer)/events" />;
      }
      if (inWorkerGroup) {
        return <Redirect href="/(organizer)/events" />;
      }
    } else {
      // Unknown role — redirect to role selection
      // Allow shared routes and the role-selection screen itself
      if (!inSharedAuthenticatedRoute && segments[0] !== 'role-selection') {
        return <Redirect href="/role-selection" />;
      }
    }
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <Slot />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
