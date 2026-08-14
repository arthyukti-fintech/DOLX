import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/ui';
import { colors } from '../../theme';
import AddressAutocomplete from '../../components/AddressAutocomplete';
import api, { isApiError } from '../../services/api';
import { PlaceDetails } from '../../services/places';
import { useEventStore } from '../../stores/eventStore';
import {
    CreateJobRequest,
    EventCategory,
    GeoPoint,
    Job,
    JobRole,
    PayType,
} from '../../types';

// ─── Constants ───

const EVENT_CATEGORIES: EventCategory[] = [
  'Wedding',
  'Corporate / Conference',
  'Concert / Music',
  'Exhibition / Trade Show',
  'Festival',
  'Sports Event',
  'Private Party',
  'Other',
];

const JOB_ROLES: JobRole[] = [
  'Event Helper',
  'Setup / Decoration Crew',
  'Catering Staff',
  'Photographer',
  'Videographer',
  'Brand Promoter',
  'Registration Staff',
  'Host / Anchor',
  'Security Staff',
  'Crowd Management',
];

const PAY_TYPES: { label: string; value: PayType }[] = [
  { label: 'Fixed', value: 'fixed' },
  { label: 'Hourly', value: 'hourly' },
];

// ─── Types ───

type FieldErrors = Record<string, string>;

interface AddedJob {
  _id: string;
  role: JobRole;
  numberOfWorkers: number;
  payRate: number;
  payType: PayType;
  shiftStart: string;
  shiftEnd: string;
}

// ─── Component ───

export default function CreateEventScreen() {
  // Step management
  const [step, setStep] = useState<1 | 2>(1);
  const [eventId, setEventId] = useState<string>('');

  // Step 1: Event form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory | ''>('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [coordinates, setCoordinates] = useState<GeoPoint | null>(null);
  const [locatingCurrentPosition, setLocatingCurrentPosition] = useState(false);
  const [description, setDescription] = useState('');
  const [eventErrors, setEventErrors] = useState<FieldErrors>({});
  const [eventApiError, setEventApiError] = useState('');
  const [eventLoading, setEventLoading] = useState(false);

  // Step 2: Job form state
  const [jobRole, setJobRole] = useState<JobRole | ''>('');
  const [numberOfWorkers, setNumberOfWorkers] = useState('');
  const [payRate, setPayRate] = useState('');
  const [payType, setPayType] = useState<PayType | ''>('');
  const [shiftStart, setShiftStart] = useState('');
  const [shiftEnd, setShiftEnd] = useState('');
  const [jobErrors, setJobErrors] = useState<FieldErrors>({});
  const [jobApiError, setJobApiError] = useState('');
  const [jobLoading, setJobLoading] = useState(false);
  const [addedJobs, setAddedJobs] = useState<AddedJob[]>([]);
  const [jobSuccess, setJobSuccess] = useState('');

  const createEvent = useEventStore((s) => s.createEvent);

  // ─── Step 1: Validate Event Form ───

  const validateEvent = (): boolean => {
    const errors: FieldErrors = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!category) errors.category = 'Category is required';
    if (!date.trim()) errors.date = 'Date is required';
    if (!startTime.trim()) errors.startTime = 'Start time is required';
    if (!endTime.trim()) errors.endTime = 'End time is required';
    if (!city.trim()) errors.city = 'City is required';
    if (!address.trim()) errors.address = 'Address is required';
    if (!coordinates) errors.coordinates = 'Search for the address above so we can pin its location';
    setEventErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Maps this screen's local error keys to the flat/dotted keys the backend returns
  // (e.g. backend sends "location.address", this form tracks it as "address").
  const FIELD_ERROR_ALIASES: Record<string, string> = {
    'location.address': 'address',
    'location.city': 'city',
    'location.coordinates.coordinates': 'coordinates',
  };
  const KNOWN_EVENT_ERROR_KEYS = new Set([
    'title', 'category', 'date', 'startTime', 'endTime', 'city', 'address', 'coordinates',
  ]);

  // ─── Step 1: Submit Event ───

  const handleCreateEvent = async () => {
    setEventApiError('');
    if (!validateEvent()) return;

    setEventLoading(true);

    const result = await createEvent({
      title: title.trim(),
      eventType: category as EventCategory,
      date: date.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      description: description.trim() || undefined,
      location: {
        city: city.trim(),
        address: address.trim(),
        state: stateName.trim() || undefined,
        pincode: pincode.trim() || undefined,
        coordinates: coordinates as GeoPoint,
      },
    });

    setEventLoading(false);

    if (typeof result === 'string') {
      setEventId(result);
      setStep(2);
    } else if (result.fieldErrors) {
      // Remap to local keys where we have a matching field, and surface anything
      // unrecognized as a visible banner instead of letting it fail silently.
      const mapped: FieldErrors = {};
      const unmapped: string[] = [];
      Object.entries(result.fieldErrors).forEach(([key, msg]) => {
        const localKey = FIELD_ERROR_ALIASES[key] ?? key;
        if (KNOWN_EVENT_ERROR_KEYS.has(localKey)) {
          mapped[localKey] = msg;
        } else {
          unmapped.push(msg);
        }
      });
      setEventErrors(mapped);
      if (unmapped.length) setEventApiError(unmapped.join(' '));
    } else {
      setEventApiError(result.message);
    }
  };

  // ─── Step 2: Validate Job Form ───

  const validateJob = (): boolean => {
    const errors: FieldErrors = {};
    if (!jobRole) errors.role = 'Role is required';
    if (!numberOfWorkers.trim()) {
      errors.numberOfWorkers = 'Number of workers is required';
    } else {
      const num = parseInt(numberOfWorkers, 10);
      if (isNaN(num) || num < 1 || num > 100) {
        errors.numberOfWorkers = 'Must be between 1 and 100';
      }
    }
    if (!payRate.trim()) {
      errors.payRate = 'Pay rate is required';
    } else {
      const rate = parseFloat(payRate);
      if (isNaN(rate) || rate < 0) {
        errors.payRate = 'Pay rate must be 0 or greater';
      }
    }
    if (!payType) errors.payType = 'Pay type is required';
    if (!shiftStart.trim()) errors.shiftStart = 'Shift start is required';
    if (!shiftEnd.trim()) errors.shiftEnd = 'Shift end is required';
    setJobErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Step 2: Submit Job ───

  const handleAddJob = async () => {
    setJobApiError('');
    setJobSuccess('');
    if (!validateJob()) return;

    setJobLoading(true);

    const jobData: CreateJobRequest = {
      role: jobRole as JobRole,
      numberOfWorkers: parseInt(numberOfWorkers, 10),
      payRate: parseFloat(payRate),
      payType: payType as PayType,
      shiftStart: shiftStart.trim(),
      shiftEnd: shiftEnd.trim(),
    };

    const result = await api.post<{ job: Job }>(
      `/api/events/${eventId}/jobs`,
      jobData
    );

    setJobLoading(false);

    if (isApiError(result)) {
      if (result.fieldErrors) {
        setJobErrors(result.fieldErrors);
      } else {
        setJobApiError(result.message);
      }
      return;
    }

    const createdJob = result.data.job;
    setAddedJobs((prev) => [
      ...prev,
      {
        _id: createdJob._id,
        role: createdJob.role,
        numberOfWorkers: createdJob.numberOfWorkers,
        payRate: createdJob.payRate,
        payType: createdJob.payType,
        shiftStart: createdJob.shiftStart,
        shiftEnd: createdJob.shiftEnd,
      },
    ]);
    setJobSuccess(`${jobData.role} added successfully!`);
    resetJobForm();
  };

  const resetJobForm = () => {
    setJobRole('');
    setNumberOfWorkers('');
    setPayRate('');
    setPayType('');
    setShiftStart('');
    setShiftEnd('');
    setJobErrors({});
  };

  const handleDone = () => {
    router.replace('/(organizer)/events');
  };

  const clearEventError = (field: string) => {
    if (eventErrors[field]) {
      setEventErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePlaceSelect = (details: PlaceDetails) => {
    setCity(details.city);
    setAddress(details.address);
    if (details.state) setStateName(details.state);
    if (details.pincode) setPincode(details.pincode);
    setCoordinates({ type: 'Point', coordinates: [details.lng, details.lat] });
    clearEventError('city');
    clearEventError('address');
    clearEventError('coordinates');
  };

  // Fallback that doesn't require the Places API key - uses on-device GPS + reverse
  // geocoding (built into expo-location) to fill in the same fields as a place selection.
  const handleUseCurrentLocation = async () => {
    setLocatingCurrentPosition(true);
    setEventApiError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setEventApiError('Location permission denied. Enter the address manually instead.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;

      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (place?.city) setCity(place.city);
      if (place?.region) setStateName(place.region);
      if (place?.postalCode) setPincode(place.postalCode);

      // Street-level detail isn't always available from GPS reverse geocoding - fall back
      // to whatever's available so the required Address field never ends up empty.
      const addressLine = [place?.streetNumber, place?.street].filter(Boolean).join(' ');
      const fallbackAddress = [place?.name, place?.district, place?.city].filter(Boolean).join(', ');
      setAddress(addressLine || fallbackAddress || 'Current location');

      setCoordinates({ type: 'Point', coordinates: [longitude, latitude] });
      clearEventError('city');
      clearEventError('address');
      clearEventError('coordinates');
    } catch {
      setEventApiError('Could not get your current location. Enter the address manually instead.');
    } finally {
      setLocatingCurrentPosition(false);
    }
  };

  const clearJobError = (field: string) => {
    if (jobErrors[field]) {
      setJobErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // ─── Render Helpers ───

  const renderStepIndicator = () => (
    <View style={styles.stepRow}>
      <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
      <View style={styles.stepLine} />
      <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
    </View>
  );

  const renderSelector = <T extends string>(
    label: string,
    options: T[],
    value: T | '',
    onChange: (val: T) => void,
    errorKey: string,
    errors: FieldErrors
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, value === opt && styles.chipActive]}
            onPress={() => onChange(opt)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.chipText, value === opt && styles.chipTextActive]}
              numberOfLines={1}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {errors[errorKey] ? (
        <Text style={styles.errorText}>{errors[errorKey]}</Text>
      ) : null}
    </View>
  );

  // ─── Render: Step 1 (Event Form) ───

  const renderStep1 = () => (
    <ScrollView
      contentContainerStyle={styles.formContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.stepTitle}>Create Event</Text>
      <Text style={styles.stepSubtitle}>
        Fill in your event details to get started
      </Text>

      {eventApiError ? (
        <View style={styles.apiErrorBox}>
          <Text style={styles.apiErrorText}>{eventApiError}</Text>
        </View>
      ) : null}

      {/* Title */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Event Title</Text>
        <View style={[styles.inputWrapper, eventErrors.title && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Grand Wedding Reception"
            placeholderTextColor="#6B7280"
            value={title}
            onChangeText={(text) => { setTitle(text); clearEventError('title'); }}
            editable={!eventLoading}
          />
        </View>
        {eventErrors.title ? (
          <Text style={styles.errorText}>{eventErrors.title}</Text>
        ) : null}
      </View>

      {/* Category */}
      {renderSelector(
        'Category',
        EVENT_CATEGORIES,
        category,
        (val) => { setCategory(val); clearEventError('category'); },
        'category',
        eventErrors
      )}

      {/* Date */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Event Date</Text>
        <View style={[styles.inputWrapper, eventErrors.date && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#6B7280"
            value={date}
            onChangeText={(text) => { setDate(text); clearEventError('date'); }}
            editable={!eventLoading}
          />
        </View>
        {eventErrors.date ? (
          <Text style={styles.errorText}>{eventErrors.date}</Text>
        ) : null}
      </View>

      {/* Start / End Time */}
      <View style={styles.rowFields}>
        <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.fieldLabel}>Start Time</Text>
          <View style={[styles.inputWrapper, eventErrors.startTime && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10:00 AM"
              placeholderTextColor="#6B7280"
              value={startTime}
              onChangeText={(text) => { setStartTime(text); clearEventError('startTime'); }}
              editable={!eventLoading}
            />
          </View>
          {eventErrors.startTime ? (
            <Text style={styles.errorText}>{eventErrors.startTime}</Text>
          ) : null}
        </View>
        <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.fieldLabel}>End Time</Text>
          <View style={[styles.inputWrapper, eventErrors.endTime && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 6:00 PM"
              placeholderTextColor="#6B7280"
              value={endTime}
              onChangeText={(text) => { setEndTime(text); clearEventError('endTime'); }}
              editable={!eventLoading}
            />
          </View>
          {eventErrors.endTime ? (
            <Text style={styles.errorText}>{eventErrors.endTime}</Text>
          ) : null}
        </View>
      </View>

      {/* Search - fills city/address/state/pincode below in one shot */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Search Address</Text>
        <AddressAutocomplete onSelect={handlePlaceSelect} placeholder="Search for the venue address" />
        <TouchableOpacity
          style={styles.useLocationButton}
          onPress={handleUseCurrentLocation}
          activeOpacity={0.7}
          disabled={locatingCurrentPosition}
        >
          {locatingCurrentPosition ? (
            <ActivityIndicator size="small" color="#A5B4FC" />
          ) : (
            <View style={styles.useLocationRow}>
              <Icon name="location" size={14} color={colors.secondary} />
              <Text style={styles.useLocationButtonText}>Use my current location</Text>
            </View>
          )}
        </TouchableOpacity>
        {eventErrors.coordinates ? (
          <Text style={styles.errorText}>{eventErrors.coordinates}</Text>
        ) : null}
      </View>

      {/* City */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>City *</Text>
        <View style={[styles.inputWrapper, eventErrors.city && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Mumbai"
            placeholderTextColor="#6B7280"
            value={city}
            onChangeText={(text) => { setCity(text); clearEventError('city'); }}
            editable={!eventLoading}
          />
        </View>
        {eventErrors.city ? (
          <Text style={styles.errorText}>{eventErrors.city}</Text>
        ) : null}
      </View>

      {/* Address */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Address *</Text>
        <View style={[styles.inputWrapper, eventErrors.address && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="e.g. 123 Event Hall, Main Road"
            placeholderTextColor="#6B7280"
            value={address}
            onChangeText={(text) => { setAddress(text); clearEventError('address'); }}
            editable={!eventLoading}
          />
        </View>
        {eventErrors.address ? (
          <Text style={styles.errorText}>{eventErrors.address}</Text>
        ) : null}
      </View>

      {/* State & Pincode */}
      <View style={styles.rowFields}>
        <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.fieldLabel}>State (optional)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Maharashtra"
              placeholderTextColor="#6B7280"
              value={stateName}
              onChangeText={setStateName}
              editable={!eventLoading}
            />
          </View>
        </View>
        <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.fieldLabel}>Pincode (optional)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 400001"
              placeholderTextColor="#6B7280"
              keyboardType="number-pad"
              value={pincode}
              onChangeText={setPincode}
              maxLength={6}
              editable={!eventLoading}
            />
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Description (optional)</Text>
        <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start' }]}>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
            placeholder="Describe your event..."
            placeholderTextColor="#6B7280"
            value={description}
            onChangeText={setDescription}
            multiline
            editable={!eventLoading}
          />
        </View>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.primaryButton, eventLoading && styles.buttonDisabled]}
        onPress={handleCreateEvent}
        disabled={eventLoading}
        activeOpacity={0.85}
      >
        {eventLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>Create Event & Add Jobs</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  // ─── Render: Job Card ───

  const renderJobCard = ({ item }: { item: AddedJob }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobCardHeader}>
        <Text style={styles.jobCardRole}>{item.role}</Text>
        <Text style={styles.jobCardPay}>
          ₹{item.payRate} / {item.payType}
        </Text>
      </View>
      <View style={styles.jobCardDetails}>
        <View style={styles.jobCardDetailRow}>
          <Icon name="people" size={13} color={colors.textMuted} />
          <Text style={styles.jobCardDetail}>
            {item.numberOfWorkers} worker{item.numberOfWorkers > 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.jobCardDetailRow}>
          <Icon name="clock" size={13} color={colors.textMuted} />
          <Text style={styles.jobCardDetail}>
            {item.shiftStart} – {item.shiftEnd}
          </Text>
        </View>
      </View>
    </View>
  );

  // ─── Render: Step 2 (Add Jobs) ───

  const renderStep2 = () => (
    <ScrollView
      contentContainerStyle={styles.formContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.stepTitle}>Add Jobs</Text>
      <Text style={styles.stepSubtitle}>
        Add roles you need for your event
      </Text>

      {jobApiError ? (
        <View style={styles.apiErrorBox}>
          <Text style={styles.apiErrorText}>{jobApiError}</Text>
        </View>
      ) : null}

      {jobSuccess ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{jobSuccess}</Text>
        </View>
      ) : null}

      {/* Added Jobs List */}
      {addedJobs.length > 0 ? (
        <View style={styles.addedJobsSection}>
          <Text style={styles.addedJobsTitle}>
            Added Jobs ({addedJobs.length})
          </Text>
          <FlatList
            data={addedJobs}
            keyExtractor={(item) => item._id}
            renderItem={renderJobCard}
            scrollEnabled={false}
          />
        </View>
      ) : null}

      {/* Job Role */}
      {renderSelector(
        'Role',
        JOB_ROLES,
        jobRole,
        (val) => { setJobRole(val); clearJobError('role'); },
        'role',
        jobErrors
      )}

      {/* Workers & Pay Rate */}
      <View style={styles.rowFields}>
        <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.fieldLabel}>Workers (1-100)</Text>
          <View style={[styles.inputWrapper, jobErrors.numberOfWorkers && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5"
              placeholderTextColor="#6B7280"
              keyboardType="number-pad"
              value={numberOfWorkers}
              onChangeText={(text) => { setNumberOfWorkers(text); clearJobError('numberOfWorkers'); }}
              editable={!jobLoading}
            />
          </View>
          {jobErrors.numberOfWorkers ? (
            <Text style={styles.errorText}>{jobErrors.numberOfWorkers}</Text>
          ) : null}
        </View>
        <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.fieldLabel}>Pay Rate (₹)</Text>
          <View style={[styles.inputWrapper, jobErrors.payRate && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 500"
              placeholderTextColor="#6B7280"
              keyboardType="decimal-pad"
              value={payRate}
              onChangeText={(text) => { setPayRate(text); clearJobError('payRate'); }}
              editable={!jobLoading}
            />
          </View>
          {jobErrors.payRate ? (
            <Text style={styles.errorText}>{jobErrors.payRate}</Text>
          ) : null}
        </View>
      </View>

      {/* Pay Type */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Pay Type</Text>
        <View style={styles.payTypeRow}>
          {PAY_TYPES.map((pt) => (
            <TouchableOpacity
              key={pt.value}
              style={[styles.payTypeOption, payType === pt.value && styles.payTypeOptionActive]}
              onPress={() => { setPayType(pt.value); clearJobError('payType'); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.payTypeText, payType === pt.value && styles.payTypeTextActive]}>
                {pt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {jobErrors.payType ? (
          <Text style={styles.errorText}>{jobErrors.payType}</Text>
        ) : null}
      </View>

      {/* Shift Start & End */}
      <View style={styles.rowFields}>
        <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.fieldLabel}>Shift Start</Text>
          <View style={[styles.inputWrapper, jobErrors.shiftStart && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="2025-03-15T09:00"
              placeholderTextColor="#6B7280"
              value={shiftStart}
              onChangeText={(text) => { setShiftStart(text); clearJobError('shiftStart'); }}
              editable={!jobLoading}
            />
          </View>
          {jobErrors.shiftStart ? (
            <Text style={styles.errorText}>{jobErrors.shiftStart}</Text>
          ) : null}
        </View>
        <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.fieldLabel}>Shift End</Text>
          <View style={[styles.inputWrapper, jobErrors.shiftEnd && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="2025-03-15T18:00"
              placeholderTextColor="#6B7280"
              value={shiftEnd}
              onChangeText={(text) => { setShiftEnd(text); clearJobError('shiftEnd'); }}
              editable={!jobLoading}
            />
          </View>
          {jobErrors.shiftEnd ? (
            <Text style={styles.errorText}>{jobErrors.shiftEnd}</Text>
          ) : null}
        </View>
      </View>

      {/* Add Job Button */}
      <TouchableOpacity
        style={[styles.secondaryButton, jobLoading && styles.buttonDisabled]}
        onPress={handleAddJob}
        disabled={jobLoading}
        activeOpacity={0.85}
      >
        {jobLoading ? (
          <ActivityIndicator color="#A5B4FC" size="small" />
        ) : (
          <Text style={styles.secondaryButtonText}>+ Add Job</Text>
        )}
      </TouchableOpacity>

      {/* Done Button */}
      <TouchableOpacity
        style={[styles.primaryButton, { marginTop: 16 }]}
        onPress={handleDone}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ─── Main Render ───

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Icon name="back" size={18} color={colors.textOnPrimary} />
          </TouchableOpacity>
          {renderStepIndicator()}
          <View style={{ width: 36 }} />
        </View>

        {/* Content */}
        {step === 1 ? renderStep1() : renderStep2()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 20, color: colors.textOnPrimary, lineHeight: 24 },

  /* Step Indicator */
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepLine: { width: 40, height: 2, backgroundColor: colors.border },

  /* Form content */
  formContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  stepTitle: { fontSize: 24, fontWeight: '700', color: colors.textOnPrimary, marginBottom: 4 },
  stepSubtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 24 },

  /* Error/Success boxes */
  apiErrorBox: {
    backgroundColor: colors.dangerBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.dangerBg,
  },
  apiErrorText: { fontSize: 13, color: colors.danger },
  successBox: {
    backgroundColor: colors.successBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.success,
  },
  successText: { fontSize: 13, color: colors.success },

  /* Field containers */
  fieldContainer: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '500', color: colors.textMuted, marginBottom: 8 },
  rowFields: { flexDirection: 'row' },

  /* Inputs */
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
  },
  inputError: { borderColor: colors.danger },
  input: { flex: 1, fontSize: 14, color: colors.textOnPrimary },
  errorText: { fontSize: 12, color: colors.danger, marginTop: 4, marginLeft: 4 },
  useLocationButton: { alignSelf: 'flex-start', marginTop: 8, paddingVertical: 4 },
  useLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  useLocationButtonText: { fontSize: 13, color: colors.secondary, fontWeight: '600' },

  /* Chips */
  chipRow: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.surface },
  chipText: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  chipTextActive: { color: colors.secondary },

  /* Pay type toggle */
  payTypeRow: { flexDirection: 'row', gap: 12 },
  payTypeOption: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payTypeOptionActive: { borderColor: colors.primary, backgroundColor: colors.surface },
  payTypeText: { fontSize: 14, fontWeight: '500', color: colors.textMuted },
  payTypeTextActive: { color: colors.secondary },

  /* Buttons */
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  primaryButtonText: { color: colors.textOnPrimary, fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
  secondaryButton: {
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: { color: colors.secondary, fontSize: 15, fontWeight: '600' },
  buttonDisabled: { opacity: 0.7 },

  /* Added Jobs section */
  addedJobsSection: { marginBottom: 20 },
  addedJobsTitle: { fontSize: 14, fontWeight: '600', color: colors.textOnPrimary, marginBottom: 10 },
  jobCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobCardRole: { fontSize: 14, fontWeight: '600', color: colors.textOnPrimary, flex: 1 },
  jobCardPay: { fontSize: 13, color: colors.secondary, fontWeight: '500' },
  jobCardDetails: { flexDirection: 'row', gap: 16 },
  jobCardDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  jobCardDetail: { fontSize: 12, color: colors.textMuted },
});
