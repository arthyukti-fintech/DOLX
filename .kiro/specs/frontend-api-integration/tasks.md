# Implementation Plan: Frontend API Integration

## Overview

This plan transforms the DOLX React Native/Expo app from a static UI prototype into a fully functional event staffing platform. Tasks are organized to build foundational layers first (types, services, stores), then connect screens, and finally wire everything together with navigation guards. Each task builds incrementally on previous work so there is no orphaned code.

## Tasks

- [x] 1. Install dependencies and set up project structure
  - [x] 1.1 Install required dependencies and configure project
    - Run: `npx expo install expo-secure-store`
    - Run: `npm install axios zustand react-native-razorpay`
    - Run: `npm install --save-dev jest @testing-library/react-native fast-check msw @types/jest`
    - Add Jest config to package.json or jest.config.ts
    - Create directory structure: `src/services/`, `src/stores/`, `src/types/`, `src/hooks/`
    - _Requirements: 1.1, 1.5_

  - [x] 1.2 Create shared TypeScript type definitions
    - Create `src/types/index.ts` with all interfaces: User, Job, Event, Application, Payment, Notification, Review
    - Include enums: UserRole, JobRole, EventCategory, EventStatus, JobStatus, ApplicationStatus, WorkStatus, PaymentStatus, PayType
    - Include request/response shapes: LoginRequest, RegisterRequest, CreateEventRequest, CreateJobRequest, CreateReviewRequest, RazorpayOrder, RazorpayCallback
    - Include ApiError, ApiResponse, and PaginatedResponse interfaces
    - _Requirements: 1.4, 1.5_

- [x] 2. Implement API service layer and token management
  - [x] 2.1 Implement token manager with expo-secure-store
    - Create `src/services/tokenManager.ts`
    - Implement getToken(): Promise<string | null> — reads JWT from expo-secure-store
    - Implement setToken(token: string): Promise<void> — persists JWT to expo-secure-store
    - Implement clearToken(): Promise<void> — removes JWT from expo-secure-store
    - _Requirements: 1.1, 2.1_

  - [x] 2.2 Implement API service with Axios interceptors
    - Create `src/services/api.ts`
    - Create Axios instance with base URL from environment config (throw if missing)
    - Add request interceptor: attach Bearer token from tokenManager if available, reject with AUTH_MISSING if not
    - Add response interceptor: on 401 clear token and return AUTH_EXPIRED error; normalize network/timeout errors with code, message, and URL
    - Implement typed get, post, put, delete, and upload methods returning ApiResponse<T> | ApiError
    - Set request timeout to 30 seconds
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ]* 2.3 Write property tests for API service (Properties 1-4)
    - **Property 1: Token attachment on authenticated requests** — For any request with a stored token, verify Authorization header contains `Bearer {token}`
    - **Property 2: Unauthenticated request rejection** — For any request without a stored token, verify no HTTP call is made and AUTH_MISSING error is returned
    - **Property 3: Token clearance on 401 response** — For any 401 response, verify token is cleared from storage
    - **Property 4: Network error normalization** — For any network/timeout failure, verify error contains code, message, and URL
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [x] 3. Implement authentication store and session management
  - [x] 3.1 Implement Zustand auth store
    - Create `src/stores/authStore.ts`
    - Implement login(email, password): call POST /api/auth/login, persist token via tokenManager, store user profile in state, return null on success or ApiError on failure
    - Implement register(data): call POST /api/auth/register, persist token, store user, return null or ApiError
    - Implement logout(): clear token via tokenManager, reset user state to null
    - Implement restoreSession(): read token from storage, call GET /api/auth/me, restore user or clear token on failure
    - Expose isAuthenticated, isLoading, user, and user.role
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 3.2 Write property test for auth state round-trip (Property 5)
    - **Property 5: Auth state round-trip persistence** — For any valid user profile and token from login, verify getToken() returns the same token and store user matches profile data
    - **Validates: Requirements 2.1**

- [x] 4. Implement login and registration screens
  - [x] 4.1 Implement login screen with API integration
    - Create `src/app/(auth)/login.tsx`
    - Build form with phone and password inputs
    - Add client-side validation: reject empty phone or empty password with inline error (no API call)
    - On submit: disable button, show loading, call authStore.login(), handle success (navigate to home) or error (show inline message, re-enable button)
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 3.7_

  - [x] 4.2 Implement signup screen with API integration
    - Create `src/app/(auth)/signup.tsx`
    - Build form with name, email, phone, password, and role picker inputs
    - Add client-side validation: reject empty required fields or phone not exactly 10 digits with field-specific inline errors (no API call)
    - On submit: disable button, show loading, call authStore.register(), handle success or show field-specific backend errors
    - _Requirements: 3.4, 3.5, 3.6, 3.8_

  - [ ]* 4.3 Write property tests for form validation (Properties 6-7)
    - **Property 6: Login form empty-field validation** — For any empty/whitespace phone or password, verify validation error without API call
    - **Property 7: Registration form input validation** — For any missing required field or invalid phone length, verify field-specific validation error without API call
    - **Validates: Requirements 3.7, 3.8**

- [x] 5. Checkpoint - Core auth flow
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement job store and job browsing screen
  - [x] 6.1 Implement Zustand job store
    - Create `src/stores/jobStore.ts`
    - Implement fetchJobs(reset?): call GET /api/jobs with page, limit, and filter params; append results on pagination or replace on reset
    - Implement fetchJobById(id): call GET /api/jobs/:id, store as currentJob
    - Implement setFilter/clearFilters: update filter state and trigger re-fetch from page 1
    - Track jobs[], currentJob, page, hasMore, isLoading, error, filters
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 6.2 Implement useDebounce and useInfiniteScroll hooks
    - Create `src/hooks/useDebounce.ts` — debounce value by 300ms for search input
    - Create `src/hooks/useInfiniteScroll.ts` — trigger callback when scroll position is within 200px of bottom
    - _Requirements: 5.2, 5.4_

  - [x] 6.3 Implement Job Browser screen
    - Create `src/app/(worker)/jobs.tsx`
    - Display paginated job list using jobStore; each card shows role, pay rate (₹), pay type, shift start/end, event name
    - Add role filter dropdown (10 defined job roles); on selection re-fetch from page 1
    - Add search text input with 300ms debounce; filter loaded jobs client-side by role or event name (case-insensitive)
    - Implement infinite scroll: fetch next page when within 200px of bottom; show end-of-list indicator when no more pages
    - Handle loading (spinner), error (message + retry button), and empty states
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 6.4 Write property tests for job browsing (Properties 8-9)
    - **Property 8: Infinite scroll pagination appends without duplicates** — For any sequence of paginated fetches, verify combined list has no duplicate job IDs
    - **Property 9: Client-side search filter correctness** — For any job list and search string, verify filtered results match case-insensitive substring criteria
    - **Validates: Requirements 5.2, 5.4**

- [x] 7. Implement job detail and application flow
  - [x] 7.1 Implement Job Detail screen
    - Create `src/app/job/[id].tsx`
    - Fetch job from GET /api/jobs/:id on mount; display role, pay rate, pay type, shift start/end, numberOfWorkers, filledCount, event title/date/location/category
    - Show Apply button when status="open" AND filledCount < numberOfWorkers AND user has not applied
    - Show disabled "Applied" button when user has applied
    - Show "Positions Filled" label when filledCount >= numberOfWorkers
    - Handle loading, error + retry states
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 7.2 Implement job application submission
    - On Apply button tap: send POST /api/applications/jobs/:jobId/apply
    - Disable button and show loading during request
    - On success: show confirmation message, switch to "Applied" disabled state
    - On error (duplicate/full): show inline error, re-enable button
    - On network error: show connectivity error, re-enable button
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 7.3 Implement My Applications screen
    - Create `src/app/(worker)/applications.tsx`
    - Fetch from GET /api/workers/applications; display each application with role name, event name, shift date, status (pending/accepted/rejected/cancelled), and date applied
    - Handle empty state with "No applications submitted" message
    - _Requirements: 7.6, 7.7_

  - [ ]* 7.4 Write property test for Apply button state (Property 10)
    - **Property 10: Apply button state determinism** — For any combination of job status, filledCount, numberOfWorkers, and user application status, verify correct button state (enabled/disabled/hidden)
    - **Validates: Requirements 6.4, 6.5, 6.6**

- [x] 8. Implement event store and event creation flow
  - [x] 8.1 Implement Zustand event store
    - Create `src/stores/eventStore.ts`
    - Implement createEvent(data): POST /api/events, return event ID or ApiError
    - Implement fetchMyEvents(): GET /api/events, store events list
    - Implement fetchEventById(id): GET /api/events/:id, store currentEvent with attached jobs
    - Implement completeEvent(id): PUT /api/events/:id/complete, update status
    - Track events[], currentEvent, isLoading, error
    - _Requirements: 8.1, 14.1, 14.4_

  - [x] 8.2 Implement Event Creation flow screens
    - Create `src/app/(organizer)/create-event.tsx`
    - Step 1: Event form (title, category, date, location, description) → POST /api/events
    - Step 2: Add jobs form (role, numberOfWorkers 1-100, payRate ≥0, payType, shiftStart, shiftEnd) → POST /api/events/:eventId/jobs
    - Allow adding multiple jobs; show list of added jobs
    - "Done" button navigates to My Events
    - Handle validation errors inline, disable submit during loading
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 9. Implement applicant management screen
  - [x] 9.1 Implement Applicant Manager screen
    - Create `src/app/event/[eventId]/job/[jobId]/applicants.tsx`
    - Fetch applicants from GET /api/jobs/:id/applicants
    - Display each applicant: name, skills, experience level, rating average, application status
    - Accept button: PUT /api/applications/:id/accept → update status to "accepted" optimistically, revert on failure
    - Reject button: PUT /api/applications/:id/reject → update status to "rejected" optimistically, revert on failure
    - When filledCount equals numberOfWorkers: disable Accept on remaining pending applicants, show "Positions Filled"
    - Handle loading and error + retry states
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 10. Checkpoint - Core features complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement payment store and wallet/payment screens
  - [x] 11.1 Implement Zustand payment store
    - Create `src/stores/paymentStore.ts`
    - Implement fetchTransactions(): GET /api/payments/my
    - Implement fundEscrow(paymentId): POST /api/payments/:id/fund → return RazorpayOrder or ApiError
    - Implement confirmEscrow(paymentId, razorpayData): POST /api/payments/:id/confirm
    - Implement releasePayment(paymentId): PUT /api/payments/:id/release
    - Track transactions[], isLoading, error
    - _Requirements: 10.1, 10.4, 10.6, 10.8_

  - [x] 11.2 Implement Wallet screen
    - Create `src/app/(worker)/wallet.tsx` and `src/app/(organizer)/wallet.tsx`
    - Fetch transactions on mount from paymentStore; show loading indicator (timeout 15s)
    - Display each transaction: amount in ₹ format, type (credit/debit), date/time, associated event/job name
    - Handle error (retry button) and empty state
    - _Requirements: 10.1, 10.2, 10.3, 10.9_

  - [x] 11.3 Implement Payment flow screen with Razorpay
    - Create `src/app/payment/[id].tsx`
    - Fund: call paymentStore.fundEscrow() → on success open Razorpay checkout with order details; on failure show error, don't launch Razorpay
    - Confirm: on Razorpay success callback call paymentStore.confirmEscrow(); on Razorpay failure/cancel show error, don't call confirm
    - Release: "Release Payment" button calls paymentStore.releasePayment() for completed jobs
    - _Requirements: 10.4, 10.5, 10.6, 10.7, 10.8_

  - [ ]* 11.4 Write property test for transaction formatting (Property 11)
    - **Property 11: Transaction amount INR formatting** — For any payment with a numeric amount, verify rendered display contains ₹ symbol, numeric value, date, and event/job name
    - **Validates: Requirements 10.9**

- [x] 12. Implement notification store and notifications screen
  - [x] 12.1 Implement Zustand notification store
    - Create `src/stores/notificationStore.ts`
    - Implement fetchNotifications(reset?): GET /api/notifications with pagination (page size 20)
    - Implement markAsRead(id): PUT /api/notifications/:id/read
    - Implement markAllAsRead(): PUT /api/notifications/read-all
    - Track notifications[], unreadCount, page, hasMore, isLoading
    - _Requirements: 11.1, 11.3, 11.4_

  - [x] 12.2 Implement Notification Center screen
    - Create `src/app/notifications.tsx`
    - Fetch paginated notifications on mount; distinguish unread (background color/dot) from read
    - Tap notification: mark as read via PUT
    - "Mark All Read" button: call markAllAsRead, update all items visually
    - Display each notification: title, message, timestamp, type icon
    - Handle loading, error + retry, and empty states
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [x] 13. Implement reviews screen
  - [x] 13.1 Implement Review Screen
    - Create `src/app/reviews.tsx`
    - Worker view: fetch reviews from GET /api/reviews/workers/:id; display reviewer name, rating stars, comment, date
    - Organizer view: submit review form with rating (1-5 required) and optional comment via POST /api/reviews
    - Client-side validation: reject submission without rating (inline error, no API call)
    - Handle loading, error + retry, empty state, and duplicate/invalid backend errors
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [x] 14. Implement profile integration
  - [x] 14.1 Implement Profile screen with API integration
    - Create `src/app/(worker)/profile.tsx` and `src/app/(organizer)/profile.tsx`
    - Fetch user from GET /api/auth/me on mount; display name, email, phone, role (loading indicator, 15s timeout)
    - Worker: additionally fetch GET /api/workers/profile for skills, experience level, location, rating, total earnings
    - Edit form: submit PUT to /api/workers/profile or /api/organizers/profile; disable submit during request; show confirmation on success, error on failure (preserve form data)
    - Photo upload (worker): multipart POST to /api/workers/profile/photo; validate JPEG/PNG and ≤5MB client-side before sending
    - Handle error + retry for initial fetch
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

  - [ ]* 14.2 Write property test for photo upload validation (Property 12)
    - **Property 12: Photo upload client-side validation** — For any file exceeding 5MB or not JPEG/PNG, verify rejection with error and no network request
    - **Validates: Requirements 13.7**

- [x] 15. Implement My Events and assigned jobs screens
  - [x] 15.1 Implement My Events screen (Organizer)
    - Create `src/app/(organizer)/events.tsx`
    - Fetch from GET /api/events; display list with title, date, category, status
    - Tap event: navigate to event detail, fetch GET /api/events/:id; show attached jobs with role, filledCount/numberOfWorkers, pay rate, shift times
    - "Complete Event" button: visible when status="active" AND all jobs fully filled; call PUT /api/events/:id/complete; update status on success, show error on failure
    - Handle error + retry for list fetch
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [x] 15.2 Implement Worker assigned jobs screen
    - Create `src/app/(worker)/home.tsx`
    - Fetch from GET /api/workers/assigned-jobs; display event name, role, shift start/end, pay rate, assignment status
    - Also fetch open jobs from GET /api/jobs (up to 10) for discovery section; display job name, role, rating
    - Show authenticated user name from authStore in header; default avatar if no photo
    - Handle loading (skeleton placeholders min 2), error (message + retry), and empty states
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 14.7_

  - [ ]* 15.3 Write property test for Complete Event button visibility (Property 13)
    - **Property 13: Complete Event button conditional visibility** — For any event, verify button visible only when status="active" AND all jobs have filledCount=numberOfWorkers
    - **Validates: Requirements 14.3**

- [x] 16. Implement role-based navigation and auth guards
  - [x] 16.1 Restructure root layout with auth guard
    - Rewrite `src/app/_layout.tsx` to use authStore
    - On mount: call restoreSession(); show loading screen while isLoading=true
    - If unauthenticated: render (auth) group only (login, signup, verify)
    - If authenticated as worker: render (worker) tab group
    - If authenticated as organizer: render (organizer) tab group
    - If role is neither worker nor organizer: redirect to role selection
    - _Requirements: 15.3, 15.4, 15.5, 2.6_

  - [x] 16.2 Implement worker tab layout
    - Create `src/app/(worker)/_layout.tsx`
    - Configure exactly 5 tabs: Home, Jobs, My Applications, Wallet, Profile
    - _Requirements: 15.1_

  - [x] 16.3 Implement organizer tab layout
    - Create `src/app/(organizer)/_layout.tsx`
    - Configure exactly 5 tabs: Home, My Events, Create Event, Wallet, Profile
    - _Requirements: 15.2_

  - [x] 16.4 Implement auth group layout
    - Create `src/app/(auth)/_layout.tsx` as a Stack navigator for login, signup, and verify screens
    - _Requirements: 15.3_

  - [ ]* 16.5 Write property tests for navigation guards (Properties 14-16)
    - **Property 14: Role-based tab configuration** — For any authenticated user, verify correct tabs based on role
    - **Property 15: Auth guard protection** — For any unauthenticated navigation to protected screen, verify redirect to login
    - **Property 16: Role guard protection** — For any role/route mismatch, verify redirect to role-appropriate Home
    - **Validates: Requirements 15.1, 15.2, 15.3, 15.4**

- [x] 17. Implement Home screen for organizer
  - [x] 17.1 Implement Organizer Home screen
    - Create `src/app/(organizer)/home.tsx`
    - Display organizer name from authStore in header
    - Fetch active events summary from GET /api/events (filter active); show count and quick links
    - Handle loading, error, and empty states
    - _Requirements: 4.2, 15.2_

- [x] 18. Final checkpoint - Full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 16 universal correctness properties defined in the design
- Unit tests validate specific examples and edge cases
- The existing `(tabs)` folder structure will be replaced by `(auth)`, `(worker)`, and `(organizer)` route groups
- All API calls use the centralized API service; screens never call Axios directly
- The backend is already built — no server changes needed

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["2.3", "3.1"] },
    { "id": 4, "tasks": ["3.2", "6.1", "8.1", "11.1", "12.1"] },
    { "id": 5, "tasks": ["4.1", "4.2", "6.2", "6.3", "8.2", "9.1", "11.2", "11.3", "12.2", "13.1", "14.1"] },
    { "id": 6, "tasks": ["4.3", "6.4", "7.1", "7.3", "11.4", "14.2", "15.1", "15.2"] },
    { "id": 7, "tasks": ["7.2", "7.4", "15.3", "17.1"] },
    { "id": 8, "tasks": ["16.1", "16.2", "16.3", "16.4"] },
    { "id": 9, "tasks": ["16.5"] }
  ]
}
```
