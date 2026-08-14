import { Ionicons } from '@expo/vector-icons';
import type { StyleProp, TextStyle } from 'react-native';
import { colors } from '../../theme';

/**
 * Semantic icon wrapper.
 *
 * Screens ask for `<Icon name="bell" />` rather than naming an Ionicons glyph
 * directly, so the icon family is swappable in one place and call sites read
 * in the app's own vocabulary. This replaced emoji used as UI icons - emoji
 * render differently per device, can't be tinted to the palette, and sit on
 * inconsistent baselines.
 */

const GLYPHS = {
  // ── Navigation & chrome ──
  back: 'arrow-back',
  forward: 'arrow-forward',
  close: 'close',
  chevronRight: 'chevron-forward',
  chevronDown: 'chevron-down',
  search: 'search',
  bell: 'notifications-outline',
  filter: 'options-outline',

  // ── Entities ──
  calendar: 'calendar-outline',
  clock: 'time-outline',
  location: 'location-outline',
  tag: 'pricetag-outline',
  briefcase: 'briefcase-outline',
  document: 'document-text-outline',
  people: 'people-outline',
  person: 'person-outline',
  building: 'business-outline',

  // ── Actions & state ──
  heart: 'heart',
  heartOutline: 'heart-outline',
  star: 'star',
  starOutline: 'star-outline',
  check: 'checkmark-circle',
  warning: 'warning-outline',
  hourglass: 'hourglass-outline',
  lock: 'lock-closed-outline',
  sparkle: 'sparkles-outline',
  scale: 'git-compare-outline',
  megaphone: 'megaphone-outline',

  // ── Money ──
  wallet: 'wallet-outline',
  cash: 'cash-outline',
  arrowIn: 'arrow-down',
  arrowOut: 'arrow-up',

  // ── Auth form fields ──
  mail: 'mail-outline',
  phone: 'phone-portrait-outline',
  key: 'key-outline',

  // ── Job roles (category tiles) ──
  roleHelper: 'hand-left-outline',
  roleSetup: 'construct-outline',
  roleCatering: 'restaurant-outline',
  rolePhoto: 'camera-outline',
  roleVideo: 'videocam-outline',
  rolePromoter: 'megaphone-outline',
  roleRegistration: 'clipboard-outline',
  roleHost: 'mic-outline',
  roleSecurity: 'shield-checkmark-outline',
  roleCrowd: 'people-circle-outline',
} as const;

export type IconName = keyof typeof GLYPHS;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function Icon({ name, size = 18, color = colors.text, style }: IconProps) {
  return (
    <Ionicons
      name={GLYPHS[name]}
      size={size}
      color={color}
      style={style}
      // Icons are decorative next to their own labels; the label carries the
      // meaning for screen readers.
      accessible={false}
    />
  );
}

/** Maps a JOB_ROLES value to its category icon. */
export function roleIcon(role: string): IconName {
  switch (role) {
    case 'Event Helper':
      return 'roleHelper';
    case 'Setup / Decoration Crew':
      return 'roleSetup';
    case 'Catering Staff':
      return 'roleCatering';
    case 'Photographer':
      return 'rolePhoto';
    case 'Videographer':
      return 'roleVideo';
    case 'Brand Promoter':
      return 'rolePromoter';
    case 'Registration Staff':
      return 'roleRegistration';
    case 'Host / Anchor':
      return 'roleHost';
    case 'Security Staff':
      return 'roleSecurity';
    case 'Crowd Management':
      return 'roleCrowd';
    default:
      return 'sparkle';
  }
}

export default Icon;
