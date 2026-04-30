DROP POLICY IF EXISTS "Coaches delete their sessions" ON public.sessions;
CREATE POLICY "Coaches delete their sessions"
  ON public.sessions
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR public.is_assigned_coach(auth.uid(), seeker_id)
    OR coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Coaches delete session participants" ON public.session_participants;
CREATE POLICY "Coaches delete session participants"
  ON public.session_participants
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_participants.session_id
        AND (
          public.is_assigned_coach(auth.uid(), s.seeker_id)
          OR s.coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
    )
  );