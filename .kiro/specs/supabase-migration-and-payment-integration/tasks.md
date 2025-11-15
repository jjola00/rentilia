# Implementation Plan

## Phase 1: Firebase Removal & Supabase Foundation

- [x] 1. Remove Firebase dependencies and install Supabase stack
  - Remove all Firebase packages from package.json (firebase, @firebase/*)
  - Install @supabase/supabase-js, @supabase/auth-ui-react, @supabase/auth-ui-shared
  - Install Stripe packages: @stripe/stripe-js, @stripe/react-stripe-js
  - Install additional dependencies: @tanstack/react-query, react-hook-form, @hookform/resolvers, zod
  - Remove any Firebase configuration files and imports from codebase
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Set up Supabase project and environment configuration
  - Create new Supabase project at supabase.com
  - Create .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Add Stripe keys: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY
  - Create src/lib/supabase/client.ts with Supabase client initialization
  - Create src/lib/supabase/server.ts for server-side operations
  - _Requirements: 1.4, 2.6_

- [x] 3. Implement complete database schema in Supabase
  - Run SQL schema for profiles, user_roles, items, bookings tables
  - Create booking_status enum type
  - Create reviews, licenses, return_evidence, messages tables
  - Enable Row Level Security on all tables
  - Create basic RLS policies for each table
  - Create performance indexes on frequently queried columns
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_


## Phase 2: Authentication & User Management

- [ ] 4. Implement Supabase authentication system
- [ ] 4.1 Create AuthProvider component with Supabase Auth context
  - Build context provider that manages auth state
  - Implement useAuth hook for accessing auth state
  - Handle session persistence and automatic token refresh
  - _Requirements: 3.1, 3.5_

- [ ] 4.2 Build login page with Supabase Auth
  - Create src/app/(auth)/login/page.tsx
  - Implement email/password login form with validation
  - Add error handling for invalid credentials
  - Redirect to dashboard on successful login
  - _Requirements: 3.1_

- [ ] 4.3 Build signup page with email verification
  - Create src/app/(auth)/signup/page.tsx
  - Implement signup form with email/password validation
  - Trigger Supabase email verification on signup
  - Show verification pending message to user
  - _Requirements: 3.1, 3.2_

- [ ] 4.4 Implement protected route component
  - Create ProtectedRoute wrapper component
  - Check authentication status before rendering
  - Redirect unauthenticated users to login
  - _Requirements: 3.4_

- [ ] 4.5 Build profile completion flow
  - Create ProfileCompletion component for first-time users
  - Require full_name, city, state, bio fields
  - Implement terms acceptance checkbox with version tracking
  - Save profile data to profiles table
  - _Requirements: 3.3, 3.4, 3.5_

- [ ] 4.6 Create profile editing page
  - Build src/app/dashboard/profile/page.tsx
  - Load existing profile data from profiles table
  - Allow editing of full_name, phone, bio, city, state
  - Implement avatar upload to Supabase Storage
  - Update updated_at timestamp on save
  - _Requirements: 3.5_


## Phase 3: Item Listing & Management

- [ ] 5. Build item creation and management system
- [ ] 5.1 Create multi-step item creation form
  - Build src/app/listings/new/page.tsx with step navigation
  - Step 1: Basic info (title, description, category)
  - Step 2: Pricing (price_per_day, replacement_value, deposit_amount)
  - Step 3: Availability (min_rental_days, max_rental_days, pickup_type)
  - Step 4: Requirements (is_license_required, pickup_address)
  - Implement Zod validation schemas for each step
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 5.2 Implement photo upload to Supabase Storage
  - Create PhotoUpload component with drag-and-drop
  - Upload images to Supabase Storage bucket
  - Generate and store public URLs in photo_urls array
  - Support multiple image uploads (up to 10 per item)
  - Add image preview and delete functionality
  - _Requirements: 4.2_

- [ ] 5.3 Build item listing page for owners
  - Create src/app/dashboard/listings/page.tsx
  - Query items table filtered by owner_id
  - Display items in grid with photo, title, price
  - Add edit and delete actions for each item
  - Show availability toggle switch
  - _Requirements: 4.1, 4.5_

- [ ] 5.4 Create item detail view page
  - Build src/app/listings/[id]/page.tsx
  - Display all item details including photos carousel
  - Show owner profile information
  - Display pricing breakdown and rental constraints
  - Add "Request Booking" button for authenticated users
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_


## Phase 4: Search & Discovery

- [ ] 6. Implement item search and filtering system
- [ ] 6.1 Build browse page with item grid
  - Create src/app/browse/page.tsx
  - Query items table where is_available = true
  - Display items in responsive grid layout
  - Implement pagination with range queries
  - _Requirements: 5.1_

- [ ] 6.2 Add category filtering
  - Create ItemFilters component with category checkboxes
  - Filter items query by selected categories
  - Update URL params to maintain filter state
  - _Requirements: 5.2_

- [ ] 6.3 Implement location-based filtering
  - Add city and state filter dropdowns
  - Query items by owner's city/state from profiles join
  - Show distance or location in item cards
  - _Requirements: 5.3_

- [ ] 6.4 Add price range filtering
  - Create price range slider component
  - Filter items where price_per_day is within range
  - Display min/max price in filter UI
  - _Requirements: 5.4_

- [ ] 6.5 Implement keyword search
  - Add search input with debouncing
  - Search against item title and description using ilike
  - Highlight search terms in results
  - _Requirements: 5.5_


## Phase 5: Booking System

- [ ] 7. Build booking request and validation system
- [ ] 7.1 Create booking request form with date picker
  - Build BookingForm component with react-day-picker
  - Implement start_datetime and end_datetime selection
  - Disable dates that conflict with existing bookings
  - Calculate number of rental days
  - _Requirements: 6.1, 6.2_

- [ ] 7.2 Implement rental duration validation
  - Validate booking duration against min_rental_days
  - Validate booking duration against max_rental_days
  - Display clear error messages for invalid durations
  - _Requirements: 6.1_

- [ ] 7.3 Add license verification for licensed equipment
  - Check if item has is_license_required = true
  - Query licenses table for renter's valid licenses
  - Verify license is_verified = true and expiry_date is future
  - Block booking if license requirements not met
  - _Requirements: 6.4_

- [ ] 7.4 Build booking summary with cost breakdown
  - Calculate total_rental_fee as price_per_day × days
  - Display rental fee and deposit as separate line items
  - Show total amount to be charged
  - Display booking dates and item details
  - _Requirements: 6.2, 6.3_

- [ ] 7.5 Create booking record in database
  - Implement create-booking Edge Function
  - Validate all booking constraints server-side
  - Insert booking with status = 'requested'
  - Return booking_id to client
  - _Requirements: 6.5_


## Phase 6: Payment Integration with Stripe

- [ ] 8. Implement Stripe payment processing
- [ ] 8.1 Create payment intent Edge Function
  - Build supabase/functions/create-booking-payment/index.ts
  - Create Payment Intent for rental fee (immediate capture)
  - Create separate Payment Intent for deposit (manual capture)
  - Save payment_intent_id and deposit_pi_id to bookings table
  - Return client secrets to frontend
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 8.2 Build checkout page with Stripe Elements
  - Create src/app/checkout/[bookingId]/page.tsx
  - Initialize Stripe.js with publishable key
  - Implement CheckoutForm component with CardElement
  - Display payment summary with rental fee + deposit
  - Handle loading states during payment processing
  - _Requirements: 7.1, 7.3_

- [ ] 8.3 Implement payment confirmation flow
  - Confirm both payment intents using Stripe.js
  - Handle successful payment confirmation
  - Update booking status to 'paid' on success
  - Redirect to booking confirmation page
  - _Requirements: 7.3, 7.4_

- [ ] 8.4 Add payment error handling and retry
  - Display Stripe error messages to user
  - Implement retry button for failed payments
  - Allow changing payment method
  - Log payment failures for debugging
  - _Requirements: 7.5_


## Phase 7: Webhook Processing

- [ ] 9. Build Stripe webhook handler
- [ ] 9.1 Create webhook Edge Function
  - Build supabase/functions/stripe-webhook/index.ts
  - Verify webhook signature using Stripe webhook secret
  - Parse webhook event payload
  - Implement idempotency checking to prevent duplicate processing
  - _Requirements: 8.3, 8.4_

- [ ] 9.2 Handle payment_intent.succeeded events
  - Extract booking_id from payment intent metadata
  - Update booking status from 'requested' to 'paid'
  - Update payment_intent_id in bookings table
  - Send confirmation email to renter and owner
  - _Requirements: 8.1_

- [ ] 9.3 Handle payment_intent.payment_failed events
  - Log payment failure details
  - Send failure notification email to renter
  - Keep booking status as 'requested' for retry
  - _Requirements: 8.2_

- [ ] 9.4 Add webhook logging and monitoring
  - Log all webhook events with timestamp and type
  - Log processing outcomes (success/failure)
  - Store webhook event IDs for idempotency
  - _Requirements: 8.5_


## Phase 8: Pickup & Return Workflow

- [ ] 10. Implement pickup and return confirmation system
- [ ] 10.1 Create pickup confirmation functionality
  - Build confirm-pickup Edge Function
  - Verify requester is item owner
  - Update booking status to 'picked_up'
  - Set pickup_confirmed_at to current timestamp
  - Send pickup confirmation email to both parties
  - _Requirements: 9.1_

- [ ] 10.2 Build return initiation for renters
  - Create return form component
  - Allow renter to mark item as returned
  - Update booking status to 'returned_waiting_owner'
  - Notify owner of pending return confirmation
  - _Requirements: 9.2_

- [ ] 10.3 Implement owner return confirmation
  - Build return confirmation UI for owners
  - Allow uploading return photos to Supabase Storage
  - Save return_photo_url to bookings table
  - Option to confirm no damage or report damage
  - _Requirements: 9.3, 9.4_

- [ ] 10.4 Create return evidence system
  - Build form for damage reporting
  - Allow multiple photo uploads for damage evidence
  - Save damage_description and damage_cost
  - Insert record into return_evidence table
  - _Requirements: 9.5_


## Phase 9: Deposit Management

- [ ] 11. Build security deposit management system
- [ ] 11.1 Create deposit management Edge Function
  - Build supabase/functions/manage-deposit/index.ts
  - Implement 'release' action to cancel deposit Payment Intent
  - Implement 'capture' action to charge deposit for damages
  - Verify requester is item owner
  - _Requirements: 10.1, 10.2_

- [ ] 11.2 Implement automatic deposit release
  - Trigger when booking status changes to 'closed_no_damage'
  - Call manage-deposit function with action='release'
  - Cancel the deposit Payment Intent in Stripe
  - Set return_confirmed_at timestamp
  - Send deposit release confirmation email
  - _Requirements: 10.1_

- [ ] 11.3 Implement partial deposit capture
  - Calculate capture amount from damage_cost
  - Capture specified amount from deposit Payment Intent
  - Calculate refund_amount as deposit_amount - damage_cost
  - Update booking status to 'deposit_captured'
  - _Requirements: 10.2, 10.3_

- [ ] 11.4 Add deposit transaction notifications
  - Send email when deposit is released
  - Send email when deposit is captured with damage details
  - Include transaction details and refund amount
  - _Requirements: 10.5_


## Phase 10: Messaging System

- [ ] 12. Build in-app messaging functionality
- [ ] 12.1 Create message sending system
  - Build send-message Edge Function
  - Validate sender_id matches authenticated user
  - Insert message into messages table
  - Set is_read to false for new messages
  - _Requirements: 11.1_

- [ ] 12.2 Build message thread view
  - Create src/app/messages/page.tsx
  - Query messages where user is sender or recipient
  - Group messages by conversation (booking_id)
  - Display messages ordered by created_at
  - _Requirements: 11.2_

- [ ] 12.3 Implement message read status
  - Mark messages as read when opened
  - Update is_read to true in database
  - Show unread count badge in navigation
  - _Requirements: 11.3, 11.4_

- [ ] 12.4 Add booking context to messages
  - Display item name and booking dates with messages
  - Link to booking details from message thread
  - Filter messages by booking_id
  - _Requirements: 11.5_


## Phase 11: Review & Rating System

- [ ] 13. Implement review and rating functionality
- [ ] 13.1 Create review submission form
  - Build ReviewForm component with star rating
  - Enable review submission when booking is completed
  - Require rating between 1-5 stars
  - Allow optional comment text
  - _Requirements: 12.1, 12.2_

- [ ] 13.2 Save reviews to database
  - Insert review with reviewer_id, reviewee_id, item_id
  - Save rating and comment to reviews table
  - Associate review with booking_id
  - _Requirements: 12.3_

- [ ] 13.3 Display reviews on profiles
  - Query reviews where user is reviewee
  - Calculate average rating from all reviews
  - Display rating count and average on profile
  - Show individual reviews with comments
  - _Requirements: 12.4_

- [ ] 13.4 Display reviews on item pages
  - Query reviews filtered by item_id
  - Show reviews ordered by created_at descending
  - Display reviewer name and rating
  - _Requirements: 12.5_


## Phase 12: License Verification

- [ ] 14. Build license management system
- [ ] 14.1 Create license upload functionality
  - Build license upload form component
  - Upload license document to Supabase Storage
  - Save document_url, license_type, expiry_date to licenses table
  - Set is_verified to false initially
  - _Requirements: 13.1, 13.2_

- [ ] 14.2 Implement admin license verification
  - Build admin verification UI
  - Display pending licenses for review
  - Allow admin to approve/reject licenses
  - Set is_verified to true and record verified_at timestamp
  - _Requirements: 13.3_

- [ ] 14.3 Add license validation for bookings
  - Check license requirements when creating booking
  - Query licenses table for matching license_type
  - Verify is_verified = true and expiry_date is future
  - Block booking creation if license invalid
  - _Requirements: 13.4, 13.5_


## Phase 13: Mobile Optimization

- [ ] 15. Optimize application for mobile devices
- [ ] 15.1 Implement responsive layouts
  - Update all pages to use responsive Tailwind classes
  - Test layouts on mobile breakpoints (< 768px)
  - Ensure proper spacing and readability on small screens
  - _Requirements: 14.1_

- [ ] 15.2 Add mobile-friendly photo upload
  - Support camera capture for photo uploads
  - Use accept="image/*" and capture="environment" attributes
  - Optimize image preview for mobile screens
  - _Requirements: 14.2_

- [ ] 15.3 Optimize form inputs for mobile
  - Use appropriate input types (tel, email, date)
  - Ensure proper keyboard displays on mobile
  - Add autocomplete attributes for better UX
  - _Requirements: 14.3_

- [ ] 15.4 Improve touch interactions
  - Ensure all buttons have minimum 44×44px tap targets
  - Add touch-friendly spacing between interactive elements
  - Test gesture interactions (swipe, pinch-to-zoom)
  - _Requirements: 14.4_

- [ ]* 15.5 Run Lighthouse mobile audit
  - Test performance, accessibility, best practices
  - Achieve score of 90+ on all metrics
  - Fix any identified issues
  - _Requirements: 14.5_


## Phase 14: Error Handling & User Feedback

- [ ] 16. Implement comprehensive error handling
- [ ] 16.1 Add form validation error display
  - Show field-level errors from Zod validation
  - Display errors next to invalid fields
  - Prevent form submission until errors resolved
  - _Requirements: 15.1_

- [ ] 16.2 Implement network error handling
  - Catch and handle Supabase client errors
  - Display user-friendly error messages
  - Add retry buttons for failed requests
  - _Requirements: 15.2_

- [ ] 16.3 Add loading states
  - Show loading spinners during async operations
  - Disable buttons during submission
  - Display skeleton loaders for data fetching
  - _Requirements: 15.3_

- [ ] 16.4 Implement success notifications
  - Show toast notifications for successful operations
  - Display confirmation messages with relevant details
  - Auto-dismiss after appropriate duration
  - _Requirements: 15.4_

- [ ] 16.5 Add error logging
  - Log errors to console in development
  - Implement error tracking service integration
  - Log critical errors without exposing sensitive data
  - _Requirements: 15.5_


## Phase 15: Beta Launch Preparation

- [ ] 17. Prepare system for beta launch
- [ ] 17.1 Set up production Supabase project
  - Create production Supabase project
  - Run database migrations in production
  - Configure production environment variables
  - Set up Supabase Storage buckets
  - _Requirements: 16.5_

- [ ] 17.2 Configure Stripe production environment
  - Switch to Stripe live keys
  - Set up production webhook endpoint
  - Test webhook delivery to production
  - Configure Stripe Connect if needed
  - _Requirements: 16.4_

- [ ] 17.3 Implement monitoring and logging
  - Set up error tracking (Sentry or similar)
  - Configure Vercel Analytics
  - Monitor Supabase dashboard metrics
  - Set up alerts for critical errors
  - _Requirements: 16.3_

- [ ] 17.4 Performance optimization
  - Optimize images with Next.js Image component
  - Implement code splitting for large components
  - Add React Query caching for frequently accessed data
  - Minimize bundle size
  - _Requirements: 16.2_

- [ ]* 17.5 Security audit
  - Review all RLS policies
  - Test authentication flows for vulnerabilities
  - Validate input sanitization
  - Check for exposed sensitive data
  - _Requirements: 16.5_

- [ ]* 17.6 End-to-end testing
  - Test complete user journey from signup to booking
  - Test payment flows with Stripe test cards
  - Test deposit release and capture scenarios
  - Verify email notifications are sent
  - _Requirements: 16.1, 16.4_

- [ ] 17.7 Deploy to production
  - Deploy Next.js app to Vercel
  - Verify all environment variables are set
  - Test production deployment
  - Monitor for errors after deployment
  - _Requirements: 16.3_

