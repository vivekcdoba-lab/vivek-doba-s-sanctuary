-- Restrict app_settings SELECT to admins only
-- Previously: SELECT policy used USING (true) which exposed config (including email sender, future API keys, feature flags) to every authenticated user.
-- Edge functions use the service role key and bypass RLS, so they are unaffected.

DROP POLICY IF EXISTS "Authenticated users can read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Anyone can read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Public can read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_select_all" ON public.app_settings;
DROP POLICY IF EXISTS "Allow read access to app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can read app_settings" ON public.app_settings;

CREATE POLICY "Admins can read app_settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));