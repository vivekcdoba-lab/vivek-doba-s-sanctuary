
-- 1. Revoke public access to check_profile_duplicate (edge functions use service role)
REVOKE ALL ON FUNCTION public.check_profile_duplicate(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_profile_duplicate(text, text) FROM anon;
REVOKE ALL ON FUNCTION public.check_profile_duplicate(text, text) FROM authenticated;

-- 2. Remove seeker self-INSERT on seeker_badges (badges must be awarded by admin/server logic)
DROP POLICY IF EXISTS "Seekers manage own progress" ON public.seeker_badges;

-- 3. Restrict clients table policies to authenticated role only
DROP POLICY IF EXISTS "Coaches can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Coaches can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Coaches can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Coaches can delete their own clients" ON public.clients;

CREATE POLICY "Coaches can view their own clients"
ON public.clients FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid())
  OR coach_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
);

CREATE POLICY "Coaches can insert their own clients"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid())
  OR coach_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
);

CREATE POLICY "Coaches can update their own clients"
ON public.clients FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid())
  OR coach_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
);

CREATE POLICY "Coaches can delete their own clients"
ON public.clients FOR DELETE
TO authenticated
USING (
  is_admin(auth.uid())
  OR coach_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
);
