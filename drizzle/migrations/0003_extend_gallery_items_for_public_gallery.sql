ALTER TABLE public.gallery_items
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS youtube_id text,
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS event_name text,
  ADD COLUMN IF NOT EXISTS program_slug text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS date date,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;

UPDATE public.gallery_items
SET image_url = COALESCE(image_url, CASE WHEN media_type = 'image' THEN media_url ELSE NULL END),
    youtube_id = COALESCE(youtube_id, CASE WHEN media_type = 'video' THEN media_url ELSE NULL END),
    caption = COALESCE(caption, description, title),
    event_name = COALESCE(event_name, title),
    sort_order = CASE WHEN sort_order = 0 THEN display_order ELSE sort_order END,
    is_published = CASE WHEN is_published = false THEN is_active ELSE is_published END;

CREATE INDEX IF NOT EXISTS gallery_items_public_order_idx ON public.gallery_items (is_published, sort_order, date DESC);
CREATE INDEX IF NOT EXISTS gallery_items_program_idx ON public.gallery_items (program_slug, is_published, date DESC);

GRANT SELECT ON public.gallery_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;
GRANT ALL ON public.gallery_items TO service_role;

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active gallery" ON public.gallery_items;
DROP POLICY IF EXISTS "Public can view active gallery items" ON public.gallery_items;
CREATE POLICY "Public can view published gallery items"
ON public.gallery_items
FOR SELECT
TO anon, authenticated
USING (is_published = true OR public.is_admin(auth.uid()));