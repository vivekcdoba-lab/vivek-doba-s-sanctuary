
-- 1. Realtime: tighter topic match — must be exactly notif:{uid}, msg:{uid}, or session:{uid}
DROP POLICY IF EXISTS "Users subscribe own topics" ON realtime.messages;
CREATE POLICY "Users subscribe own topics" ON realtime.messages
  FOR SELECT TO authenticated
  USING (
    realtime.topic() = 'notifications:' || auth.uid()::text
    OR realtime.topic() = 'messages:' || auth.uid()::text
    OR realtime.topic() = 'sessions:' || auth.uid()::text
    OR realtime.topic() = 'user:' || auth.uid()::text
  );

-- 2. Notifications: only admins or service role can INSERT
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND cmd='INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications', pol.policyname);
  END LOOP;
END $$;
CREATE POLICY "Only admins insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 3. session_notifications: only admins can INSERT
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='session_notifications' AND cmd='INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.session_notifications', pol.policyname);
  END LOOP;
END $$;
CREATE POLICY "Only admins insert session notifications"
  ON public.session_notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 4. session_signatures: allow signer to read their own signature row (no IP/UA leak — they're the one who created it)
CREATE POLICY "Signers read own signature row"
  ON public.session_signatures FOR SELECT TO authenticated
  USING (
    signer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- 5. session_audit_log: compare actor_id to caller's profile id (not auth.uid directly)
DROP POLICY IF EXISTS "Insert audit for own session or admin" ON public.session_audit_log;
CREATE POLICY "Insert audit for own session or admin"
  ON public.session_audit_log FOR INSERT TO authenticated
  WITH CHECK (
    actor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND (
      public.is_admin(auth.uid())
      OR session_id IN (
        SELECT s.id FROM public.sessions s
        JOIN public.profiles p ON p.id = s.seeker_id
        WHERE p.user_id = auth.uid()
      )
    )
  );
