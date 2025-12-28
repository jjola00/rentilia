ALTER TABLE items
ADD COLUMN IF NOT EXISTS value_band text;

UPDATE items
SET value_band = CASE
  WHEN replacement_value IS NULL THEN '0_250'
  WHEN replacement_value <= 250 THEN '0_250'
  WHEN replacement_value <= 500 THEN '250_500'
  WHEN replacement_value <= 1000 THEN '500_1000'
  WHEN replacement_value <= 2500 THEN '1000_2500'
  WHEN replacement_value <= 5000 THEN '2500_5000'
  ELSE '5000_plus'
END
WHERE value_band IS NULL;

ALTER TABLE items
ALTER COLUMN value_band SET NOT NULL;

ALTER TABLE items
DROP CONSTRAINT IF EXISTS items_value_band_check;

ALTER TABLE items
ADD CONSTRAINT items_value_band_check
CHECK (value_band IN ('0_250', '250_500', '500_1000', '1000_2500', '2500_5000', '5000_plus'));

CREATE INDEX IF NOT EXISTS idx_items_value_band ON items(value_band);
