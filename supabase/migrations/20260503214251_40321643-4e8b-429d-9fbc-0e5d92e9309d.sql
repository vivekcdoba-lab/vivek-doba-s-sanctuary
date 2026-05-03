-- Tighten email_log SELECT: restrictive deny for non-super-admins
CREATE POLICY "Deny non-super-admin select email_log" ON public.email_log
AS RESTRICTIVE FOR SELECT TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Tighten suppressed_emails to super-admin only
DROP POLICY IF EXISTS "Admins can read suppressed emails" ON public.suppressed_emails;
CREATE POLICY "Super admins can read suppressed emails" ON public.suppressed_emails
FOR SELECT TO authenticated
USING (public.is_super_admin(auth.uid()));