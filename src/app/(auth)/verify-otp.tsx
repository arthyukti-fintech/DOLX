import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Icon, OtpInput, ScreenHeader, Text } from '../../components/ui';
import { useAuthStore, type OtpAccountChoice } from '../../stores/authStore';
import { colors, radius, spacing } from '../../theme';

/**
 * Figma's "Enter Verification Code" screen.
 *
 * The design's caption reads "4-digit" while the artwork draws six boxes; four
 * is what was agreed and what the backend issues, so four is what's rendered.
 *
 * One number can hold both a worker and an organizer account. When it does, the
 * backend answers the correct code with a choice rather than a token, and this
 * screen asks before completing sign-in.
 */

const CODE_LENGTH = 4;
const RESEND_SECONDS = 30;

export default function VerifyOtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [choices, setChoices] = useState<OtpAccountChoice[] | null>(null);

  const verifyLoginOtp = useAuthStore((s) => s.verifyLoginOtp);
  const requestLoginOtp = useAuthStore((s) => s.requestLoginOtp);

  // Guards against firing the auto-submit twice while the request is in flight.
  const submittedFor = useRef<string | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const goHome = () => {
    const role = useAuthStore.getState().user?.role;
    router.replace(role === 'organizer' ? '/(organizer)/home' : '/(worker)/home');
  };

  const submit = async (value: string, role?: 'worker' | 'organizer') => {
    if (!phone) return;

    setIsVerifying(true);
    setError('');

    const result = await verifyLoginOtp(phone, value, role);
    setIsVerifying(false);

    if (result === null) {
      goHome();
      return;
    }

    if ('accounts' in result) {
      setChoices(result.accounts);
      return;
    }

    // A rejected code is worth retyping, so clear it and let the boxes refill.
    setError(result.message);
    setCode('');
    submittedFor.current = null;
  };

  const handleChange = (value: string) => {
    setCode(value);
    if (error) setError('');

    // Submitting on the last digit saves a tap; the ref stops a re-render from
    // firing the same code twice.
    if (value.length === CODE_LENGTH && submittedFor.current !== value) {
      submittedFor.current = value;
      submit(value);
    }
  };

  const handleResend = async () => {
    if (!phone || secondsLeft > 0) return;

    setError('');
    setCode('');
    submittedFor.current = null;

    const err = await requestLoginOtp(phone);
    if (err) {
      setError(err.message);
      return;
    }
    setSecondsLeft(RESEND_SECONDS);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text variant="h1" weight="bold">
          Enter Verification Code
        </Text>
        <Text variant="bodySm" color={colors.textMuted} style={styles.caption}>
          We&apos;ve sent a {CODE_LENGTH}-digit code to +91 {phone}
        </Text>

        {choices ? (
          <View style={styles.choices}>
            <Text variant="bodySm" color={colors.textMuted}>
              This number has more than one account. Which one do you want to use?
            </Text>

            {choices.map((choice) => (
              <Card
                key={choice.role}
                style={styles.choiceCard}
                onPress={() => submit(code, choice.role)}
              >
                <Icon
                  name={choice.role === 'organizer' ? 'calendar' : 'roleHelper'}
                  size={22}
                  color={colors.primary}
                />
                <View style={styles.choiceBody}>
                  <Text variant="body" weight="semibold">
                    {choice.role === 'organizer' ? 'Event Organiser' : 'Worker'}
                  </Text>
                  <Text variant="caption" color={colors.textMuted}>
                    {choice.name}
                  </Text>
                </View>
                <Icon name="chevronRight" size={18} color={colors.textFaint} />
              </Card>
            ))}
          </View>
        ) : (
          <>
            <OtpInput
              value={code}
              onChange={handleChange}
              length={CODE_LENGTH}
              editable={!isVerifying}
              hasError={!!error}
              autoFocus
              style={styles.otp}
            />

            {error ? (
              <Text variant="bodySm" color={colors.danger} style={styles.error}>
                {error}
              </Text>
            ) : null}

            <Button
              label="Continue"
              onPress={() => submit(code)}
              loading={isVerifying}
              disabled={code.length !== CODE_LENGTH}
              style={styles.cta}
            />

            <TouchableOpacity
              onPress={handleResend}
              disabled={secondsLeft > 0}
              activeOpacity={0.7}
              style={styles.resend}
            >
              <Text
                variant="bodySm"
                weight="semibold"
                color={secondsLeft > 0 ? colors.textFaint : colors.secondary}
              >
                {secondsLeft > 0 ? `Resend OTP in ${secondsLeft}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxxl },

  caption: { marginTop: spacing.sm, marginBottom: spacing.xxl },
  otp: { marginBottom: spacing.lg },
  error: { marginBottom: spacing.md },
  cta: { marginBottom: spacing.lg },
  resend: { alignSelf: 'flex-start' },

  choices: { gap: spacing.md },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  choiceBody: { flex: 1, gap: 2 },
});
