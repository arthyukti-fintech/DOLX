import { useRef, useState } from 'react';
import {
    StyleSheet,
    TextInput,
    View,
    type NativeSyntheticEvent,
    type StyleProp,
    type TextInputKeyPressEventData,
    type ViewStyle,
} from 'react-native';
import { colors, fonts, radius, spacing } from '../../theme';

/**
 * The boxed verification-code entry from the Figma OTP screens.
 *
 * Renders one box per character and keeps them in sync with a single string
 * value, so the parent just deals with `"1234"` rather than per-box state.
 */

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  /** Digits only by default; reset codes may be alphanumeric. */
  alphanumeric?: boolean;
  autoFocus?: boolean;
  hasError?: boolean;
  /** Locked while a code is being checked, so the boxes can't change mid-request. */
  editable?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function OtpInput({
  value,
  onChange,
  length = 4,
  alphanumeric = false,
  autoFocus,
  hasError,
  editable = true,
  style,
}: OtpInputProps) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const chars = Array.from({ length }, (_, i) => value[i] ?? '');

  // Long codes (the emailed reset key) need tighter boxes to fit a phone
  // width; short numeric OTPs get the roomier treatment from the design.
  const compact = length > 6;
  const boxStyle = compact ? styles.boxCompact : styles.boxRoomy;

  const setCharAt = (index: number, char: string) => {
    const next = chars.slice();
    next[index] = char;
    // Trailing empties would otherwise pad the value with undefined slots.
    onChange(next.join('').replace(/\s/g, ''));
  };

  const handleChange = (index: number, raw: string) => {
    const cleaned = alphanumeric
      ? raw.replace(/[^a-zA-Z0-9!@#$%&*]/g, '')
      : raw.replace(/[^0-9]/g, '');

    if (!cleaned) {
      setCharAt(index, '');
      return;
    }

    // Handle paste / autofill of the whole code into one box.
    if (cleaned.length > 1) {
      const merged = (value.slice(0, index) + cleaned).slice(0, length);
      onChange(merged);
      const nextFocus = Math.min(merged.length, length - 1);
      inputs.current[nextFocus]?.focus();
      return;
    }

    setCharAt(index, cleaned);
    if (index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    // Backspace on an empty box should step back rather than sit there.
    if (e.nativeEvent.key === 'Backspace' && !chars[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      setCharAt(index - 1, '');
    }
  };

  return (
    <View style={[styles.row, style]}>
      {chars.map((char, index) => (
        <TextInput
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          style={[
            styles.box,
            boxStyle,
            char ? styles.boxFilled : null,
            focusedIndex === index ? styles.boxFocused : null,
            hasError ? styles.boxError : null,
          ]}
          value={char}
          onChangeText={(t) => handleChange(index, t)}
          onKeyPress={(e) => handleKeyPress(index, e)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          keyboardType={alphanumeric ? 'default' : 'number-pad'}
          autoCapitalize="characters"
          autoCorrect={false}
          // Allows the OS to paste a full code into the first box.
          maxLength={index === 0 ? length : 1}
          autoFocus={autoFocus && index === 0}
          editable={editable}
          textAlign="center"
          selectTextOnFocus
          accessibilityLabel={`Verification code digit ${index + 1}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'center' },
  box: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    fontFamily: fonts.displaySemiBold,
    color: colors.text,
    padding: 0,
  },
  boxRoomy: { maxWidth: 56, height: 56, fontSize: 22 },
  boxCompact: { maxWidth: 34, height: 46, fontSize: 15 },
  boxFilled: { borderColor: colors.primary },
  boxFocused: { borderColor: colors.secondary },
  boxError: { borderColor: colors.danger },
});

export default OtpInput;
