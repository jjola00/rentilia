-- Publish reviews immediately, but hide from reviewee until they submit
ALTER TABLE reviews ALTER COLUMN is_published SET DEFAULT TRUE;

UPDATE reviews
SET is_published = TRUE
WHERE is_published = FALSE;

DROP TRIGGER IF EXISTS publish_reviews_after_insert ON reviews;
DROP FUNCTION IF EXISTS publish_reviews_for_booking();

DROP POLICY IF EXISTS "Users can view published reviews or their own" ON reviews;
DROP POLICY IF EXISTS "Reviews are public except to reviewee until they submit" ON reviews;

CREATE OR REPLACE FUNCTION public.has_submitted_review(p_booking_id uuid, p_reviewer_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.reviews
    WHERE booking_id = p_booking_id
      AND reviewer_id = p_reviewer_id
  );
$$;

REVOKE ALL ON FUNCTION public.has_submitted_review(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_submitted_review(uuid, uuid) TO anon, authenticated;

CREATE POLICY "Reviews are public except to reviewee until they submit" ON reviews
  FOR SELECT USING (
    reviewer_id = auth.uid()
    OR (
      is_published = true
      AND (
        auth.uid() IS NULL
        OR reviewee_id <> auth.uid()
        OR public.has_submitted_review(booking_id, auth.uid())
      )
    )
  );
