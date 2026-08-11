import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, radius, spacing, type } from '../../theme';
import { Text } from './Text';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  /** Leading glyph shown inside the field, as in the Figma auth screens. */
  icon?: React.ReactNode;
  /** Renders the show/hide affordance and masks input by default. */
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({
  label,
  error,
  icon,
  isPassword,
  containerStyle,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text variant="bodySm" weight="medium" color={colors.text} style={styles.label}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          error ? styles.fieldError : null,
        ]}
      >
        {icon ? <View style={styles.icon}>{icon}</View> : null}

        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textFaint}
          secureTextEntry={isPassword ? hidden : false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setHidden((v) => !v)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Text variant="bodySm" color={colors.textMuted}>
              {hidden ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text variant="caption" color={colors.danger} style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignSelf: 'stretch' },
  label: { marginBottom: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  fieldFocused: { borderColor: colors.primary },
  fieldError: { borderColor: colors.danger },
  icon: { alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    fontFamily: fonts.bodyRegular,
    fontSize: type.body.fontSize,
    color: colors.text,
    // RN pads text inputs unevenly across platforms; zeroing it keeps the
    // text optically centred against the fixed 52pt field height.
    paddingVertical: 0,
  },
  error: { marginTop: spacing.xs },
});

export default Input;
