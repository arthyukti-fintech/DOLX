import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Icon, IconLabel, ScreenHeader, SkeletonList, StatusPill, Text } from '../../../../../components/ui';
import api, { isApiError } from '../../../../../services/api';
import { colors, radius, spacing } from '../../../../../theme';
import { Application, ApplicationStatus, Job, User } from '../../../../../types';

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

function getExperienceTone(level: string): { bg: string; fg: string } {
  switch (level) {
    case 'Expert':
      return { bg: colors.successBg, fg: colors.success };
    case 'Intermediate':
      return { bg: colors.surface, fg: colors.primary };
    default:
      return { bg: colors.warningBg, fg: colors.warning };
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

  // ─── Fetch ───

  const fetchApplicants = useCallback(async () => {
    if (!jobId) return;

    setIsLoading(true);
    setError(null);

    // Job details drive the filled/total counts shown above the list.
    const jobResult = await api.get<{ job: Job }>(`/api/jobs/${jobId}`);
    if (isApiError(jobResult)) {
      setIsLoading(false);
      setError(jobResult.message);
      return;
    }
    setJob(jobResult.data.job);

    const result = await api.get<{ applicants: ApplicantData[] }>(
      `/api/jobs/${jobId}/applicants`
    );

    if (isApiError(result)) {
      setIsLoading(false);
      setError(result.message);
      return;
    }

    setApplicants(result.data.applicants);
    setIsLoading(false);
  }, [jobId]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  // ─── Accept / reject (optimistic, reverted on failure) ───

  const handleAccept = useCallback(
    async (applicationId: string) => {
      setActionLoadingId(applicationId);

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
        setApplicants(previousApplicants);
        Alert.alert('Error', result.message || 'Could not reject applicant');
      }

      setActionLoadingId(null);
    },
    [applicants]
  );

  const isPositionsFilled = job !== null && job.filledCount >= job.numberOfWorkers;

  // ─── Loading / error ───

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ScreenHeader title="Applicants" />
        <SkeletonList />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ScreenHeader title="Applicants" />
        <View style={styles.centered}>
          <Icon name="warning" size={34} color={colors.textFaint} />
          <Text variant="bodySm" color={colors.textMuted} center style={styles.stateCopy}>
            {error}
          </Text>
          <Button label="Retry" onPress={fetchApplicants} size="sm" fullWidth={false} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main ───

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader title="Applicants" />

      {/* Job summary */}
      {job ? (
        <View style={styles.summary}>
          <Text variant="body" weight="semibold">
            {job.role}
          </Text>
          {isPositionsFilled ? (
            <IconLabel
              icon="check"
              label={`${job.filledCount} / ${job.numberOfWorkers} filled`}
              color={colors.success}
              variant="bodySm"
              weight="semibold"
              size={14}
            />
          ) : (
            <Text variant="bodySm" weight="semibold" color={colors.textMuted}>
              {job.filledCount} / {job.numberOfWorkers} filled
            </Text>
          )}
        </View>
      ) : null}

      {isPositionsFilled ? (
        <View style={styles.banner}>
          <Text variant="caption" weight="semibold" color={colors.warning}>
            All positions are filled — no further applicants can be accepted.
          </Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {applicants.length === 0 ? (
          <Card elevation="flat" style={styles.stateCard}>
            <Icon name="person" size={34} color={colors.textFaint} />
            <Text variant="body" weight="semibold" center>
              No applicants yet
            </Text>
            <Text variant="bodySm" color={colors.textMuted} center>
              Workers who apply to this job will show up here.
            </Text>
          </Card>
        ) : (
          applicants.map((applicant) => {
            const workerProfile = applicant.worker.workerProfile;
            const isPending = applicant.status === 'pending';
            const isBusy = actionLoadingId === applicant._id;
            const acceptDisabled = isBusy || (isPositionsFilled && isPending);
            const expTone = workerProfile
              ? getExperienceTone(workerProfile.experienceLevel)
              : null;

            return (
              <Card key={applicant._id} style={styles.card}>
                {/* Name + status */}
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text variant="body" weight="bold" color={colors.textOnPrimary}>
                      {applicant.worker.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text variant="body" weight="semibold" style={styles.name} numberOfLines={1}>
                    {applicant.worker.name}
                  </Text>
                  <StatusPill status={applicant.status} />
                </View>

                {/* Details */}
                {workerProfile ? (
                  <View style={styles.details}>
                    <View style={styles.detailRow}>
                      <Text variant="caption" color={colors.textFaint} style={styles.detailLabel}>
                        Skills
                      </Text>
                      <Text variant="bodySm" style={styles.detailValue} numberOfLines={2}>
                        {workerProfile.skills.join(', ') || 'Not specified'}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text variant="caption" color={colors.textFaint} style={styles.detailLabel}>
                        Experience
                      </Text>
                      {expTone ? (
                        <View style={[styles.expBadge, { backgroundColor: expTone.bg }]}>
                          <Text variant="caption" weight="semibold" color={expTone.fg}>
                            {workerProfile.experienceLevel}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.detailRow}>
                      <Text variant="caption" color={colors.textFaint} style={styles.detailLabel}>
                        Rating
                      </Text>
                      <IconLabel
                        icon="star"
                        iconColor={colors.secondary}
                        color={colors.text}
                        variant="bodySm"
                        size={14}
                        style={styles.detailValue}
                        label={`${workerProfile.ratingAvg.toFixed(1)} (${workerProfile.ratingCount} ${
                          workerProfile.ratingCount === 1 ? 'review' : 'reviews'
                        })`}
                      />
                    </View>
                  </View>
                ) : null}

                <Text variant="caption" color={colors.textFaint} style={styles.applied}>
                  Applied {formatDate(applicant.createdAt)}
                </Text>

                {/* Actions */}
                {isPending ? (
                  <View style={styles.actions}>
                    <Button
                      label="Accept"
                      onPress={() => handleAccept(applicant._id)}
                      disabled={acceptDisabled}
                      loading={isBusy}
                      size="sm"
                      style={styles.actionBtn}
                    />
                    <Button
                      label="Reject"
                      variant="outline"
                      onPress={() => handleReject(applicant._id)}
                      disabled={isBusy}
                      size="sm"
                      style={styles.actionBtn}
                    />
                  </View>
                ) : null}
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  banner: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.warningBg,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingBottom: 40 },

  card: { marginBottom: spacing.md },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { flex: 1 },

  details: { gap: spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  detailLabel: { width: 76 },
  detailValue: { flex: 1 },
  expBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },

  applied: { marginTop: spacing.md },

  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  actionBtn: { flex: 1 },

  /* States */
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxxl,
  },
  stateCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxxl,
    marginTop: spacing.xl,
  },
  stateGlyph: { fontSize: 34 },
  stateCopy: { marginBottom: spacing.xs },
});
