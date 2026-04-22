-- Part 1: Signatures — admin-only (drop coach SELECT policies)
DROP POLICY IF EXISTS "Coaches read document signatures" ON public.document_signatures;
DROP POLICY IF EXISTS "Coaches view their seekers' requests" ON public.signature_requests;

-- Part 2: Profiles — admin-only role/promotion
DROP POLICY IF EXISTS "Users can update own profile (role locked by trigger)" ON public.profiles;
DROP POLICY IF EXISTS "Restrict role changes to admins" ON public.profiles;
DROP POLICY IF EXISTS "Admins update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own non-role fields" ON public.profiles;

CREATE POLICY "Admins update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users update own non-role fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
