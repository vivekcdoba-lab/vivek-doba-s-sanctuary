CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 180),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text NOT NULL DEFAULT '' CHECK (char_length(excerpt) <= 500),
  cover_image text,
  body text NOT NULL DEFAULT '' CHECK (char_length(body) <= 100000),
  category text NOT NULL CHECK (category IN ('Business Growth','Leadership','Mindset','Health','Family','Sales')),
  tags text[] NOT NULL DEFAULT '{}',
  author text NOT NULL DEFAULT 'Vivek Doba' CHECK (char_length(author) BETWEEN 2 AND 100),
  published_at timestamptz,
  seo_title text CHECK (seo_title IS NULL OR char_length(seo_title) <= 70),
  seo_description text CHECK (seo_description IS NULL OR char_length(seo_description) <= 170),
  related_course_slug text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published posts" ON public.posts FOR SELECT TO anon, authenticated USING (is_published = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage posts" ON public.posts FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX posts_publication_idx ON public.posts (is_published, published_at DESC);
CREATE INDEX posts_category_idx ON public.posts (category, is_published, published_at DESC);
CREATE INDEX posts_related_course_idx ON public.posts (related_course_slug, is_published);
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
COMMENT ON TABLE public.blog_posts IS 'DEPRECATED: public and admin blog now use public.posts; retained for preservation and historical content.';

ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS annual_turnover_range text,
  ADD COLUMN IF NOT EXISTS program_interest text;
ALTER TABLE public.contact_submissions
  ADD CONSTRAINT contact_business_type_length CHECK (business_type IS NULL OR char_length(business_type) <= 120) NOT VALID,
  ADD CONSTRAINT contact_turnover_values CHECK (annual_turnover_range IS NULL OR annual_turnover_range IN ('Under ₹50 lakh','₹50 lakh–₹2 crore','₹2–15 crore','Above ₹15 crore')) NOT VALID,
  ADD CONSTRAINT contact_program_interest_length CHECK (program_interest IS NULL OR char_length(program_interest) <= 180) NOT VALID;
GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;