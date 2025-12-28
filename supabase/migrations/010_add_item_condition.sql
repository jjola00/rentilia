ALTER TABLE items
ADD COLUMN IF NOT EXISTS condition text;

UPDATE items
SET condition = 'good'
WHERE condition IS NULL;

ALTER TABLE items
ALTER COLUMN condition SET NOT NULL;

ALTER TABLE items
DROP CONSTRAINT IF EXISTS items_condition_check;

ALTER TABLE items
ADD CONSTRAINT items_condition_check
CHECK (condition IN ('brand_new', 'excellent', 'good', 'fair', 'poor'));
