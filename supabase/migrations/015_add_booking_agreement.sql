ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS agreement_accepted_at timestamptz;
