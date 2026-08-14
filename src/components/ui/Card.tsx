import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, radius, shadow, spacing } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  /** `flat` sits on a tinted background; `raised` lifts off a white page. */
  elevation?: 'flat' | 'card' | 'raised';
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  children,
  onPress,
  elevation = 'card',
  padded = true,
  style,
}: CardProps) {
  // Tappable cards dip slightly under the finger. A spring rather than a
  // timing curve so the release feels physical instead of mechanical.
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const composed = [
    styles.base,
    padded && styles.padded,
    elevation === 'card' && shadow.card,
    elevation === 'raised' && shadow.raised,
    elevation === 'flat' && styles.flat,
    style,
  ];

  if (onPress) {
    return (
      <AnimatedPressable
        style={[composed, animatedStyle]}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 320 });
        }}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={composed}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
  },
  padded: { padding: spacing.lg },
  flat: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default Card;
