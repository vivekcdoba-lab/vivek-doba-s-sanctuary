ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS gallery_images text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS price_inr numeric(12,2),
  ADD COLUMN IF NOT EXISTS gst_included boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stock_status text NOT NULL DEFAULT 'in_stock',
  ADD COLUMN IF NOT EXISTS is_preorder boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;

UPDATE public.products
SET slug = COALESCE(slug, lower(trim(both '-' from regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')))),
    short_description = COALESCE(short_description, description),
    long_description = COALESCE(long_description, description),
    price_inr = COALESCE(price_inr, price),
    sort_order = CASE WHEN sort_order = 0 THEN display_order ELSE sort_order END,
    is_published = CASE WHEN is_published = false THEN is_active ELSE is_published END;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique_idx ON public.products (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS products_public_order_idx ON public.products (is_published, sort_order, name);

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_stock_status_check;
ALTER TABLE public.products ADD CONSTRAINT products_stock_status_check CHECK (stock_status IN ('in_stock', 'out_of_stock', 'preorder'));
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_price_inr_nonnegative_check;
ALTER TABLE public.products ADD CONSTRAINT products_price_inr_nonnegative_check CHECK (price_inr IS NULL OR price_inr >= 0);

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view published products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (is_published = true OR public.is_admin(auth.uid()));