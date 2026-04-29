-- Harden email_log: explicitly block all client-side writes.
-- Service role (used by edge functions) bypasses RLS and can still INSERT.
CREATE POLICY "No client INSERT to email_log"
  ON public.email_log FOR INSERT TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "No client UPDATE to email_log"
  ON public.email_log FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);

CREATE POLICY "No client DELETE from email_log"
  ON public.email_log FOR DELETE TO authenticated, anon
  USING (false);