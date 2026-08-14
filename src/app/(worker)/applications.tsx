import api, { isApiError } from '@/services/api';
import { Application, Job } from '@/types';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, FadeInItem, Icon, IconLabel, ImagePlaceholder, SkeletonList, StatusPill, Text, roleIcon } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

// ─── Helpers ───

function getJobRole(job: Job | string): string {
  if (typeof job === 'string') return 'Unknown Role';
  return job.role;
}

function getEventName(application: Application): string {
  const { event, job } = application;

  if (typeof event !== 'string' && event?.title) {
    return event.title;
  }

  // Fall back to the event nested on the job when only that is populated.
  if (typeof job !== 'string' && job?.event) {
    if (typeof job.event !== 'string' && job.event?.title) {
      return job.event.title;
    }
  }

  return 'Unknown Event';
}

function getShiftDate(job: Job | string): string {
  if (typeof job === 'string') return '';
  const date = new Date(job.shiftStart);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getPayRate(job: Job | string): number | null {
  if (typeof job === 'string') return null;
  return job.payRate ?? null;
}

function formatDateApplied(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Application card ───

const ApplicationCard: React.FC<{ application: Application }> = ({ application }) => {
  const roleName = getJobRole(application.job);
  const eventName = getEventName(application);
  const shiftDate = getShiftDate(application.job);
  const payRate = getPayRate(application.job);

  return (
    <Card style={styles.card} padded={false}>
      <ImagePlaceholder seed={roleName} icon={roleIcon(roleName)} rounded="md" style={styles.thumb} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text variant="body" weight="semibold" numberOfLines={1} style={styles.role}>
            {roleName}
          </Text>
          <StatusPill status={application.status} />
        </View>

        <Text variant="bodySm" color={colors.textMuted} numberOfLines={1}>
          {eventName}
        </Text>

        {shiftDate ? (
          <IconLabel icon="calendar" label={shiftDate} color={colors.textFaint} variant="caption" />
        ) : null}

        <View style={styles.bottomRow}>
          <Text variant="caption" color={colors.textFaint}>
            Applied {formatDateApplied(application.createdAt)}
          </Text>
          {payRate != null ? (
            <Text variant="bodySm" weight="bold" color={colors.secondary}>
              ₹{payRate.toLocaleString('en-IN')}
            </Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
};

// ─── Screen ───

const MyApplicationsScreen: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await api.get<{ applications: Application[] }>(
      '/api/workers/applications'
    );

    if (isApiError(result)) {
      setError(result.message);
      setIsLoading(false);
      return;
    }

    setApplications(result.data.applications);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.header}>
        <Text variant="h2" weight="bold" color={colors.textOnPrimary}>
          My Applications
        </Text>
        <Text variant="bodySm" color="rgba(249,244,244,0.7)" style={styles.headerSub}>
          Track where you&apos;ve applied
        </Text>
      </View>

      <View style={styles.content}>
        {error && applications.length === 0 ? (
          <Card elevation="flat" style={styles.stateCard}>
            <Icon name="warning" size={34} color={colors.textFaint} />
            <Text variant="bodySm" color={colors.textMuted} center style={styles.stateCopy}>
              {error}
            </Text>
            <Button label="Retry" onPress={fetchApplications} size="sm" fullWidth={false} />
          </Card>
        ) : isLoading && applications.length === 0 ? (
          <SkeletonList />
        ) : (
          <FlatList
            data={applications}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <FadeInItem index={index}>
                <ApplicationCard application={item} />
              </FadeInItem>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Card elevation="flat" style={styles.stateCard}>
                <Icon name="document" size={34} color={colors.textFaint} />
                <Text variant="body" weight="semibold" center>
                  No applications yet
                </Text>
                <Text variant="bodySm" color={colors.textMuted} center>
                  Browse available jobs and apply to start working at events.
                </Text>
              </Card>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default MyApplicationsScreen;

// ─── Styles ───

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
  headerSub: { marginTop: 2 },

  content: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl },
  listContent: { paddingTop: spacing.lg, paddingBottom: spacing.xxxl },

  /* ── Card ── */
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  thumb: { width: 64, height: 64 },
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

  /* ── States ── */
  stateCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxxl,
    marginTop: spacing.xl,
  },
  stateGlyph: { fontSize: 34 },
  stateCopy: { marginBottom: spacing.xs },
});
