import Animated, { FadeInDown } from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';

/**
 * Staggered entrance for list rows.
 *
 * Rows fade up in sequence rather than all appearing at once, which gives the
 * eye an order to read them in and makes the transition out of the skeleton
 * feel deliberate instead of abrupt.
 */

/** Gap between consecutive rows, in ms. */
const STAGGER_MS = 45;

/**
 * Rows past this point start together. Without a cap, a long list would make
 * the last rows wait seconds before appearing - and in a virtualized list the
 * row that mounts at index 60 is on screen *now*, so it must not be delayed.
 */
const MAX_STAGGERED = 8;

interface FadeInItemProps {
  /** Position in the list; drives the stagger. */
  index?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function FadeInItem({ index = 0, children, style }: FadeInItemProps) {
  const delay = Math.min(index, MAX_STAGGERED) * STAGGER_MS;

  return (
    <Animated.View style={style} entering={FadeInDown.duration(260).delay(delay)}>
      {children}
    </Animated.View>
  );
}

export default FadeInItem;
