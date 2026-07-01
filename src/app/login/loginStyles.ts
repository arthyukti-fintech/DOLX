import { Dimensions, StyleSheet } from 'react-native';

const { height: SCREEN_H } = Dimensions.get('window');

const MOSAIC_HEIGHT = SCREEN_H * 0.6;

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
    backgroundColor: '#fff',
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
  mosaicImg4: { width: '100%', height: 110, borderRadius: 14 },
  mosaicImg5: { width: '100%', height: 130, borderRadius: 14 },
  mosaicImg6: { width: '100%', height: 150, borderRadius: 14 },
  mosaicImg7: { width: '100%', height: 130, borderRadius: 14 },
  mosaicImg8: { width: '100%', height: 140, borderRadius: 14 },
  mosaicImg9: { width: '100%', height: 120, borderRadius: 14 },
  mosaicImg10: { width: '100%', height: 130, borderRadius: 14 },
  mosaicImg11: { width: '100%', height: 120, borderRadius: 14 },
  mosaicOverlay: {
    ...StyleSheet.absoluteFill,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 14,
    width: '100%',
    marginBottom: 16,
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
  loginButton: {
    backgroundColor: '#1C2340',
    borderRadius: 12,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
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

export default styles;