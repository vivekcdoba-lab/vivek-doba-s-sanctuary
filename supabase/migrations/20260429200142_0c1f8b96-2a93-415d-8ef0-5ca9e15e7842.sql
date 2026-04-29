-- Fix 1: Prevent privilege escalation via profile self-insert
-- Restrict role to 'seeker' and forbid setting admin fields on insert.
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'seeker'
    AND admin_level IS NULL
    AND (admin_permissions IS NULL OR admin_permissions = '{}'::jsonb)
    AND (is_also_coach IS NULL OR is_also_coach = false)
  );

-- Fix 2: Restrict email_log SELECT to super admins only.
DROP POLICY IF EXISTS "Admins read email log" ON public.email_log;

CREATE POLICY "Super admins read email log"
  ON public.email_log
  FOR SELECT
  TO authenticated
  USING (public.is_super_admin(auth.uid()));
