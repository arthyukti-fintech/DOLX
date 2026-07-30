import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import api from "../../../../../services/api";
import { Application, ApplicationStatus, Job, User } from '../../../../types';

// ─── Types ───

interface ApplicantData {
  _id: string;
  worker: Pick<User, '_id' | 'name' | 'workerProfile'>;
  status: ApplicationStatus;
  createdAt: string;
}

// ─── Helpers ───

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getExperienceBadgeStyle(level: string) {
  switch (level) {
    case 'Expert':
      return { backgroundColor: '#e8f5e9', color: '#2e7d32' };
    case 'Intermediate':
      return { backgroundColor: '#e3f2fd', color: '#1565c0' };
    default:
      return { backgroundColor: '#fff3e0', color: '#e65100' };
  }
}

function getStatusBadgeStyle(status: ApplicationStatus) {
  switch (status) {
    case 'accepted':
      return { backgroundColor: '#e8f5e9', color: '#2e7d32' };
    case 'rejected':
      return { backgroundColor: '#ffebee', color: '#c62828' };
    case 'cancelled':
      return { backgroundColor: '#f5f5f5', color: '#616161' };
    default:
      return { backgroundColor: '#fff8e1', color: '#f57f17' };
  }
}

// ─── Component ───

export default function ApplicantManagerScreen() {
  const { jobId } = useLocalSearchParams<{ eventId: string; jobId: string }>();
  const router = useRouter();

  const [applicants, setApplicants] = useState<ApplicantData[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // ─── Fetch applicants ───

  const fetchApplicants = useCallback(async () => {
    if (!jobId) return;

    setIsLoading(true);
    setError(null);

    // Fetch job details for filledCount/numberOfWorkers
    const jobResult = await api.get<{ job: Job }>(`/api/jobs/${jobId}`);
    if (isApiError(jobResult)) {
      setIsLoading(false);
      setError(jobResult.message);
      return;
    }
    setJob(jobResult.data.job);

    // Fetch applicants
    const result = await api.get<{ applications: ApplicantData[] }>(
      `/api/jobs/${jobId}/applicants`
    );

    if (isApiError(result)) {
      setIsLoading(false);
      setError(result.message);
      return;
    }

    setApplicants(result.data.applications);
    setIsLoading(false);
  }, [jobId]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  // ─── Accept/Reject with optimistic update ───

  const handleAccept = useCallback(
    async (applicationId: string) => {
      setActionLoadingId(applicationId);

      // Optimistic update
      const previousApplicants = [...applicants];
      const previousJob = job ? { ...job } : null;

      setApplicants((prev) =>
        prev.map((a) =>
          a._id === applicationId ? { ...a, status: 'accepted' as ApplicationStatus } : a
        )
      );
      if (job) {
        setJob({ ...job, filledCount: job.filledCount + 1 });
      }

      const result = await api.put<{ application: Application }>(
        `/api/applications/${applicationId}/accept`
      );

      if (isApiError(result)) {
        // Revert optimistic update
        setApplicants(previousApplicants);
        setJob(previousJob);
        Alert.alert('Error', result.message || 'Could not accept applicant');
      }

      setActionLoadingId(null);
    },
    [applicants, job]
  );

  const handleReject = useCallback(
    async (applicationId: string) => {
      setActionLoadingId(applicationId);

      // Optimistic update
      const previousApplicants = [...applicants];

      setApplicants((prev) =>
        prev.map((a) =>
          a._id === applicationId ? { ...a, status: 'rejected' as ApplicationStatus } : a
        )
      );

      const result = await api.put<{ application: Application }>(
        `/api/applications/${applicationId}/reject`
      );

      if (isApiError(result)) {
        // Revert optimistic update
        setApplicants(previousApplicants);
        Alert.alert('Error', result.message || 'Could not reject applicant');
      }

      setActionLoadingId(null);
    },
    [applicants]
  );

  // ─── Derived state ───

  const isPositionsFilled =
    job !== null && job.filledCount >= job.numberOfWorkers;

  // ─── Loading State ───

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Applicants</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Loading applicants...</Text>
        </View>
      </View>
    );
  }

  // ─── Error State ───

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Applicants</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={fetchApplicants} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ─── Main Render ───

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Applicants</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Positions Filled Banner */}
      {isPositionsFilled && (
        <View style={styles.filledBanner}>
          <Text style={styles.filledBannerText}>
            Positions Filled ({job!.filledCount}/{job!.numberOfWorkers})
          </Text>
        </View>
      )}

      {/* Job Summary */}
      {job && (
        <View style={styles.jobSummary}>
          <Text style={styles.jobRole}>{job.role}</Text>
          <Text style={styles.jobFilled}>
            {job.filledCount} / {job.numberOfWorkers} filled
          </Text>
        </View>
      )}

      {/* Applicants List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {applicants.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No applicants yet</Text>
          </View>
        ) : (
          applicants.map((applicant) => {
            const workerProfile = applicant.worker.workerProfile;
            const isPending = applicant.status === 'pending';
            const isActionDisabled = actionLoadingId === applicant._id;
            const acceptDisabled =
              isActionDisabled || (isPositionsFilled && isPending);

            const statusStyle = getStatusBadgeStyle(applicant.status);
            const expStyle = workerProfile
              ? getExperienceBadgeStyle(workerProfile.experienceLevel)
              : null;

            return (
              <View key={applicant._id} style={styles.applicantCard}>
                {/* Top row: name + status */}
                <View style={styles.cardTopRow}>
                  <Text style={styles.applicantName}>
                    {applicant.worker.name}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusStyle.backgroundColor },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: statusStyle.color }]}
                    >
                      {applicant.status.charAt(0).toUpperCase() +
                        applicant.status.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Worker details */}
                {workerProfile && (
                  <View style={styles.detailsSection}>
                    {/* Skills */}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Skills</Text>
                      <Text style={styles.detailValue} numberOfLines={2}>
                        {workerProfile.skills.join(', ') || 'Not specified'}
                      </Text>
                    </View>

                    {/* Experience Level */}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Experience</Text>
                      {expStyle && (
                        <View
                          style={[
                            styles.expBadge,
                            { backgroundColor: expStyle.backgroundColor },
                          ]}
                        >
                          <Text style={{ color: expStyle.color, fontSize: 12, fontWeight: '600' }}>
                            {workerProfile.experienceLevel}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Rating */}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Rating</Text>
                      <Text style={styles.detailValue}>
                        ⭐ {workerProfile.ratingAvg.toFixed(1)} (
                        {workerProfile.ratingCount} reviews)
                      </Text>
                    </View>
                  </View>
                )}

                {/* Applied date */}
                <Text style={styles.appliedDate}>
                  Applied: {formatDate(applicant.createdAt)}
                </Text>

                {/* Action buttons — only for pending applicants */}
                {isPending && (
                  <View style={styles.actionRow}>
                    <Pressable
                      style={[
                        styles.acceptButton,
                        acceptDisabled && styles.disabledButton,
                      ]}
                      onPress={() => handleAccept(applicant._id)}
                      disabled={acceptDisabled}
                    >
                      {isActionDisabled ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      )}
                    </Pressable>

                    <Pressable
                      style={[
                        styles.rejectButton,
                        isActionDisabled && styles.disabledButton,
                      ]}
                      onPress={() => handleReject(applicant._id)}
                      disabled={isActionDisabled}
                    >
                      {isActionDisabled ? (
                        <ActivityIndicator size="small" color="#c62828" />
                      ) : (
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      )}
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a1a2e',
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backText: {
    color: '#ffffff',
    fontSize: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 15,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  filledBanner: {
    backgroundColor: '#fff3e0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  filledBannerText: {
    color: '#e65100',
    fontSize: 14,
    fontWeight: '600',
  },
  jobSummary: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  jobRole: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  jobFilled: {
    fontSize: 13,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
  },
  applicantCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#888',
    width: 80,
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  expBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  appliedDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#1a73e8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c62828',
  },
  rejectButtonText: {
    color: '#c62828',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
