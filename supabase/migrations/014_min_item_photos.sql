CREATE OR REPLACE FUNCTION public.enforce_min_item_photos()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF COALESCE(array_length(NEW.photo_urls, 1), 0) < 4 THEN
    RAISE EXCEPTION 'At least 4 photos are required';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_min_item_photos_on_items ON public.items;

CREATE TRIGGER enforce_min_item_photos_on_items
BEFORE INSERT OR UPDATE OF photo_urls ON public.items
FOR EACH ROW
EXECUTE FUNCTION public.enforce_min_item_photos();
