import { Dimensions, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts } from '../../theme';

/**
 * The oversized DOLX wordmark that closes a scrolling screen in the design.
 *
 * It is set as a fraction of the screen width rather than a fixed point size,
 * because the design has it spanning almost the full content width - pinning it
 * to a number would leave it undersized on a tablet and clipped on a small
 * handset.
 *
 * Decorative only: hidden from screen readers, since "DOLX" read aloud at the
 * end of every screen is noise.
 */

const { width: SCREEN_W } = Dimensions.get('window');

// Tuned against the design: the wordmark occupies roughly 80% of the content
// width, which for four glyphs lands near a fifth of the screen per character.
const FONT_SIZE = Math.round(SCREEN_W * 0.2);

export function BrandWatermark({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.wrap, style]} pointerEvents="none" accessibilityElementsHidden>
      <Text style={styles.mark} numberOfLines={1} allowFontScaling={false}>
        DOLX
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  mark: {
    fontFamily: fonts.displayBold,
    fontSize: FONT_SIZE,
    lineHeight: Math.round(FONT_SIZE * 1.15),
    letterSpacing: Math.round(FONT_SIZE * 0.06),
    color: colors.border,
    // letterSpacing adds trailing space after the last glyph; nudge back so the
    // wordmark reads as optically centred.
    marginLeft: Math.round(FONT_SIZE * 0.06),
  },
});

export default BrandWatermark;
