import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';

type FieldErrors = Record<string, string>;

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(params.email ?? '');
  const [secretKey, setSecretKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetPassword = useAuthStore((state) => state.resetPassword);

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
    if (!secretKey.trim()) errors.secretKey = 'Secret key is required';
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>Reset Password</Text>
          <Text style={styles.subheading}>
            Enter the secret key we sent to your email, along with your new password.
          </Text>

          {generalError ? (
            <View style={styles.generalErrorBox}>
              <Text style={styles.generalErrorText}>{generalError}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={styles.fieldContainer}>
            <View style={[styles.inputWrapper, fieldErrors.email ? styles.inputError : null]}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearFieldError('email');
                }}
              />
            </View>
            {fieldErrors.email ? <Text style={styles.errorText}>{fieldErrors.email}</Text> : null}
          </View>

          {/* Secret key - free-form: letters, digits, and symbols are all accepted */}
          <View style={styles.fieldContainer}>
            <View style={[styles.inputWrapper, fieldErrors.secretKey ? styles.inputError : null]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Secret Key"
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
                autoCorrect={false}
                value={secretKey}
                onChangeText={(text) => {
                  setSecretKey(text);
                  clearFieldError('secretKey');
                }}
              />
            </View>
            {fieldErrors.secretKey ? (
              <Text style={styles.errorText}>{fieldErrors.secretKey}</Text>
            ) : null}
          </View>

          {/* New Password - free-form: letters, digits, and symbols are all accepted */}
          <View style={styles.fieldContainer}>
            <View style={[styles.inputWrapper, fieldErrors.newPassword ? styles.inputError : null]}>
              <Text style={styles.inputIcon}>🔑</Text>
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor="#6B7280"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  clearFieldError('newPassword');
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                <Text style={styles.eyeIcon}>{showPassword ? '👁' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
            {fieldErrors.newPassword ? (
              <Text style={styles.errorText}>{fieldErrors.newPassword}</Text>
            ) : null}
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldContainer}>
            <View style={[styles.inputWrapper, fieldErrors.confirmPassword ? styles.inputError : null]}>
              <Text style={styles.inputIcon}>🔑</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                placeholderTextColor="#6B7280"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  clearFieldError('confirmPassword');
                }}
              />
            </View>
            {fieldErrors.confirmPassword ? (
              <Text style={styles.errorText}>{fieldErrors.confirmPassword}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Need a new code? </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/(auth)/forgot-password')}>
              <Text style={styles.loginLink}>Resend</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#0D0D1A' },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C2340',
    borderWidth: 1,
    borderColor: '#2A3350',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  backArrow: { fontSize: 20, color: '#FFFFFF', lineHeight: 24 },

  heading: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 },
  subheading: { fontSize: 13, color: '#9CA3AF', marginBottom: 28, lineHeight: 19 },

  generalErrorBox: {
    backgroundColor: '#3B1A1A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  generalErrorText: { fontSize: 13, color: '#FCA5A5' },

  fieldContainer: { marginBottom: 14 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3350',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 14,
    backgroundColor: '#1C2340',
  },
  inputError: { borderColor: '#EF4444' },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#FFFFFF' },
  eyeIcon: { fontSize: 16, color: '#9CA3AF' },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 4, marginLeft: 4 },

  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },

  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 13, color: '#9CA3AF' },
  loginLink: { fontSize: 13, color: '#A5B4FC', fontWeight: '600' },
});
