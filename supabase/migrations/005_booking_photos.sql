-- Booking photos for pickup/return condition
CREATE TABLE IF NOT EXISTS booking_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('pickup', 'return')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_photos_booking ON booking_photos(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_photos_type ON booking_photos(photo_type);

ALTER TABLE booking_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view booking photos" ON booking_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM bookings b
      JOIN items i ON b.item_id = i.id
      WHERE b.id = booking_id
        AND (b.renter_id = auth.uid() OR i.owner_id = auth.uid())
    )
  );

CREATE POLICY "Renters can upload booking photos" ON booking_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM bookings b
      WHERE b.id = booking_id
        AND b.renter_id = auth.uid()
    )
  );
