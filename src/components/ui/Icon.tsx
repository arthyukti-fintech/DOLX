import { Ionicons } from '@expo/vector-icons';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors } from '../../theme';
import { DOLX_ICON_DEFAULT_COLOR, DOLX_ICON_XML } from './dolxIconXml';

/**
 * Semantic icon wrapper.
 *
 * Screens ask for `<Icon name="bell" />` rather than naming a glyph directly,
 * so the icon family is swappable in one place and call sites read in the
 * app's own vocabulary.
 *
 * Where the design supplied an icon, that is what renders. The set covers 21
 * of the names below; the rest fall back to Ionicons, which is why the map
 * stays - removing it would leave holes in the UI rather than a near-match.
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

  // ── Supplied by the design set; Ionicons here is only the fallback ──
  home: 'home-outline',
  category: 'grid-outline',
  edit: 'create-outline',
  logout: 'log-out-outline',
  help: 'help-circle-outline',
  personAlt: 'person-circle-outline',

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
  roleDecoration: 'color-palette-outline',
  roleCatering: 'restaurant-outline',
  roleCleaning: 'sparkles-outline',
  roleHostess: 'rose-outline',
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

export function Icon({ name, size = 18, color, style }: IconProps) {
  const xml = DOLX_ICON_XML[name];

  if (xml) {
    // A few icons mean something by their colour - a green up arrow, a red
    // down arrow, a gold star - so an explicit `color` still wins, but leaving
    // it off keeps the design's intent rather than flattening it to body text.
    const tint = color ?? DOLX_ICON_DEFAULT_COLOR[name] ?? colors.text;

    return (
      // SvgXml has no accessibility props of its own; the wrapper carries them.
      // Icons sit beside their own labels, which is what a screen reader reads.
      // Callers only ever pass spacing here, which is valid on both a Text and
      // a View - the cast reconciles the two style types, nothing more.
      <View style={style as StyleProp<ViewStyle>} accessible={false} pointerEvents="none">
        <SvgXml xml={xml.replace(/__C__/g, tint)} width={size} height={size} />
      </View>
    );
  }

  return (
    <Ionicons
      name={GLYPHS[name]}
      size={size}
      color={color ?? colors.text}
      style={style}
      accessible={false}
    />
  );
}

/**
 * True when an icon's colour is part of its meaning - the gold star, the green
 * and red wallet arrows. Callers that tint a whole row use this to leave those
 * alone, so a muted label doesn't turn a rating star grey.
 */
export function hasSemanticColor(name: IconName): boolean {
  return name in DOLX_ICON_DEFAULT_COLOR;
}

/** Maps a JOB_ROLES value to its category icon. */
export function roleIcon(role: string): IconName {
  switch (role) {
    case 'Event Helper':
      return 'roleHelper';
    case 'Setup Crew':
      return 'roleSetup';
    case 'Decoration':
      return 'roleDecoration';
    case 'Catering Staff':
      return 'roleCatering';
    case 'Cleaning Staff':
      return 'roleCleaning';
    case 'Hostess':
      return 'roleHostess';
    case 'Photographer':
      return 'rolePhoto';
    case 'Videographer':
      return 'roleVideo';
    case 'Promoter':
      return 'rolePromoter';
    case 'Registration Staff':
      return 'roleRegistration';
    case 'Host / Anchor':
      return 'roleHost';
    case 'Security':
      return 'roleSecurity';
    case 'Crowd Management':
      return 'roleCrowd';
    default:
      return 'sparkle';
  }
}

export default Icon;
