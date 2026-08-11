import {
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme';

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
      <TouchableOpacity style={composed} onPress={onPress} activeOpacity={0.85}>
        {children}
      </TouchableOpacity>
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
