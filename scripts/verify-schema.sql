-- Verify Database Schema
-- Run this in your Supabase SQL Editor to check your current schema

-- Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check items table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'items'
ORDER BY ordinal_position;

-- Check bookings table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- Check if category values in items match our constants
SELECT DISTINCT category, COUNT(*) as count
FROM items
GROUP BY category
ORDER BY category;

-- Check for any items with null or invalid categories
SELECT id, title, category
FROM items
WHERE category IS NULL 
   OR category NOT IN (
     'Tools & Equipment',
     'Party & Events',
     'Electronics',
     'Sports & Outdoors',
     'Vehicles',
     'Photography & Video',
     'Home & Garden',
     'Other'
   );

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'items', 'bookings', 'reviews', 'licenses', 'messages', 'user_roles', 'return_evidence')
ORDER BY tablename;
