CREATE TABLE public.rental_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rental_id uuid NOT NULL REFERENCES public.rental_requests(id), status text NOT NULL, actor_id uuid NOT NULL, occurred_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.rental_events TO authenticated;
GRANT ALL ON public.rental_events TO service_role;
ALTER TABLE public.rental_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read rental timeline" ON public.rental_events FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.rental_requests r WHERE r.id = rental_id AND auth.uid() IN (r.renter_id,r.owner_id)));
CREATE INDEX rental_events_order ON public.rental_events(rental_id, occurred_at);
CREATE FUNCTION public.record_rental_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN
 IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
  INSERT INTO public.rental_events(rental_id,status,actor_id) VALUES (NEW.id,NEW.status,coalesce(auth.uid(),NEW.renter_id));
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER rental_status_timeline AFTER INSERT OR UPDATE ON public.rental_requests FOR EACH ROW EXECUTE FUNCTION public.record_rental_event();