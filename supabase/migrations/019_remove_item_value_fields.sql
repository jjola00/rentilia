ALTER TABLE public.items
DROP CONSTRAINT IF EXISTS items_category_value_cap_check;

ALTER TABLE public.items
DROP CONSTRAINT IF EXISTS items_value_band_check;

DROP INDEX IF EXISTS idx_items_value_band;

ALTER TABLE public.items
DROP COLUMN IF EXISTS value_band;

ALTER TABLE public.items
DROP COLUMN IF EXISTS replacement_value;

ALTER TABLE public.items
DROP COLUMN IF EXISTS max_rental_days;
