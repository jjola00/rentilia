# Supabase Database Documentation

## Overview

This directory contains database migrations and documentation for the Rentilia Supabase database.

## Database Schema

### Core Tables

1. **profiles** - User profile information (extends auth.users)
2. **user_roles** - User role management (renter, owner, admin)
3. **items** - Rental item listings
4. **bookings** - Rental bookings and transactions
5. **reviews** - User and item reviews
6. **licenses** - License verification for certified equipment
7. **return_evidence** - Damage documentation for returns
8. **messages** - In-app messaging between users

### Enums

- **booking_status**: pending, requested, paid, picked_up, returned_waiting_owner, closed_no_damage, deposit_captured, cancelled
- **pickup_type**: renter_pickup, owner_delivery
- **user_role**: renter, owner, admin

## Migrations

### Initial Schema
The base schema should already be applied. It includes:
- All 8 core tables
- Basic RLS policies
- Enum types

### Migration 001: Indexes and Enhanced Policies
File: `migrations/001_add_indexes_and_policies.sql`

**To apply this migration:**
1. Go to Supabase Dashboard > SQL Editor
2. Copy the contents of `supabase/migrations/001_add_indexes_and_policies.sql`
3. Paste and click "Run"

**What it adds:**
- Performance indexes on frequently queried columns
- Enhanced RLS policies for all tables
- Automatic `updated_at` triggers for profiles, items, and bookings

## Row Level Security (RLS)

All tables have RLS enabled. Key policies:

### Profiles
- ✅ Public read access
- ✅ Users can update their own profile

### Items
- ✅ Public read access for available items
- ✅ Owners can CRUD their own items

### Bookings
- ✅ Participants (renter + owner) can view
- ✅ Renters can create bookings
- ✅ Participants can update status

### Messages
- ✅ Users can view their own messages
- ✅ Users can send messages
- ✅ Recipients can mark as read

### Reviews
- ✅ Public read access
- ✅ Users can create reviews

### Licenses
- ✅ Users can view their own licenses
- ✅ Admins can view all licenses
- ✅ Admins can verify licenses

## Storage Buckets

You'll need to create these storage buckets in Supabase:

1. **item-photos** - For rental item images
   - Public access for read
   - Authenticated users can upload

2. **avatars** - For user profile pictures
   - Public access for read
   - Users can upload their own

3. **licenses** - For license documents
   - Private access
   - Users can upload their own
   - Admins can view all

4. **return-evidence** - For return damage photos
   - Private access
   - Booking participants can view

## Verification

Run the verification script to check your database setup:

```bash
npm run verify-db
```

Or manually:

```bash
npx tsx scripts/verify-database.ts
```

## Generating TypeScript Types

To generate TypeScript types from your database schema:

```bash
npx supabase gen types typescript --project-id aldwqlcbzvldpzlmtxwd > src/lib/supabase/types.ts
```

Note: You'll need the Supabase CLI installed for this.

## Common Queries

### Get user profile
```typescript
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
```

### Get available items
```typescript
const { data } = await supabase
  .from('items')
  .select('*, owner:profiles(full_name, avatar_url)')
  .eq('is_available', true)
  .order('created_at', { ascending: false })
```

### Get user's bookings
```typescript
const { data } = await supabase
  .from('bookings')
  .select('*, item:items(*), renter:profiles(*)')
  .eq('renter_id', userId)
  .order('created_at', { ascending: false })
```

## Troubleshooting

### RLS Policy Errors
If you get "row-level security policy" errors:
1. Check that RLS is enabled on the table
2. Verify the user is authenticated
3. Check that appropriate policies exist

### Permission Errors
If you can't perform operations:
1. Verify you're using the correct Supabase key
2. Check RLS policies match your use case
3. Ensure user has the required role (for admin operations)

## Next Steps

1. ✅ Base schema applied
2. ⏳ Apply migration 001 (indexes and policies)
3. ⏳ Create storage buckets
4. ⏳ Set up storage policies
5. ⏳ Generate TypeScript types
