import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, ImagePlaceholder, Text } from '../../components/ui';
import { useServiceStore } from '../../stores/serviceStore';
import { colors, radius, spacing } from '../../theme';

/**
 * Figma's "Category Screen".
 *
 * Note there is no price here: the catalog describes what can be hired, and
 * the organizer names the rate on the job-post form that "Book Now" opens.
 */
export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const service = useServiceStore((s) => s.currentService);
  const isLoading = useServiceStore((s) => s.isLoading);
  const error = useServiceStore((s) => s.error);
  const fetchServiceById = useServiceStore((s) => s.fetchServiceById);
  const fetchFavourites = useServiceStore((s) => s.fetchFavourites);
  const isFavourite = useServiceStore((s) => s.isFavourite);
  const toggleFavourite = useServiceStore((s) => s.toggleFavourite);

  useEffect(() => {
    if (id) fetchServiceById(id);
    fetchFavourites();
  }, [id, fetchServiceById, fetchFavourites]);

  const saved = service ? isFavourite(service._id) : false;

  const handleBookNow = () => {
    if (!service) return;
    // Hands off to the normal job-post flow with the role pre-selected - the
    // organizer sets the amount, workers apply, and the existing
    // accept -> complete -> payout chain takes over from there.
    router.push({
      pathname: '/(organizer)/create-event',
      params: { presetRole: service.role, serviceTitle: service.title },
    });
  };

  if (isLoading && !service) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="bodySm" color={colors.textMuted}>
            Loading service…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !service) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.centered}>
          <Text style={styles.stateGlyph}>⚠️</Text>
          <Text variant="bodySm" color={colors.textMuted} center>
            {error ?? 'Service not found'}
          </Text>
          <Button label="Go Back" onPress={() => router.back()} size="sm" fullWidth={false} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Hero ── */}
        <View style={styles.hero}>
          {/* Square hero - the card below overlaps it with its own radius. */}
          <ImagePlaceholder seed={service.role} glyph="✨" rounded={0} style={styles.heroImg} />

          <SafeAreaView style={styles.heroOverlay} edges={['top']}>
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.circleGlyph}>←</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.circleBtn}
              onPress={() => toggleFavourite(service._id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={saved ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Text style={styles.circleGlyph}>{saved ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* ── Detail card ── */}
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text variant="h1" weight="bold" style={styles.title}>
              {service.title}
            </Text>
            {service.isFeatured ? (
              <View style={styles.featuredTag}>
                <Text variant="caption" weight="semibold" color={colors.secondary}>
                  Featured
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <Text variant="bodySm" color={colors.textMuted}>
              ⭐ {service.ratingAvg > 0 ? service.ratingAvg.toFixed(1) : 'New'}
              {service.ratingCount > 0 ? ` (${service.ratingCount})` : ''}
            </Text>
            <Text variant="bodySm" color={colors.textFaint}>
              •
            </Text>
            <Text variant="bodySm" color={colors.textMuted}>
              {service.role}
            </Text>
          </View>

          {service.description ? (
            <Text variant="body" color={colors.textMuted} style={styles.description}>
              {service.description}
            </Text>
          ) : null}

          {/* Pricing is set per job, not per catalog entry - say so plainly
              rather than showing a number that isn't real. */}
          <Card elevation="flat" style={styles.priceCard}>
            <Text variant="caption" color={colors.textFaint}>
              PRICING
            </Text>
            <Text variant="body" weight="semibold" style={styles.priceLine}>
              You set the rate
            </Text>
            <Text variant="bodySm" color={colors.textMuted}>
              Post this role with the amount you&apos;re offering. Workers apply, you pick who to
              hire, and payment is released 24 hours after you confirm the work is done.
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* ── Sticky CTA ── */}
      <View style={styles.footer}>
        <Button label="Book Now" onPress={handleBookNow} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xxxl },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxxl,
  },
  stateGlyph: { fontSize: 40 },

  /* ── Hero ── */
  hero: { height: 280 },
  heroImg: { width: '100%', height: 280 },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(1,25,69,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  circleGlyph: { fontSize: 17, color: colors.textOnPrimary },

  /* ── Card ── */
  card: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: { flex: 1 },
  featuredTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  description: { marginTop: spacing.lg, lineHeight: 22 },

  priceCard: { marginTop: spacing.xl, gap: 2 },
  priceLine: { marginBottom: spacing.xs },

  /* ── Footer ── */
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
