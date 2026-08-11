import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import { Text } from './Text';

/**
 * The coloured state chip used on booking, job, application and payment
 * cards throughout the design (Confirmed / Pending / Completed / …).
 *
 * Accepts the raw status strings the API returns so callers don't each
 * have to map them.
 */

interface StatusPillProps {
  status: string;
  style?: StyleProp<ViewStyle>;
}

type Tone = { bg: string; fg: string };

const TONES: Record<string, Tone> = {
  // Positive / active
  active: { bg: colors.successBg, fg: colors.success },
  open: { bg: colors.successBg, fg: colors.success },
  accepted: { bg: colors.successBg, fg: colors.success },
  confirmed: { bg: colors.successBg, fg: colors.success },
  released: { bg: colors.successBg, fg: colors.success },
  resolved: { bg: colors.successBg, fg: colors.success },

  // Awaiting action
  pending: { bg: colors.warningBg, fg: colors.warning },
  draft: { bg: colors.warningBg, fg: colors.warning },
  held: { bg: colors.warningBg, fg: colors.warning },
  in_review: { bg: colors.warningBg, fg: colors.warning },
  assigned: { bg: colors.infoBg, fg: colors.info },

  // Terminal - neutral
  completed: { bg: colors.infoBg, fg: colors.info },
  closed: { bg: colors.surface, fg: colors.textMuted },
  refunded: { bg: colors.surface, fg: colors.textMuted },

  // Terminal - negative
  cancelled: { bg: colors.dangerBg, fg: colors.danger },
  rejected: { bg: colors.dangerBg, fg: colors.danger },
  failed: { bg: colors.dangerBg, fg: colors.danger },
};

const FALLBACK: Tone = { bg: colors.surface, fg: colors.textMuted };

function toLabel(status: string): string {
  const spaced = status.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function StatusPill({ status, style }: StatusPillProps) {
  const tone = TONES[status?.toLowerCase()] ?? FALLBACK;

  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: tone.fg }]} />
      <Text variant="caption" weight="semibold" color={tone.fg}>
        {toLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});

export default StatusPill;
