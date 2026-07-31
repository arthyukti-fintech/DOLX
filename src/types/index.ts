// ─── Enums (matching backend constants.js exactly) ───

export type UserRole = 'worker' | 'organizer' | 'admin';

export type JobRole =
  | 'Event Helper'
  | 'Setup / Decoration Crew'
  | 'Catering Staff'
  | 'Photographer'
  | 'Videographer'
  | 'Brand Promoter'
  | 'Registration Staff'
  | 'Host / Anchor'
  | 'Security Staff'
  | 'Crowd Management';

export type EventCategory =
  | 'Wedding'
  | 'Corporate / Conference'
  | 'Concert / Music'
  | 'Exhibition / Trade Show'
  | 'Festival'
  | 'Sports Event'
  | 'Private Party'
  | 'Other';

export type EventStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export type JobStatus = 'open' | 'closed' | 'completed' | 'cancelled';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export type WorkStatus = 'assigned' | 'ongoing' | 'completed' | 'no_show';

export type PaymentStatus = 'pending' | 'held' | 'released' | 'refunded' | 'failed';

export type PayType = 'fixed' | 'hourly';

// ─── Core Models ───

// Mirrors the backend's GeoJSON Point storage - coordinates are [longitude, latitude]
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  workerProfile?: {
    skills: JobRole[];
    experienceLevel: 'Beginner' | 'Intermediate' | 'Expert';
    location: { city?: string; state?: string; coordinates?: GeoPoint };
    ratingAvg: number;
    ratingCount: number;
    totalEarnings: number;
    profilePhoto?: string;
  };
  organizerProfile?: {
    companyName?: string;
    ratingAvg: number;
    ratingCount: number;
  };
}

export interface Job {
  _id: string;
  event: Event | string;
  organizer: Pick<User, '_id' | 'name' | 'organizerProfile'> | string;
  role: JobRole;
  numberOfWorkers: number;
  filledCount: number;
  payRate: number;
  payType: PayType;
  shiftStart: string; // ISO datetime
  shiftEnd: string;
  status: JobStatus;
  createdAt: string;
  distanceKm?: number; // present only when browsing with lat/lng (proximity search)
}

export interface Event {
  _id: string;
  organizer: string;
  title: string;
  eventType: EventCategory;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location: { address?: string; city: string; state?: string; pincode?: string; coordinates: GeoPoint };
  status: EventStatus;
  createdAt: string;
}

export interface Application {
  _id: string;
  job: Job | string;
  event: Event | string;
  worker: User | string;
  organizer: string;
  status: ApplicationStatus;
  workStatus?: WorkStatus;
  createdAt: string;
  respondedAt?: string;
  completedAt?: string;
}

export interface Payment {
  _id: string;
  application: string;
  job: { _id: string; role: string } | string;
  event: { _id: string; title: string } | string;
  organizer: string;
  worker: string;
  amount: number;
  commissionPercent: number;
  commissionAmount: number;
  workerPayout: number;
  status: PaymentStatus;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  createdAt: string;
  escrowHeldAt?: string;
  releasedAt?: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface Review {
  _id: string;
  job: { _id: string; role: string };
  fromUser: { _id: string; name: string; organizerProfile?: { companyName?: string } };
  toUser: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// ─── Request/Response Shapes ───

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  companyName?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  secretKey: string;
  newPassword: string;
}

export interface CreateEventRequest {
  title: string;
  eventType: EventCategory;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location: { address?: string; city: string; state?: string; pincode?: string; coordinates: GeoPoint };
}

export interface CreateJobRequest {
  role: JobRole;
  numberOfWorkers: number;
  payRate: number;
  payType: PayType;
  shiftStart: string;
  shiftEnd: string;
}

export interface CreateReviewRequest {
  applicationId: string;
  rating: number;
  comment?: string;
}

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  paymentId: string;
}

export interface RazorpayCallback {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

// ─── API Response Types ───

export interface ApiError {
  code: string;           // e.g., 'AUTH_MISSING', 'NETWORK_ERROR', 'VALIDATION_ERROR'
  message: string;        // User-facing message
  url?: string;           // Original request URL
  status?: number;        // HTTP status code
  fieldErrors?: Record<string, string>; // Field-specific validation errors
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: { total: number; page: number; limit: number };
}

// ─── Pagination ───

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number };
}
