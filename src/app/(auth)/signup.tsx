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
import { Button, Icon, Input, ScreenHeader, Text, type IconName } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { colors, radius, spacing } from '../../theme';
import { UserRole } from '../../types';

type FieldErrors = Record<string, string>;

const ROLES: { value: UserRole; icon: IconName; label: string; blurb: string }[] = [
  { value: 'organizer', icon: 'calendar', label: 'Event Organiser', blurb: 'Hire staff for events' },
  { value: 'worker', icon: 'roleHelper', label: 'Worker', blurb: 'Find gigs near you' },
];

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');

  const register = useAuthStore((state) => state.register);

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    if (!phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (phone.replace(/\D/g, '').length !== 10) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }
    if (!password.trim()) errors.password = 'Password is required';
    if (!role) errors.role = 'Please select a role';
    if (role === 'organizer' && !companyName.trim()) {
      errors.companyName = 'Company name is required for organizers';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async () => {
    setGeneralError('');
    if (!validate()) return;

    setIsLoading(true);

    const data = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password.trim(),
      role: role as UserRole,
      ...(role === 'organizer' && companyName.trim()
        ? { companyName: companyName.trim() }
        : {}),
    };

    const error = await register(data);
    setIsLoading(false);

    if (error) {
      if (error.fieldErrors) {
        setFieldErrors(error.fieldErrors);
      } else {
        setGeneralError(error.message);
      }
      return;
    }

    const user = useAuthStore.getState().user;
    router.replace(user?.role === 'organizer' ? '/(organizer)/home' : '/(worker)/home');
  };

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
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
            Create Account
          </Text>
          <Text variant="bodySm" color={colors.textMuted} style={styles.subtitle}>
            Join DOLX and start hiring or working at events near you.
          </Text>

          {/* ── Role picker ── */}
          <Text variant="bodySm" weight="medium" style={styles.roleLabel}>
            I want to join as
          </Text>
          <View style={styles.roleRow}>
            {ROLES.map((option) => {
              const isActive = role === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.roleCard, isActive && styles.roleCardActive]}
                  activeOpacity={0.85}
                  onPress={() => {
                    setRole(option.value);
                    clearFieldError('role');
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isActive }}
                >
                  <Icon
                    name={option.icon}
                    size={24}
                    color={isActive ? colors.secondary : colors.primary}
                  />
                  <Text variant="bodySm" weight="semibold" center>
                    {option.label}
                  </Text>
                  <Text variant="caption" color={colors.textMuted} center>
                    {option.blurb}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {fieldErrors.role ? (
            <Text variant="caption" color={colors.danger} style={styles.roleError}>
              {fieldErrors.role}
            </Text>
          ) : null}

          {/* ── Fields ── */}
          <Input
            placeholder="Full Name"
            value={name}
            onChangeText={(t) => {
              setName(t);
              clearFieldError('name');
            }}
            editable={!isLoading}
            error={fieldErrors.name}
            icon={<Icon name="person" size={18} color={colors.textFaint} />}
            containerStyle={styles.field}
          />

          <Input
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              clearFieldError('email');
            }}
            editable={!isLoading}
            error={fieldErrors.email}
            icon={<Icon name="mail" size={18} color={colors.textFaint} />}
            containerStyle={styles.field}
          />

          <Input
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(t) => {
              setPhone(t);
              clearFieldError('phone');
            }}
            editable={!isLoading}
            error={fieldErrors.phone}
            icon={<Icon name="phone" size={18} color={colors.textFaint} />}
            containerStyle={styles.field}
          />

          {role === 'organizer' ? (
            <Input
              placeholder="Company Name"
              value={companyName}
              onChangeText={(t) => {
                setCompanyName(t);
                clearFieldError('companyName');
              }}
              editable={!isLoading}
              error={fieldErrors.companyName}
              icon={<Icon name="building" size={18} color={colors.textFaint} />}
              containerStyle={styles.field}
            />
          ) : null}

          <Input
            placeholder="Password"
            isPassword
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              clearFieldError('password');
            }}
            editable={!isLoading}
            error={fieldErrors.password}
            icon={<Icon name="key" size={18} color={colors.textFaint} />}
            containerStyle={styles.field}
          />

          {generalError ? (
            <Text variant="bodySm" color={colors.danger} center style={styles.generalError}>
              {generalError}
            </Text>
          ) : null}

          <Button
            label="Create Account"
            onPress={handleSignup}
            loading={isLoading}
            style={styles.cta}
          />

          <View style={styles.footer}>
            <Text variant="bodySm" color={colors.textMuted}>
              Already have an account?{' '}
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

  subtitle: { marginTop: spacing.sm, marginBottom: spacing.xl },

  roleLabel: { marginBottom: spacing.sm },
  roleRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  roleCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  roleCardActive: { borderColor: colors.primary, backgroundColor: colors.surface },
  roleGlyph: { fontSize: 24, marginBottom: spacing.xs },
  roleError: { marginTop: -spacing.md, marginBottom: spacing.md },

  field: { marginBottom: spacing.md },
  inputIcon: { fontSize: 18 },

  generalError: { marginBottom: spacing.md },
  cta: { marginTop: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
});
