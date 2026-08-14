import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { colors, radius, spacing } from '../../theme';

/**
 * Shimmering placeholder blocks shown while content loads.
 *
 * A skeleton that mirrors the shape of what's coming reads as faster and more
 * finished than a spinner at identical load times, because the layout stops
 * jumping when data lands.
 */

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  rounded?: keyof typeof radius | number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height = 14, rounded = 'sm', style }: SkeletonProps) {
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      -1, // forever
      true // reverse, so it breathes rather than snapping back
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  const borderRadius = typeof rounded === 'number' ? rounded : radius[rounded];

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: colors.surface }, animatedStyle, style]}
    />
  );
}

/** A list row placeholder: thumbnail plus two lines of text. */
export function SkeletonCard({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton width={68} height={68} rounded="md" />
      <View style={styles.body}>
        <Skeleton width="70%" height={14} />
        <Skeleton width="45%" height={11} />
        <Skeleton width="30%" height={11} />
      </View>
    </View>
  );
}

/** Repeats SkeletonCard to stand in for a list that hasn't loaded. */
export function SkeletonList({ count = 4, style }: { count?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

/**
 * Placeholder for a single-record screen: a hero banner, a title block, then a
 * couple of detail cards. Mirrors the shape shared by the job, event, service
 * and profile detail screens.
 */
export function SkeletonDetail({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.detail, style]}>
      <Skeleton height={150} rounded="lg" />

      <View style={styles.detailBlock}>
        <Skeleton width="65%" height={20} />
        <Skeleton width="40%" height={13} />
      </View>

      {[0, 1].map((i) => (
        <View key={i} style={styles.detailCard}>
          <Skeleton width="35%" height={13} />
          <Skeleton width="100%" height={11} />
          <Skeleton width="80%" height={11} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  body: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  list: { paddingTop: spacing.lg },

  detail: { padding: spacing.xl, gap: spacing.lg },
  detailBlock: { gap: spacing.sm },
  detailCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default Skeleton;
