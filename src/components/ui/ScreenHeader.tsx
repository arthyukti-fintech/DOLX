import { router } from 'expo-router';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../../theme';
import { Icon } from './Icon';
import { Text } from './Text';

/**
 * The circular back button + optional title/action row that sits at the top
 * of the inner screens in the design (OTP, Edit Profile, Category, …).
 */

interface ScreenHeaderProps {
  title?: string;
  /** Hidden on roots that can't go back. */
  showBack?: boolean;
  onBack?: () => void;
  /** Right-aligned slot - e.g. an "Edit" action. */
  action?: React.ReactNode;
  /** Use on navy backgrounds so the control stays visible. */
  onDark?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ScreenHeader({
  title,
  showBack = true,
  onBack,
  action,
  onDark,
  style,
}: ScreenHeaderProps) {
  const tint = onDark ? colors.textOnPrimary : colors.text;

  return (
    <View style={[styles.row, style]}>
      {showBack ? (
        <TouchableOpacity
          onPress={onBack ?? (() => router.back())}
          style={[styles.back, onDark && styles.backOnDark]}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="back" size={19} color={tint} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      {title ? (
        <Text variant="h3" weight="semibold" color={tint} numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      ) : (
        <View style={styles.flex} />
      )}

      {/* Keeps the title optically centred when there's no right-hand action. */}
      {action ?? <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backOnDark: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: { flex: 1, textAlign: 'center' },
  flex: { flex: 1 },
  spacer: { width: 40 },
});

export default ScreenHeader;
