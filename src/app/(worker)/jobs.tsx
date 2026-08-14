import { useDebounce } from '@/hooks/useDebounce';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useWorkerLocation } from '@/hooks/useWorkerLocation';
import { useAuthStore } from '@/stores/authStore';
import { useJobStore } from '@/stores/jobStore';
import { Event, Job, JobRole } from '@/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, FadeInItem, Icon, IconLabel, ImagePlaceholder, SkeletonList, Text, roleIcon } from '@/components/ui';
import { colors, fonts, radius, spacing, type as typeScale } from '@/theme';

// ─── Constants ───

const JOB_ROLES: JobRole[] = [
  'Event Helper',
  'Setup / Decoration Crew',
  'Catering Staff',
  'Photographer',
  'Videographer',
  'Brand Promoter',
  'Registration Staff',
  'Host / Anchor',
  'Security Staff',
  'Crowd Management',
];

// ─── Helper Functions ───

function getEventName(event: Event | string): string {
  if (typeof event === 'string') return '';
  return event.title || '';
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Job Card Component ───

interface JobCardProps {
  job: Job;
  onPress: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  const eventName = getEventName(job.event);

  return (
    <Card style={cardStyles.card} padded={false} onPress={onPress}>
      <ImagePlaceholder seed={job.role} icon={roleIcon(job.role)} rounded="md" style={cardStyles.thumb} />

      <View style={cardStyles.body}>
        <View style={cardStyles.topRow}>
          <Text variant="body" weight="semibold" numberOfLines={1} style={cardStyles.role}>
            {job.role}
          </Text>
          <Text variant="body" weight="bold" color={colors.secondary}>
            ₹{job.payRate.toLocaleString('en-IN')}
          </Text>
        </View>

        {eventName ? (
          <Text variant="bodySm" color={colors.textMuted} numberOfLines={1}>
            {eventName}
          </Text>
        ) : null}

        <IconLabel
          icon="clock"
          label={`${formatTime(job.shiftStart)} – ${formatTime(job.shiftEnd)}`}
          color={colors.textFaint}
        />

        <View style={cardStyles.bottomRow}>
          <Text variant="caption" color={colors.textFaint}>
            / {job.payType === 'hourly' ? 'hr' : 'fixed'}
          </Text>
          {job.distanceKm !== undefined ? (
            <IconLabel
              icon="location"
              label={`${job.distanceKm} km away`}
              color={colors.primary}
              weight="semibold"
            />
          ) : null}
        </View>
      </View>
    </Card>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  thumb: { width: 68, height: 68 },
  body: { flex: 1, gap: 2 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  role: { flex: 1 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
});

// ─── Header Component ───

const RADIUS_OPTIONS_KM = [5, 10, 25, 50, 100];

interface JobsHeaderProps {
  selectedRole: string | undefined;
  onSelectRole: (role: string | undefined) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  locationStatus: 'loading' | 'granted' | 'denied';
  radiusKm: number;
  onSelectRadius: (km: number) => void;
  onRetryLocation: () => void;
}

const JobsHeader: React.FC<JobsHeaderProps> = ({
  selectedRole,
  onSelectRole,
  searchText,
  onSearchChange,
  locationStatus,
  radiusKm,
  onSelectRadius,
  onRetryLocation,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  return (
    <View style={headerStyles.container}>
      <Text variant="h2" weight="bold" color={colors.textOnPrimary}>
        Browse Jobs
      </Text>

      {/* Search */}
      <View style={headerStyles.searchContainer}>
        <Icon name="search" size={16} color={colors.textFaint} />
        <TextInput
          style={headerStyles.searchInput}
          placeholder="Search by role or event…"
          placeholderTextColor={colors.textFaint}
          value={searchText}
          onChangeText={onSearchChange}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>

      {/* Distance filter */}
      {locationStatus === 'granted' ? (
        <View style={headerStyles.radiusRow}>
          <Text variant="caption" color="rgba(249,244,244,0.7)">
            Within
          </Text>
          {RADIUS_OPTIONS_KM.map((km) => (
            <TouchableOpacity
              key={km}
              style={[headerStyles.chip, radiusKm === km && headerStyles.chipActive]}
              onPress={() => onSelectRadius(km)}
              activeOpacity={0.7}
            >
              <Text
                variant="caption"
                weight={radiusKm === km ? 'semibold' : 'regular'}
                color={radiusKm === km ? colors.textOnPrimary : 'rgba(249,244,244,0.75)'}
              >
                {km}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : locationStatus === 'denied' ? (
        <TouchableOpacity
          style={headerStyles.locationBanner}
          onPress={onRetryLocation}
          activeOpacity={0.7}
        >
          <IconLabel
            icon="location"
            label="Enable location to sort jobs by distance"
            color="rgba(249,244,244,0.85)"
            numberOfLines={2}
            style={headerStyles.bannerCopy}
          />
          <Text variant="caption" weight="semibold" color={colors.secondary}>
            Enable
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* Role filter */}
      <View style={headerStyles.filterRow}>
        <TouchableOpacity
          style={headerStyles.filterButton}
          onPress={() => setShowRoleDropdown(!showRoleDropdown)}
          activeOpacity={0.7}
        >
          <Text variant="bodySm" color={colors.textOnPrimary} numberOfLines={1} style={headerStyles.filterLabel}>
            {selectedRole || 'All Roles'}
          </Text>
          <Icon name="chevronDown" size={14} color={colors.textOnPrimary} />
        </TouchableOpacity>

        {selectedRole ? (
          <TouchableOpacity
            style={headerStyles.clearButton}
            onPress={() => onSelectRole(undefined)}
            activeOpacity={0.7}
          >
            <Text variant="caption" weight="semibold" color={colors.secondary}>
              Clear
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Role dropdown */}
      {showRoleDropdown && (
        <View style={headerStyles.dropdown}>
          {JOB_ROLES.map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                headerStyles.dropdownItem,
                selectedRole === role && headerStyles.dropdownItemActive,
              ]}
              onPress={() => {
                onSelectRole(role === selectedRole ? undefined : role);
                setShowRoleDropdown(false);
              }}
              activeOpacity={0.7}
            >
              <Text
                variant="bodySm"
                weight={selectedRole === role ? 'semibold' : 'regular'}
                color={selectedRole === role ? colors.primary : colors.text}
              >
                {role}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },

  searchContainer: {
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

  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  chipActive: { backgroundColor: colors.secondary },

  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bannerCopy: { flex: 1 },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 42,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  filterLabel: { flex: 1 },
  filterArrow: { fontSize: 14, color: colors.textOnPrimary },
  clearButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  dropdown: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemActive: { backgroundColor: colors.surface },
});

// ─── Main Screen ───

const DEFAULT_RADIUS_KM = 25;

const JobBrowserScreen: React.FC = () => {
  const router = useRouter();
  const {
    jobs,
    isLoading,
    error,
    hasMore,
    filters,
    fetchJobs,
    setFilter,
    setLocationFilter,
  } = useJobStore();
  const profileCity = useAuthStore((s) => s.user?.workerProfile?.location?.city);
  const { lat, lng, status: locationStatus, refresh: retryLocation } = useWorkerLocation();

  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 300);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);

  // Infinite scroll hook
  const { onEndReached, onEndReachedThreshold, isFetchingMore } = useInfiniteScroll({
    onLoadMore: () => fetchJobs(false),
    hasMore,
    isLoading,
  });

  // Initial fetch on mount - unfiltered, so content shows up immediately rather than
  // waiting on the location permission prompt (which the user may take a while to answer).
  useEffect(() => {
    fetchJobs(true);
  }, []);

  // Once GPS resolves, switch to a proximity-sorted fetch. If denied, fall back to the
  // worker's saved profile city instead (still better than an unfiltered list).
  useEffect(() => {
    if (locationStatus === 'granted' && lat !== null && lng !== null) {
      setLocationFilter(lat, lng, radiusKm);
    } else if (locationStatus === 'denied' && profileCity) {
      setFilter('city', profileCity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationStatus, lat, lng]);

  const handleSelectRadius = useCallback(
    (km: number) => {
      setRadiusKm(km);
      if (locationStatus === 'granted' && lat !== null && lng !== null) {
        setLocationFilter(lat, lng, km);
      }
    },
    [locationStatus, lat, lng, setLocationFilter]
  );

  // Client-side search filtering
  const filteredJobs = useMemo(() => {
    if (!debouncedSearch.trim()) return jobs;

    const query = debouncedSearch.toLowerCase().trim();
    return jobs.filter((job) => {
      const roleName = job.role.toLowerCase();
      const eventName = getEventName(job.event).toLowerCase();
      return roleName.includes(query) || eventName.includes(query);
    });
  }, [jobs, debouncedSearch]);

  // Role filter handler — triggers API re-fetch from page 1
  const handleRoleSelect = useCallback(
    (role: string | undefined) => {
      setFilter('role', role);
    },
    [setFilter]
  );

  // Navigate to job detail
  const handleJobPress = useCallback(
    (jobId: string) => {
      router.push(`/job/${jobId}`);
    },
    [router]
  );

  // Retry handler
  const handleRetry = useCallback(() => {
    fetchJobs(true);
  }, [fetchJobs]);

  // Render job card
  const renderJobCard = useCallback(
    ({ item }: { item: Job }) => (
      <JobCard job={item} onPress={() => handleJobPress(item._id)} />
    ),
    [handleJobPress]
  );

  // Key extractor
  const keyExtractor = useCallback((item: Job) => item._id, []);

  // Footer component
  const renderFooter = () => {
    if (isFetchingMore) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text variant="bodySm" color={colors.textMuted}>
            Loading more jobs…
          </Text>
        </View>
      );
    }

    if (!hasMore && filteredJobs.length > 0) {
      return (
        <View style={styles.endIndicator}>
          <Text variant="bodySm" color={colors.textFaint}>
            You&apos;ve seen all available jobs
          </Text>
        </View>
      );
    }

    return null;
  };

  // Empty state
  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Icon name="document" size={34} color={colors.textFaint} />
        <Text variant="body" weight="semibold" center>
          No jobs found
        </Text>
        <Text variant="bodySm" color={colors.textMuted} center>
          {debouncedSearch.trim()
            ? 'Try adjusting your search or filters'
            : 'Check back later for new opportunities'}
        </Text>
      </View>
    );
  };

  // Error state
  if (error && jobs.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <JobsHeader
          selectedRole={filters.role}
          onSelectRole={handleRoleSelect}
          searchText={searchText}
          onSearchChange={setSearchText}
          locationStatus={locationStatus}
          radiusKm={radiusKm}
          onSelectRadius={handleSelectRadius}
          onRetryLocation={retryLocation}
        />
        <View style={styles.centered}>
          <Icon name="warning" size={34} color={colors.textFaint} />
          <Text variant="bodySm" color={colors.textMuted} center style={styles.stateCopy}>
            {error}
          </Text>
          <Button label="Retry" onPress={handleRetry} size="sm" fullWidth={false} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <JobsHeader
        selectedRole={filters.role}
        onSelectRole={handleRoleSelect}
        searchText={searchText}
        onSearchChange={setSearchText}
        locationStatus={locationStatus}
        radiusKm={radiusKm}
        onSelectRadius={handleSelectRadius}
        onRetryLocation={retryLocation}
      />

      {/* Initial loading state */}
      {isLoading && jobs.length === 0 ? (
        <View style={styles.listContainer}>
          <SkeletonList style={styles.listContent} />
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={filteredJobs}
            keyExtractor={keyExtractor}
            renderItem={({ item, index }) => (
              <FadeInItem index={index}>{renderJobCard({ item })}</FadeInItem>
            )}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default JobBrowserScreen;

// ─── Screen Styles ───

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  listContainer: { flex: 1, backgroundColor: colors.background },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    gap: spacing.md,
    backgroundColor: colors.background,
  },

  stateGlyph: { fontSize: 40 },
  stateCopy: { marginBottom: spacing.sm },

  emptyContainer: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: 60,
    paddingHorizontal: spacing.xxxl,
  },

  footerLoading: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  endIndicator: { alignItems: 'center', paddingVertical: spacing.xl },
});