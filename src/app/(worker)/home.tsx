import api, { isApiError } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useServiceStore } from '@/stores/serviceStore';
import { Job } from '@/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Icon, ImagePlaceholder, SkeletonList, StatusPill, Text, roleIcon } from '../../components/ui';
import { colors, radius, shadow, spacing } from '../../theme';
import { CATALOG_ROLES } from '@/constants/roles';

// ─── Types ───

interface AssignedJob {
  _id: string;
  job: Job | { _id: string; role: string; payRate: number; shiftStart: string; shiftEnd: string };
  event: { _id: string; title: string } | string;
  status: string;
  workStatus?: string;
}

/**
 * The role taxonomy the platform hires for. Mirrors JOB_ROLES on the backend -
 * kept as a local constant so the category grid renders instantly rather than
 * waiting on a round-trip for a list that effectively never changes.
 */
const CORE_STAFF: { role: string }[] = CATALOG_ROLES.map((role) => ({ role }));

// ─── Screen ───

const WorkerHomeScreen: React.FC = () => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [assignedJobs, setAssignedJobs] = useState<AssignedJob[]>([]);
  const [assignedLoading, setAssignedLoading] = useState(true);

  const [discoveryJobs, setDiscoveryJobs] = useState<Job[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(true);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

  const fetchAssignedJobs = useCallback(async () => {
    setAssignedLoading(true);
    const result = await api.get<{ applications: AssignedJob[] }>('/api/workers/assigned-jobs');
    if (!isApiError(result)) {
      setAssignedJobs(result.data.applications ?? []);
    }
    setAssignedLoading(false);
  }, []);

  const fetchDiscoveryJobs = useCallback(async () => {
    setDiscoveryLoading(true);
    setDiscoveryError(null);
    const result = await api.get<{ jobs: Job[] }>('/api/jobs', { limit: 10 });
    if (isApiError(result)) {
      setDiscoveryError(result.message);
      setDiscoveryLoading(false);
      return;
    }
    setDiscoveryJobs(result.data.jobs ?? []);
    setDiscoveryLoading(false);
  }, []);

  const featured = useServiceStore((s) => s.featured);
  const trending = useServiceStore((s) => s.trending);
  const fetchFeatured = useServiceStore((s) => s.fetchFeatured);
  const fetchTrending = useServiceStore((s) => s.fetchTrending);

  useEffect(() => {
    fetchAssignedJobs();
    fetchDiscoveryJobs();
    fetchFeatured();
    fetchTrending();
  }, [fetchAssignedJobs, fetchDiscoveryJobs, fetchFeatured, fetchTrending]);

  const userName = user?.name ?? 'there';
  const city = user?.workerProfile?.location?.city;


  const formatShift = (iso?: string) => {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Navy header ── */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text variant="h2" weight="bold" color={colors.textOnPrimary}>
                Welcome, {userName}
              </Text>
              <View style={styles.headerSubRow}>
                {city ? <Icon name="location" size={12} color="rgba(249,244,244,0.7)" /> : null}
                <Text variant="bodySm" color="rgba(249,244,244,0.7)">
                  {city ?? 'Find your next gig'}
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerIcon}
                activeOpacity={0.7}
                onPress={() => router.push('/notifications')}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
              >
                <Icon name="bell" size={18} color={colors.textOnPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIcon}
                activeOpacity={0.7}
                onPress={() => router.push('/(worker)/profile')}
                accessibilityRole="button"
                accessibilityLabel="Profile"
              >
                <Text style={styles.headerGlyph}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.search}
            activeOpacity={0.8}
            onPress={() => router.push('/(worker)/jobs')}
            accessibilityRole="search"
          >
            <Icon name="search" size={16} color={colors.textFaint} />
            <Text variant="bodySm" color={colors.textFaint}>
              Find your perfect gig
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Promo banner ── */}
        <View style={styles.section}>
          <ImagePlaceholder seed="premium-banner" rounded="lg" style={styles.banner} />
          <View style={styles.bannerCopy} pointerEvents="none">
            <Text variant="h2" weight="bold" color={colors.textOnPrimary}>
              Premium Events{'\n'}For You
            </Text>
            <Text variant="bodySm" color="rgba(249,244,244,0.85)" style={styles.bannerSub}>
              Top-paying gigs near you
            </Text>
          </View>
        </View>

        {/* ── Core staff categories ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="h3" weight="semibold">
              Our Core Staff
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(worker)/jobs')}>
              <Text variant="bodySm" weight="semibold" color={colors.secondary}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoryGrid}>
            {CORE_STAFF.map((item) => (
              <TouchableOpacity
                key={item.role}
                style={styles.categoryTile}
                activeOpacity={0.8}
                onPress={() => router.push('/(worker)/jobs')}
              >
                <ImagePlaceholder
                  seed={item.role}
                  icon={roleIcon(item.role)}
                  iconSize={24}
                  rounded="md"
                  style={styles.categoryThumb}
                />
                <Text variant="caption" weight="medium" center numberOfLines={2}>
                  {item.role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Assigned jobs ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="h3" weight="semibold">
              My Assigned Jobs
            </Text>
            {assignedJobs.length > 0 ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/(worker)/applications')}
              >
                <Text variant="bodySm" weight="semibold" color={colors.secondary}>
                  See All
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {assignedLoading ? (
            <Card elevation="flat">
              <Text variant="bodySm" color={colors.textMuted} center>
                Loading your jobs…
              </Text>
            </Card>
          ) : assignedJobs.length === 0 ? (
            <Card elevation="flat">
              <Text variant="bodySm" color={colors.textMuted} center>
                No assigned jobs yet. Browse available jobs below.
              </Text>
            </Card>
          ) : (
            assignedJobs.slice(0, 3).map((item) => {
              const role = typeof item.job === 'object' ? item.job.role : 'Job';
              const eventTitle = typeof item.event === 'object' ? item.event.title : 'Event';
              const pay = typeof item.job === 'object' ? item.job.payRate : undefined;
              const shiftStart = typeof item.job === 'object' ? item.job.shiftStart : undefined;

              return (
                <Card key={item._id} style={styles.bookingCard} padded={false}>
                  <ImagePlaceholder seed={role} icon="calendar" rounded="md" style={styles.bookingThumb} />
                  <View style={styles.bookingBody}>
                    <Text variant="body" weight="semibold" numberOfLines={1}>
                      {eventTitle}
                    </Text>
                    <Text variant="bodySm" color={colors.textMuted} numberOfLines={1}>
                      {role}
                    </Text>
                    <View style={styles.bookingMeta}>
                      <Text variant="caption" color={colors.textFaint}>
                        {formatShift(shiftStart)}
                      </Text>
                    </View>
                    <View style={styles.bookingFooter}>
                      <StatusPill status={item.workStatus ?? item.status} />
                      {pay != null ? (
                        <Text variant="body" weight="bold" color={colors.secondary}>
                          ₹{pay.toLocaleString('en-IN')}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </View>

        {/* ── Discovery ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="h3" weight="semibold">
              Nearby Services
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(worker)/jobs')}>
              <Text variant="bodySm" weight="semibold" color={colors.secondary}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {discoveryLoading ? (
            <Card elevation="flat">
              <Text variant="bodySm" color={colors.textMuted} center>
                Finding jobs near you…
              </Text>
            </Card>
          ) : discoveryError ? (
            <Card elevation="flat">
              <Text variant="bodySm" color={colors.danger} center>
                {discoveryError}
              </Text>
            </Card>
          ) : discoveryJobs.length === 0 ? (
            <Card elevation="flat">
              <Text variant="bodySm" color={colors.textMuted} center>
                No open jobs right now. Check back soon.
              </Text>
            </Card>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
            >
              {discoveryJobs.map((job) => {
                const eventTitle =
                  typeof job.event === 'object' && job.event ? job.event.title : 'Event';
                return (
                  <TouchableOpacity
                    key={job._id}
                    style={styles.discoverCard}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/job/${job._id}`)}
                  >
                    <ImagePlaceholder
                      seed={job.role}
                      icon={roleIcon(job.role)}
                      rounded="md"
                      style={styles.discoverThumb}
                    />
                    <Text variant="bodySm" weight="semibold" numberOfLines={1} style={styles.discoverTitle}>
                      {eventTitle}
                    </Text>
                    <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
                      {job.role}
                    </Text>
                    <View style={styles.discoverFooter}>
                      <Text variant="bodySm" weight="bold" color={colors.secondary}>
                        ₹{job.payRate?.toLocaleString('en-IN')}
                      </Text>
                      {job.distanceKm != null ? (
                        <Text variant="caption" color={colors.textFaint}>
                          {job.distanceKm.toFixed(1)} km
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* ── Featured workers ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="h3" weight="semibold">
              Featured Services
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/services')}>
              <Text variant="bodySm" weight="semibold" color={colors.secondary}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {featured.length === 0 ? (
            <Card elevation="flat">
              <Text variant="bodySm" color={colors.textMuted} center>
                No featured services right now.
              </Text>
            </Card>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
            >
              {featured.map((service) => (
                <TouchableOpacity
                  key={service._id}
                  style={styles.featuredCard}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/services/${service._id}`)}
                >
                  <ImagePlaceholder
                    seed={service.role}
                    icon={roleIcon(service.role)}
                    rounded="pill"
                    style={styles.featuredAvatar}
                  />
                  <Text variant="bodySm" weight="semibold" center numberOfLines={1}>
                    {service.title}
                  </Text>
                  <Text variant="caption" color={colors.textMuted} center numberOfLines={1}>
                    {service.role}
                  </Text>
                  <Text variant="caption" color={colors.textFaint} center>
                    {service.ratingAvg > 0 ? service.ratingAvg.toFixed(1) : 'New'}
                  </Text>
                  <View style={styles.bookBtn}>
                    <Text variant="caption" weight="semibold" color={colors.textOnPrimary}>
                      Book Now
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Popular & trending ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="h3" weight="semibold">
              Popular &amp; Trending
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(worker)/jobs')}>
              <Text variant="bodySm" weight="semibold" color={colors.secondary}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {trending.length === 0 ? (
            <Card elevation="flat">
              <Text variant="bodySm" color={colors.textMuted} center>
                Nothing trending yet. Check back soon.
              </Text>
            </Card>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
            >
              {trending.map((service) => (
                <TouchableOpacity
                  key={service._id}
                  style={styles.trendCard}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/services/${service._id}`)}
                >
                  <ImagePlaceholder
                    seed={service.role}
                    icon={roleIcon(service.role)}
                    rounded="md"
                    style={styles.trendThumb}
                  />
                  <Text variant="bodySm" weight="semibold" numberOfLines={1} style={styles.trendTitle}>
                    {service.title}
                  </Text>
                  <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
                    {service.bookingCount > 0
                      ? `${service.bookingCount} booked`
                      : service.role}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <Text variant="hero" weight="bold" color={colors.surface} center style={styles.watermark}>
          DOLX
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },
  scroll: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xxxl },

  /* ── Header ── */
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flex: 1, marginRight: spacing.md },
  headerSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerGlyph: { fontSize: 16, color: colors.textOnPrimary },
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

  /* ── Sections ── */
  section: { paddingHorizontal: spacing.xl, marginTop: spacing.xxl },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  /* ── Promo banner ── */
  banner: { height: 140, width: '100%' },
  bannerCopy: {
    position: 'absolute',
    left: spacing.xl + spacing.lg,
    top: spacing.xl,
    right: spacing.xxxl,
  },
  bannerSub: { marginTop: spacing.xs },

  /* ── Categories ── */
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  categoryTile: { width: '30%', alignItems: 'center', gap: spacing.xs },
  categoryThumb: { width: '100%', aspectRatio: 1.15 },

  /* ── Assigned job cards ── */
  bookingCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bookingThumb: { width: 72, height: 72 },
  bookingBody: { flex: 1, justifyContent: 'space-between' },
  bookingMeta: { marginTop: 2 },
  bookingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },

  /* ── Horizontal discovery ── */
  hScroll: { gap: spacing.md, paddingRight: spacing.xl },
  discoverCard: {
    width: 150,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.sm,
    ...shadow.card,
  },
  discoverThumb: { width: '100%', height: 90, marginBottom: spacing.sm },
  discoverTitle: { marginBottom: 2 },
  discoverFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },

  /* ── Featured workers ── */
  demoTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.warningBg,
  },
  featuredCard: {
    width: 132,
    alignItems: 'center',
    gap: 2,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  featuredAvatar: { width: 56, height: 56, marginBottom: spacing.xs },
  bookBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },

  /* ── Trending ── */
  trendCard: {
    width: 140,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    ...shadow.card,
  },
  trendThumb: { width: '100%', height: 92, marginBottom: spacing.sm },
  trendTitle: { marginBottom: 1 },

  watermark: { marginTop: spacing.xxxl, letterSpacing: 4 },
});

export default WorkerHomeScreen;
