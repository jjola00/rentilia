CREATE TABLE IF NOT EXISTS waitlist_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  source text,
  confirmation_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_signups_email_unique
  ON waitlist_signups (lower(email));

ALTER TABLE waitlist_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist" ON waitlist_signups
  FOR INSERT WITH CHECK (email IS NOT NULL);
