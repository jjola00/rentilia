# Rentilia Testing Checklist

## Prerequisites
- [x] Supabase project is set up and running
- [x] All migrations have been applied to the database
- [x] Stripe account is configured (test mode)
- [x] Environment variables are set in `.env.local`
- [x] Development server is running (`npm run dev`)

## Phase 1 & 2: Authentication & User Management

### Sign Up
- [x] Navigate to `/signup`
- [x] Fill in email, password, and full name
- [x] Click "Sign Up"
- [x] Verify account is created (check Supabase dashboard → Authentication → Users)
- [x] Check that profile is created in `profiles` table
- [x] Verify email verification email is sent (if enabled)

### Login
- [x] Navigate to `/login`
- [x] Enter valid credentials
- [x] Click "Log In"
- [x] Verify redirect to home page
- [x] Check that header shows user avatar/initial instead of login buttons

### Google OAuth
- [x] Click "Continue with Google" on signup/login page
- [x] Complete Google authentication
- [x] Verify redirect back to app
- [x] Check profile is created with Google data (name, avatar)

### Profile Management
- [x] Navigate to `/dashboard/profile`
- [x] Update profile information (name, phone, city, state, bio)
- [x] Click "Save Changes"
- [x] Verify success message
- [x] Refresh page and confirm changes persisted

### Logout
- [x] Click user avatar in header
- [x] Click "Log out"
- [x] Verify redirect to home page
- [x] Confirm header shows login buttons again

## Phase 3: Item Listing & Management

### Create New Listing
- [x] Navigate to `/listings/new` or click "List an Item" in header
- [x] **Step 1 - Basic Info:**
  - [x] Enter title (min 5 characters)
  - [x] Enter description (min 20 characters)
  - [x] Select category
  - [x] Click "Next"
- [x] **Step 2 - Pricing:**
  - [x] Enter price per day
  - [x] Enter replacement value
  -[x] Enter security deposit
  - [x] Click "Next"
- [x] **Step 3 - Availability:**
  - [x] Set minimum rental days
  - [x] Set maximum rental days (must be >= minimum)
  - [x] Select pickup type (Renter Pickup or Owner Delivery)
  - [x] Click "Next"
- [x] **Step 4 - Photos:**
  - [x] Upload at least one photo (drag & drop or click to upload)
  - [x] Verify photo preview appears
  - [x] Test removing a photo
  - [x] Click "Next"
- [x] **Step 5 - Requirements:**
  - [x] Enter pickup address
  - [x] Optionally check "Require license"
  - [x] Click "Create Listing"
- [x] Verify success message
- [x] Confirm redirect to `/dashboard/listings`

### View My Listings
- [x] Navigate to `/dashboard/listings`
- [x] Verify your created item appears
- [x] Check item shows correct photo, title, category, and price
- [x] Toggle availability switch (Available/Hidden)
- [x] Verify item status updates

### Edit Listing
- [x] Click edit icon on a listing
- [x] Modify any field
- [x] Save changes
- [x] Verify updates are reflected

### Delete Listing
- [x] Click delete icon on a listing
- [x] Confirm deletion in dialog
- [x] Verify item is removed from list

### View Item Details
- [x] Navigate to `/browse`
- [x] Click on any item
- [x] Verify all details display correctly:
  - [x] Photo carousel (if multiple photos)
  - [x] Title, category, description
  - [x] Price per day
  - [x] Security deposit and replacement value
  - [x] Rental period constraints
  - [x] Pickup type
  - [x] Owner information
- [x] If you're the owner, verify "Edit Listing" button shows
- [x] If you're not the owner, verify "Request Booking" button shows

## Phase 4: Search & Discovery

### Browse Items
- [x] Navigate to `/browse`
- [x] Verify all available items display in grid
- [x] Check item cards show photo, title, category, and price

### Category Filter
- [x] Select a category from dropdown
- [x] Verify only items in that category display
- [x] Select "All Categories"
- [x] Verify all items display again

### Price Filter
- [x] Adjust price range slider
- [x] Verify only items within price range display
- [x] Move slider to maximum
- [x] Verify all items display

### Location Filter
- [x] Enter a city in the city filter
- [x] Verify only items from that city display
- [x] Verify filtering works
- [x] Clear filters
- [x] Verify all items display

### Keyword Search
- [x] Enter a search term in the search box (if implemented)
- [x] Verify items matching title or description display
- [x] Clear search
- [x] Verify all items display

## Phase 5: Booking System

### Create Booking Request
- [x] Navigate to an item detail page (not your own)
- [x] Click "Request Booking"
- [x] Verify redirect to `/bookings/new?itemId=...`
- [x] **Select Dates:**
  - [x] Click start date on calendar
  - [x] Click end date on calendar
  - [x] Verify rental days calculation is correct
- [x] **Validate Duration:**
  - [x] Try selecting dates shorter than minimum rental days
  - [x] Verify error message appears
  - [x] Try selecting dates longer than maximum rental days
  - [x] Verify error message appears
  - [x] Select valid date range
  - [x] Verify error clears
- [x] **Check Cost Breakdown:**
  - [x] Verify rental fee = price_per_day × days
  - [x] Verify security deposit displays
  - [x] Verify total = rental fee + deposit
- [x] Click "Proceed to Payment"
- [x] Verify redirect to checkout page

### License Verification (if item requires license)
- [ ] Try to book an item that requires a license
- [ ] If you don't have a verified license:
  - [ ] Verify warning message displays
  - [ ] Verify "Proceed to Payment" button is disabled
- [ ] Upload a license (if needed):
  - [ ] Navigate to profile or license upload page
  - [ ] Upload license document
  - [ ] Wait for admin verification (or verify in Supabase dashboard)
- [ ] Return to booking page
- [ ] Verify license check passes

## Phase 6: Payment Integration

### Checkout Process
- [x] On checkout page, verify booking summary displays:
  - [x] Item photo and title
  - [x] Booking dates
  - [x] Rental fee
  - [x] Security deposit
  - [x] Total amount
- [x] **Enter Payment Details:**
  - [x] Use Stripe test card: `4242 4242 4242 4242`
  - [x] Enter any future expiry date (e.g., 12/34)
  - [x] Enter any 3-digit CVC (e.g., 123)
  - [x] Enter any ZIP code (e.g., 12345)
- [x] Click "Pay $X.XX"
- [x] Verify processing indicator shows
- [x] Verify success message appears
- [x] Verify redirect to confirmation page

### Payment Failure Handling
- [ ] Return to checkout page
- [ ] Use Stripe test card for decline: `4000 0000 0000 0002`
- [ ] Enter payment details
- [ ] Click "Pay"
- [ ] Verify error message displays
- [ ] Verify you can retry with different card
- [ ] Use valid test card and complete payment

### Booking Status Updates
- [x] After successful payment, check Supabase dashboard
- [x] Verify booking status changed from "requested" to "paid"
- [x] Verify `payment_intent_id` and `deposit_pi_id` are populated

### Return & Deposit Handling
- [x] Owner confirms pickup from dashboard
- [x] Renter marks item as returned
- [x] Owner confirms return with no damage → deposit released
- [x] Owner reports damage with amount/notes/evidence → deposit capture succeeds
- [ ] Verify booking history/status is visible in a detail view (missing UI)

## Phase 7: Webhook Processing

### Webhook Setup (Manual)
- [ ] In Stripe Dashboard, go to Developers → Webhooks
- [ ] Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
- [ ] Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- [ ] Copy webhook signing secret
- [ ] Add to Supabase Edge Function secrets as `STRIPE_WEBHOOK_SECRET`

### Test Webhook Events
- [ ] Make a test payment
- [ ] Check Stripe Dashboard → Developers → Webhooks → Recent deliveries
- [ ] Verify webhook was delivered successfully
- [ ] Check Supabase dashboard → `webhook_events` table
- [ ] Verify event was logged with correct `event_id` and `event_type`

### Idempotency Check
- [ ] In Stripe Dashboard, find a webhook event
- [ ] Click "Resend"
- [ ] Check `webhook_events` table
- [ ] Verify duplicate event was not processed again

## Database Verification

### Check Tables
- [ ] Open Supabase dashboard → Table Editor
- [ ] Verify all tables exist:
  - [ ] profiles
  - [ ] user_roles
  - [ ] items
  - [ ] bookings
  - [ ] reviews
  - [ ] licenses
  - [ ] return_evidence
  - [ ] messages
  - [ ] webhook_events
  - [ ] payment_failures

### Check RLS Policies
- [ ] Go to Supabase dashboard → Authentication → Policies
- [ ] Verify policies exist for all tables
- [ ] Test that users can only access their own data:
  - [ ] Try to view another user's profile (should fail)
  - [ ] Try to edit another user's item (should fail)
  - [ ] Try to view another user's bookings (should fail)

### Check Data Integrity
- [ ] Run: `npm run verify-db`
- [ ] Verify all checks pass
- [ ] Check for orphaned records (bookings without items, etc.)

## Edge Cases & Error Handling

### Authentication Errors
- [ ] Try to access `/dashboard` without logging in
- [ ] Verify redirect to `/login`
- [ ] Try to access `/listings/new` without logging in
- [ ] Verify redirect to `/login`

### Validation Errors
- [ ] Try to create item with title < 5 characters
- [ ] Verify error message displays
- [ ] Try to create item with description < 20 characters
- [ ] Verify error message displays
- [ ] Try to set max rental days < min rental days
- [ ] Verify error message displays

### Network Errors
- [ ] Disconnect internet
- [ ] Try to load browse page
- [ ] Verify error message displays
- [ ] Reconnect internet
- [ ] Verify page loads correctly

### Permission Errors
- [ ] Try to book your own item
- [ ] Verify error message and redirect
- [ ] Try to edit another user's item (via URL manipulation)
- [ ] Verify access denied

## Performance & UX

### Loading States
- [ ] Verify loading spinners show during:
  - [ ] Page loads
  - [ ] Form submissions
  - [ ] Payment processing
  - [ ] Photo uploads

### Responsive Design
- [ ] Test on mobile device or resize browser to mobile width
- [ ] Verify all pages are responsive:
  - [ ] Home page
  - [ ] Browse page
  - [ ] Item details
  - [ ] Booking form
  - [ ] Checkout page
  - [ ] Dashboard
- [ ] Verify touch targets are large enough
- [ ] Verify text is readable

### Success Messages
- [ ] Verify toast notifications appear for:
  - [ ] Successful login
  - [ ] Successful signup
  - [ ] Profile updated
  - [ ] Item created
  - [ ] Item updated
  - [ ] Item deleted
  - [ ] Booking created
  - [ ] Payment successful

### Error Messages
- [ ] Verify error messages are clear and actionable
- [ ] Verify errors don't expose sensitive information
- [ ] Verify errors are logged to console for debugging

## Final Checks

### Environment Variables
- [ ] Verify all required env vars are set:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`

### Build & Deploy
- [ ] Run: `npm run build`
- [ ] Verify build completes without errors
- [ ] Run: `npm run start`
- [ ] Verify production build works locally
- [ ] Test critical paths in production mode

### Security
- [ ] Verify passwords are not visible in forms
- [ ] Verify API keys are not exposed in client code
- [ ] Verify RLS policies prevent unauthorized access
- [ ] Verify payment information is handled securely

## Known Issues & Limitations

Document any issues found during testing:

1. **Issue:** [Description]
   - **Steps to reproduce:** [Steps]
   - **Expected:** [Expected behavior]
   - **Actual:** [Actual behavior]
   - **Severity:** [Critical/High/Medium/Low]

2. **Issue:** [Description]
   - **Steps to reproduce:** [Steps]
   - **Expected:** [Expected behavior]
   - **Actual:** [Actual behavior]
   - **Severity:** [Critical/High/Medium/Low]

## Test Results Summary

- **Total Tests:** [Number]
- **Passed:** [Number]
- **Failed:** [Number]
- **Blocked:** [Number]
- **Pass Rate:** [Percentage]

**Tested By:** [Your Name]  
**Date:** [Date]  
**Environment:** [Development/Staging/Production]  
**Browser:** [Chrome/Firefox/Safari/etc.]  
**Device:** [Desktop/Mobile/Tablet]

## Notes

Add any additional observations or recommendations here.
