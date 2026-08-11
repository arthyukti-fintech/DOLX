import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, ImagePlaceholder, Text } from '../components/ui';
import { useServiceStore } from '../stores/serviceStore';
import { colors, radius, spacing } from '../theme';
import { Service } from '../types';

export default function FavouritesScreen() {
  const favourites = useServiceStore((s) => s.favourites);
  const fetchFavourites = useServiceStore((s) => s.fetchFavourites);
  const toggleFavourite = useServiceStore((s) => s.toggleFavourite);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFavourites().finally(() => setIsLoading(false));
  }, [fetchFavourites]);

  const renderItem = ({ item }: { item: Service }) => (
    <Card style={styles.card} padded={false} onPress={() => router.push(`/services/${item._id}`)}>
      <ImagePlaceholder seed={item.role} glyph="✨" rounded="md" style={styles.thumb} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text variant="body" weight="semibold" numberOfLines={1} style={styles.title}>
            {item.title}
          </Text>
          <TouchableOpacity
            onPress={() => toggleFavourite(item._id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Remove from favourites"
          >
            <Text style={styles.heart}>❤️</Text>
          </TouchableOpacity>
        </View>

        <Text variant="caption" color={colors.textMuted} numberOfLines={2}>
          {item.description ?? item.role}
        </Text>

        <Text variant="caption" color={colors.textFaint} style={styles.meta}>
          ⭐ {item.ratingAvg > 0 ? item.ratingAvg.toFixed(1) : 'New'}
        </Text>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text variant="h2" weight="bold" color={colors.textOnPrimary}>
            Favourites
          </Text>
          <View style={styles.backBtnSpacer} />
        </View>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <Card elevation="flat" style={styles.stateCard}>
            <ActivityIndicator color={colors.primary} />
            <Text variant="bodySm" color={colors.textMuted} center>
              Loading favourites…
            </Text>
          </Card>
        ) : (
          <FlatList
            data={favourites}
            keyExtractor={(s) => s._id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Card elevation="flat" style={styles.stateCard}>
                <Text style={styles.stateGlyph}>🤍</Text>
                <Text variant="body" weight="semibold" center>
                  No favourites yet
                </Text>
                <Text variant="bodySm" color={colors.textMuted} center>
                  Tap the heart on any service to save it here.
                </Text>
                <Button
                  label="Browse Services"
                  onPress={() => router.push('/services')}
                  size="sm"
                  fullWidth={false}
                />
              </Card>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },

  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnSpacer: { width: 36 },
  backArrow: { fontSize: 17, color: colors.textOnPrimary },

  content: { flex: 1, backgroundColor: colors.background },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  thumb: { width: 76, height: 76 },
  body: { flex: 1, gap: 3 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: { flex: 1 },
  heart: { fontSize: 16 },
  meta: { marginTop: spacing.xs },

  stateCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxxl,
    marginTop: spacing.xl,
  },
  stateGlyph: { fontSize: 34 },
});
