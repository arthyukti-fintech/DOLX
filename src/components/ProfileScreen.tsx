import AddressAutocomplete from '@/components/AddressAutocomplete';
import { PlaceDetails } from '@/services/places';
import api, { isApiError } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { GeoPoint, User } from '@/types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// ─── Constants ───

const FETCH_TIMEOUT_MS = 15_000;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png'];

// ─── Types ───

interface WorkerProfileData {
  skills: string[];
  experienceLevel: string;
  location: { city?: string; state?: string; coordinates?: GeoPoint };
  ratingAvg: number;
  ratingCount: number;
  totalEarnings: number;
  profilePhoto?: string;
}

interface ProfileScreenProps {
  role: 'worker' | 'organizer';
}

// ─── Main Component ───

const ProfileScreen: React.FC<ProfileScreenProps> = ({ role }) => {
  const { user, updateProfile } = useAuthStore();

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Profile data
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfileData | null>(null);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editCoordinates, setEditCoordinates] = useState<GeoPoint | null>(null);
  const [editCompanyName, setEditCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Photo upload
  const [isUploading, setIsUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // ─── Data Fetching ───

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setTimedOut(false);

    // Set up 15s timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
    }, FETCH_TIMEOUT_MS);

    try {
      // Fetch user from /api/auth/me
      const meResult = await api.get<{ user: User }>('/api/auth/me');

      if (isApiError(meResult)) {
        setError(meResult.message);
        setIsLoading(false);
        return;
      }

      const fetchedUser = meResult.data.user;
      setProfileUser(fetchedUser);
      updateProfile(fetchedUser);

      // Worker: additionally fetch worker profile
      if (role === 'worker') {
        const workerResult = await api.get<{ profile: WorkerProfileData }>('/api/workers/profile');

        if (isApiError(workerResult)) {
          // Still show basic profile even if worker details fail
          setWorkerProfile(fetchedUser.workerProfile ?? null);
        } else {
          setWorkerProfile(workerResult.data.profile);
        }
      }

      setIsLoading(false);
    } catch {
      setError('Unable to load profile. Please try again.');
      setIsLoading(false);
    }
  }, [role, updateProfile]);

  useEffect(() => {
    fetchProfile();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchProfile]);

  // Clear timeout when loading finishes
  useEffect(() => {
    if (!isLoading && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [isLoading]);

  // ─── Edit Mode ───

  const startEditing = useCallback(() => {
    setEditName(profileUser?.name ?? '');
    setEditPhone(profileUser?.phone ?? '');
    setSubmitSuccess(false);
    setSubmitError(null);

    if (role === 'worker') {
      const wp = workerProfile ?? profileUser?.workerProfile;
      setEditCity(wp?.location?.city ?? '');
      setEditState(wp?.location?.state ?? '');
      setEditCoordinates(wp?.location?.coordinates ?? null);
    } else {
      setEditCompanyName(profileUser?.organizerProfile?.companyName ?? '');
    }

    setIsEditing(true);
  }, [profileUser, workerProfile, role]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

  const handlePlaceSelect = useCallback((details: PlaceDetails) => {
    setEditCity(details.city);
    if (details.state) setEditState(details.state);
    setEditCoordinates({ type: 'Point', coordinates: [details.lng, details.lat] });
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const endpoint =
      role === 'worker' ? '/api/workers/profile' : '/api/organizers/profile';

    const body: Record<string, unknown> =
      role === 'worker'
        ? {
            name: editName,
            phone: editPhone,
            location: {
              city: editCity,
              state: editState,
              ...(editCoordinates ? { coordinates: editCoordinates } : {}),
            },
          }
        : {
            name: editName,
            phone: editPhone,
            companyName: editCompanyName,
          };

    const result = await api.put<{ user: User }>(endpoint, body);

    setIsSubmitting(false);

    if (isApiError(result)) {
      setSubmitError(result.message);
      return;
    }

    // Update local state
    if (result.data.user) {
      setProfileUser(result.data.user);
      updateProfile(result.data.user);
    }

    setSubmitSuccess(true);
    setIsEditing(false);
  }, [role, editName, editPhone, editCity, editState, editCoordinates, editCompanyName, updateProfile]);

  // ─── Photo Upload ───

  const handlePhotoUpload = useCallback(async () => {
    setPhotoError(null);

    try {
      // Dynamic import to avoid issues on platforms without expo-image-picker
      const ImagePicker = await import('expo-image-picker');

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        setPhotoError('Permission to access photos was denied.');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (pickerResult.canceled || !pickerResult.assets?.length) {
        return;
      }

      const asset = pickerResult.assets[0];
      const uri = asset.uri;
      const fileSize = asset.fileSize ?? 0;
      const mimeType = asset.mimeType ?? '';

      // Client-side validation: file size
      if (fileSize > MAX_PHOTO_SIZE) {
        setPhotoError('Photo must be less than 5 MB.');
        return;
      }

      // Client-side validation: file type
      if (!ALLOWED_PHOTO_TYPES.includes(mimeType)) {
        // Fallback: check file extension if mimeType is missing
        const ext = uri.split('.').pop()?.toLowerCase();
        if (ext !== 'jpg' && ext !== 'jpeg' && ext !== 'png') {
          setPhotoError('Only JPEG or PNG photos are allowed.');
          return;
        }
      }

      // Build FormData for upload
      setIsUploading(true);

      const formData = new FormData();
      const filename = uri.split('/').pop() ?? 'photo.jpg';
      const type = mimeType || (filename.endsWith('.png') ? 'image/png' : 'image/jpeg');

      formData.append('photo', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename,
        type,
      } as any);

      const uploadResult = await api.upload<{ profilePhoto: string }>(
        '/api/workers/profile/photo',
        formData
      );

      setIsUploading(false);

      if (isApiError(uploadResult)) {
        setPhotoError(uploadResult.message);
        return;
      }

      // Update local profile photo
      if (workerProfile) {
        setWorkerProfile({ ...workerProfile, profilePhoto: uploadResult.data.profilePhoto });
      }
    } catch {
      setIsUploading(false);
      setPhotoError('Failed to upload photo. Please try again.');
    }
  }, [workerProfile]);

  // ─── Retry Handler ───

  const handleRetry = useCallback(() => {
    setTimedOut(false);
    fetchProfile();
  }, [fetchProfile]);

  // ─── Render: Error State ───

  const showError = error || (timedOut && isLoading);

  if (showError && !profileUser) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#1B2547" />
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorMessage}>
            {error || 'Unable to load profile. Please try again.'}
          </Text>
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

  // ─── Render: Loading State ───

  if (isLoading && !profileUser) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#1B2547" />
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B2547" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render: Profile Content ───

  const displayUser = profileUser ?? user;
  const wp = workerProfile ?? displayUser?.workerProfile;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1B2547" />

      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Profile</Text>
        {!isEditing && (
          <TouchableOpacity onPress={startEditing} activeOpacity={0.7}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        )}
        {isEditing && (
          <TouchableOpacity onPress={cancelEditing} activeOpacity={0.7}>
            <Text style={styles.cancelLink}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Photo (Worker) */}
        {role === 'worker' && (
          <View style={styles.photoSection}>
            <View style={styles.avatarContainer}>
              {wp?.profilePhoto ? (
                <Image source={{ uri: wp.profilePhoto }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {displayUser?.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePhotoUpload}
              disabled={isUploading}
              activeOpacity={0.7}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#1B2547" />
              ) : (
                <Text style={styles.uploadButtonText}>Change Photo</Text>
              )}
            </TouchableOpacity>

            {photoError && (
              <Text style={styles.photoErrorText}>{photoError}</Text>
            )}
          </View>
        )}

        {/* Organizer Photo placeholder */}
        {role === 'organizer' && (
          <View style={styles.photoSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {displayUser?.name?.charAt(0)?.toUpperCase() ?? '?'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Success Message */}
        {submitSuccess && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>Profile updated successfully!</Text>
          </View>
        )}

        {/* Submit Error */}
        {submitError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{submitError}</Text>
          </View>
        )}

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter name"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.fieldValue}>{displayUser?.name ?? '—'}</Text>
            )}
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>{displayUser?.email ?? '—'}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Enter phone"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>{displayUser?.phone ?? '—'}</Text>
            )}
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Role</Text>
            <Text style={styles.fieldValue}>
              {displayUser?.role
                ? displayUser.role.charAt(0).toUpperCase() + displayUser.role.slice(1)
                : '—'}
            </Text>
          </View>
        </View>

        {/* Worker-specific section */}
        {role === 'worker' && wp && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Worker Details</Text>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Skills</Text>
              <Text style={styles.fieldValue}>
                {wp.skills?.length ? wp.skills.join(', ') : '—'}
              </Text>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Experience</Text>
              <Text style={styles.fieldValue}>{wp.experienceLevel ?? '—'}</Text>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Location</Text>
              {isEditing ? (
                <View style={{ flex: 1 }}>
                  <AddressAutocomplete
                    onSelect={handlePlaceSelect}
                    placeholder="Search for your city"
                    citiesOnly
                    wrapperStyle={styles.autocompleteWrapper}
                    inputStyle={styles.autocompleteInput}
                    dropdownStyle={styles.autocompleteDropdown}
                    suggestionTextStyle={styles.autocompleteSuggestionText}
                    placeholderTextColor="#999"
                  />
                  <View style={styles.locationRow}>
                    <TextInput
                      style={[styles.input, styles.locationInput]}
                      value={editCity}
                      onChangeText={setEditCity}
                      placeholder="City"
                      placeholderTextColor="#999"
                    />
                    <TextInput
                      style={[styles.input, styles.locationInput]}
                      value={editState}
                      onChangeText={setEditState}
                      placeholder="State"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              ) : (
                <Text style={styles.fieldValue}>
                  {[wp.location?.city, wp.location?.state].filter(Boolean).join(', ') || '—'}
                </Text>
              )}
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Rating</Text>
              <Text style={styles.fieldValue}>
                ⭐ {wp.ratingAvg?.toFixed(1) ?? '0.0'} ({wp.ratingCount ?? 0} reviews)
              </Text>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Total Earnings</Text>
              <Text style={styles.fieldValue}>₹{wp.totalEarnings?.toLocaleString('en-IN') ?? '0'}</Text>
            </View>
          </View>
        )}

        {/* Organizer-specific section */}
        {role === 'organizer' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organizer Details</Text>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Company</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editCompanyName}
                  onChangeText={setEditCompanyName}
                  placeholder="Company name"
                  placeholderTextColor="#999"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {displayUser?.organizerProfile?.companyName ?? '—'}
                </Text>
              )}
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Rating</Text>
              <Text style={styles.fieldValue}>
                ⭐ {displayUser?.organizerProfile?.ratingAvg?.toFixed(1) ?? '0.0'} (
                {displayUser?.organizerProfile?.ratingCount ?? 0} reviews)
              </Text>
            </View>
          </View>
        )}

        {/* Submit Button (Edit Mode) */}
        {isEditing && (
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Logout */}
        {!isEditing && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              const { logout } = useAuthStore.getState();
              logout();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

// ─── Styles ───

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    backgroundColor: '#1B2547',
    paddingTop: 16,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  editLink: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelLink: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Photo Section
  photoSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8EAF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1B2547',
  },
  uploadButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1B2547',
  },
  uploadButtonText: {
    color: '#1B2547',
    fontSize: 13,
    fontWeight: '600',
  },
  photoErrorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },

  // Success/Error Banners
  successBanner: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  successText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  errorBannerText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Section
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#F8F9FC',
    borderRadius: 14,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B2547',
    marginBottom: 16,
  },

  // Field Rows
  fieldRow: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: 15,
    color: '#222222',
    fontWeight: '500',
  },

  // Inputs
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222222',
  },
  locationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  locationInput: {
    flex: 1,
  },
  autocompleteWrapper: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDD',
    marginBottom: 8,
  },
  autocompleteInput: {
    color: '#222222',
  },
  autocompleteDropdown: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDD',
  },
  autocompleteSuggestionText: {
    color: '#222222',
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#1B2547',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Logout
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },

  // Loading
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

  // Error
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
});
