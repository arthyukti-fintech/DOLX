import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius } from '../../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

/**
 * Stand-in for the photography in the Figma comps.
 *
 * The API doesn't return image URLs yet, so rather than leaving holes in the
 * layout we fill the exact same footprint with a deterministic brand gradient.
 * When image support lands this component is the single place to swap in a
 * real <Image>, and every screen picks it up.
 */

interface ImagePlaceholderProps {
  /** Drives which gradient is picked, so the same entity keeps the same colour. */
  seed?: string;
  /** Optional icon rendered centred - e.g. the category's icon. */
  icon?: IconName;
  /** Size of the centred icon; scale it up on large tiles. */
  iconSize?: number;
  /** Optional short label under the icon. */
  label?: string;
  rounded?: keyof typeof radius | number;
  style?: StyleProp<ViewStyle>;
}

// Brand-adjacent gradients: navy through to orange, so placeholders read as
// deliberate design rather than missing assets.
const GRADIENTS: [string, string][] = [
  ['#011945', '#123A73'],
  ['#123A73', '#2A5CA8'],
  ['#EE5C17', '#F59356'],
  ['#B8410E', '#EE5C17'],
  ['#1E3A5F', '#3B6FA8'],
  ['#7A2E0B', '#D4581A'],
];

function pickGradient(seed?: string): [string, string] {
  if (!seed) return GRADIENTS[0];
  // Simple deterministic hash - stable across renders and app launches.
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 10007;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

export function ImagePlaceholder({
  seed,
  icon,
  iconSize = 22,
  label,
  rounded = 'md',
  style,
}: ImagePlaceholderProps) {
  const borderRadius = typeof rounded === 'number' ? rounded : radius[rounded];
  const [from, to] = pickGradient(seed);

  return (
    <LinearGradient
      colors={[from, to]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.base, { borderRadius }, style]}
    >
      {icon || label ? (
        <View style={styles.content}>
          {icon ? (
            <Icon name={icon} size={iconSize} color="rgba(255,255,255,0.92)" />
          ) : null}
          {label ? (
            <Text
              variant="caption"
              weight="medium"
              color={colors.textOnPrimary}
              center
              numberOfLines={2}
            >
              {label}
            </Text>
          ) : null}
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: { alignItems: 'center', justifyContent: 'center', gap: 4, padding: 4 },
});

export default ImagePlaceholder;
