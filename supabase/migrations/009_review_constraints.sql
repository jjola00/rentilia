-- Enforce one review per role per booking and correct reviewer role

-- Ensure one review per side (renter/owner) per booking
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_booking_role
  ON reviews(booking_id, reviewer_role);

-- Validate reviewer role matches booking participation
CREATE OR REPLACE FUNCTION public.enforce_review_role()
RETURNS TRIGGER AS $$
DECLARE
  booking_renter uuid;
  booking_owner uuid;
BEGIN
  SELECT b.renter_id, i.owner_id
  INTO booking_renter, booking_owner
  FROM bookings b
  JOIN items i ON b.item_id = i.id
  WHERE b.id = NEW.booking_id;

  IF booking_renter IS NULL OR booking_owner IS NULL THEN
    RAISE EXCEPTION 'Booking or item not found for review';
  END IF;

  IF NEW.reviewer_id = booking_renter AND NEW.reviewer_role <> 'renter' THEN
    RAISE EXCEPTION 'Reviewer role must be renter';
  END IF;

  IF NEW.reviewer_id = booking_owner AND NEW.reviewer_role <> 'owner' THEN
    RAISE EXCEPTION 'Reviewer role must be owner';
  END IF;

  IF NEW.reviewer_id <> booking_renter AND NEW.reviewer_id <> booking_owner THEN
    RAISE EXCEPTION 'Reviewer must be booking participant';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_review_role_before_insert ON reviews;
CREATE TRIGGER enforce_review_role_before_insert
BEFORE INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION public.enforce_review_role();
