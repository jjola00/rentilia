ALTER TABLE items
DROP CONSTRAINT IF EXISTS items_category_value_cap_check;

ALTER TABLE items
ADD CONSTRAINT items_category_value_cap_check
CHECK (
  replacement_value IS NULL OR
  CASE category
    WHEN 'Tools & Equipment' THEN replacement_value <= 3000
    WHEN 'Party & Events' THEN replacement_value <= 2500
    WHEN 'Electronics' THEN replacement_value <= 3000
    WHEN 'Sports & Outdoors' THEN replacement_value <= 2500
    WHEN 'Vehicles' THEN replacement_value <= 15000
    WHEN 'Photography & Video' THEN replacement_value <= 5000
    WHEN 'Home & Garden' THEN replacement_value <= 2000
    WHEN 'Other' THEN replacement_value <= 1500
    ELSE false
  END
) NOT VALID;
