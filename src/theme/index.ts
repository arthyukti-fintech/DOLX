/**
 * DOLX design system.
 *
 * Values here come from the client-approved Figma file
 * ("Dolx - Mobile App Design") and the brand spec that accompanied it.
 * Screens should pull from these tokens rather than hard-coding hex/size
 * values so a future brand tweak is a one-file change.
 */

// ─── Palette ───

export const colors = {
  /** Brand navy - headers, primary buttons, section bars. */
  primary: '#011945',
  /** Brand orange - accents, highlights, active states, price/CTA emphasis. */
  secondary: '#EE5C17',

  /** Page background. */
  background: '#FFFFFF',
  /** Light neutral used behind cards/inputs to separate them from the page. */
  surface: '#F7F8FA',
  /** Card background sitting on top of `surface`. */
  card: '#FFFFFF',

  /** Primary reading colour (near-black, matches the Figma text style). */
  text: '#0D0D0D',
  /** Secondary/supporting copy. */
  textMuted: '#6B7280',
  /** Placeholder + disabled copy. */
  textFaint: '#9CA3AF',
  /** Copy that sits on top of the navy/orange fills. */
  textOnPrimary: '#F9F4F4',

  /** Hairline borders on inputs, cards, dividers. */
  border: '#E5E7EB',
  /** Slightly stronger border for focused/selected states. */
  borderStrong: '#C9CDD4',

  // Status colours - used by booking/job/payment state pills.
  success: '#16A34A',
  successBg: '#DCFCE7',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  info: '#2563EB',
  infoBg: '#DBEAFE',

  /** Rating star fill. */
  star: '#F59E0B',
  /** Scrim over hero imagery so white text stays legible. */
  overlay: 'rgba(1, 25, 69, 0.55)',
} as const;

// ─── Typography ───

/**
 * Poppins carries headings and anything with brand personality;
 * Inter handles dense UI copy, labels and numerics.
 * Names match the keys registered in `useAppFonts`.
 */
export const fonts = {
  displayRegular: 'Poppins_400Regular',
  displayMedium: 'Poppins_500Medium',
  displaySemiBold: 'Poppins_600SemiBold',
  displayBold: 'Poppins_700Bold',

  bodyRegular: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

/** Type ramp - `size`/`lineHeight` pairs kept together so vertical rhythm stays consistent. */
export const type = {
  hero: { fontSize: 34, lineHeight: 42 },
  h1: { fontSize: 24, lineHeight: 32 },
  h2: { fontSize: 20, lineHeight: 28 },
  h3: { fontSize: 17, lineHeight: 24 },
  body: { fontSize: 15, lineHeight: 22 },
  bodySm: { fontSize: 13, lineHeight: 19 },
  caption: { fontSize: 11, lineHeight: 16 },
} as const;

// ─── Layout ───

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

/**
 * Cross-platform elevation. RN needs `elevation` on Android and the
 * shadow* family on iOS, so both are set together.
 */
export const shadow = {
  card: {
    shadowColor: '#011945',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  raised: {
    shadowColor: '#011945',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const theme = { colors, fonts, type, spacing, radius, shadow } as const;

export default theme;
