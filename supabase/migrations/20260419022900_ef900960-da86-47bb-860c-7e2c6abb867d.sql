
-- Remove seeker direct-read policy (was leaking IP/UA at base level)
DROP POLICY IF EXISTS "Seekers read signatures of own sessions" ON public.session_signatures;

-- Drop view; replace with security definer function
DROP VIEW IF EXISTS public.session_signatures_safe;

CREATE OR REPLACE FUNCTION public.get_session_signatures(_session_id uuid)
RETURNS TABLE (
  id uuid,
  session_id uuid,
  signer_id uuid,
  signer_role text,
  storage_path text,
  typed_name text,
  content_hash text,
  signed_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow if admin OR the session belongs to the calling seeker
  IF NOT (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.profiles p ON p.id = s.seeker_id
      WHERE s.id = _session_id AND p.user_id = auth.uid()
    )
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT ss.id, ss.session_id, ss.signer_id, ss.signer_role,
         ss.storage_path, ss.typed_name, ss.content_hash, ss.signed_at
  FROM public.session_signatures ss
  WHERE ss.session_id = _session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_session_signatures(uuid) TO authenticated;
