import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

/**
 * "How Will You Use DOLX?" - the role split screen from the Figma flow.
 *
 * Reached when an authenticated account has no usable role yet, and from
 * signup so a new user picks their side of the marketplace up front.
 */

type Role = 'organizer' | 'worker';

const OPTIONS: { role: Role; glyph: string; title: string; blurb: string }[] = [
  {
    role: 'organizer',
    glyph: '🎪',
    title: 'Event Organiser',
    blurb: 'Post events and hire verified staff on demand.',
  },
  {
    role: 'worker',
    glyph: '🙋',
    title: 'Worker',
    blurb: 'Find gigs near you and get paid after every job.',
  },
];

// Decorative hero collage, mirroring the Figma split screen.
const HERO = [
  { uri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=250&fit=crop' },
  { uri: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=200&h=180&fit=crop' },
  { uri: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=190&fit=crop' },
  { uri: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=180&fit=crop' },
  { uri: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&h=200&fit=crop' },
  { uri: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=200&fit=crop' },
];

export default function RoleSelectionScreen() {
  const user = useAuthStore((state) => state.user);
  const [selected, setSelected] = useState<Role | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    // The account's role is set at registration, so this screen routes rather
    // than mutates - an existing account with a mismatched role needs support.
    router.replace(selected === 'organizer' ? '/(organizer)/home' : '/(worker)/home');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.heroGrid}>
            {HERO.map((src, i) => (
              <Image key={i} source={src} style={styles.heroTile} resizeMode="cover" />
            ))}
          </View>
          <View style={styles.heroScrim} pointerEvents="none" />
        </View>

        {/* ── Choice card ── */}
        <View style={styles.card}>
          <Text variant="h1" weight="bold" center>
            How Will You Use DOLX?
          </Text>
          <Text variant="bodySm" color={colors.textMuted} center style={styles.subtitle}>
            {user?.name ? `Hi ${user.name}, choose ` : 'Choose '}
            how you&apos;d like to get started.
          </Text>

          {OPTIONS.map((option) => {
            const isActive = selected === option.role;
            return (
              <TouchableOpacity
                key={option.role}
                style={[styles.option, isActive && styles.optionActive]}
                activeOpacity={0.85}
                onPress={() => setSelected(option.role)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
              >
                <View style={[styles.optionIcon, isActive && styles.optionIconActive]}>
                  <Text style={styles.optionGlyph}>{option.glyph}</Text>
                </View>

                <View style={styles.optionBody}>
                  <Text variant="body" weight="semibold">
                    {option.title}
                  </Text>
                  <Text variant="bodySm" color={colors.textMuted}>
                    {option.blurb}
                  </Text>
                </View>

                <View style={[styles.radio, isActive && styles.radioActive]}>
                  {isActive ? <View style={styles.radioDot} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}

          <Button
            label="Continue"
            onPress={handleContinue}
            disabled={!selected}
            style={styles.cta}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  scroll: { flexGrow: 1 },

  /* ── Hero ── */
  hero: { height: 260, overflow: 'hidden', backgroundColor: colors.primary },
  heroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.sm,
    transform: [{ rotate: '-8deg' }, { scale: 1.25 }],
  },
  heroTile: { width: '31%', height: 120, borderRadius: radius.md },
  heroScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },

  /* ── Card ── */
  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: 40,
  },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing.xxl },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.md,
  },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.surface },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconActive: { backgroundColor: colors.primary },
  optionGlyph: { fontSize: 22 },
  optionBody: { flex: 1, gap: 2 },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.secondary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
  },

  cta: { marginTop: spacing.lg },
});
