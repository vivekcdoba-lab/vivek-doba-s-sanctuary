-- Homepage media showcase table
CREATE TABLE public.homepage_media (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  platform text NOT NULL DEFAULT 'youtube',
  content_type text NOT NULL DEFAULT 'video',
  external_url text NOT NULL,
  thumbnail_url text,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_media ENABLE ROW LEVEL SECURITY;

-- Public read for active items (homepage works for anonymous visitors)
CREATE POLICY "Anyone can view active homepage media"
  ON public.homepage_media
  FOR SELECT
  USING (is_active = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert homepage media"
  ON public.homepage_media
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update homepage media"
  ON public.homepage_media
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete homepage media"
  ON public.homepage_media
  FOR DELETE
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_homepage_media_updated_at
  BEFORE UPDATE ON public.homepage_media
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_homepage_media_active_order
  ON public.homepage_media (is_active, display_order, created_at DESC);

-- Public storage bucket for thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('homepage-media', 'homepage-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read homepage-media"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'homepage-media');

CREATE POLICY "Admins can upload homepage-media"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'homepage-media' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update homepage-media"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'homepage-media' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete homepage-media"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'homepage-media' AND public.is_admin(auth.uid()));