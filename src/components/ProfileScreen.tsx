import AddressAutocomplete from '@/components/AddressAutocomplete';
import { PlaceDetails } from '@/services/places';
import api, { isApiError } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { GeoPoint, User } from '@/types';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Icon, IconLabel, SkeletonDetail, Text, type IconName } from '@/components/ui';
import { colors, fonts, radius, spacing, type as typeScale } from '@/theme';

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
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.topBar}>
          <Text variant="h3" weight="semibold">Profile</Text>
        </View>
        <View style={styles.centered}>
          <Icon name="warning" size={40} color={colors.textFaint} />
          <Text variant="body" color={colors.textMuted} center style={styles.centeredCopy}>
            {error || 'Unable to load profile. Please try again.'}
          </Text>
          <Button label="Retry" onPress={handleRetry} fullWidth={false} size="md" />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render: Loading State ───

  if (isLoading && !profileUser) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.topBar}>
          <Text variant="h3" weight="semibold">Profile</Text>
        </View>
        <SkeletonDetail />
      </SafeAreaView>
    );
  }

  // ─── Render: Profile ───

  const displayUser = profileUser ?? user;
  const wp = workerProfile ?? displayUser?.workerProfile;
  const initial = displayUser?.name?.charAt(0)?.toUpperCase() ?? '?';

  /** A read-only label/value pair, or its editable counterpart. */
  const InfoRow = ({
    label,
    value,
    icon,
    iconColor,
    editing,
    onChangeText,
    placeholder,
    keyboardType,
  }: {
    label: string;
    value: string;
    /** Optional leading icon on the value line (e.g. a star beside a rating). */
    icon?: IconName;
    iconColor?: string;
    editing?: boolean;
    onChangeText?: (t: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'phone-pad';
  }) => (
    <View style={styles.infoRow}>
      <Text variant="caption" weight="medium" color={colors.textFaint} style={styles.infoLabel}>
        {label.toUpperCase()}
      </Text>
      {editing && onChangeText ? (
        <TextInput
          style={styles.inlineInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          keyboardType={keyboardType ?? 'default'}
        />
      ) : icon ? (
        <IconLabel
          icon={icon}
          iconColor={iconColor}
          color={colors.text}
          variant="body"
          weight="medium"
          size={15}
          label={value || '—'}
        />
      ) : (
        <Text variant="body" weight="medium">
          {value || '—'}
        </Text>
      )}
    </View>
  );

  /** Navigational row in the Figma "Personal Info" menu. */
  const MenuRow = ({
    icon,
    label,
    onPress,
  }: {
    icon: IconName;
    label: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={styles.menuRow}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
    >
      <View style={styles.menuIcon}>
        <Icon name={icon} size={17} color={colors.primary} />
      </View>
      <Text variant="body" style={styles.menuLabel}>
        {label}
      </Text>
      <Text style={styles.menuChevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <Text variant="h3" weight="semibold">
          Profile
        </Text>
        <TouchableOpacity
          onPress={isEditing ? cancelEditing : startEditing}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Text
            variant="bodySm"
            weight="semibold"
            color={isEditing ? colors.danger : colors.secondary}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Identity ── */}
        <View style={styles.identity}>
          <View style={styles.avatarWrap}>
            {wp?.profilePhoto ? (
              <Image source={{ uri: wp.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text variant="hero" weight="bold" color={colors.textOnPrimary}>
                  {initial}
                </Text>
              </View>
            )}

            {role === 'worker' ? (
              <TouchableOpacity
                style={styles.avatarBadge}
                onPress={handlePhotoUpload}
                disabled={isUploading}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Change photo"
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color={colors.textOnPrimary} />
                ) : (
                  <Icon name="rolePhoto" size={14} color={colors.textOnPrimary} />
                )}
              </TouchableOpacity>
            ) : null}
          </View>

          <Text variant="h2" weight="bold" style={styles.identityName}>
            {displayUser?.name ?? '—'}
          </Text>
          <Text variant="bodySm" color={colors.textMuted}>
            {displayUser?.email ?? ''}
          </Text>

          {photoError ? (
            <Text variant="caption" color={colors.danger} style={styles.photoError}>
              {photoError}
            </Text>
          ) : null}
        </View>

        {/* ── Banners ── */}
        {submitSuccess ? (
          <View style={[styles.banner, styles.bannerSuccess]}>
            <Text variant="bodySm" color={colors.success}>
              Profile updated successfully
            </Text>
          </View>
        ) : null}

        {submitError ? (
          <View style={[styles.banner, styles.bannerError]}>
            <Text variant="bodySm" color={colors.danger}>
              {submitError}
            </Text>
          </View>
        ) : null}

        {/* ── Personal info ── */}
        <View style={styles.sectionBar}>
          <Text variant="body" weight="semibold" color={colors.textOnPrimary}>
            Personal Info
          </Text>
        </View>

        <Card style={styles.card} padded={false}>
          <InfoRow
            label="Name"
            value={isEditing ? editName : displayUser?.name ?? ''}
            editing={isEditing}
            onChangeText={setEditName}
            placeholder="Enter name"
          />
          <View style={styles.divider} />
          <InfoRow label="Email" value={displayUser?.email ?? ''} />
          <View style={styles.divider} />
          <InfoRow
            label="Phone"
            value={isEditing ? editPhone : displayUser?.phone ?? ''}
            editing={isEditing}
            onChangeText={setEditPhone}
            placeholder="Enter phone"
            keyboardType="phone-pad"
          />
          <View style={styles.divider} />
          <InfoRow
            label="Role"
            value={
              displayUser?.role
                ? displayUser.role.charAt(0).toUpperCase() + displayUser.role.slice(1)
                : ''
            }
          />
        </Card>

        {/* ── Worker details ── */}
        {role === 'worker' && wp ? (
          <>
            <View style={styles.sectionBar}>
              <Text variant="body" weight="semibold" color={colors.textOnPrimary}>
                Worker Details
              </Text>
            </View>

            <Card style={styles.card} padded={false}>
              <InfoRow label="Skills" value={wp.skills?.length ? wp.skills.join(', ') : ''} />
              <View style={styles.divider} />
              <InfoRow label="Experience" value={wp.experienceLevel ?? ''} />
              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text variant="caption" weight="medium" color={colors.textFaint} style={styles.infoLabel}>
                  LOCATION
                </Text>
                {isEditing ? (
                  <View>
                    <AddressAutocomplete
                      onSelect={handlePlaceSelect}
                      placeholder="Search for your city"
                      citiesOnly
                      wrapperStyle={styles.autocompleteWrapper}
                      inputStyle={styles.autocompleteInput}
                      dropdownStyle={styles.autocompleteDropdown}
                      suggestionTextStyle={styles.autocompleteSuggestionText}
                      placeholderTextColor={colors.textFaint}
                    />
                    <View style={styles.locationRow}>
                      <TextInput
                        style={[styles.inlineInput, styles.locationInput]}
                        value={editCity}
                        onChangeText={setEditCity}
                        placeholder="City"
                        placeholderTextColor={colors.textFaint}
                      />
                      <TextInput
                        style={[styles.inlineInput, styles.locationInput]}
                        value={editState}
                        onChangeText={setEditState}
                        placeholder="State"
                        placeholderTextColor={colors.textFaint}
                      />
                    </View>
                  </View>
                ) : (
                  <Text variant="body" weight="medium">
                    {[wp.location?.city, wp.location?.state].filter(Boolean).join(', ') || '—'}
                  </Text>
                )}
              </View>

              <View style={styles.divider} />
              <InfoRow
                label="Rating"
                icon="star"
                iconColor={colors.secondary}
                value={`${wp.ratingAvg?.toFixed(1) ?? '0.0'} (${wp.ratingCount ?? 0} reviews)`}
              />
              <View style={styles.divider} />
              <InfoRow
                label="Total Earnings"
                value={`₹${wp.totalEarnings?.toLocaleString('en-IN') ?? '0'}`}
              />
            </Card>
          </>
        ) : null}

        {/* ── Organizer details ── */}
        {role === 'organizer' ? (
          <>
            <View style={styles.sectionBar}>
              <Text variant="body" weight="semibold" color={colors.textOnPrimary}>
                Organizer Details
              </Text>
            </View>

            <Card style={styles.card} padded={false}>
              <InfoRow
                label="Company"
                value={isEditing ? editCompanyName : displayUser?.organizerProfile?.companyName ?? ''}
                editing={isEditing}
                onChangeText={setEditCompanyName}
                placeholder="Company name"
              />
              <View style={styles.divider} />
              <InfoRow
                label="Rating"
                icon="star"
                iconColor={colors.secondary}
                value={`${displayUser?.organizerProfile?.ratingAvg?.toFixed(1) ?? '0.0'} (${
                  displayUser?.organizerProfile?.ratingCount ?? 0
                } reviews)`}
              />
            </Card>
          </>
        ) : null}

        {/* ── Quick links ── */}
        {!isEditing ? (
          <Card style={styles.card} padded={false}>
            <MenuRow
              icon="document"
              label={role === 'worker' ? 'My Applications' : 'My Events'}
              onPress={() =>
                router.push(role === 'worker' ? '/(worker)/applications' : '/(organizer)/events')
              }
            />
            <View style={styles.divider} />
            <MenuRow
              icon="wallet"
              label="Wallet"
              onPress={() =>
                router.push(role === 'worker' ? '/(worker)/wallet' : '/(organizer)/wallet')
              }
            />
          </Card>
        ) : null}

        {/* ── Actions ── */}
        {isEditing ? (
          <Button
            label="Save Changes"
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.action}
          />
        ) : (
          <Button
            label="Log Out"
            variant="outline"
            style={styles.action}
            onPress={async () => {
              const { logout } = useAuthStore.getState();
              await logout();
              router.replace('/(auth)/login');
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

// ─── Styles ───

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },

  scrollContent: { paddingBottom: spacing.xxxl },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    gap: spacing.md,
  },
  centeredCopy: { marginBottom: spacing.sm },
  bigGlyph: { fontSize: 40 },

  /* ── Identity ── */
  identity: { alignItems: 'center', paddingVertical: spacing.xl },
  avatarWrap: { marginBottom: spacing.md },
  avatar: { width: 104, height: 104, borderRadius: 52 },
  avatarFallback: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  avatarBadgeGlyph: { fontSize: 14 },
  identityName: { marginBottom: 2 },
  photoError: { marginTop: spacing.sm },

  /* ── Banners ── */
  banner: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  bannerSuccess: { backgroundColor: colors.successBg },
  bannerError: { backgroundColor: colors.dangerBg },

  /* ── Sections ── */
  sectionBar: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
  },
  card: { marginHorizontal: spacing.xl, marginTop: spacing.md },

  infoRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  infoLabel: { marginBottom: spacing.xs, letterSpacing: 0.6 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg },

  inlineInput: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body.fontSize,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  locationRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  locationInput: { flex: 1 },

  autocompleteWrapper: { marginBottom: spacing.xs },
  autocompleteInput: {
    fontFamily: fonts.bodyRegular,
    fontSize: typeScale.body.fontSize,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
  },
  autocompleteDropdown: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  autocompleteSuggestionText: {
    fontFamily: fonts.bodyRegular,
    fontSize: typeScale.bodySm.fontSize,
    color: colors.text,
  },

  /* ── Menu ── */
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuGlyph: { fontSize: 16 },
  menuLabel: { flex: 1 },
  menuChevron: { fontSize: 22, color: colors.textFaint, lineHeight: 24 },

  action: { marginHorizontal: spacing.xl, marginTop: spacing.xxl },
});
