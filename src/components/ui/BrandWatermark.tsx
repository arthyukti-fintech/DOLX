import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fonts } from '../../theme';

/**
 * The oversized DOLX wordmark that closes a scrolling screen in the design.
 *
 * Sized from the width it is actually given rather than from the screen: the
 * two home screens pad their content differently, and deriving it from
 * `Dimensions` overflowed the narrower one, ellipsizing the mark to "DO…".
 *
 * Decorative only: hidden from screen readers, since "DOLX" read aloud at the
 * end of every screen is noise.
 */

/** Share of the available width the four glyphs should occupy. */
const WIDTH_RATIO = 0.78;

/** "DOLX" is four caps; this is roughly their advance width per point of size. */
const GLYPH_ADVANCE = 2.9;

export function BrandWatermark({ style }: { style?: StyleProp<ViewStyle> }) {
  const [fontSize, setFontSize] = useState(0);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0) setFontSize((width * WIDTH_RATIO) / GLYPH_ADVANCE);
  };

  return (
    <View
      style={[styles.wrap, style]}
      onLayout={handleLayout}
      pointerEvents="none"
      accessibilityElementsHidden
    >
      {/* Nothing to draw until the first layout pass reports a width. */}
      {fontSize > 0 ? (
        <Text
          style={[
            styles.mark,
            {
              fontSize,
              lineHeight: fontSize * 1.15,
              letterSpacing: fontSize * 0.05,
              // letterSpacing adds trailing space after the last glyph; nudge
              // back so the wordmark reads as optically centred.
              marginLeft: fontSize * 0.05,
            },
          ]}
          numberOfLines={1}
          // Clip rather than ellipsize - a truncated brand mark reading "DO…"
          // is worse than one that simply sits a fraction wide.
          ellipsizeMode="clip"
          allowFontScaling={false}
        >
          DOLX
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  mark: { fontFamily: fonts.displayBold, color: colors.border },
});

export default BrandWatermark;
