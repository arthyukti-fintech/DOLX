import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types';

type FieldErrors = Record<string, string>;

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');

  const register = useAuthStore((state) => state.register);

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    if (!email.trim()) {
      errors.email = 'Email is required';
    }
    if (!phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (phone.replace(/\D/g, '').length !== 10) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }
    if (!password.trim()) {
      errors.password = 'Password is required';
    }
    if (!role) {
      errors.role = 'Please select a role';
    }
    if (role === 'organizer' && !companyName.trim()) {
      errors.companyName = 'Company name is required for organizers';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async () => {
    setGeneralError('');

    if (!validate()) {
      return;
    }

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
      // Map field-specific backend errors
      if (error.fieldErrors) {
        setFieldErrors(error.fieldErrors);
      } else {
        setGeneralError(error.message);
      }
      return;
    }

    // Success — navigate based on role (matches (auth)/login.tsx's post-auth redirect)
    const user = useAuthStore.getState().user;
    if (user?.role === 'organizer') {
      router.replace('/(organizer)/home');
    } else {
      router.replace('/(worker)/home');
    }
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
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          {/* Heading */}
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subheading}>
            Join DOLX to find or post event jobs
          </Text>

          {/* General error */}
          {generalError ? (
            <View style={styles.generalErrorBox}>
              <Text style={styles.generalErrorText}>{generalError}</Text>
            </View>
          ) : null}

          {/* Name */}
          <View style={styles.fieldContainer}>
            <View
              style={[
                styles.inputWrapper,
                fieldErrors.name ? styles.inputError : null,
              ]}
            >
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#6B7280"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  clearFieldError('name');
                }}
                autoCapitalize="words"
              />
            </View>
            {fieldErrors.name ? (
              <Text style={styles.errorText}>{fieldErrors.name}</Text>
            ) : null}
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <View
              style={[
                styles.inputWrapper,
                fieldErrors.email ? styles.inputError : null,
              ]}
            >
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
            {fieldErrors.email ? (
              <Text style={styles.errorText}>{fieldErrors.email}</Text>
            ) : null}
          </View>

          {/* Phone */}
          <View style={styles.fieldContainer}>
            <View
              style={[
                styles.inputWrapper,
                fieldErrors.phone ? styles.inputError : null,
              ]}
            >
              <Text style={styles.inputIcon}>📞</Text>
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  clearFieldError('phone');
                }}
                maxLength={10}
              />
            </View>
            {fieldErrors.phone ? (
              <Text style={styles.errorText}>{fieldErrors.phone}</Text>
            ) : null}
          </View>

          {/* Password */}
          <View style={styles.fieldContainer}>
            <View
              style={[
                styles.inputWrapper,
                fieldErrors.password ? styles.inputError : null,
              ]}
            >
              <Text style={styles.inputIcon}>🔑</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#6B7280"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearFieldError('password');
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeIcon}>
                  {showPassword ? '👁' : '🙈'}
                </Text>
              </TouchableOpacity>
            </View>
            {fieldErrors.password ? (
              <Text style={styles.errorText}>{fieldErrors.password}</Text>
            ) : null}
          </View>

          {/* Role Picker */}
          <View style={styles.fieldContainer}>
            <Text style={styles.roleLabel}>I am a:</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === 'worker' && styles.roleOptionActive,
                ]}
                onPress={() => {
                  setRole('worker');
                  clearFieldError('role');
                  setCompanyName('');
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    role === 'worker' && styles.roleOptionTextActive,
                  ]}
                >
                  Worker
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === 'organizer' && styles.roleOptionActive,
                ]}
                onPress={() => {
                  setRole('organizer');
                  clearFieldError('role');
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    role === 'organizer' && styles.roleOptionTextActive,
                  ]}
                >
                  Organizer
                </Text>
              </TouchableOpacity>
            </View>
            {fieldErrors.role ? (
              <Text style={styles.errorText}>{fieldErrors.role}</Text>
            ) : null}
          </View>

          {/* Company Name (shown for organizer) */}
          {role === 'organizer' ? (
            <View style={styles.fieldContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  fieldErrors.companyName ? styles.inputError : null,
                ]}
              >
                <Text style={styles.inputIcon}>🏢</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Company Name"
                  placeholderTextColor="#6B7280"
                  value={companyName}
                  onChangeText={(text) => {
                    setCompanyName(text);
                    clearFieldError('companyName');
                  }}
                  autoCapitalize="words"
                />
              </View>
              {fieldErrors.companyName ? (
                <Text style={styles.errorText}>{fieldErrors.companyName}</Text>
              ) : null}
            </View>
          ) : null}

          {/* Create Account Button */}
          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.createButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.createButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },

  /* Back button */
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
  backArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 24,
  },

  /* Heading */
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 28,
  },

  /* General error */
  generalErrorBox: {
    backgroundColor: '#3B1A1A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  generalErrorText: {
    fontSize: 13,
    color: '#FCA5A5',
  },

  /* Field containers */
  fieldContainer: {
    marginBottom: 14,
  },

  /* Inputs */
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
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  eyeIcon: {
    fontSize: 16,
    color: '#9CA3AF',
  },

  /* Error text */
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },

  /* Role picker */
  roleLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 10,
    fontWeight: '500',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A3350',
    backgroundColor: '#1C2340',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleOptionActive: {
    borderColor: '#6366F1',
    backgroundColor: '#1E1B4B',
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  roleOptionTextActive: {
    color: '#A5B4FC',
  },

  /* Create button */
  createButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  /* Login link */
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  loginLink: {
    fontSize: 13,
    color: '#A5B4FC',
    fontWeight: '600',
  },
});
