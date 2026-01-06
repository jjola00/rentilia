ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS service_fee numeric NOT NULL DEFAULT 0;
