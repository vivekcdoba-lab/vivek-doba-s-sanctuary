ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_side_program boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS step text,
  ADD COLUMN IF NOT EXISTS stage text,
  ADD COLUMN IF NOT EXISTS hook text,
  ADD COLUMN IF NOT EXISTS outcome text,
  ADD COLUMN IF NOT EXISTS mode text,
  ADD COLUMN IF NOT EXISTS seats text,
  ADD COLUMN IF NOT EXISTS next_date text,
  ADD COLUMN IF NOT EXISTS who_for text,
  ADD COLUMN IF NOT EXISTS not_for text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS before text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS after text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS method jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS deliverables text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS price_inr integer,
  ADD COLUMN IF NOT EXISTS price_from boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS gst_applies boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_note text,
  ADD COLUMN IF NOT EXISTS cta_label text,
  ADD COLUMN IF NOT EXISTS cta_type text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS next_slug text,
  ADD COLUMN IF NOT EXISTS locked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS card_image_url text,
  ADD COLUMN IF NOT EXISTS gallery_image_urls text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS video_ids text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_keywords text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS generated_image boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS courses_slug_unique ON public.courses(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS courses_public_order_idx ON public.courses(is_published, is_side_program, sort_order);

ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_cta_type_check;
ALTER TABLE public.courses ADD CONSTRAINT courses_cta_type_check CHECK (cta_type IN ('book','diagnostic','apply','enquiry','prebook','read','none'));
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_price_inr_nonnegative;
ALTER TABLE public.courses ADD CONSTRAINT courses_price_inr_nonnegative CHECK (price_inr IS NULL OR price_inr >= 0);

GRANT SELECT ON public.courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;

DROP POLICY IF EXISTS "Anyone can view active courses" ON public.courses;
DROP POLICY IF EXISTS "Public can view published courses" ON public.courses;
CREATE POLICY "Public can view published courses" ON public.courses FOR SELECT TO anon, authenticated USING (is_published = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));