CREATE OR REPLACE FUNCTION public.validate_listing() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE block jsonb;
BEGIN
 IF TG_OP = 'UPDATE' AND (NEW.owner_id <> OLD.owner_id OR NEW.id <> OLD.id) THEN RAISE EXCEPTION 'Listing ownership cannot change'; END IF;
 IF NEW.photo_path NOT LIKE NEW.owner_id::text || '/%' THEN RAISE EXCEPTION 'Photo must belong to the lender'; END IF;
 IF NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'listing-photos' AND name = NEW.photo_path) THEN RAISE EXCEPTION 'Upload the listing photo first'; END IF;
 IF jsonb_typeof(NEW.details) <> 'object' OR octet_length(NEW.details::text) > 30000 THEN RAISE EXCEPTION 'Invalid listing details'; END IF;
 IF coalesce(NEW.details->>'category','') NOT IN ('Dress','Top','Bottom','Suit','Bag','Shoes','Jewelry','Accessory') OR char_length(coalesce(NEW.details->>'size','')) NOT BETWEEN 1 AND 60 OR char_length(coalesce(NEW.details->>'description','')) > 4000 THEN RAISE EXCEPTION 'Invalid category, size or description'; END IF;
 IF NEW.details ? 'sanitizedAt' AND NEW.details->>'category' NOT IN ('Shoes','Jewelry') THEN RAISE EXCEPTION 'Sanitizing applies to shoes and jewelry'; END IF;
 IF jsonb_typeof(coalesce(NEW.details->'blocks','[]'::jsonb)) <> 'array' THEN RAISE EXCEPTION 'Invalid unavailable dates'; END IF;
 FOR block IN SELECT value FROM jsonb_array_elements(coalesce(NEW.details->'blocks','[]'::jsonb)) LOOP
  IF block->>'start' IS NULL OR block->>'end' IS NULL OR (block->>'end')::date < (block->>'start')::date THEN RAISE EXCEPTION 'Invalid unavailable dates'; END IF;
  IF EXISTS (SELECT 1 FROM public.rental_requests r WHERE r.listing_id = NEW.id AND r.status IN ('Confirmed','Picked Up') AND r.start_date <= (block->>'end')::date AND r.end_date >= (block->>'start')::date) THEN RAISE EXCEPTION 'Unavailable dates overlap a confirmed booking'; END IF;
 END LOOP;
 NEW.updated_at = now(); RETURN NEW;
END $$;