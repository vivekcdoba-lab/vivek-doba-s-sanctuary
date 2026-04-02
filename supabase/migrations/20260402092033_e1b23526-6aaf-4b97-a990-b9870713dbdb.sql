-- Drop broken recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all, seekers own" ON public.profiles;

-- Recreate using is_admin() security definer function (no recursion)
CREATE POLICY "Users can view own profile, admins all"
ON public.profiles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile, admins all"
ON public.profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Allow the trigger (service role) to insert profiles
CREATE POLICY "Service role can insert profiles"
ON public.profiles FOR INSERT
WITH CHECK (true);