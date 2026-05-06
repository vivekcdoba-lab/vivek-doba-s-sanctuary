-- Allow assigned coaches to read their seekers' non-negotiables (coach-assigned habits).
CREATE POLICY "Assigned coaches view seeker non-negotiables"
  ON public.seeker_non_negotiables
  FOR SELECT
  TO authenticated
  USING (public.is_assigned_coach(auth.uid(), seeker_id));