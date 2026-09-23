ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS public_description text,
  ADD COLUMN IF NOT EXISTS image_url text;

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'digital',
  image_url text,
  price numeric(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'Events' CHECK (category IN ('Events','Seminars','Workshops','Testimonials')),
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image','video')),
  media_url text NOT NULL,
  thumbnail_url text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;
GRANT ALL ON public.gallery_items TO service_role;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active gallery" ON public.gallery_items FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage gallery" ON public.gallery_items FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text,
  content text NOT NULL,
  cover_image_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published blog posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (status = 'published' OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage blog posts" ON public.blog_posts FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  email text NOT NULL CHECK (char_length(email) <= 254),
  phone text CHECK (char_length(phone) <= 30),
  message text NOT NULL CHECK (char_length(message) BETWEEN 5 AND 3000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','responded')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (status = 'new');
CREATE POLICY "Admins manage contact submissions" ON public.contact_submissions FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX products_public_order_idx ON public.products (is_active, display_order);
CREATE INDEX gallery_public_order_idx ON public.gallery_items (is_active, category, display_order);
CREATE INDEX blog_publication_idx ON public.blog_posts (status, published_at DESC);
CREATE INDEX contact_status_created_idx ON public.contact_submissions (status, created_at DESC);

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gallery_items_updated_at BEFORE UPDATE ON public.gallery_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Public reads public content media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'public-content');
CREATE POLICY "Admins upload public content media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'public-content' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins update public content media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'public-content' AND public.is_admin(auth.uid())) WITH CHECK (bucket_id = 'public-content' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins delete public content media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'public-content' AND public.is_admin(auth.uid()));