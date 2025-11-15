# Requirements Document

## Introduction

Rentilia is migrating from a problematic Firebase-based codebase to a fresh, clean architecture using Supabase as the complete backend solution. This migration must deliver a beta-ready peer-to-peer rental marketplace within 3-4 weeks, supporting 30 initial users with full payment processing, booking management, and user communication features.

The system must handle the complete rental lifecycle: item listing → search/discovery → booking request → payment (rental fee + security deposit) → pickup confirmation → return confirmation → deposit release/capture → owner payout.

## Glossary

- **Rentilia System**: The complete peer-to-peer rental marketplace platform
- **Supabase Backend**: PostgreSQL database, authentication, storage, and edge functions provided by Supabase
- **Renter**: A user who books and pays to use items owned by others
- **Owner**: A user who lists items for rent and receives payments
- **Booking**: A rental transaction with defined start/end dates, payment, and status tracking
- **Security Deposit**: A refundable amount held during rental to cover potential damages
- **Rental Fee**: The non-refundable payment for using an item during the booking period
- **Licensed Equipment**: Items requiring certification (e.g., chainsaws, commercial vehicles)
- **Pickup Type**: Method of item transfer - either renter pickup or owner delivery
- **Payment Intent**: Stripe's representation of a payment transaction
- **Edge Function**: Serverless function running on Supabase infrastructure
- **Row Level Security (RLS)**: PostgreSQL security policies controlling data access
- **Beta Launch**: Initial release to 30 test users for validation

## Requirements

### Requirement 1: Firebase Dependency Removal

**User Story:** As a developer, I want to completely remove all Firebase dependencies from the codebase, so that the application runs exclusively on Supabase infrastructure without conflicts or legacy code.

#### Acceptance Criteria

1. WHEN the developer inspects package.json, THE Rentilia System SHALL contain zero Firebase-related dependencies
2. WHEN the developer searches the codebase for Firebase imports, THE Rentilia System SHALL return zero results for Firebase SDK references
3. WHEN the application builds, THE Rentilia System SHALL complete without Firebase-related errors or warnings
4. WHEN the developer reviews environment variables, THE Rentilia System SHALL contain only Supabase and Stripe configuration keys
5. THE Rentilia System SHALL replace all Firebase authentication calls with Supabase authentication equivalents

### Requirement 2: Supabase Database Schema Implementation

**User Story:** As a platform administrator, I want a complete database schema that supports all rental marketplace features, so that the system can track users, items, bookings, payments, reviews, and communications.

#### Acceptance Criteria

1. THE Rentilia System SHALL create a profiles table with fields for full_name, email, phone, bio, avatar_url, city, state, stripe_account_id, and terms acceptance tracking
2. THE Rentilia System SHALL create an items table with fields for title, description, category, price_per_day, replacement_value, deposit_amount, pickup_type, is_license_required, min_rental_days, max_rental_days, and photo_urls
3. THE Rentilia System SHALL create a bookings table with fields for item_id, renter_id, start_datetime, end_datetime, total_rental_fee, deposit_amount, status, payment_intent_id, deposit_pi_id, pickup_confirmed_at, return_confirmed_at, and refund_amount
4. THE Rentilia System SHALL create supporting tables for reviews, licenses, return_evidence, messages, and user_roles
5. THE Rentilia System SHALL implement a booking_status enum with values: pending, requested, paid, picked_up, returned_waiting_owner, closed_no_damage, deposit_captured, cancelled
6. THE Rentilia System SHALL enable Row Level Security on all tables with appropriate access policies

### Requirement 3: User Authentication and Profile Management

**User Story:** As a new user, I want to sign up, verify my email, complete my profile, and accept terms of service, so that I can start using the rental marketplace as either a renter or owner.

#### Acceptance Criteria

1. WHEN a user submits valid signup credentials, THE Rentilia System SHALL create an authenticated user account via Supabase Auth
2. WHEN a user signs up, THE Rentilia System SHALL send an email verification link to the provided email address
3. WHEN a new user first logs in, THE Rentilia System SHALL require profile completion including full_name, city, state, and bio
4. WHEN a user accesses protected features, THE Rentilia System SHALL require terms_accepted to be true
5. WHEN a user updates their profile, THE Rentilia System SHALL validate and save changes to the profiles table with updated_at timestamp

### Requirement 4: Item Listing and Management

**User Story:** As an owner, I want to create detailed item listings with photos, pricing, availability rules, and pickup options, so that renters can discover and book my items.

#### Acceptance Criteria

1. WHEN an owner creates an item listing, THE Rentilia System SHALL require title, description, category, price_per_day, replacement_value, deposit_amount, and pickup_address
2. WHEN an owner uploads item photos, THE Rentilia System SHALL store images in Supabase Storage and save URLs in the photo_urls array
3. WHEN an owner specifies rental constraints, THE Rentilia System SHALL save min_rental_days and max_rental_days to enforce booking duration limits
4. WHEN an owner marks an item as requiring a license, THE Rentilia System SHALL set is_license_required to true
5. WHEN an owner selects pickup type, THE Rentilia System SHALL save either renter_pickup or owner_delivery to the pickup_type field

### Requirement 5: Search and Discovery

**User Story:** As a renter, I want to search and filter available items by category, location, price, and pickup type, so that I can find items that meet my needs.

#### Acceptance Criteria

1. WHEN a renter views the browse page, THE Rentilia System SHALL display all items where is_available equals true
2. WHEN a renter applies category filters, THE Rentilia System SHALL return only items matching the selected category
3. WHEN a renter applies location filters, THE Rentilia System SHALL return items from owners in the specified city or state
4. WHEN a renter applies price filters, THE Rentilia System SHALL return items where price_per_day falls within the specified range
5. WHEN a renter searches by keyword, THE Rentilia System SHALL match against item title and description fields

### Requirement 6: Booking Request and Validation

**User Story:** As a renter, I want to request a booking for specific dates and see the total cost breakdown, so that I understand what I'm paying before committing.

#### Acceptance Criteria

1. WHEN a renter selects booking dates, THE Rentilia System SHALL validate that the duration meets the item's min_rental_days and max_rental_days constraints
2. WHEN a renter requests a booking, THE Rentilia System SHALL calculate total_rental_fee as (price_per_day × number_of_days)
3. WHEN a renter views booking summary, THE Rentilia System SHALL display separate line items for rental fee and security deposit
4. IF the item has is_license_required set to true, THEN THE Rentilia System SHALL verify the renter has a valid, verified license before allowing booking
5. WHEN a booking is created, THE Rentilia System SHALL set status to requested and save all booking details to the bookings table

### Requirement 7: Payment Processing with Stripe

**User Story:** As a renter, I want to securely pay the rental fee and authorize the security deposit using my credit card, so that I can confirm my booking.

#### Acceptance Criteria

1. WHEN a renter proceeds to checkout, THE Rentilia System SHALL create a Stripe Payment Intent for the total_rental_fee amount
2. WHEN a renter proceeds to checkout, THE Rentilia System SHALL create a separate Stripe Payment Intent for the deposit_amount with capture_method set to manual
3. WHEN payment is successful, THE Rentilia System SHALL save the payment_intent_id and deposit_pi_id to the bookings table
4. WHEN payment is successful, THE Rentilia System SHALL update booking status from requested to paid
5. WHEN payment fails, THE Rentilia System SHALL display a clear error message and allow the renter to retry with a different payment method

### Requirement 8: Stripe Webhook Processing

**User Story:** As the system, I want to receive and process Stripe webhook events reliably, so that booking statuses and payment records stay synchronized with actual payment outcomes.

#### Acceptance Criteria

1. WHEN Stripe sends a payment_intent.succeeded event, THE Rentilia System SHALL update the corresponding booking status to paid
2. WHEN Stripe sends a payment_intent.payment_failed event, THE Rentilia System SHALL log the failure and notify the renter via email
3. WHEN processing webhook events, THE Rentilia System SHALL verify the webhook signature using the Stripe webhook secret
4. WHEN processing webhook events, THE Rentilia System SHALL implement idempotency to prevent duplicate processing
5. WHEN a webhook is processed, THE Rentilia System SHALL log the event type, booking_id, and processing outcome

### Requirement 9: Pickup and Return Confirmation

**User Story:** As an owner and renter, I want to confirm when an item is picked up and returned, so that the rental period is accurately tracked and the deposit can be released.

#### Acceptance Criteria

1. WHEN an owner confirms pickup, THE Rentilia System SHALL update booking status to picked_up and set pickup_confirmed_at to the current timestamp
2. WHEN a renter initiates return, THE Rentilia System SHALL update booking status to returned_waiting_owner
3. WHEN an owner confirms return with no damage, THE Rentilia System SHALL update booking status to closed_no_damage and set return_confirmed_at
4. WHEN an owner uploads return photos, THE Rentilia System SHALL save the image URL to return_photo_url in the bookings table
5. IF an owner reports damage, THEN THE Rentilia System SHALL allow creation of a return_evidence record with damage_description and damage_cost

### Requirement 10: Security Deposit Management

**User Story:** As a renter, I want my security deposit automatically released when I return an item undamaged, so that I receive my refund promptly without manual intervention.

#### Acceptance Criteria

1. WHEN a booking reaches closed_no_damage status, THE Rentilia System SHALL cancel the deposit Payment Intent to release the authorization
2. WHEN an owner reports damage with a cost less than the deposit, THE Rentilia System SHALL capture the damage_cost amount from the deposit Payment Intent
3. WHEN an owner reports damage with a cost less than the deposit, THE Rentilia System SHALL calculate and save refund_amount as (deposit_amount - damage_cost)
4. WHEN a partial deposit is captured, THE Rentilia System SHALL update booking status to deposit_captured
5. WHEN deposit operations complete, THE Rentilia System SHALL send email notifications to both renter and owner with transaction details

### Requirement 11: In-App Messaging

**User Story:** As a renter or owner, I want to send messages to the other party about a booking, so that we can coordinate pickup, ask questions, and resolve issues.

#### Acceptance Criteria

1. WHEN a user sends a message, THE Rentilia System SHALL save the message to the messages table with sender_id, recipient_id, booking_id, and content
2. WHEN a user views their messages, THE Rentilia System SHALL display all messages where they are either sender or recipient, ordered by created_at
3. WHEN a user receives a new message, THE Rentilia System SHALL set is_read to false
4. WHEN a user opens a message, THE Rentilia System SHALL update is_read to true
5. WHERE a message is related to a booking, THE Rentilia System SHALL display the booking context (item name, dates) alongside the message thread

### Requirement 12: Review and Rating System

**User Story:** As a user, I want to leave reviews and ratings after completing a rental, so that I can share my experience and help build trust in the community.

#### Acceptance Criteria

1. WHEN a booking reaches closed_no_damage or deposit_captured status, THE Rentilia System SHALL enable review submission for both renter and owner
2. WHEN a user submits a review, THE Rentilia System SHALL require a rating between 1 and 5 stars
3. WHEN a user submits a review, THE Rentilia System SHALL save reviewer_id, reviewee_id, item_id, rating, and comment to the reviews table
4. WHEN a user views a profile, THE Rentilia System SHALL calculate and display the average rating from all reviews where the user is the reviewee
5. WHEN a user views an item, THE Rentilia System SHALL display reviews where the item_id matches, ordered by created_at descending

### Requirement 13: License Verification System

**User Story:** As an owner of licensed equipment, I want to verify that renters have valid certifications before allowing bookings, so that I comply with legal requirements and reduce liability.

#### Acceptance Criteria

1. WHEN a user uploads a license document, THE Rentilia System SHALL store the file in Supabase Storage and save the document_url to the licenses table
2. WHEN a user uploads a license, THE Rentilia System SHALL save license_type and expiry_date
3. WHEN an admin reviews a license, THE Rentilia System SHALL allow setting is_verified to true and recording verified_at timestamp
4. WHEN a renter attempts to book licensed equipment, THE Rentilia System SHALL check for a valid license where license_type matches requirements and expiry_date is in the future
5. IF a renter lacks a valid verified license for licensed equipment, THEN THE Rentilia System SHALL prevent booking creation and display a clear error message

### Requirement 14: Mobile Responsiveness

**User Story:** As a mobile user, I want all features to work seamlessly on my smartphone, so that I can manage rentals on the go.

#### Acceptance Criteria

1. WHEN a user accesses the site on a mobile device, THE Rentilia System SHALL display a responsive layout optimized for screen widths below 768 pixels
2. WHEN a mobile user uploads photos, THE Rentilia System SHALL support camera capture in addition to file selection
3. WHEN a mobile user interacts with forms, THE Rentilia System SHALL use appropriate input types (tel for phone, email for email, date for dates)
4. WHEN a mobile user navigates, THE Rentilia System SHALL provide touch-friendly buttons with minimum 44×44 pixel tap targets
5. THE Rentilia System SHALL achieve a Google Lighthouse mobile score of 90 or higher for performance and accessibility

### Requirement 15: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when operations succeed or fail, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. WHEN a user submits a form with validation errors, THE Rentilia System SHALL display specific error messages next to each invalid field
2. WHEN a network request fails, THE Rentilia System SHALL display a user-friendly error message and suggest retry actions
3. WHEN a long-running operation is in progress, THE Rentilia System SHALL display a loading indicator
4. WHEN an operation completes successfully, THE Rentilia System SHALL display a success message with relevant details
5. WHEN a critical error occurs, THE Rentilia System SHALL log the error details for debugging while showing a generic message to the user

### Requirement 16: Beta Launch Readiness

**User Story:** As a product manager, I want the system to support 30 beta users with reliable performance and security, so that we can validate the marketplace concept and gather feedback.

#### Acceptance Criteria

1. THE Rentilia System SHALL support concurrent usage by 30 authenticated users without performance degradation
2. THE Rentilia System SHALL achieve page load times under 2 seconds for all core pages on standard broadband connections
3. THE Rentilia System SHALL maintain 99.5% uptime during the beta testing period
4. THE Rentilia System SHALL process payments with 100% success rate excluding legitimate card declines
5. THE Rentilia System SHALL implement comprehensive Row Level Security policies preventing unauthorized data access across all tables
