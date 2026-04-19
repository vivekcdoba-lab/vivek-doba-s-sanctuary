
-- 1. session_signatures: restrict IP/UA to admins only via a safe view
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='session_signatures' AND cmd='SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.session_signatures', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Admins read full signatures"
  ON public.session_signatures FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE OR REPLACE VIEW public.session_signatures_safe AS
SELECT id, session_id, signer_id, signer_role, storage_path, typed_name, content_hash, signed_at
FROM public.session_signatures;

GRANT SELECT ON public.session_signatures_safe TO authenticated, anon;

-- 2. personal_swot_assessments: fix broken ownership policies
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='personal_swot_assessments'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.personal_swot_assessments', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users view own SWOT or admin"
  ON public.personal_swot_assessments FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users insert own SWOT"
  ON public.personal_swot_assessments FOR INSERT TO authenticated
  WITH CHECK (
    seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users update own SWOT or admin"
  ON public.personal_swot_assessments FOR UPDATE TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users delete own SWOT or admin"
  ON public.personal_swot_assessments FOR DELETE TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- 3. session_audit_log: require session ownership or admin on INSERT
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='session_audit_log' AND cmd='INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.session_audit_log', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Insert audit for own session or admin"
  ON public.session_audit_log FOR INSERT TO authenticated
  WITH CHECK (
    actor_id = auth.uid()
    AND (
      public.is_admin(auth.uid())
      OR session_id IN (
        SELECT s.id FROM public.sessions s
        JOIN public.profiles p ON p.id = s.seeker_id
        WHERE p.user_id = auth.uid()
      )
    )
  );

-- 4. swot_entries: explicit deny for non-admins
DROP POLICY IF EXISTS "Block non-admin reads on swot_entries" ON public.swot_entries;
CREATE POLICY "Block non-admin reads on swot_entries"
  ON public.swot_entries FOR SELECT TO authenticated, anon
  USING (public.is_admin(auth.uid()));
