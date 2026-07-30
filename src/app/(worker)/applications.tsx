import api, { isApiError } from '@/services/api';
import { Application, ApplicationStatus, Job } from '@/types';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Helper Functions ───

function getJobRole(job: Job | string): string {
  if (typeof job === 'string') return 'Unknown Role';
  return job.role;
}

function getEventName(application: Application): string {
  const { event, job } = application;

  // Try event field first
  if (typeof event !== 'string' && event?.title) {
    return event.title;
  }

  // Fall back to job.event if job is populated
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
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateApplied(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusColor(status: ApplicationStatus): string {
  switch (status) {
    case 'pending':
      return '#F5A623';
    case 'accepted':
      return '#34C759';
    case 'rejected':
      return '#FF3B30';
    case 'cancelled':
      return '#8E8E93';
    default:
      return '#666666';
  }
}

function getStatusLabel(status: ApplicationStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'accepted':
      return 'Accepted';
    case 'rejected':
      return 'Rejected';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

// ─── Application Card Component ───

interface ApplicationCardProps {
  application: Application;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application }) => {
  const roleName = getJobRole(application.job);
  const eventName = getEventName(application);
  const shiftDate = getShiftDate(application.job);
  const statusColor = getStatusColor(application.status);
  const statusLabel = getStatusLabel(application.status);
  const dateApplied = formatDateApplied(application.createdAt);

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.header}>
        <Text style={cardStyles.role} numberOfLines={1}>
          {roleName}
        </Text>
        <View style={[cardStyles.statusBadge, { backgroundColor: statusColor + '1A' }]}>
          <Text style={[cardStyles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <Text style={cardStyles.eventName} numberOfLines={1}>
        {eventName}
      </Text>

      <View style={cardStyles.detailsRow}>
        {shiftDate ? (
          <View style={cardStyles.detailItem}>
            <Text style={cardStyles.detailLabel}>Shift:</Text>
            <Text style={cardStyles.detailValue}>{shiftDate}</Text>
          </View>
        ) : null}

        <View style={cardStyles.detailItem}>
          <Text style={cardStyles.detailLabel}>Applied:</Text>
          <Text style={cardStyles.detailValue}>{dateApplied}</Text>
        </View>
      </View>
    </View>
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
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventName: {
    fontSize: 13,
    color: '#555555',
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#888888',
    marginRight: 4,
  },
  detailValue: {
    fontSize: 12,
    color: '#444444',
  },
});

// ─── Main Screen ───

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

  // Key extractor
  const keyExtractor = useCallback((item: Application) => item._id, []);

  // Render application card
  const renderItem = useCallback(
    ({ item }: { item: Application }) => <ApplicationCard application={item} />,
    []
  );

  // Empty state
  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📄</Text>
        <Text style={styles.emptyTitle}>No applications submitted</Text>
        <Text style={styles.emptyMessage}>
          Browse available jobs and apply to start working at events
        </Text>
      </View>
    );
  };

  // Error state
  if (error && applications.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#1B2547" />
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>My Applications</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchApplications}
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
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>My Applications</Text>
      </View>

      {/* Loading state */}
      {isLoading && applications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B2547" />
          <Text style={styles.loadingText}>Loading applications...</Text>
        </View>
      ) : (
        <View style={styles.listSection}>
          <FlatList
            data={applications}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmpty}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default MyApplicationsScreen;

// ─── Screen Styles ───

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: '#1B2547',
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
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
});
