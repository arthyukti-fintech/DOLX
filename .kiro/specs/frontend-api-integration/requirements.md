# Requirements Document

## Introduction

This feature transforms the DOLX event staffing platform frontend from a static UI prototype into a fully functional application by building missing screens and integrating all existing and new screens with the backend API. The scope covers: an API service layer with authentication token management, global state management, missing screens (job browsing, job detail, job applications, event creation, applicant management, payments, notifications, reviews), and connecting all existing static screens to live backend data.

## Glossary

- **API_Service**: The centralized HTTP client layer (axios/fetch wrapper) responsible for making authenticated requests to the backend, handling token refresh, and standardizing error responses.
- **Auth_Store**: The global state container managing user authentication status, JWT tokens, and user profile data across the application.
- **Job_Browser**: The screen displaying a filterable, searchable list of open jobs available for workers to browse and apply to.
- **Job_Detail_Screen**: The screen showing complete information about a single job posting including event details, pay rate, shift times, and an apply action.
- **Application_Manager**: The screen enabling organizers to view, accept, or reject worker applications for their posted jobs.
- **Event_Creation_Flow**: The multi-step form flow allowing organizers to create events and attach job postings (roles, pay, shift times) to those events.
- **Payment_Flow**: The screens handling Razorpay-based escrow fund, confirmation, and release operations for organizers.
- **Notification_Center**: The screen displaying push and in-app notifications with read/unread state management.
- **Review_Screen**: The screen enabling organizers to rate and review workers after job completion, and workers to view their received reviews.
- **Worker**: A user with the role "worker" who browses and applies for event staffing jobs.
- **Organizer**: A user with the role "organizer" who creates events, posts jobs, manages applicants, and handles payments.
- **Backend_API**: The Node.js/Express REST API server providing endpoints for auth, events, jobs, applications, payments, notifications, reviews, disputes, and admin operations.
- **Token**: A JWT access token returned by the Backend_API upon successful authentication, stored securely on device and attached to all authenticated requests.
- **Escrow**: The payment holding mechanism where the Organizer funds are held via Razorpay until the job is completed and payment is released to the Worker.

## Requirements

### Requirement 1: API Service Layer

**User Story:** As a developer, I want a centralized API service layer, so that all screens can make authenticated backend requests with consistent error handling and token management.

#### Acceptance Criteria

1. WHEN a stored Token exists, THE API_Service SHALL attach it as a Bearer authorization header to every outgoing request to the Backend_API.
2. IF no stored Token exists when a request is initiated, THEN THE API_Service SHALL reject the request without sending it to the Backend_API and return a standardized error object with an error code indicating missing authentication.
3. WHEN the Backend_API returns an HTTP 401 response, THE API_Service SHALL clear the stored Token from persistent storage and redirect the user to the login screen.
4. WHEN a network request fails due to connectivity loss or exceeds a timeout of 30 seconds, THE API_Service SHALL return a standardized error object containing an error code string, a user-facing message string, and the original request URL.
5. THE API_Service SHALL provide typed request methods for GET, POST, PUT, and DELETE operations that accept a URL path, optional request body (for POST and PUT), and optional query parameters (for GET and DELETE), and return a typed response or a standardized error object.
6. THE API_Service SHALL read the base URL from an environment configuration value rather than a hardcoded string.
7. IF the base URL environment configuration value is missing or empty at initialization, THEN THE API_Service SHALL throw an error indicating the missing configuration and prevent any requests from being sent.

### Requirement 2: Authentication State Management

**User Story:** As a user, I want the app to remember my login session, so that I do not have to re-authenticate every time I open the app.

#### Acceptance Criteria

1. WHEN the Backend_API returns a successful login response containing a Token and user profile, THE Auth_Store SHALL persist the Token to secure device storage and store the user profile in memory.
2. WHEN the app launches and a Token exists in secure device storage, THE Auth_Store SHALL validate the Token by fetching the user profile from the Backend_API, and upon a successful response, restore the authenticated session with the returned user profile data in memory without requiring re-login.
3. IF the stored Token is invalid or the Backend_API returns an authentication error during session restore, THEN THE Auth_Store SHALL remove the Token from secure device storage and navigate the user to the login screen.
4. WHEN the user taps the logout button, THE Auth_Store SHALL remove the Token from secure device storage, clear the user profile from memory, and navigate the user to the login screen.
5. THE Auth_Store SHALL expose the current user role (Worker, Organizer, or Admin) to all screens for role-based UI rendering.
6. WHILE the Auth_Store is performing session restore on app launch, THE app SHALL display a loading indicator and prevent navigation to protected screens until the check completes.

### Requirement 3: Login and Registration Integration

**User Story:** As a new or returning user, I want to log in or register using my phone number, so that I can access the platform.

#### Acceptance Criteria

1. WHEN the user submits a phone number and password on the login screen, THE API_Service SHALL send a POST request to /api/auth/login with the provided credentials.
2. WHEN the Backend_API returns a successful login response containing a Token and user profile, THE Auth_Store SHALL persist the Token to secure device storage, store the user profile in memory, and navigate the user to the home screen.
3. IF the Backend_API returns a 401 or 400 error during login, THEN THE login screen SHALL display the error message returned by the Backend_API below the input fields and re-enable the submit button.
4. WHEN the user submits the registration form with name, email, phone, password, and role, THE API_Service SHALL send a POST request to /api/auth/register with the provided data.
5. IF the Backend_API returns a validation error during registration, THEN THE signup screen SHALL display field-specific error messages next to the corresponding input fields and re-enable the submit button.
6. WHILE the login or registration request is in progress, THE login screen or signup screen SHALL disable the submit button and display a loading indicator to prevent duplicate submissions.
7. IF the user submits the login form with an empty phone number or empty password, THEN THE login screen SHALL display an inline validation message indicating the missing field without sending a request to the Backend_API.
8. IF the user submits the registration form with any required field (name, email, phone, password, or role) empty or with a phone number not exactly 10 digits, THEN THE signup screen SHALL display an inline validation message for the invalid field without sending a request to the Backend_API.

### Requirement 4: Home Screen Data Integration

**User Story:** As a worker, I want the home screen to display real job listings and worker data, so that I can discover available opportunities.

#### Acceptance Criteria

1. WHEN the home screen mounts, THE home screen SHALL fetch open jobs from GET /api/jobs and display up to 10 jobs in the worker cards section; each card SHALL show the job name, role, and rating.
2. WHEN the home screen mounts, THE home screen SHALL display the authenticated user name from the Auth_Store in the header; IF no profile photo is available in the Auth_Store, THEN THE home screen SHALL display a default placeholder avatar.
3. IF the job data fetch fails or does not respond within 10 seconds, THEN THE home screen SHALL hide the skeleton placeholders, display an error message indicating the data could not be loaded, and display a retry button that re-triggers the data fetch when tapped.
4. WHILE the home screen is loading job data, THE home screen SHALL display skeleton placeholder components matching the number of cards visible in the viewport (minimum 2) in place of the worker cards.
5. IF the job data fetch returns an empty list, THEN THE home screen SHALL display an empty-state message indicating no jobs are currently available.
6. WHEN the retry button is tapped, THE home screen SHALL display the skeleton placeholders again and re-fetch jobs from GET /api/jobs following the same loading, success, and failure behaviors defined in criteria 1, 3, 4, and 5.

### Requirement 5: Job Browsing Screen

**User Story:** As a worker, I want to browse available jobs with filters, so that I can find relevant opportunities matching my skills and preferences.

#### Acceptance Criteria

1. WHEN the Job_Browser screen mounts, THE Job_Browser SHALL fetch paginated job listings from GET /api/jobs with a default page size of 10.
2. WHEN the user scrolls to within 200 pixels of the bottom of the job list and additional pages remain, THE Job_Browser SHALL fetch the next page of results and append them to the existing list; WHEN no additional pages remain, THE Job_Browser SHALL not issue further fetch requests and SHALL display an end-of-list indicator.
3. WHEN the user selects a role filter (from the 10 defined job roles), THE Job_Browser SHALL re-fetch jobs from page 1 with the selected role as a query parameter and replace the current list with the new results.
4. WHEN the user enters text in the search field and at least 300 milliseconds have elapsed since the last keystroke, THE Job_Browser SHALL filter the currently loaded jobs client-side by event name or role containing the entered text (case-insensitive).
5. THE Job_Browser SHALL display each job card showing the role name, pay rate with currency symbol, pay type, shift start time, shift end time, and event name.
6. IF the job listings fetch from GET /api/jobs fails, THEN THE Job_Browser SHALL display an error message indicating the failure and a retry button that re-triggers the fetch when tapped.
7. WHILE the Job_Browser is fetching job listings (initial load or next page), THE Job_Browser SHALL display a loading indicator visible to the user.
8. WHEN the fetched job listings return zero results or no loaded jobs match the current search text, THE Job_Browser SHALL display an empty state message indicating no jobs were found.

### Requirement 6: Job Detail Screen

**User Story:** As a worker, I want to view full details of a job posting, so that I can decide whether to apply.

#### Acceptance Criteria

1. WHEN the user taps a job card, THE Job_Detail_Screen SHALL navigate to a detail view and fetch job data from GET /api/jobs/:id.
2. WHILE the job data is being fetched, THE Job_Detail_Screen SHALL display a loading indicator in place of the job content.
3. THE Job_Detail_Screen SHALL display the job role, pay rate, pay type, shift start, shift end, number of workers needed, filled count, and event details including event title, date, location, and category.
4. WHILE the job status is "open" and filledCount is less than numberOfWorkers and the current user has not already applied, THE Job_Detail_Screen SHALL display an "Apply" button.
5. IF the current user has already applied to the job, THEN THE Job_Detail_Screen SHALL display the Apply button in a disabled state with a label indicating "Applied".
6. IF filledCount is greater than or equal to numberOfWorkers, THEN THE Job_Detail_Screen SHALL display a "Positions Filled" label instead of the Apply button.
7. IF the job data fetch fails, THEN THE Job_Detail_Screen SHALL display an error message and a retry button that re-triggers the GET /api/jobs/:id request when tapped.

### Requirement 7: Job Application Flow

**User Story:** As a worker, I want to apply to jobs directly from the app, so that I can get hired for events.

#### Acceptance Criteria

1. WHEN the user taps the "Apply" button on the Job_Detail_Screen, THE API_Service SHALL send a POST request to /api/applications/jobs/:jobId/apply.
2. WHILE the application request is in progress, THE Job_Detail_Screen SHALL disable the Apply button and display a loading indicator in place of the button label to prevent duplicate submissions.
3. WHEN the Backend_API returns a successful application response, THE Job_Detail_Screen SHALL display a confirmation message indicating the application was submitted and replace the Apply button with a disabled "Applied" state.
4. IF the Backend_API returns an error (duplicate application or job full), THEN THE Job_Detail_Screen SHALL display the error message inline near the Apply button and re-enable the Apply button.
5. IF the application request fails due to network error, THEN THE Job_Detail_Screen SHALL display an error message indicating connectivity failure and re-enable the Apply button so the user can retry.
6. WHEN the worker navigates to their applications list, THE applications screen SHALL fetch data from GET /api/workers/applications and display each application with the job role name, event name, shift date, application status (pending, accepted, rejected, cancelled), and date applied.
7. IF the applications list fetch returns an empty result, THEN THE applications screen SHALL display a message indicating no applications have been submitted.

### Requirement 8: Event Creation Flow

**User Story:** As an organizer, I want to create events and attach job postings, so that I can hire staff for my events.

#### Acceptance Criteria

1. WHEN the organizer submits the event creation form with title, category, date, location, and description, THE API_Service SHALL send a POST request to /api/events with the provided data.
2. WHEN the Backend_API returns a successful event creation response, THE Event_Creation_Flow SHALL navigate to a job posting step where the organizer can add roles to the event.
3. WHEN the organizer submits a job posting with role, number of workers (minimum 1, maximum 100), pay rate (minimum 0), pay type, shift start, and shift end, THE API_Service SHALL send a POST request to /api/events/:eventId/jobs.
4. WHEN the Backend_API returns a successful job posting response, THE Event_Creation_Flow SHALL display a confirmation message and add the created job to the visible list of jobs attached to the event.
5. THE Event_Creation_Flow SHALL allow the organizer to add multiple job postings to a single event; WHEN the organizer taps a "Done" or "Finalize" button, THE Event_Creation_Flow SHALL navigate to the My Events screen showing the newly created event.
6. IF the Backend_API returns a validation error during event or job creation, THEN THE Event_Creation_Flow SHALL display the specific validation error messages adjacent to the relevant form fields.
7. WHILE the event creation or job posting request is in progress, THE Event_Creation_Flow SHALL disable the submit button and display a loading indicator to prevent duplicate submissions.

### Requirement 9: Applicant Management

**User Story:** As an organizer, I want to review and accept or reject applicants for my posted jobs, so that I can build my event team.

#### Acceptance Criteria

1. WHEN the organizer navigates to the applicant list for a job, THE Application_Manager SHALL fetch applicants from GET /api/jobs/:id/applicants.
2. THE Application_Manager SHALL display each applicant with their name, skills, experience level, rating average, and application status.
3. WHEN the organizer taps "Accept" on an applicant, THE API_Service SHALL send a PUT request to /api/applications/:id/accept and, upon success, update the applicant status to "accepted" in the UI.
4. WHEN the organizer taps "Reject" on an applicant, THE API_Service SHALL send a PUT request to /api/applications/:id/reject and, upon success, update the applicant status to "rejected" in the UI.
5. IF the accept or reject PUT request fails, THEN THE Application_Manager SHALL display an error message indicating the action could not be completed and retain the original applicant status.
6. WHEN an application is accepted and the job filledCount equals numberOfWorkers, THE Application_Manager SHALL disable the Accept button on remaining pending applicants and display a "Positions Filled" indicator.
7. WHILE the applicant list is loading, THE Application_Manager SHALL display a loading indicator; IF the fetch fails, THEN THE Application_Manager SHALL display an error message with a retry button.

### Requirement 10: Wallet and Payment Integration

**User Story:** As an organizer, I want to fund escrow payments and release payments to workers, so that the payment process is secure and transparent.

#### Acceptance Criteria

1. WHEN the wallet screen mounts, THE wallet screen SHALL fetch transaction data from GET /api/payments/my and display a loading indicator until the response is received or a timeout of 15 seconds elapses.
2. IF the GET /api/payments/my request fails or times out, THEN THE wallet screen SHALL display an error message indicating the transactions could not be loaded and provide a retry option.
3. IF no transactions exist for the organizer, THEN THE wallet screen SHALL display an empty-state message indicating no transactions are available.
4. WHEN the organizer initiates payment for an accepted application, THE Payment_Flow SHALL call POST /api/payments/:id/fund to create a Razorpay order.
5. IF the POST /api/payments/:id/fund request fails, THEN THE Payment_Flow SHALL display an error message indicating the payment order could not be created and shall not launch the Razorpay checkout.
6. WHEN Razorpay returns a successful payment, THE Payment_Flow SHALL call POST /api/payments/:id/confirm to confirm the escrow hold.
7. IF Razorpay returns a payment failure or the user cancels the checkout, THEN THE Payment_Flow SHALL display an error message indicating the payment was not completed and shall not call the confirm endpoint.
8. WHEN the organizer releases payment for a job with status "completed", THE API_Service SHALL send a PUT request to /api/payments/:id/release.
9. THE wallet screen SHALL display each transaction with amount in INR (₹) format, type (credit/debit), date and time, and associated event or job name.

### Requirement 11: Notifications Screen

**User Story:** As a user, I want to view my notifications in the app, so that I stay informed about job updates, application statuses, and payment events.

#### Acceptance Criteria

1. WHEN the Notification_Center mounts, THE Notification_Center SHALL fetch paginated notifications from GET /api/notifications with a default page size of 20.
2. THE Notification_Center SHALL visually distinguish unread notifications from read notifications using a distinct background color or indicator dot.
3. WHEN the user taps a notification, THE API_Service SHALL send a PUT request to /api/notifications/:id/read and update the visual state to read.
4. WHEN the user taps "Mark All Read", THE API_Service SHALL send a PUT request to /api/notifications/read-all and update all notification items to the read visual state.
5. THE Notification_Center SHALL display each notification with a title, message body, timestamp, and notification type icon.
6. WHILE the notifications are loading, THE Notification_Center SHALL display a loading indicator; IF the fetch fails, THEN THE Notification_Center SHALL display an error message with a retry button.
7. IF no notifications exist, THEN THE Notification_Center SHALL display an empty-state message indicating there are no notifications.

### Requirement 12: Reviews Screen

**User Story:** As an organizer, I want to review workers after job completion, and as a worker, I want to see my reviews, so that the platform maintains accountability and trust.

#### Acceptance Criteria

1. WHEN the organizer submits a review with a rating (1-5) and optional comment for a worker, THE API_Service SHALL send a POST request to /api/reviews with the review data.
2. IF the organizer attempts to submit a review without selecting a rating, THEN THE Review_Screen SHALL display an inline validation message indicating a rating is required and SHALL NOT send the request.
3. WHEN a worker navigates to their reviews section, THE Review_Screen SHALL fetch reviews from GET /api/reviews/workers/:id and display them as a list.
4. THE Review_Screen SHALL display each review with the reviewer name, rating stars, comment text, and date.
5. IF the Backend_API returns an error when submitting a review (duplicate or invalid), THEN THE Review_Screen SHALL display the error message to the user.
6. WHILE the reviews list is loading, THE Review_Screen SHALL display a loading indicator; IF the fetch fails, THEN THE Review_Screen SHALL display an error message with a retry button.
7. IF no reviews exist for the worker, THEN THE Review_Screen SHALL display an empty-state message.

### Requirement 13: Profile Integration

**User Story:** As a user, I want my profile screen to show real data and allow updates, so that my information stays current.

#### Acceptance Criteria

1. WHEN the profile screen mounts, THE profile screen SHALL fetch the user profile from GET /api/auth/me and display the name, email, phone, and role, showing a loading indicator until the response is received or a timeout of 15 seconds elapses.
2. IF the profile fetch from GET /api/auth/me fails or times out, THEN THE profile screen SHALL display an error message indicating the profile could not be loaded and provide a retry option.
3. WHEN a worker navigates to their profile, THE profile screen SHALL additionally fetch worker-specific data from GET /api/workers/profile displaying skills, experience level, location, rating, and total earnings.
4. WHEN the user submits profile changes, THE API_Service SHALL send a PUT request to the appropriate profile update endpoint (/api/workers/profile or /api/organizers/profile) and, upon receiving a success response, display a confirmation message; the submit control SHALL be disabled while the request is in progress to prevent duplicate submissions.
5. IF the profile update PUT request fails, THEN THE profile screen SHALL display an error message indicating the update was unsuccessful and preserve the user's entered data in the form fields.
6. WHEN a worker uploads a profile photo, THE API_Service SHALL send a multipart POST request to /api/workers/profile/photo with the image file, accepting only JPEG or PNG formats with a maximum file size of 5 MB.
7. IF the selected profile photo exceeds 5 MB or is not in JPEG or PNG format, THEN THE profile screen SHALL display an error message indicating the file constraint that was violated and SHALL NOT send the upload request.

### Requirement 14: My Events and Bookings Integration

**User Story:** As an organizer, I want to see my created events and their status, so that I can manage my event portfolio.

#### Acceptance Criteria

1. WHEN the organizer navigates to My Events, THE screen SHALL fetch events from GET /api/events and display them as a list with title, date, category, and status (draft, active, completed, or cancelled).
2. WHEN the organizer taps an event, THE screen SHALL fetch event details from GET /api/events/:id including attached jobs and, for each job, display the role name, filledCount out of numberOfWorkers, pay rate, and shift times.
3. WHILE the event status is "active" and all attached jobs have filledCount equal to numberOfWorkers, THE event detail screen SHALL display a "Complete Event" button.
4. WHEN the organizer taps "Complete Event", THE API_Service SHALL send a PUT request to /api/events/:id/complete and, upon success, update the event status to "completed" in the UI and hide the "Complete Event" button.
5. IF the PUT request to /api/events/:id/complete fails, THEN THE screen SHALL display an error message indicating the event could not be completed and retain the current event state.
6. IF the event list fetch from GET /api/events fails, THEN THE screen SHALL display a retry button that re-triggers the fetch when tapped.
7. WHEN a worker navigates to their assigned jobs, THE screen SHALL fetch data from GET /api/workers/assigned-jobs and display each assignment with the event name, role name, shift start time, shift end time, pay rate, and assignment status.

### Requirement 15: Role-Based Navigation

**User Story:** As a user, I want the app to show role-appropriate screens and actions, so that I only see functionality relevant to my role.

#### Acceptance Criteria

1. WHILE the authenticated user role is "worker", THE tab navigation SHALL display exactly 5 tabs in this order: Home, Jobs, My Applications, Wallet, and Profile.
2. WHILE the authenticated user role is "organizer", THE tab navigation SHALL display exactly 5 tabs in this order: Home, My Events, Create Event, Wallet, and Profile.
3. IF an unauthenticated user attempts to navigate to any screen other than Login, Signup, Signup Verification Code, and Role Selection, THEN THE app SHALL redirect the user to the login screen within 1 second without displaying the protected screen content.
4. IF an authenticated user attempts to navigate to a tab or screen that is not assigned to their role, THEN THE app SHALL redirect the user to their role's Home tab without displaying the unauthorized screen content.
5. IF the authenticated user's role is not "worker" or "organizer", THEN THE app SHALL redirect the user to the Role Selection screen.
