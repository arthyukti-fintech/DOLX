import { router, useLocalSearchParams } from 'expo-router';
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
import { Button, Input, OtpInput, ScreenHeader, Text } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing } from '../../theme';

type FieldErrors = Record<string, string>;

/**
 * "Enter Verification Code" from the Figma flow.
 *
 * The code entered here is the reset key the backend emails on
 * forgot-password, so the boxed OTP entry maps onto a real credential
 * rather than a decorative one.
 */
export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(params.email ?? '');
  const [secretKey, setSecretKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetPassword = useAuthStore((state) => state.resetPassword);
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!email.trim()) errors.email = 'Email is required';
    if (!secretKey.trim()) errors.secretKey = 'Enter the code from your email';
    if (!newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.trim().length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    }
    if (confirmPassword.trim() !== newPassword.trim()) {
      errors.confirmPassword = "Passwords don't match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setGeneralError('');
    if (!validate()) return;

    setIsLoading(true);
    const error = await resetPassword(email.trim(), secretKey.trim(), newPassword.trim());
    setIsLoading(false);

    if (error) {
      if (error.fieldErrors) {
        setFieldErrors(error.fieldErrors);
      } else {
        setGeneralError(error.message);
      }
      return;
    }

    router.replace('/(auth)/login');
  };

  const handleResend = async () => {
    if (!email.trim() || resendState === 'sending') return;
    setResendState('sending');
    await forgotPassword(email.trim());
    setResendState('sent');
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text variant="h1" weight="bold">
            Enter Verification{'\n'}Code
          </Text>
          <Text variant="bodySm" color={colors.textMuted} style={styles.subtitle}>
            We&apos;ve sent a code to{' '}
            <Text variant="bodySm" weight="semibold" color={colors.text}>
              {email || 'your email'}
            </Text>
            . Enter it below to set a new password.
          </Text>

          {!params.email ? (
            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                clearFieldError('email');
              }}
              editable={!isLoading}
              error={fieldErrors.email}
              containerStyle={styles.field}
            />
          ) : null}

          <OtpInput
            value={secretKey}
            onChange={(v) => {
              setSecretKey(v);
              clearFieldError('secretKey');
            }}
            length={6}
            hasError={!!fieldErrors.secretKey}
            style={styles.otp}
          />
          {fieldErrors.secretKey ? (
            <Text variant="caption" color={colors.danger} center style={styles.otpError}>
              {fieldErrors.secretKey}
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={handleResend}
            disabled={resendState === 'sending'}
            style={styles.resend}
            activeOpacity={0.7}
          >
            <Text variant="bodySm" color={colors.textMuted}>
              Didn&apos;t get a code?{' '}
            </Text>
            <Text variant="bodySm" weight="semibold" color={colors.secondary}>
              {resendState === 'sending'
                ? 'Sending…'
                : resendState === 'sent'
                  ? 'Sent'
                  : 'Resend'}
            </Text>
          </TouchableOpacity>

          <Input
            label="New password"
            placeholder="At least 8 characters"
            isPassword
            value={newPassword}
            onChangeText={(t) => {
              setNewPassword(t);
              clearFieldError('newPassword');
            }}
            editable={!isLoading}
            error={fieldErrors.newPassword}
            containerStyle={styles.field}
          />

          <Input
            label="Confirm password"
            placeholder="Re-enter your new password"
            isPassword
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              clearFieldError('confirmPassword');
            }}
            editable={!isLoading}
            error={fieldErrors.confirmPassword}
            containerStyle={styles.field}
          />

          {generalError ? (
            <Text variant="bodySm" color={colors.danger} center style={styles.generalError}>
              {generalError}
            </Text>
          ) : null}

          <Button
            label="Reset Password"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.cta}
          />

          <View style={styles.footer}>
            <Text variant="bodySm" color={colors.textMuted}>
              Remembered it?{' '}
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
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 40,
  },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing.xxl },
  field: { marginBottom: spacing.md },
  otp: { marginBottom: spacing.sm },
  otpError: { marginBottom: spacing.sm },
  resend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  generalError: { marginBottom: spacing.md },
  cta: { marginTop: spacing.sm },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});
