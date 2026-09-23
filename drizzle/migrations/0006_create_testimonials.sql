CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  business text CHECK (business IS NULL OR char_length(business) <= 180),
  city text CHECK (city IS NULL OR char_length(city) <= 120),
  photo text CHECK (photo IS NULL OR char_length(photo) <= 2048),
  quote text CHECK (quote IS NULL OR char_length(quote) <= 3000),
  youtube_id text CHECK (youtube_id IS NULL OR youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  program_slug text CHECK (program_slug IS NULL OR program_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  rating smallint CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT testimonial_has_content CHECK (quote IS NOT NULL OR youtube_id IS NOT NULL)
);

GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published testimonials"
ON public.testimonials
FOR SELECT
TO anon, authenticated
USING (is_published = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage testimonials"
ON public.testimonials
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX testimonials_public_order_idx
ON public.testimonials (is_published, sort_order, created_at DESC);

CREATE INDEX testimonials_program_idx
ON public.testimonials (program_slug, is_published, sort_order);

CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();