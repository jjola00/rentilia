-- Reviews for booking participants and items
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  reviewer_role TEXT NOT NULL CHECK (reviewer_role IN ('renter', 'owner')),
  item_rating INT NOT NULL CHECK (item_rating BETWEEN 1 AND 5),
  user_rating INT NOT NULL CHECK (user_rating BETWEEN 1 AND 5),
  comment TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reviews_reviewer_reviewee_check CHECK (reviewer_id <> reviewee_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_booking_reviewer ON reviews(booking_id, reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_item ON reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(is_published);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can view published reviews or their own" ON reviews;
DROP POLICY IF EXISTS "Users can create booking reviews" ON reviews;

CREATE POLICY "Users can view published reviews or their own" ON reviews
  FOR SELECT USING (
    is_published = true OR reviewer_id = auth.uid()
  );

CREATE POLICY "Users can create booking reviews" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id
    AND reviewer_id <> reviewee_id
    AND EXISTS (
      SELECT 1
      FROM bookings b
      JOIN items i ON b.item_id = i.id
      WHERE b.id = booking_id
        AND b.status IN ('closed_no_damage', 'deposit_captured')
        AND i.id = item_id
        AND (
          (auth.uid() = b.renter_id AND i.owner_id = reviewee_id AND reviewer_role = 'renter')
          OR (auth.uid() = i.owner_id AND b.renter_id = reviewee_id AND reviewer_role = 'owner')
        )
    )
  );

CREATE OR REPLACE FUNCTION publish_reviews_for_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM reviews WHERE booking_id = NEW.booking_id AND reviewer_role = 'renter'
  ) AND EXISTS (
    SELECT 1 FROM reviews WHERE booking_id = NEW.booking_id AND reviewer_role = 'owner'
  ) THEN
    UPDATE reviews SET is_published = true WHERE booking_id = NEW.booking_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS publish_reviews_after_insert ON reviews;
CREATE TRIGGER publish_reviews_after_insert
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION publish_reviews_for_booking();
