import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Icon, Input, Text } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { colors, radius, spacing } from '../../theme';

const { height: SCREEN_H } = Dimensions.get('window');
const MOSAIC_HEIGHT = SCREEN_H * 0.45;

// Decorative collage behind the sign-in card, matching the Figma hero.
// These are fixed brand imagery rather than API-driven content.
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

/** Digits only, capped at 10 - the length the backend stores. */
const cleanPhone = (raw: string) => raw.replace(/\D/g, '').slice(0, 10);

const LoginScreen: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const requestLoginOtp = useAuthStore((state) => state.requestLoginOtp);

  const handleSendCode = async () => {
    setApiError('');
    setPhoneError('');

    if (phone.length !== 10) {
      setPhoneError('Enter your 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    const error = await requestLoginOtp(phone);
    setIsLoading(false);

    if (error) {
      setApiError(error.message);
      return;
    }

    // The response is deliberately identical for unregistered numbers, so the
    // code screen is where a wrong number surfaces - not here.
    router.push({ pathname: '/(auth)/verify-otp', params: { phone } });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero collage ── */}
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

        {/* ── Sign-in card ── */}
        <View style={styles.card}>
          <Text variant="hero" weight="bold" color={colors.primary} style={styles.brandName}>
            DOLX
          </Text>
          <Text variant="bodySm" color={colors.textMuted} style={styles.tagline}>
            Event Hiring Made Simple
          </Text>

          <Input
            placeholder="Enter Your Mobile Number"
            keyboardType="number-pad"
            autoCapitalize="none"
            textContentType="telephoneNumber"
            maxLength={10}
            value={phone}
            onChangeText={(text) => {
              setPhone(cleanPhone(text));
              if (phoneError) setPhoneError('');
            }}
            editable={!isLoading}
            error={phoneError || undefined}
            icon={
              <Text variant="bodySm" weight="semibold" color={colors.textMuted}>
                +91
              </Text>
            }
            containerStyle={styles.field}
          />

          {apiError ? (
            <Text variant="bodySm" color={colors.danger} center style={styles.apiError}>
              {apiError}
            </Text>
          ) : null}

          <Button
            label="Log In"
            onPress={handleSendCode}
            loading={isLoading}
            style={styles.loginButton}
          />

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text variant="caption" color={colors.textFaint}>
              or register with
            </Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Image
                source={require('../../../assets/images/google.png')}
                style={styles.socialIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Image
                source={require('../../../assets/images/facebook.png')}
                style={styles.socialIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Image
                source={require('../../../assets/images/apple.png')}
                style={styles.socialIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.signUpRow}>
            <Text variant="bodySm" color={colors.textMuted}>
              Don&apos;t have an account?{' '}
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(auth)/signup')}>
              <Text variant="bodySm" weight="semibold" color={colors.secondary}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },
  scrollContent: { flexGrow: 1 },

  /* ── Hero collage ── */
  mosaicContainer: {
    height: MOSAIC_HEIGHT,
    overflow: 'hidden',
    backgroundColor: colors.primary,
  },
  mosaicRotated: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    transform: [{ rotate: '12deg' }],
    marginTop: -30,
    marginLeft: -30,
    marginRight: -10,
  },
  mosaicColumnLeft: { flex: 1, gap: spacing.sm, marginTop: 0 },
  mosaicColumnCenter: { flex: 1, gap: spacing.sm, marginTop: 40 },
  mosaicColumnRight: { flex: 1, gap: spacing.sm, marginTop: 15 },
  mosaicImg1: { width: '100%', height: 150, borderRadius: radius.lg },
  mosaicImg2: { width: '100%', height: 120, borderRadius: radius.lg },
  mosaicImg3: { width: '100%', height: 130, borderRadius: radius.lg },
  mosaicImg4: { width: '100%', height: 130, borderRadius: radius.lg },
  mosaicImg5: { width: '100%', height: 150, borderRadius: radius.lg },
  mosaicImg6: { width: '100%', height: 140, borderRadius: radius.lg },
  mosaicImg7: { width: '100%', height: 120, borderRadius: radius.lg },
  mosaicImg8: { width: '100%', height: 130, borderRadius: radius.lg },
  mosaicOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },

  /* ── Card ── */
  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandName: { letterSpacing: -0.5, marginBottom: spacing.xs },
  tagline: { marginBottom: spacing.xxl + spacing.xs },

  field: { marginBottom: spacing.md },
  inputIcon: { fontSize: 18 },

  forgotPasswordRow: { alignSelf: 'flex-end', marginBottom: spacing.md },
  apiError: { marginBottom: spacing.md },

  loginButton: { marginBottom: spacing.xxl },

  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  orLine: { flex: 1, height: 1, backgroundColor: colors.border },

  socialRow: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.xxl },
  socialButton: {
    width: 52,
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: { width: 22, height: 22 },

  signUpRow: { flexDirection: 'row', alignItems: 'center' },
});

export default LoginScreen;
