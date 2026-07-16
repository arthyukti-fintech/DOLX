import api, { isApiError } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { Job } from '@/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// ─── Types ───

interface AssignedJob {
  _id: string;
  job: Job | { _id: string; role: string; payRate: number; shiftStart: string; shiftEnd: string };
  event: { _id: string; title: string } | string;
  status: string;
  workStatus?: string;
}

// ─── Skeleton Placeholder ───

const SkeletonCard: React.FC<{ wide?: boolean }> = ({ wide }) => (
  <View style={[styles.skeletonCard, wide && styles.skeletonCardWide]}>
    <View style={styles.skeletonLine} />
    <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
    <View style={[styles.skeletonLine, styles.skeletonLineMedium]} />
  </View>
);

// ─── Main Screen ───

const WorkerHomeScreen: React.FC = () => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  // Assigned jobs state
  const [assignedJobs, setAssignedJobs] = useState<AssignedJob[]>([]);
  const [assignedLoading, setAssignedLoading] = useState(true);
  const [assignedError, setAssignedError] = useState<string | null>(null);

  // Discovery jobs state
  const [discoveryJobs, setDiscoveryJobs] = useState<Job[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(true);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

  // ─── Fetch Assigned Jobs ───

  const fetchAssignedJobs = useCallback(async () => {
    setAssignedLoading(true);
    setAssignedError(null);

    const result = await api.get<{ applications: AssignedJob[] }>('/api/workers/assigned-jobs');

    if (isApiError(result)) {
      setAssignedError(result.message);
      setAssignedLoading(false);
      return;
    }

    setAssignedJobs(result.data.applications ?? []);
    setAssignedLoading(false);
  }, []);

  // ─── Fetch Discovery Jobs ───

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

  // ─── Fetch All Data ───

  const fetchAll = useCallback(() => {
    fetchAssignedJobs();
    fetchDiscoveryJobs();
  }, [fetchAssignedJobs, fetchDiscoveryJobs]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── Helpers ───

  const userName = user?.name ?? 'Worker';
  const profilePhoto = user?.workerProfile?.profilePhoto;

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return '#3B82F6';
      case 'ongoing':
        return '#F59E0B';
      case 'completed':
        return '#10B981';
      case 'no_show':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  // ─── Render: Header ───

  const renderHeader = () => (
    <View style={styles.darkSection}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>Welcome, {userName}</Text>
          <Text style={styles.subtitleText}>Find your next gig</Text>
        </View>
        <View style={styles.avatarContainer}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  // ─── Render: Assigned Job Card ───

  const renderAssignedJobCard = (item: AssignedJob) => {
    const job = typeof item.job === 'object' ? item.job : null;
    const event = typeof item.event === 'object' ? item.event : null;
    const status = item.workStatus ?? item.status ?? 'assigned';

    return (
      <View key={item._id} style={styles.assignedCard}>
        <View style={styles.assignedCardHeader}>
          <Text style={styles.assignedEventName} numberOfLines={1}>
            {event?.title ?? 'Event'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
              {status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        {job && (
          <>
            <Text style={styles.assignedRole}>{(job as any).role}</Text>
            <View style={styles.assignedDetails}>
              <Text style={styles.assignedDetailText}>
                🕐 {formatTime((job as any).shiftStart)} — {formatTime((job as any).shiftEnd)}
              </Text>
              <Text style={styles.assignedPay}>₹{(job as any).payRate}</Text>
            </View>
          </>
        )}
      </View>
    );
  };

  // ─── Render: Discovery Job Card ───

  const renderDiscoveryCard = (item: Job) => {
    const eventObj = typeof item.event === 'object' ? item.event : null;

    return (
      <TouchableOpacity
        key={item._id}
        style={styles.discoveryCard}
        onPress={() => router.push(`/job/${item._id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.discoveryCardContent}>
          <Text style={styles.discoveryJobName} numberOfLines={1}>
            {eventObj?.title ?? 'Job'}
          </Text>
          <Text style={styles.discoveryRole}>{item.role}</Text>
          <View style={styles.discoveryRatingRow}>
            <Text style={styles.discoveryStar}>⭐</Text>
            <Text style={styles.discoveryRating}>
              {typeof item.organizer === 'object'
                ? (item.organizer.organizerProfile?.ratingAvg?.toFixed(1) ?? '—')
                : '—'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Render: Assigned Jobs Section ───

  const renderAssignedSection = () => {
    if (assignedLoading) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Assigned Jobs</Text>
          <SkeletonCard wide />
          <SkeletonCard wide />
        </View>
      );
    }

    if (assignedError) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Assigned Jobs</Text>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{assignedError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchAssignedJobs}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (assignedJobs.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Assigned Jobs</Text>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No assigned jobs yet. Browse available jobs below!</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Assigned Jobs</Text>
        {assignedJobs.map(renderAssignedJobCard)}
      </View>
    );
  };

  // ─── Render: Discovery Section ───

  const renderDiscoverySection = () => {
    if (discoveryLoading) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discover Jobs</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </ScrollView>
        </View>
      );
    }

    if (discoveryError) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discover Jobs</Text>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{discoveryError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchDiscoveryJobs}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (discoveryJobs.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discover Jobs</Text>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No jobs are currently available.</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Discover Jobs</Text>
          <TouchableOpacity onPress={() => router.push('/(worker)/jobs')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.discoveryScroll}
        >
          {discoveryJobs.map(renderDiscoveryCard)}
        </ScrollView>
      </View>
    );
  };

  // ─── Main Render ───

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1C2340" />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderHeader()}
          <View style={styles.lightSection}>
            {renderAssignedSection()}
            {renderDiscoverySection()}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1C2340',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  darkSection: {
    backgroundColor: '#011945',
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 24,
  },
  lightSection: {
    backgroundColor: '#F5F6FA',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  avatarContainer: {
    marginLeft: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C2340',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 12,
  },
  // Skeleton
  skeletonCard: {
    width: 200,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    padding: 16,
    marginRight: 12,
  },
  skeletonCardWide: {
    width: '100%',
    marginRight: 0,
    marginBottom: 12,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
    marginBottom: 10,
    width: '80%',
  },
  skeletonLineShort: {
    width: '50%',
  },
  skeletonLineMedium: {
    width: '65%',
  },
  // Error
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Empty
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  // Assigned Job Card
  assignedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  assignedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignedEventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C2340',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  assignedRole: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
  },
  assignedDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignedDetailText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  assignedPay: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  // Discovery Card
  discoveryScroll: {
    paddingRight: 16,
  },
  discoveryCard: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  discoveryCardContent: {
    flex: 1,
  },
  discoveryJobName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C2340',
    marginBottom: 4,
  },
  discoveryRole: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 8,
  },
  discoveryRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discoveryStar: {
    fontSize: 12,
    marginRight: 4,
  },
  discoveryRating: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
});

export default WorkerHomeScreen;
