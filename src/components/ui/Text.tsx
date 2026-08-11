import type { ReactNode } from 'react';
import { StyleSheet, Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { colors, fonts, type } from '../../theme';

type Variant = 'hero' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySm' | 'caption';
type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

interface TextProps extends RNTextProps {
  variant?: Variant;
  weight?: Weight;
  /** Any palette colour, or a raw hex when a one-off is genuinely needed. */
  color?: string;
  center?: boolean;
  children?: ReactNode;
}

/**
 * Headings use Poppins, everything else uses Inter - matching the Figma
 * type spec. Using this instead of RN's Text keeps that split automatic.
 */
const DISPLAY_VARIANTS: Variant[] = ['hero', 'h1', 'h2', 'h3'];

const DISPLAY_WEIGHTS: Record<Weight, string> = {
  regular: fonts.displayRegular,
  medium: fonts.displayMedium,
  semibold: fonts.displaySemiBold,
  bold: fonts.displayBold,
};

const BODY_WEIGHTS: Record<Weight, string> = {
  regular: fonts.bodyRegular,
  medium: fonts.bodyMedium,
  semibold: fonts.bodySemiBold,
  bold: fonts.bodyBold,
};

export function Text({
  variant = 'body',
  weight,
  color = colors.text,
  center,
  style,
  children,
  ...rest
}: TextProps) {
  const isDisplay = DISPLAY_VARIANTS.includes(variant);
  // Headings read as headings by default; body copy stays regular.
  const resolvedWeight: Weight = weight ?? (isDisplay ? 'semibold' : 'regular');
  const family = isDisplay ? DISPLAY_WEIGHTS[resolvedWeight] : BODY_WEIGHTS[resolvedWeight];

  const composed: TextStyle = {
    ...type[variant],
    fontFamily: family,
    color,
    ...(center ? styles.center : null),
  };

  return (
    <RNText style={[composed, style]} {...rest}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});

export default Text;
