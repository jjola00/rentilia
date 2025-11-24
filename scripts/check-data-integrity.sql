-- Data Integrity Checks
-- Run this to identify any data issues

-- 1. Check for items without owners
SELECT id, title, owner_id
FROM items
WHERE owner_id IS NULL
   OR owner_id NOT IN (SELECT id FROM profiles);

-- 2. Check for items with invalid price values
SELECT id, title, price_per_day, deposit_amount, replacement_value
FROM items
WHERE price_per_day <= 0
   OR deposit_amount < 0
   OR replacement_value <= 0;

-- 3. Check for items with invalid rental day constraints
SELECT id, title, min_rental_days, max_rental_days
FROM items
WHERE min_rental_days <= 0
   OR max_rental_days <= 0
   OR max_rental_days < min_rental_days;

-- 4. Check for bookings with invalid dates
SELECT id, item_id, start_datetime, end_datetime
FROM bookings
WHERE end_datetime <= start_datetime;

-- 5. Check for bookings referencing non-existent items
SELECT b.id, b.item_id, b.renter_id
FROM bookings b
WHERE b.item_id NOT IN (SELECT id FROM items);

-- 6. Check for bookings with invalid renters
SELECT b.id, b.item_id, b.renter_id
FROM bookings b
WHERE b.renter_id NOT IN (SELECT id FROM profiles);

-- 7. Check for orphaned photos (items with empty photo_urls arrays)
SELECT id, title, photo_urls
FROM items
WHERE photo_urls IS NULL
   OR array_length(photo_urls, 1) IS NULL
   OR array_length(photo_urls, 1) = 0;

-- 8. Check profiles without required fields
SELECT id, full_name, email, city
FROM profiles
WHERE full_name IS NULL
   OR full_name = ''
   OR email IS NULL
   OR email = '';

-- 9. Summary statistics
SELECT 
  'Total Items' as metric,
  COUNT(*) as count
FROM items
UNION ALL
SELECT 
  'Available Items',
  COUNT(*)
FROM items
WHERE is_available = true
UNION ALL
SELECT 
  'Total Bookings',
  COUNT(*)
FROM bookings
UNION ALL
SELECT 
  'Total Users',
  COUNT(*)
FROM profiles;
