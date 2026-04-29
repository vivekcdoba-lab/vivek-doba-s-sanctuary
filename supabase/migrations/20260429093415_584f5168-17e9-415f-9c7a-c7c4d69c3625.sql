-- 1) Tighten session_participants coach policy: scope to assigned coach only
DROP POLICY IF EXISTS "Coaches manage session participants" ON public.session_participants;

CREATE POLICY "Coaches manage assigned session participants"
ON public.session_participants
FOR ALL
TO authenticated
USING (
  public.is_coach(auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.sessions s
    WHERE s.id = session_participants.session_id
      AND public.is_assigned_coach(auth.uid(), s.seeker_id)
  )
)
WITH CHECK (
  public.is_coach(auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.sessions s
    WHERE s.id = session_participants.session_id
      AND public.is_assigned_coach(auth.uid(), s.seeker_id)
  )
);

-- 2) Revoke anon EXECUTE on SECURITY DEFINER functions that should not be reachable without auth.
--    Keep anon access only for token-based RPCs (LGT invitation flow).
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_coach(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_assigned_coach(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_seeker_link_group(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_session_signatures(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_leaderboard_data(text, uuid, text, uuid) FROM anon;

-- Note: keep authenticated EXECUTE on the role-check helpers (is_admin/is_coach/is_super_admin/
-- is_assigned_coach/get_seeker_link_group) because RLS policies across many tables call them
-- and Postgres evaluates RLS expressions as the querying role.

-- get_lgt_application_by_token & submit_lgt_application_by_token intentionally remain
-- callable by anon (token-based public flow) and validate the token internally.