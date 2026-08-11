import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, radius, spacing } from '../../theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  /** Stretches to the container width - the default for form/CTA buttons in the design. */
  fullWidth?: boolean;
  /** Optional leading element (icon/emoji) rendered before the label. */
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const HEIGHTS: Record<Size, number> = { sm: 38, md: 46, lg: 54 };

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled,
  loading,
  fullWidth = true,
  icon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const container: ViewStyle[] = [
    styles.base,
    { height: HEIGHTS[size] },
    VARIANT_CONTAINER[variant],
    fullWidth ? styles.fullWidth : styles.auto,
    isDisabled ? styles.disabled : null,
  ].filter(Boolean) as ViewStyle[];

  return (
    <TouchableOpacity
      style={[container, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={VARIANT_LABEL[variant]} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text
            style={[styles.label, { color: VARIANT_LABEL[variant] }]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const VARIANT_CONTAINER: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: { backgroundColor: 'transparent' },
};

const VARIANT_LABEL: Record<Variant, string> = {
  primary: colors.textOnPrimary,
  secondary: colors.textOnPrimary,
  outline: colors.primary,
  ghost: colors.primary,
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  fullWidth: { alignSelf: 'stretch' },
  auto: { alignSelf: 'flex-start' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { alignItems: 'center', justifyContent: 'center' },
  label: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  disabled: { opacity: 0.5 },
});

export default Button;
