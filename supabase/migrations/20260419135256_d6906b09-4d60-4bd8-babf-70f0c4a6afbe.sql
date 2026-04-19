-- Global key/value settings table
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read
CREATE POLICY "Authenticated can read app_settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert app_settings"
ON public.app_settings
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can update
CREATE POLICY "Admins can update app_settings"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can delete
CREATE POLICY "Admins can delete app_settings"
ON public.app_settings
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Auto-update updated_at on changes
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default email_from value
INSERT INTO public.app_settings (key, value)
VALUES ('email_from', '"VDTS <info@vivekdoba.com>"'::jsonb);