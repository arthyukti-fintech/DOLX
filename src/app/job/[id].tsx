import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import api, { isApiError } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useJobStore } from '../../stores/jobStore';
import { Application, Event, Job } from '../../types';

// ─── Helpers ───

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatShift(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

function getEventData(job: Job): Event | null {
  if (typeof job.event === 'object' && job.event !== null) {
    return job.event as Event;
  }
  return null;
}

// ─── Component ───

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { currentJob, isLoading, error, fetchJobById } = useJobStore();
  const user = useAuthStore((s) => s.user);

  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const loadJob = useCallback(() => {
    if (id) {
      fetchJobById(id);
    }
  }, [id, fetchJobById]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  // ─── Apply Logic ───
  const handleApply = useCallback(async () => {
    if (!id || isApplying) return;

    setIsApplying(true);
    setApplyError(null);

    const result = await api.post<Application>(`/api/applications/jobs/${id}/apply`);

    if (isApiError(result)) {
      // Distinguish network errors from business logic errors
      if (result.code === 'NETWORK_ERROR' || result.code === 'TIMEOUT_ERROR') {
        setApplyError('Unable to connect. Check your internet and try again.');
      } else {
        // Duplicate application, job full, or other backend error
        setApplyError(result.message);
      }
      setIsApplying(false);
    } else {
      // Success
      setHasApplied(true);
      setApplySuccess(true);
      setIsApplying(false);
    }
  }, [id, isApplying]);

  // ─── Loading State ───
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Job Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Loading job details...</Text>
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
          <Text style={styles.headerTitle}>Job Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadJob} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ─── No Job Found ───
  if (!currentJob) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Job Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Job not found</Text>
        </View>
      </View>
    );
  }

  // ─── Derive event data ───
  const event = getEventData(currentJob);
  const isPositionsFilled = currentJob.filledCount >= currentJob.numberOfWorkers;
  const canApply =
    currentJob.status === 'open' &&
    !isPositionsFilled &&
    !hasApplied;

  // ─── Render Apply Button Section ───
  function renderApplySection() {
    if (isPositionsFilled) {
      return (
        <View style={styles.positionsFilledContainer}>
          <Text style={styles.positionsFilledText}>Positions Filled</Text>
        </View>
      );
    }

    if (hasApplied) {
      return (
        <View>
          {applySuccess && (
            <Text style={styles.successText}>Application submitted successfully!</Text>
          )}
          <Pressable style={[styles.applyButton, styles.appliedButton]} disabled>
            <Text style={[styles.applyButtonText, styles.appliedButtonText]}>Applied</Text>
          </Pressable>
        </View>
      );
    }

    if (canApply) {
      return (
        <View>
          {applyError && (
            <Text style={styles.applyErrorText}>{applyError}</Text>
          )}
          <Pressable
            style={[styles.applyButton, isApplying && styles.applyButtonDisabled]}
            onPress={handleApply}
            disabled={isApplying}
          >
            {isApplying ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.applyButtonText}>Apply</Text>
            )}
          </Pressable>
        </View>
      );
    }

    return null;
  }

  return (
    <View style={styles.container}>
      {/* Dark Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* White Card – Job Info */}
        <View style={styles.card}>
          <Text style={styles.roleTitle}>{currentJob.role}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pay Rate</Text>
            <Text style={styles.infoValue}>
              ₹{currentJob.payRate} / {currentJob.payType === 'hourly' ? 'hr' : 'fixed'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pay Type</Text>
            <Text style={styles.infoValue}>{currentJob.payType}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Shift</Text>
            <Text style={styles.infoValue}>
              {formatShift(currentJob.shiftStart, currentJob.shiftEnd)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Shift Date</Text>
            <Text style={styles.infoValue}>{formatDate(currentJob.shiftStart)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Workers Needed</Text>
            <Text style={styles.infoValue}>{currentJob.numberOfWorkers}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Positions Filled</Text>
            <Text style={styles.infoValue}>
              {currentJob.filledCount} / {currentJob.numberOfWorkers}
            </Text>
          </View>
        </View>

        {/* White Card – Event Info */}
        {event && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Event Details</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Title</Text>
              <Text style={styles.infoValue}>{event.title}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{event.eventType}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>
                {[event.location.address, event.location.city, event.location.state]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            </View>
          </View>
        )}

        {/* Apply Button Section */}
        <View style={styles.applySection}>{renderApplySection()}</View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a2e',
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },
  applySection: {
    marginTop: 8,
    alignItems: 'center',
  },
  applyButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  appliedButton: {
    backgroundColor: '#e0e0e0',
  },
  appliedButtonText: {
    color: '#666',
  },
  positionsFilledContainer: {
    backgroundColor: '#fff3e0',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  positionsFilledText: {
    color: '#e65100',
    fontSize: 15,
    fontWeight: '600',
  },
  applyButtonDisabled: {
    backgroundColor: '#90baf9',
  },
  applyErrorText: {
    color: '#d32f2f',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
  },
  successText: {
    color: '#2e7d32',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
  },
});
