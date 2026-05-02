
-- 1) Restrictive policy on email_send_log: only admins or service_role can SELECT
CREATE POLICY "Restrict email_send_log reads to admins and service role"
  ON public.email_send_log
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()) OR auth.role() = 'service_role');

-- 2) Standardize coach access to assessment tables via is_assigned_coach()
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'wheel_of_life_assessments',
    'mooch_assessments',
    'lgt_assessments',
    'purusharthas_assessments',
    'firo_b_assessments',
    'happiness_assessments'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Coaches view assigned seekers assessments" ON public.%I;', t);
    EXECUTE format($f$
      CREATE POLICY "Coaches view assigned seekers assessments"
        ON public.%I
        FOR SELECT
        TO authenticated
        USING (public.is_assigned_coach(auth.uid(), seeker_id));
    $f$, t);
  END LOOP;
END $$;
