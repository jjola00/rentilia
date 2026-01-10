ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by owner" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profiles are insertable by owner" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles are updatable by owner" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS public.profiles_public (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  city TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.profiles_public (id, full_name, avatar_url, city, bio, created_at, updated_at)
SELECT id, full_name, avatar_url, city, bio, created_at, updated_at
FROM public.profiles
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  city = EXCLUDED.city,
  bio = EXCLUDED.bio,
  updated_at = EXCLUDED.updated_at;

CREATE OR REPLACE FUNCTION public.sync_profiles_public()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    DELETE FROM public.profiles_public WHERE id = OLD.id;
    RETURN OLD;
  END IF;

  INSERT INTO public.profiles_public (id, full_name, avatar_url, city, bio, created_at, updated_at)
  VALUES (NEW.id, NEW.full_name, NEW.avatar_url, NEW.city, NEW.bio, NEW.created_at, NEW.updated_at)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    city = EXCLUDED.city,
    bio = EXCLUDED.bio,
    updated_at = EXCLUDED.updated_at;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_profiles_public ON public.profiles;
CREATE TRIGGER sync_profiles_public
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_profiles_public();

ALTER TABLE public.profiles_public ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable" ON public.profiles_public
  FOR SELECT USING (true);

GRANT SELECT ON public.profiles_public TO anon, authenticated;

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_bookings_expires_at ON public.bookings(expires_at);

CREATE OR REPLACE FUNCTION public.set_booking_expiry()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'requested' THEN
    NEW.expires_at = NOW() + interval '15 minutes';
  ELSE
    NEW.expires_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_booking_expiry ON public.bookings;
CREATE TRIGGER set_booking_expiry
BEFORE INSERT OR UPDATE OF status ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.set_booking_expiry();

CREATE OR REPLACE FUNCTION public.expire_requested_bookings()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.bookings
  SET status = 'cancelled',
      updated_at = NOW()
  WHERE status = 'requested'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM cron.job
    WHERE jobname = 'expire_requested_bookings'
  ) THEN
    PERFORM cron.schedule(
      'expire_requested_bookings',
      '*/10 * * * *',
      $cron$select public.expire_requested_bookings();$cron$
    );
  END IF;
END;
$$;
