import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    FlatList,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Icon, IconLabel, ImagePlaceholder, SkeletonList, Text, roleIcon } from '../../components/ui';
import { useDebounce } from '../../hooks/useDebounce';
import { useServiceStore } from '../../stores/serviceStore';
import { colors, fonts, radius, spacing, type as typeScale } from '../../theme';
import { JobRole, Service } from '../../types';
import { JOB_ROLES } from '../../constants/roles';

const ROLE_FILTERS: (JobRole | 'All')[] = ['All', ...JOB_ROLES];

export default function ServiceCatalogScreen() {
  const services = useServiceStore((s) => s.services);
  const isLoading = useServiceStore((s) => s.isLoading);
  const error = useServiceStore((s) => s.error);
  const fetchServices = useServiceStore((s) => s.fetchServices);
  const setFilter = useServiceStore((s) => s.setFilter);
  const fetchFavourites = useServiceStore((s) => s.fetchFavourites);
  const isFavourite = useServiceStore((s) => s.isFavourite);
  const toggleFavourite = useServiceStore((s) => s.toggleFavourite);
  const favourites = useServiceStore((s) => s.favourites);

  const [role, setRole] = useState<JobRole | 'All'>('All');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  useEffect(() => {
    setFilter('role', role === 'All' ? undefined : role);
    setFilter('q', debouncedSearch.trim() || undefined);
    fetchServices();
  }, [role, debouncedSearch, setFilter, fetchServices]);

  const renderService = ({ item }: { item: Service }) => {
    const saved = isFavourite(item._id);

    return (
      <Card
        style={styles.card}
        padded={false}
        onPress={() => router.push(`/services/${item._id}`)}
      >
        <ImagePlaceholder seed={item.role} icon={roleIcon(item.role)} rounded="md" style={styles.thumb} />

        <View style={styles.body}>
          <View style={styles.topRow}>
            <Text variant="body" weight="semibold" numberOfLines={1} style={styles.title}>
              {item.title}
            </Text>
            <TouchableOpacity
              onPress={() => toggleFavourite(item._id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={saved ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Icon name={saved ? 'heart' : 'heartOutline'} size={18} color={saved ? colors.secondary : colors.textFaint} />
            </TouchableOpacity>
          </View>

          <Text variant="caption" color={colors.textMuted} numberOfLines={2}>
            {item.description ?? item.role}
          </Text>

          <View style={styles.metaRow}>
            <IconLabel icon="star" label={item.ratingAvg > 0 ? item.ratingAvg.toFixed(1) : 'New'} color={colors.textFaint} variant="caption" />
            {item.isFeatured ? (
              <View style={styles.featuredTag}>
                <Text variant="caption" weight="medium" color={colors.secondary}>
                  Featured
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Card>
    );
  };

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
            <Icon name="back" size={18} color={colors.textOnPrimary} />
          </TouchableOpacity>
          <Text variant="h2" weight="bold" color={colors.textOnPrimary}>
            All Categories
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push('/favourites')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Favourites"
          >
            <Icon name="heartOutline" size={18} color={colors.textOnPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.search}>
          <Icon name="search" size={16} color={colors.textFaint} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services…"
            placeholderTextColor={colors.textFaint}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.body2}>
        <FlatList
          horizontal
          data={ROLE_FILTERS}
          keyExtractor={(r) => r}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipStrip}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, role === item && styles.chipActive]}
              onPress={() => setRole(item)}
              activeOpacity={0.7}
            >
              <Text
                variant="caption"
                weight={role === item ? 'semibold' : 'regular'}
                color={role === item ? colors.textOnPrimary : colors.textMuted}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        {isLoading && services.length === 0 ? (
          <SkeletonList />
        ) : error ? (
          <Card elevation="flat" style={styles.stateCard}>
            <Icon name="warning" size={34} color={colors.textFaint} />
            <Text variant="bodySm" color={colors.textMuted} center>
              {error}
            </Text>
            <Button label="Retry" onPress={fetchServices} size="sm" fullWidth={false} />
          </Card>
        ) : (
          <FlatList
            data={services}
            keyExtractor={(s) => s._id}
            renderItem={renderService}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            // Re-render rows when the favourites set changes so hearts stay in sync.
            extraData={favourites.length}
            ListEmptyComponent={
              <Card elevation="flat" style={styles.stateCard}>
                <Icon name="search" size={34} color={colors.textFaint} />
                <Text variant="body" weight="semibold" center>
                  No services found
                </Text>
                <Text variant="bodySm" color={colors.textMuted} center>
                  Try a different category or search term.
                </Text>
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
  backArrow: { fontSize: 17, color: colors.textOnPrimary },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    height: 46,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
  },
  searchGlyph: { fontSize: 14 },
  searchInput: {
    flex: 1,
    fontFamily: fonts.bodyRegular,
    fontSize: typeScale.bodySm.fontSize,
    color: colors.text,
    paddingVertical: 0,
  },

  body2: { flex: 1, backgroundColor: colors.background },
  chipStrip: { flexGrow: 0 },
  chipRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary },

  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },

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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  featuredTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },

  stateCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxxl,
    marginHorizontal: spacing.xl,
  },
  stateGlyph: { fontSize: 34 },
});
