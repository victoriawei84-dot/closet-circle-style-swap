CREATE TABLE public.listings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL, owner_name text NOT NULL, neighborhood text NOT NULL DEFAULT '', zip text NOT NULL DEFAULT '', published boolean NOT NULL DEFAULT true,
 title text NOT NULL, daily_rate numeric(10,2) NOT NULL, cleaning_fee numeric(10,2) NOT NULL DEFAULT 0, deposit numeric(10,2) NOT NULL DEFAULT 0, photo_path text NOT NULL, details jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK (char_length(title) BETWEEN 1 AND 150), CHECK (daily_rate > 0 AND daily_rate <= 10000), CHECK (cleaning_fee >= 0 AND deposit >= 0), CHECK (char_length(owner_name) BETWEEN 1 AND 80)
);
GRANT SELECT ON public.listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published listings visible" ON public.listings FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "Owner reads own listings" ON public.listings FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner creates listing" ON public.listings FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner edits listing" ON public.listings FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE FUNCTION public.validate_listing() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF TG_OP = 'UPDATE' AND (NEW.owner_id <> OLD.owner_id OR NEW.id <> OLD.id) THEN RAISE EXCEPTION 'Listing ownership cannot change'; END IF;
 IF NEW.photo_path NOT LIKE NEW.owner_id::text || '/%' THEN RAISE EXCEPTION 'Photo must belong to the lender'; END IF;
 IF jsonb_typeof(NEW.details) <> 'object' OR octet_length(NEW.details::text) > 30000 THEN RAISE EXCEPTION 'Invalid listing details'; END IF;
 NEW.updated_at = now(); RETURN NEW;
END $$;
CREATE TRIGGER listings_validate BEFORE INSERT OR UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.validate_listing();
CREATE TABLE public.rental_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), listing_id uuid NOT NULL REFERENCES public.listings(id), renter_id uuid NOT NULL, owner_id uuid NOT NULL, renter_name text NOT NULL, owner_name text NOT NULL,
 start_date date NOT NULL, end_date date NOT NULL, pickup text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'Requested', daily_rate numeric(10,2) NOT NULL DEFAULT 0, cleaning_fee numeric(10,2) NOT NULL DEFAULT 0, deposit numeric(10,2) NOT NULL DEFAULT 0, total numeric(12,2) NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK (status IN ('Requested','Confirmed','Picked Up','Returned','Completed','Declined')), CHECK (end_date >= start_date), CHECK (renter_id <> owner_id), CHECK (char_length(pickup) <= 300), CHECK (char_length(renter_name) BETWEEN 1 AND 80)
);
GRANT SELECT, INSERT, UPDATE ON public.rental_requests TO authenticated;
GRANT ALL ON public.rental_requests TO service_role;
ALTER TABLE public.rental_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read requests" ON public.rental_requests FOR SELECT TO authenticated USING (auth.uid() IN (renter_id, owner_id));
CREATE POLICY "Renter submits own request" ON public.rental_requests FOR INSERT TO authenticated WITH CHECK (renter_id = auth.uid());
CREATE POLICY "Owner updates request" ON public.rental_requests FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE INDEX rentals_listing_dates ON public.rental_requests(listing_id, start_date, end_date);
CREATE FUNCTION public.validate_rental_request() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE piece public.listings; block jsonb;
BEGIN
 SELECT * INTO piece FROM public.listings WHERE id = NEW.listing_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Listing not found'; END IF;
 IF TG_OP = 'INSERT' THEN
  IF auth.uid() IS NULL OR NEW.renter_id <> auth.uid() THEN RAISE EXCEPTION 'Sign in to request a rental'; END IF;
  IF NOT piece.published OR piece.owner_id = auth.uid() THEN RAISE EXCEPTION 'Cannot rent your own or an unpublished listing'; END IF;
  IF NEW.start_date < CURRENT_DATE OR NEW.end_date < NEW.start_date OR NEW.end_date - NEW.start_date > 365 THEN RAISE EXCEPTION 'Choose valid future dates within one year'; END IF;
  NEW.owner_id = piece.owner_id; NEW.owner_name = piece.owner_name; NEW.status = 'Requested';
  NEW.daily_rate = piece.daily_rate; NEW.cleaning_fee = piece.cleaning_fee; NEW.deposit = piece.deposit;
  NEW.total = piece.daily_rate * (NEW.end_date - NEW.start_date + 1) + piece.cleaning_fee + piece.deposit;
 ELSE
  IF auth.uid() IS NULL OR auth.uid() <> OLD.owner_id THEN RAISE EXCEPTION 'Only the lender can change the request'; END IF;
  IF (to_jsonb(NEW) - 'status' - 'updated_at') IS DISTINCT FROM (to_jsonb(OLD) - 'status' - 'updated_at') THEN RAISE EXCEPTION 'Agreed rental details cannot change'; END IF;
  IF NOT ((OLD.status = 'Requested' AND NEW.status IN ('Confirmed','Declined')) OR (OLD.status = 'Confirmed' AND NEW.status = 'Picked Up') OR (OLD.status = 'Picked Up' AND NEW.status = 'Returned') OR (OLD.status = 'Returned' AND NEW.status = 'Completed')) THEN RAISE EXCEPTION 'Invalid rental status change'; END IF;
 END IF;
 IF NEW.status IN ('Requested','Confirmed','Picked Up') THEN
  IF EXISTS (SELECT 1 FROM public.rental_requests r WHERE r.listing_id = NEW.listing_id AND r.id <> NEW.id AND r.status IN ('Confirmed','Picked Up') AND r.start_date <= NEW.end_date AND r.end_date >= NEW.start_date) THEN RAISE EXCEPTION 'These dates already have a confirmed booking'; END IF;
  FOR block IN SELECT value FROM jsonb_array_elements(coalesce(piece.details->'blocks', '[]'::jsonb)) LOOP
   IF (block->>'start')::date <= NEW.end_date AND (block->>'end')::date >= NEW.start_date THEN RAISE EXCEPTION 'These dates are unavailable'; END IF;
  END LOOP;
 END IF;
 IF NEW.status = 'Returned' THEN UPDATE public.listings SET details = details - 'sanitizedAt' WHERE id = NEW.listing_id; END IF;
 NEW.updated_at = now(); RETURN NEW;
END $$;
CREATE TRIGGER rental_validate BEFORE INSERT OR UPDATE ON public.rental_requests FOR EACH ROW EXECUTE FUNCTION public.validate_rental_request();
CREATE POLICY "Listing photos public read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'listing-photos');
CREATE POLICY "Lender uploads own photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-photos' AND (storage.foldername(name))[1] = auth.uid()::text AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp'));
CREATE POLICY "Lender updates own photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'listing-photos' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'listing-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Lender deletes own photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'listing-photos' AND (storage.foldername(name))[1] = auth.uid()::text);