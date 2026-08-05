import { useAuthStore } from '@/stores/authStore';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Role Selection screen.
 *
 * Shown when an authenticated user's role is not "worker" or "organizer".
 * This acts as a redirect target per Requirement 15.5.
 */
export default function RoleSelectionScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.icon}>🎯</Text>
        <Text style={styles.title}>Select Your Role</Text>
        <Text style={styles.subtitle}>
          Hi {user?.name ?? 'there'}, please select a role to continue using DOLX.
        </Text>
        <Text style={styles.hint}>
          Contact support or update your profile to set your role as Worker or Organizer.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B2547',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  hint: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
