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
- [ ] Click user avatar in header
- [ ] Click "Log out"
- [ ] Verify redirect to home page
- [ ] Confirm header shows login buttons again

## Phase 3: Item Listing & Management

### Create New Listing
- [ ] Navigate to `/listings/new` or click "List an Item" in header
- [ ] **Step 1 - Basic Info:**
  - [ ] Enter title (min 5 characters)
  - [ ] Enter description (min 20 characters)
  - [ ] Select category
  - [ ] Click "Next"
- [ ] **Step 2 - Pricing:**
  - [ ] Enter price per day
  - [ ] Enter replacement value
  - [ ] Enter security deposit
  - [ ] Click "Next"
- [ ] **Step 3 - Availability:**
  - [ ] Set minimum rental days
  - [ ] Set maximum rental days (must be >= minimum)
  - [ ] Select pickup type (Renter Pickup or Owner Delivery)
  - [ ] Click "Next"
- [ ] **Step 4 - Photos:**
  - [ ] Upload at least one photo (drag & drop or click to upload)
  - [ ] Verify photo preview appears
  - [ ] Test removing a photo
  - [ ] Click "Next"
- [ ] **Step 5 - Requirements:**
  - [ ] Enter pickup address
  - [ ] Optionally check "Require license"
  - [ ] Click "Create Listing"
- [ ] Verify success message
- [ ] Confirm redirect to `/dashboard/listings`

### View My Listings
- [ ] Navigate to `/dashboard/listings`
- [ ] Verify your created item appears
- [ ] Check item shows correct photo, title, category, and price
- [ ] Toggle availability switch (Available/Hidden)
- [ ] Verify item status updates

### Edit Listing
- [ ] Click edit icon on a listing
- [ ] Modify any field
- [ ] Save changes
- [ ] Verify updates are reflected

### Delete Listing
- [ ] Click delete icon on a listing
- [ ] Confirm deletion in dialog
- [ ] Verify item is removed from list

### View Item Details
- [ ] Navigate to `/browse`
- [ ] Click on any item
- [ ] Verify all details display correctly:
  - [ ] Photo carousel (if multiple photos)
  - [ ] Title, category, description
  - [ ] Price per day
  - [ ] Security deposit and replacement value
  - [ ] Rental period constraints
  - [ ] Pickup type
  - [ ] Owner information
- [ ] If you're the owner, verify "Edit Listing" button shows
- [ ] If you're not the owner, verify "Request Booking" button shows

## Phase 4: Search & Discovery

### Browse Items
- [ ] Navigate to `/browse`
- [ ] Verify all available items display in grid
- [ ] Check item cards show photo, title, category, and price

### Category Filter
- [ ] Select a category from dropdown
- [ ] Verify only items in that category display
- [ ] Select "All Categories"
- [ ] Verify all items display again

### Price Filter
- [ ] Adjust price range slider
- [ ] Verify only items within price range display
- [ ] Move slider to maximum
- [ ] Verify all items display

### Location Filter
- [ ] Enter a city in the city filter
- [ ] Verify only items from that city display
- [ ] Enter a state in the state filter
- [ ] Verify filtering works
- [ ] Clear filters
- [ ] Verify all items display

### Keyword Search
- [ ] Enter a search term in the search box (if implemented)
- [ ] Verify items matching title or description display
- [ ] Clear search
- [ ] Verify all items display

## Phase 5: Booking System

### Create Booking Request
- [ ] Navigate to an item detail page (not your own)
- [ ] Click "Request Booking"
- [ ] Verify redirect to `/bookings/new?itemId=...`
- [ ] **Select Dates:**
  - [ ] Click start date on calendar
  - [ ] Click end date on calendar
  - [ ] Verify rental days calculation is correct
- [ ] **Validate Duration:**
  - [ ] Try selecting dates shorter than minimum rental days
  - [ ] Verify error message appears
  - [ ] Try selecting dates longer than maximum rental days
  - [ ] Verify error message appears
  - [ ] Select valid date range
  - [ ] Verify error clears
- [ ] **Check Cost Breakdown:**
  - [ ] Verify rental fee = price_per_day × days
  - [ ] Verify security deposit displays
  - [ ] Verify total = rental fee + deposit
- [ ] Click "Proceed to Payment"
- [ ] Verify redirect to checkout page

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
- [ ] On checkout page, verify booking summary displays:
  - [ ] Item photo and title
  - [ ] Booking dates
  - [ ] Rental fee
  - [ ] Security deposit
  - [ ] Total amount
- [ ] **Enter Payment Details:**
  - [ ] Use Stripe test card: `4242 4242 4242 4242`
  - [ ] Enter any future expiry date (e.g., 12/34)
  - [ ] Enter any 3-digit CVC (e.g., 123)
  - [ ] Enter any ZIP code (e.g., 12345)
- [ ] Click "Pay $X.XX"
- [ ] Verify processing indicator shows
- [ ] Verify success message appears
- [ ] Verify redirect to confirmation page

### Payment Failure Handling
- [ ] Return to checkout page
- [ ] Use Stripe test card for decline: `4000 0000 0000 0002`
- [ ] Enter payment details
- [ ] Click "Pay"
- [ ] Verify error message displays
- [ ] Verify you can retry with different card
- [ ] Use valid test card and complete payment

### Booking Status Updates
- [ ] After successful payment, check Supabase dashboard
- [ ] Verify booking status changed from "requested" to "paid"
- [ ] Verify `payment_intent_id` and `deposit_pi_id` are populated

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
