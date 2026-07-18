import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

/**
 * Index route — redirects to the appropriate initial screen.
 * The root _layout.tsx handles the auth guard logic,
 * so this just needs to push to the correct entry point.
 */
export default function Index() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user?.role === 'worker') {
    return <Redirect href="/(worker)/home" />;
  }

  if (user?.role === 'organizer') {
    return <Redirect href="/(organizer)/events" />;
  }

  // Unknown role — role selection
  return <Redirect href="/role-selection" />;
}
