
-- Tighten the restrictive UPDATE policy on profiles (avoid USING true)
DROP POLICY IF EXISTS "Restrict role changes to admins" ON public.profiles;
CREATE POLICY "Restrict role changes to admins"
ON public.profiles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (
  public.is_admin(auth.uid())
  OR role = (SELECT p.role FROM public.profiles p WHERE p.id = profiles.id)
);

-- Remove broad coach read on documents bucket (coaches will get signed URLs from edge function)
DROP POLICY IF EXISTS "documents_coach_read" ON storage.objects;
