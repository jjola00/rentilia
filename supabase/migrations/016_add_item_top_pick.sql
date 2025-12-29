ALTER TABLE items
ADD COLUMN IF NOT EXISTS is_top_pick boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_items_top_pick ON items(is_top_pick)
WHERE is_top_pick = true;
