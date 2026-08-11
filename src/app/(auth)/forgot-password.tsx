import { router } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, ScreenHeader, Text } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { colors, radius, spacing } from '../../theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const forgotPassword = useAuthStore((state) => state.forgotPassword);

  const handleSubmit = async () => {
    setGeneralError('');
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    setIsLoading(true);
    const error = await forgotPassword(email.trim());
    setIsLoading(false);

    if (error) {
      setGeneralError(error.message);
      return;
    }

    router.push({ pathname: '/(auth)/reset-password', params: { email: email.trim() } });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenHeader />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.badge}>
            <Text style={styles.badgeGlyph}>🔒</Text>
          </View>

          <Text variant="h1" weight="bold">
            Forgot Password?
          </Text>
          <Text variant="bodySm" color={colors.textMuted} style={styles.subtitle}>
            Enter the email linked to your account and we&apos;ll send you a 6-digit code to reset
            your password.
          </Text>

          <Input
            placeholder="Enter Your Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (emailError) setEmailError('');
            }}
            editable={!isLoading}
            error={emailError || undefined}
            icon={<Text style={styles.inputIcon}>✉️</Text>}
            containerStyle={styles.field}
          />

          {generalError ? (
            <Text variant="bodySm" color={colors.danger} center style={styles.generalError}>
              {generalError}
            </Text>
          ) : null}

          <Button
            label="Send Code"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.cta}
          />

          <View style={styles.footer}>
            <Text variant="bodySm" color={colors.textMuted}>
              Remembered your password?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')} activeOpacity={0.7}>
              <Text variant="bodySm" weight="semibold" color={colors.secondary}>
                Log In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xxl, paddingBottom: 40 },

  badge: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  badgeGlyph: { fontSize: 28 },

  subtitle: { marginTop: spacing.sm, marginBottom: spacing.xxl },
  field: { marginBottom: spacing.md },
  inputIcon: { fontSize: 18 },
  generalError: { marginBottom: spacing.md },
  cta: { marginTop: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
});
