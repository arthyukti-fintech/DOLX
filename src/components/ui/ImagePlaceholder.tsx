import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { categoryImage } from '../../constants/categoryImages';
import { colors, radius } from '../../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

/**
 * The photography slot used across the app.
 *
 * Where `seed` names a staff category we have a photograph for, this renders
 * that image; everything else falls back to a deterministic brand gradient so
 * the layout keeps its exact footprint rather than showing a hole.
 *
 * Screens already pass the role as `seed`, so photographs appeared without a
 * single call site changing - and when the API starts returning image URLs,
 * this stays the one place that needs to know.
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
  const photo = categoryImage(seed);

  // With a photograph the icon is redundant - the picture already says what
  // the category is - but a label still needs a scrim to stay readable.
  if (photo) {
    return (
      <View style={[styles.base, { borderRadius }, style]}>
        <Image source={photo} style={styles.photo} resizeMode="cover" />
        {label ? (
          <View style={styles.scrim}>
            <Text variant="caption" weight="semibold" color={colors.textOnPrimary} center numberOfLines={2}>
              {label}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

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

  photo: { width: '100%', height: '100%' },
  // Anchored to the bottom so the label sits over the darker part of most
  // photographs rather than across the subject's face.
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 6,
    paddingVertical: 5,
    backgroundColor: 'rgba(1,25,69,0.62)',
  },
});

export default ImagePlaceholder;
