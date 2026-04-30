-- 1. Admin SELECT policy on suppressed_emails for oversight
CREATE POLICY "Admins can read suppressed emails"
ON public.suppressed_emails
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- 2. Coach SELECT policy on session_topics for assigned/conducted sessions
CREATE POLICY "Coaches view session topics for their seekers"
ON public.session_topics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.sessions s
    WHERE s.id = session_topics.session_id
      AND (
        -- Coach conducted the session directly
        s.coach_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
        -- Or coach is assigned to the seeker
        OR public.is_assigned_coach(auth.uid(), s.seeker_id)
      )
  )
);