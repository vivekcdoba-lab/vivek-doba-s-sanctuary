-- Fix agreements policies: coach_id is a profile UUID, not auth.uid()
DROP POLICY IF EXISTS "Coaches can view their own agreements" ON public.agreements;
DROP POLICY IF EXISTS "Coaches can insert their own agreements" ON public.agreements;
DROP POLICY IF EXISTS "Coaches can update their own agreements" ON public.agreements;
DROP POLICY IF EXISTS "Coaches can delete their own agreements" ON public.agreements;

CREATE POLICY "Coaches can view their own agreements"
ON public.agreements FOR SELECT
USING (
  coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Coaches can insert their own agreements"
ON public.agreements FOR INSERT
WITH CHECK (
  coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Coaches can update their own agreements"
ON public.agreements FOR UPDATE
USING (
  coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Coaches can delete their own agreements"
ON public.agreements FOR DELETE
USING (
  coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR public.is_admin(auth.uid())
);

-- Fix assessments policies: same coach_id mismatch
DROP POLICY IF EXISTS "Coaches can view their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Coaches can insert their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Coaches can update their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Coaches can delete their own assessments" ON public.assessments;

CREATE POLICY "Coaches can view their own assessments"
ON public.assessments FOR SELECT
USING (
  coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Coaches can insert their own assessments"
ON public.assessments FOR INSERT
WITH CHECK (
  coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Coaches can update their own assessments"
ON public.assessments FOR UPDATE
USING (
  coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Coaches can delete their own assessments"
ON public.assessments FOR DELETE
USING (
  coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR public.is_admin(auth.uid())
);

-- Remove ability for seekers to award themselves arbitrary points.
-- Points should only be inserted by admins or service role (edge functions/triggers).
DROP POLICY IF EXISTS "Seekers earn points" ON public.points_ledger;