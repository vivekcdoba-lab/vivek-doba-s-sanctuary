
-- 1. document_signatures: add deny-all INSERT for non-admins (service role bypasses RLS)
CREATE POLICY "Only admins can insert document signatures"
  ON public.document_signatures FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 2. sessions: replace broad seeker UPDATE with column-restricted policy via trigger
DROP POLICY IF EXISTS "Seekers can update own session reflections" ON public.sessions;

CREATE POLICY "Seekers can update own session reflections"
  ON public.sessions FOR UPDATE TO authenticated
  USING (seeker_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (seeker_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));

-- The validate_seeker_session_update trigger already reverts coach-only fields when
-- the caller is not admin or assigned coach. Ensure it is attached to sessions.
DROP TRIGGER IF EXISTS trg_validate_seeker_session_update ON public.sessions;
CREATE TRIGGER trg_validate_seeker_session_update
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_seeker_session_update();

-- 3. daily_report_settings: restrict SELECT to admins
DROP POLICY IF EXISTS "Anyone authed can read daily report settings" ON public.daily_report_settings;
CREATE POLICY "Admins can read daily report settings"
  ON public.daily_report_settings FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- 4. topics: restrict INSERT to coaches and admins
DROP POLICY IF EXISTS "Authenticated users can create topics" ON public.topics;
CREATE POLICY "Coaches and admins can create topics"
  ON public.topics FOR INSERT TO authenticated
  WITH CHECK (
    (public.is_admin(auth.uid()) OR public.is_coach(auth.uid()))
    AND created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
  );
