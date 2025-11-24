-- Standardize category names across the database
-- This migration updates any items with old category names to match the new standard

-- Update "Outdoor & Sports" to "Sports & Outdoors"
UPDATE items
SET category = 'Sports & Outdoors'
WHERE category = 'Outdoor & Sports';

-- Update "Transportation" to "Vehicles"
UPDATE items
SET category = 'Vehicles'
WHERE category = 'Transportation';

-- Add a check constraint to ensure only valid categories are used
-- First, drop the constraint if it exists
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_category_check;

-- Add the constraint with valid categories
ALTER TABLE items ADD CONSTRAINT items_category_check
CHECK (category IN (
  'Tools & Equipment',
  'Party & Events',
  'Electronics',
  'Sports & Outdoors',
  'Vehicles',
  'Photography & Video',
  'Home & Garden',
  'Other'
));

-- Create an index on category for better filter performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
