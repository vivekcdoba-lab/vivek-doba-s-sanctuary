
-- Recreate view with security_invoker so it uses caller's RLS
DROP VIEW IF EXISTS public.session_signatures_safe;
CREATE VIEW public.session_signatures_safe
WITH (security_invoker = true) AS
SELECT id, session_id, signer_id, signer_role, storage_path, typed_name, content_hash, signed_at
FROM public.session_signatures;

GRANT SELECT ON public.session_signatures_safe TO authenticated, anon;

-- Allow seekers to read base rows for their own sessions (they'll only query via the view, which excludes IP/UA columns)
CREATE POLICY "Seekers read signatures of own sessions"
  ON public.session_signatures FOR SELECT TO authenticated
  USING (
    session_id IN (
      SELECT s.id FROM public.sessions s
      JOIN public.profiles p ON p.id = s.seeker_id
      WHERE p.user_id = auth.uid()
    )
  );
