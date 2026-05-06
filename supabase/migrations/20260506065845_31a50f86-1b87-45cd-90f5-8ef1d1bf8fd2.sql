-- course_session_rules: restrict SELECT to admins/coaches
DROP POLICY IF EXISTS "Authenticated can read course session rules" ON public.course_session_rules;

CREATE POLICY "Admins and coaches can read course session rules"
  ON public.course_session_rules
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_coach(auth.uid()));

-- email_send_log: collapse to a single super-admin SELECT policy alongside service role
DROP POLICY IF EXISTS "Super admins and service role can read email send log" ON public.email_send_log;
DROP POLICY IF EXISTS "Super admins can delete old email send log entries" ON public.email_send_log;

CREATE POLICY "Super admins read email send log"
  ON public.email_send_log
  FOR SELECT
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins delete email send log entries"
  ON public.email_send_log
  FOR DELETE
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- suppressed_emails: keep only one super-admin SELECT policy; service role keeps its own
-- (existing "Super admins can read suppressed emails" already restricts to super admins; nothing else to add)
