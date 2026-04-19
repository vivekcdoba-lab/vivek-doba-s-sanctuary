-- Fix clients RLS: coach_id stores profiles.id, not auth.uid().
-- Also add admin full access.

DROP POLICY IF EXISTS "Coaches can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Coaches can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Coaches can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Coaches can delete their own clients" ON public.clients;

CREATE POLICY "Coaches can view their own clients"
  ON public.clients FOR SELECT
  USING (
    public.is_admin(auth.uid())
    OR coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can insert their own clients"
  ON public.clients FOR INSERT
  WITH CHECK (
    public.is_admin(auth.uid())
    OR coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can update their own clients"
  ON public.clients FOR UPDATE
  USING (
    public.is_admin(auth.uid())
    OR coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can delete their own clients"
  ON public.clients FOR DELETE
  USING (
    public.is_admin(auth.uid())
    OR coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );