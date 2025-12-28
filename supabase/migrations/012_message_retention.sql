CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

CREATE OR REPLACE FUNCTION public.delete_old_messages()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.messages
  WHERE created_at < now() - interval '30 days';
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM cron.job
    WHERE jobname = 'delete_old_messages_daily'
  ) THEN
    PERFORM cron.schedule(
      'delete_old_messages_daily',
      '0 3 * * *',
      $$select public.delete_old_messages();$$
    );
  END IF;
END;
$$;
