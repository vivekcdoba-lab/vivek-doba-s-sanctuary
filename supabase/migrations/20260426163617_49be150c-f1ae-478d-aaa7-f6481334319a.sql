-- Remove direct signer SELECT on session_signatures so IP/user_agent of signers
-- aren't exposed via SELECT *. Seekers must use the get_session_signatures RPC,
-- which excludes ip_address and user_agent columns.
DROP POLICY IF EXISTS "Signers read own signature row" ON public.session_signatures;