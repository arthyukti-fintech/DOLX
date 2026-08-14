import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Banknote,
  Bell,
  Briefcase,
  Brush,
  Building2,
  Calendar,
  Camera,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  CircleUser,
  ClipboardList,
  Clock,
  ConciergeBell,
  FileText,
  HandHelping,
  Heart,
  House,
  Hourglass,
  Key,
  LayoutGrid,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Mic,
  PartyPopper,
  Phone,
  Scale,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SquarePen,
  Star,
  Tag,
  TriangleAlert,
  User,
  Users,
  UsersRound,
  UtensilsCrossed,
  Video,
  Wallet,
  Wrench,
  X,
} from 'lucide-react-native';
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
 * of the names below; Lucide covers the remaining 33.
 *
 * Lucide replaced Ionicons for that fallback because it is stroke-based with
 * rounded caps on a uniform grid - the same construction as the supplied set -
 * whereas Ionicons read visibly thinner and rounder sitting next to them.
 */

const GLYPHS = {
  // ── Navigation & chrome ──
  back: ArrowLeft,
  forward: ArrowRight,
  close: X,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  search: Search,
  bell: Bell,
  filter: SlidersHorizontal,

  // ── Also supplied by the design set; these entries are the fallback only ──
  home: House,
  category: LayoutGrid,
  edit: SquarePen,
  logout: LogOut,
  help: CircleHelp,
  personAlt: CircleUser,

  // ── Entities ──
  calendar: Calendar,
  clock: Clock,
  location: MapPin,
  tag: Tag,
  briefcase: Briefcase,
  document: FileText,
  people: Users,
  person: User,
  building: Building2,

  // ── Actions & state ──
  heart: Heart,
  heartOutline: Heart,
  star: Star,
  starOutline: Star,
  check: CircleCheck,
  warning: TriangleAlert,
  hourglass: Hourglass,
  lock: Lock,
  sparkle: Sparkles,
  scale: Scale,
  megaphone: Megaphone,

  // ── Money ──
  wallet: Wallet,
  cash: Banknote,
  arrowIn: ArrowDown,
  arrowOut: ArrowUp,

  // ── Auth form fields ──
  mail: Mail,
  phone: Phone,
  key: Key,

  // ── Job roles (category tiles) ──
  roleHelper: HandHelping,
  roleSetup: Wrench,
  roleDecoration: PartyPopper,
  roleCatering: UtensilsCrossed,
  roleCleaning: Brush,
  roleHostess: ConciergeBell,
  rolePhoto: Camera,
  roleVideo: Video,
  rolePromoter: Megaphone,
  roleRegistration: ClipboardList,
  roleHost: Mic,
  roleSecurity: ShieldCheck,
  roleCrowd: UsersRound,
} as const;

export type IconName = keyof typeof GLYPHS;

/**
 * Lucide draws on a 24px grid at 2px; the design's icons sit on 20px at ~1.5.
 * Scaling that ratio lands at 1.8, which matches their weight optically rather
 * than arithmetically - a thinner line reads lighter at small sizes.
 */
const LUCIDE_STROKE = 1.8;

/**
 * Names the design draws filled rather than outlined.
 *
 * Deliberately excludes `check`: it maps to a circled tick, and filling that
 * paints the disc solid so the tick disappears into it.
 */
const FILLED = new Set<IconName>(['heart', 'star']);

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

  // Lucide covers the names the design set doesn't. It is stroke-based with
  // rounded caps on a uniform grid, which sits far closer to the supplied icons
  // than Ionicons did - those read visibly thinner and rounder beside them.
  const Glyph = GLYPHS[name];

  return (
    <View style={style as StyleProp<ViewStyle>} accessible={false} pointerEvents="none">
      <Glyph
        size={size}
        color={color ?? colors.text}
        // Matches the weight of the supplied icons once scaled off Lucide's
        // 24px grid onto the 20px one the design uses.
        strokeWidth={LUCIDE_STROKE}
        // Filled variants in the design set: outline-only would lose the
        // distinction between a saved and unsaved favourite.
        fill={FILLED.has(name) ? (color ?? colors.text) : 'none'}
      />
    </View>
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
