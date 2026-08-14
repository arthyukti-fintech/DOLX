import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../../theme';
import { Icon, hasSemanticColor, type IconName } from './Icon';
import { Text } from './Text';

/**
 * An icon paired with a line of text - the metadata rows that appear on almost
 * every card (date, location, category, shift time, rating).
 *
 * These used to be emoji inlined into the string ("📅 12 Dec"). Splitting the
 * icon out means it aligns optically with the text baseline, inherits the
 * palette, and stays visually identical across devices.
 */

interface IconLabelProps {
  icon: IconName;
  label: string | number;
  color?: string;
  iconColor?: string;
  size?: number;
  variant?: 'caption' | 'bodySm' | 'body';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
}

export function IconLabel({
  icon,
  label,
  color = colors.textMuted,
  iconColor,
  size = 13,
  variant = 'caption',
  weight = 'regular',
  numberOfLines = 1,
  style,
}: IconLabelProps) {
  return (
    <View style={[styles.row, style]}>
      {/*
        An icon whose colour carries meaning keeps it unless a caller asks
        otherwise - the label may be muted, but a rating star is still gold.
      */}
      <Icon
        name={icon}
        size={size}
        color={iconColor ?? (hasSemanticColor(icon) ? undefined : color)}
      />
      <Text
        variant={variant}
        weight={weight}
        color={color}
        numberOfLines={numberOfLines}
        style={styles.label}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  // Lets the text truncate rather than pushing the icon out of the row.
  label: { flexShrink: 1 },
});

export default IconLabel;
