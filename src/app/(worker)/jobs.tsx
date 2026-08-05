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
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <TouchableOpacity
      activeOpacity={0.8}
      style={cardStyles.card}
      onPress={onPress}
    >
      <View style={cardStyles.header}>
        <Text style={cardStyles.role} numberOfLines={1}>
          {job.role}
        </Text>
        <Text style={cardStyles.pay}>
          ₹{job.payRate.toLocaleString('en-IN')}{' '}
          <Text style={cardStyles.payType}>
            / {job.payType === 'hourly' ? 'hr' : 'fixed'}
          </Text>
        </Text>
      </View>

      {eventName ? (
        <Text style={cardStyles.eventName} numberOfLines={1}>
          {eventName}
        </Text>
      ) : null}

      <View style={cardStyles.shiftRow}>
        <Text style={cardStyles.shiftLabel}>Shift:</Text>
        <Text style={cardStyles.shiftTime}>
          {formatTime(job.shiftStart)} – {formatTime(job.shiftEnd)}
        </Text>
      </View>

      {job.distanceKm !== undefined ? (
        <Text style={cardStyles.distance}>📍 {job.distanceKm} km away</Text>
      ) : null}
    </TouchableOpacity>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#F4F4F4',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  role: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
    flex: 1,
    marginRight: 8,
  },
  pay: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B2547',
  },
  payType: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666666',
  },
  eventName: {
    fontSize: 13,
    color: '#555555',
    marginBottom: 8,
  },
  shiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shiftLabel: {
    fontSize: 12,
    color: '#888888',
    marginRight: 4,
  },
  shiftTime: {
    fontSize: 12,
    color: '#444444',
  },
  distance: {
    fontSize: 12,
    color: '#1B2547',
    fontWeight: '600',
    marginTop: 8,
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
      <Text style={headerStyles.heading}>Browse Jobs</Text>

      {/* Search Input */}
      <View style={headerStyles.searchContainer}>
        <TextInput
          style={headerStyles.searchInput}
          placeholder="Search by role or event..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={searchText}
          onChangeText={onSearchChange}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>

      {/* Location / distance */}
      {locationStatus === 'granted' ? (
        <View style={headerStyles.radiusRow}>
          <Text style={headerStyles.radiusLabel}>Within</Text>
          {RADIUS_OPTIONS_KM.map((km) => (
            <TouchableOpacity
              key={km}
              style={[headerStyles.radiusChip, radiusKm === km && headerStyles.radiusChipActive]}
              onPress={() => onSelectRadius(km)}
              activeOpacity={0.7}
            >
              <Text style={[headerStyles.radiusChipText, radiusKm === km && headerStyles.radiusChipTextActive]}>
                {km}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : locationStatus === 'denied' ? (
        <TouchableOpacity style={headerStyles.locationBanner} onPress={onRetryLocation} activeOpacity={0.7}>
          <Text style={headerStyles.locationBannerText}>
            📍 Enable location to see jobs sorted by distance
          </Text>
          <Text style={headerStyles.locationBannerAction}>Enable</Text>
        </TouchableOpacity>
      ) : null}

      {/* Role Filter */}
      <View style={headerStyles.filterRow}>
        <TouchableOpacity
          style={headerStyles.filterButton}
          onPress={() => setShowRoleDropdown(!showRoleDropdown)}
          activeOpacity={0.7}
        >
          <Text style={headerStyles.filterButtonText} numberOfLines={1}>
            {selectedRole || 'All Roles'}
          </Text>
          <Text style={headerStyles.filterArrow}>▼</Text>
        </TouchableOpacity>

        {selectedRole ? (
          <TouchableOpacity
            style={headerStyles.clearButton}
            onPress={() => onSelectRole(undefined)}
            activeOpacity={0.7}
          >
            <Text style={headerStyles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Role Dropdown */}
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
                style={[
                  headerStyles.dropdownItemText,
                  selectedRole === role && headerStyles.dropdownItemTextActive,
                ]}
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
    backgroundColor: '#1B2547',
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 10,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFFFFF',
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  radiusLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginRight: 2,
  },
  radiusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  radiusChipActive: {
    backgroundColor: '#FFFFFF',
  },
  radiusChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  radiusChipTextActive: {
    color: '#1B2547',
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  locationBannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  locationBannerAction: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flex: 1,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  filterArrow: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    marginLeft: 8,
  },
  clearButton: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: 170,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemActive: {
    backgroundColor: '#EEF0FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333333',
  },
  dropdownItemTextActive: {
    color: '#1B2547',
    fontWeight: '600',
  },
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
          <ActivityIndicator size="small" color="#1B2547" />
          <Text style={styles.footerText}>Loading more jobs...</Text>
        </View>
      );
    }

    if (!hasMore && filteredJobs.length > 0) {
      return (
        <View style={styles.endIndicator}>
          <Text style={styles.endIndicatorText}>You've seen all available jobs</Text>
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
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No jobs found</Text>
        <Text style={styles.emptyMessage}>
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
        <StatusBar barStyle="light-content" backgroundColor="#1B2547" />
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
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1B2547" />
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B2547" />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      ) : (
        <View style={styles.listSection}>
          <FlatList
            data={filteredJobs}
            keyExtractor={keyExtractor}
            renderItem={renderJobCard}
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
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listSection: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 15,
    color: '#444444',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#1B2547',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLoading: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666666',
  },
  endIndicator: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  endIndicatorText: {
    fontSize: 13,
    color: '#999999',
    fontStyle: 'italic',
  },
});
