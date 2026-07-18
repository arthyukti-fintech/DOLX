import api, { isApiError } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { CreateReviewRequest, Review } from '@/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Helper Functions ───

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function renderStars(rating: number): string {
  const filled = Math.round(Math.min(5, Math.max(0, rating)));
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

// ─── Review Item Component (Worker View) ───

interface ReviewItemProps {
  review: Review;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  const reviewerName =
    review.fromUser?.organizerProfile?.companyName || review.fromUser?.name || 'Anonymous';

  return (
    <View style={itemStyles.container}>
      <View style={itemStyles.header}>
        <View style={itemStyles.avatarCircle}>
          <Text style={itemStyles.avatarText}>
            {reviewerName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={itemStyles.headerInfo}>
          <Text style={itemStyles.reviewerName} numberOfLines={1}>
            {reviewerName}
          </Text>
          <Text style={itemStyles.date}>{formatDate(review.createdAt)}</Text>
        </View>
      </View>

      <Text style={itemStyles.stars}>{renderStars(review.rating)}</Text>

      {review.comment ? (
        <Text style={itemStyles.comment}>{review.comment}</Text>
      ) : null}

      {review.job?.role ? (
        <View style={itemStyles.roleBadge}>
          <Text style={itemStyles.roleText}>{review.job.role}</Text>
        </View>
      ) : null}
    </View>
  );
};

const itemStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1B2547',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  date: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  stars: {
    fontSize: 18,
    color: '#F5A623',
    letterSpacing: 2,
    marginBottom: 8,
  },
  comment: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F4FF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleText: {
    fontSize: 12,
    color: '#1B2547',
    fontWeight: '500',
  },
});

// ─── Star Rating Input Component (Organizer View) ───

interface StarRatingInputProps {
  rating: number;
  onRate: (value: number) => void;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({ rating, onRate }) => {
  return (
    <View style={starInputStyles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRate(star)}
          activeOpacity={0.7}
          style={starInputStyles.starButton}
        >
          <Text
            style={[
              starInputStyles.star,
              star <= rating
                ? starInputStyles.starFilled
                : starInputStyles.starEmpty,
            ]}
          >
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const starInputStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  starButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  star: {
    fontSize: 36,
  },
  starFilled: {
    color: '#F5A623',
  },
  starEmpty: {
    color: '#D0D0D0',
  },
});

// ─── Header Component ───

interface ReviewsHeaderProps {
  title: string;
  onBack: () => void;
}

const ReviewsHeader: React.FC<ReviewsHeaderProps> = ({ title, onBack }) => {
  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.topRow}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={headerStyles.backButton}>
          <Text style={headerStyles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={headerStyles.heading}>{title}</Text>
        <View style={headerStyles.spacer} />
      </View>
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: '#1B2547',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingRight: 12,
    paddingVertical: 4,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  spacer: {
    width: 34,
  },
});

// ─── Worker Reviews List View ───

interface WorkerReviewsViewProps {
  workerId: string;
}

const WorkerReviewsView: React.FC<WorkerReviewsViewProps> = ({ workerId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await api.get<{ reviews: Review[] }>(
      `/api/reviews/workers/${workerId}`
    );

    if (isApiError(result)) {
      setError(result.message);
    } else {
      setReviews(result.data.reviews ?? result.data as unknown as Review[]);
    }

    setIsLoading(false);
  }, [workerId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1B2547" />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  // Error state with retry
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchReviews}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyIcon}>⭐</Text>
        <Text style={styles.emptyTitle}>No reviews yet</Text>
        <Text style={styles.emptyMessage}>
          Your reviews will appear here once organizers rate your work.
        </Text>
      </View>
    );
  }

  // Reviews list
  return (
    <FlatList
      data={reviews}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <ReviewItem review={item} />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

// ─── Organizer Submit Review View ───

const OrganizerReviewView: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleRatingChange = (value: number) => {
    setRating(value);
    if (ratingError) {
      setRatingError(null);
    }
  };

  const handleSubmit = async () => {
    // Client-side validation: rating is required
    if (rating === 0) {
      setRatingError('Please select a rating (1-5)');
      return;
    }

    setRatingError(null);
    setSubmitError(null);
    setIsSubmitting(true);

    const reviewData: CreateReviewRequest = {
      applicationId: applicationId.trim(),
      rating,
      comment: comment.trim() || undefined,
    };

    const result = await api.post<{ review: Review }>('/api/reviews', reviewData);

    if (isApiError(result)) {
      setSubmitError(result.message);
    } else {
      setSubmitSuccess(true);
      // Reset form
      setRating(0);
      setComment('');
      setApplicationId('');
    }

    setIsSubmitting(false);
  };

  if (submitSuccess) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Review Submitted</Text>
        <Text style={styles.successMessage}>
          Thank you! Your review has been submitted successfully.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setSubmitSuccess(false)}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>Submit Another</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={formStyles.container}>
      <Text style={formStyles.sectionTitle}>Rate Worker</Text>

      {/* Application ID input */}
      <Text style={formStyles.label}>Application ID</Text>
      <TextInput
        style={formStyles.input}
        value={applicationId}
        onChangeText={setApplicationId}
        placeholder="Enter the application ID"
        placeholderTextColor="#999999"
        editable={!isSubmitting}
      />

      {/* Star Rating */}
      <Text style={formStyles.label}>Rating *</Text>
      <StarRatingInput rating={rating} onRate={handleRatingChange} />
      {ratingError && <Text style={formStyles.errorText}>{ratingError}</Text>}

      {/* Comment */}
      <Text style={formStyles.label}>Comment (optional)</Text>
      <TextInput
        style={[formStyles.input, formStyles.textArea]}
        value={comment}
        onChangeText={setComment}
        placeholder="Share your experience with this worker..."
        placeholderTextColor="#999999"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        editable={!isSubmitting}
      />

      {/* Submit Error */}
      {submitError && (
        <View style={formStyles.errorBanner}>
          <Text style={formStyles.errorBannerText}>{submitError}</Text>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[formStyles.submitButton, isSubmitting && formStyles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.7}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={formStyles.submitButtonText}>Submit Review</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const formStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B2547',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F5F5F8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E8E8EC',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  errorBanner: {
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  errorBannerText: {
    color: '#CC3333',
    fontSize: 13,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#1B2547',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

// ─── Main Screen ───

const ReviewScreen: React.FC = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const isWorker = user?.role === 'worker';
  const title = isWorker ? 'My Reviews' : 'Submit Review';

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, [router]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1B2547" />
      <ReviewsHeader title={title} onBack={handleBack} />

      {isWorker && user?._id ? (
        <WorkerReviewsView workerId={user._id} />
      ) : (
        <OrganizerReviewView />
      )}
    </SafeAreaView>
  );
};

export default ReviewScreen;

// ─── Screen Styles ───

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
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
  successIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
});
