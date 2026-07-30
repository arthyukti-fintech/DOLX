import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
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

const { height: SCREEN_H } = Dimensions.get('window');
const MOSAIC_HEIGHT = SCREEN_H * 0.45;

const IMAGES = {
  col1_img1: { uri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=250&fit=crop' },
  col1_img2: { uri: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=180&fit=crop' },
  col1_img3: { uri: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=200&h=200&fit=crop' },
  col2_img1: { uri: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=200&h=180&fit=crop' },
  col2_img2: { uri: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&h=200&fit=crop' },
  col3_img1: { uri: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=190&fit=crop' },
  col3_img2: { uri: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=200&h=170&fit=crop' },
  col3_img3: { uri: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=200&fit=crop' },
};

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);

  const validate = (): boolean => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setApiError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setApiError('');

    const error = await login(email.trim(), password.trim());

    if (error) {
      setApiError(error.message);
      setIsLoading(false);
    } else {
      // Login successful — navigate based on role
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === 'organizer') {
        router.replace('/(organizer)/home');
      } else {
        router.replace('/(worker)/home');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Mosaic ── */}
        <View style={styles.mosaicContainer}>
          <View style={styles.mosaicRotated}>
            <View style={styles.mosaicColumnLeft}>
              <Image source={IMAGES.col1_img1} style={styles.mosaicImg1} resizeMode="cover" />
              <Image source={IMAGES.col1_img2} style={styles.mosaicImg2} resizeMode="cover" />
              <Image source={IMAGES.col1_img3} style={styles.mosaicImg3} resizeMode="cover" />
            </View>
            <View style={styles.mosaicColumnCenter}>
              <Image source={IMAGES.col2_img1} style={styles.mosaicImg4} resizeMode="cover" />
              <Image source={IMAGES.col2_img2} style={styles.mosaicImg5} resizeMode="cover" />
            </View>
            <View style={styles.mosaicColumnRight}>
              <Image source={IMAGES.col3_img1} style={styles.mosaicImg6} resizeMode="cover" />
              <Image source={IMAGES.col3_img2} style={styles.mosaicImg7} resizeMode="cover" />
              <Image source={IMAGES.col3_img3} style={styles.mosaicImg8} resizeMode="cover" />
            </View>
          </View>
          <View style={styles.mosaicOverlay} pointerEvents="none" />
        </View>

        {/* ── Bottom Card ── */}
        <View style={styles.card}>
          <Text style={styles.brandName}>DOLX</Text>
          <Text style={styles.tagline}>Event Hiring Made Simple</Text>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter Your Email"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              editable={!isLoading}
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔑</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter Password"
              placeholderTextColor="#6B7280"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '👁' : '🙈'}</Text>
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <TouchableOpacity
            style={styles.forgotPasswordRow}
            activeOpacity={0.7}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* API Error */}
          {apiError ? <Text style={styles.apiErrorText}>{apiError}</Text> : null}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or register with</Text>
            <View style={styles.orLine} />
          </View>

          {/* Social Icons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Image
                source={require('../../../assets/images/google.png')}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Image
                source={require('../../../assets/images/facebook.png')}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Image
                source={require('../../../assets/images/apple.png')}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpRow}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(auth)/signup')}
            >
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  scrollContent: {
    flexGrow: 1,
  },

  /* ── Mosaic ── */
  mosaicContainer: {
    height: MOSAIC_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#0D0D1A',
  },
  mosaicRotated: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 8,
    transform: [{ rotate: '12deg' }],
    marginTop: -30,
    marginLeft: -30,
    marginRight: -10,
  },
  mosaicColumnLeft: {
    flex: 1,
    gap: 8,
    marginTop: 0,
  },
  mosaicColumnCenter: {
    flex: 1,
    gap: 8,
    marginTop: 40,
  },
  mosaicColumnRight: {
    flex: 1,
    gap: 8,
    marginTop: 15,
  },
  mosaicImg1: { width: '100%', height: 150, borderRadius: 14 },
  mosaicImg2: { width: '100%', height: 120, borderRadius: 14 },
  mosaicImg3: { width: '100%', height: 130, borderRadius: 14 },
  mosaicImg4: { width: '100%', height: 130, borderRadius: 14 },
  mosaicImg5: { width: '100%', height: 150, borderRadius: 14 },
  mosaicImg6: { width: '100%', height: 140, borderRadius: 14 },
  mosaicImg7: { width: '100%', height: 120, borderRadius: 14 },
  mosaicImg8: { width: '100%', height: 130, borderRadius: 14 },
  mosaicOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 13, 26, 0.3)',
  },

  /* ── Card ── */
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandName: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1C2340',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 28,
  },

  /* ── Inputs ── */
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 14,
    width: '100%',
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 2,
  },
  flagEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCodeText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  divider: {
    color: '#D1D5DB',
    fontSize: 20,
    fontWeight: '300',
    marginHorizontal: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  eyeIcon: {
    fontSize: 18,
    paddingLeft: 8,
  },

  /* ── Forgot Password ── */
  forgotPasswordRow: {
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#1C2340',
    fontWeight: '600',
  },

  /* ── Errors ── */
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
    marginLeft: 4,
  },
  apiErrorText: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 4,
  },

  /* ── Button ── */
  loginButton: {
    backgroundColor: '#1C2340',
    borderRadius: 12,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  /* ── Divider ── */
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  /* ── Social ── */
  socialRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Sign Up ── */
  signUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 13,
    color: '#6B7280',
  },
  signUpLink: {
    fontSize: 13,
    color: '#1C2340',
    fontWeight: '600',
  },
});

export default LoginScreen;
