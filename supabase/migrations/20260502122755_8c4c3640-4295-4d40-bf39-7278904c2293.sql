-- Allow assigned coaches to INSERT/UPDATE seeker_assessments for their seekers
CREATE POLICY "Assigned coaches insert seeker assessments"
  ON public.seeker_assessments FOR INSERT TO authenticated
  WITH CHECK (public.is_assigned_coach(auth.uid(), seeker_id));

CREATE POLICY "Assigned coaches update seeker assessments"
  ON public.seeker_assessments FOR UPDATE TO authenticated
  USING (public.is_assigned_coach(auth.uid(), seeker_id))
  WITH CHECK (public.is_assigned_coach(auth.uid(), seeker_id));

-- Allow assigned coaches to SELECT seeker_assessments for their seekers (visibility for review)
CREATE POLICY "Assigned coaches view seeker assessments"
  ON public.seeker_assessments FOR SELECT TO authenticated
  USING (public.is_assigned_coach(auth.uid(), seeker_id));

-- Allow coaches to INSERT/UPDATE their own coach_weekly_challenges
CREATE POLICY "Coaches insert own weekly challenges"
  ON public.coach_weekly_challenges FOR INSERT TO authenticated
  WITH CHECK (
    coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND (seeker_id IS NULL OR public.is_assigned_coach(auth.uid(), seeker_id))
  );

CREATE POLICY "Coaches update own weekly challenges"
  ON public.coach_weekly_challenges FOR UPDATE TO authenticated
  USING (coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches view own weekly challenges"
  ON public.coach_weekly_challenges FOR SELECT TO authenticated
  USING (coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches delete own weekly challenges"
  ON public.coach_weekly_challenges FOR DELETE TO authenticated
  USING (coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Allow assigned coaches to SELECT daily_worksheets for their seekers
CREATE POLICY "Assigned coaches view seeker worksheets"
  ON public.daily_worksheets FOR SELECT TO authenticated
  USING (public.is_assigned_coach(auth.uid(), seeker_id));
