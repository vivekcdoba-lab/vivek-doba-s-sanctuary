-- Fee Structure agreement support
-- Index for fast lookup of agreements by seeker + type
CREATE INDEX IF NOT EXISTS idx_agreements_client_type ON public.agreements(client_id, type);

-- Allow admins full CRUD on agreements (in addition to existing coach policies)
DROP POLICY IF EXISTS "Admins can view all agreements" ON public.agreements;
DROP POLICY IF EXISTS "Admins can insert agreements" ON public.agreements;
DROP POLICY IF EXISTS "Admins can update agreements" ON public.agreements;
DROP POLICY IF EXISTS "Admins can delete agreements" ON public.agreements;

CREATE POLICY "Admins can view all agreements" ON public.agreements
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert agreements" ON public.agreements
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update agreements" ON public.agreements
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete agreements" ON public.agreements
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- Allow seekers to view their own agreements (read-only)
DROP POLICY IF EXISTS "Seekers can view their own agreements" ON public.agreements;
CREATE POLICY "Seekers can view their own agreements" ON public.agreements
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = agreements.client_id AND p.user_id = auth.uid()
    )
  );