-- Fix 1 (CRITICAL): Privilege escalation via profile self-update
-- Replace the over-permissive "Users update own non-role fields" policy with one that
-- explicitly forbids changing role / admin_level / admin_permissions / is_also_coach.
DROP POLICY IF EXISTS "Users update own non-role fields" ON public.profiles;

CREATE POLICY "Users update own non-role fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND role IS NOT DISTINCT FROM (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid())
  AND admin_level IS NOT DISTINCT FROM (SELECT p.admin_level FROM public.profiles p WHERE p.user_id = auth.uid())
  AND admin_permissions IS NOT DISTINCT FROM (SELECT p.admin_permissions FROM public.profiles p WHERE p.user_id = auth.uid())
  AND is_also_coach IS NOT DISTINCT FROM (SELECT p.is_also_coach FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- Fix 2: Standardize signature storage ownership checks.
-- session_signatures.signer_id stores profiles.id, NOT auth.uid().
-- The existing _own_row policies compared signer_id directly to auth.uid() (never matches).
-- Rewrite them to join through profiles.user_id = auth.uid().
DROP POLICY IF EXISTS "signatures_delete_own_row" ON storage.objects;
DROP POLICY IF EXISTS "signatures_update_own_row" ON storage.objects;
DROP POLICY IF EXISTS "Signers can delete own signatures" ON storage.objects;
DROP POLICY IF EXISTS "Signers can update own signatures" ON storage.objects;

CREATE POLICY "Signers can delete own signatures"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'signatures'
  AND (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.session_signatures ss
      JOIN public.profiles p ON p.id = ss.signer_id
      WHERE ss.storage_path = storage.objects.name
        AND p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Signers can update own signatures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'signatures'
  AND (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.session_signatures ss
      JOIN public.profiles p ON p.id = ss.signer_id
      WHERE ss.storage_path = storage.objects.name
        AND p.user_id = auth.uid()
    )
  )
)
WITH CHECK (
  bucket_id = 'signatures'
  AND (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.session_signatures ss
      JOIN public.profiles p ON p.id = ss.signer_id
      WHERE ss.storage_path = storage.objects.name
        AND p.user_id = auth.uid()
    )
  )
);