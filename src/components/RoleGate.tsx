import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';

/**
 * Keeps a route group to the role it was built for.
 *
 * `index.tsx` already sends people to the right home after login, so the normal
 * path was never wrong. What was missing is a guard on the groups themselves:
 * a deep link, a typed URL, a browser back button, or a stale route restored on
 * launch would render the other role's tabs and every request behind them would
 * fail with "Role 'worker' is not permitted to access this resource" - an API
 * error surfaced as if the app were broken.
 *
 * Redirecting is deliberate rather than rendering an error: landing on the
 * wrong tab is a navigation mistake, and the fix is to be somewhere valid.
 */

/** Where a signed-in user belongs. */
function homeFor(role: UserRole): string {
  if (role === 'worker') return '/(worker)/home';
  if (role === 'organizer') return '/(organizer)/home';
  // Admins have no mobile experience - they use the web panel - so there is
  // nowhere sensible to send them but back to the start.
  return '/role-selection';
}

interface RoleGateProps {
  /** The role this group serves. */
  role: UserRole;
  children: ReactNode;
}

export function RoleGate({ role, children }: RoleGateProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Session restored but the profile hasn't arrived yet - hold rather than
  // bounce, or a slow /me response would eject someone mid-launch.
  if (!user) return null;

  if (user.role !== role) {
    return <Redirect href={homeFor(user.role) as never} />;
  }

  return <>{children}</>;
}

export default RoleGate;
